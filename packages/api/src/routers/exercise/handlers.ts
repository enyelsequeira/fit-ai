import type { ExerciseCategory, ExerciseType } from "@fit-ai/db/schema/exercise";

import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { workoutExercise } from "@fit-ai/db/schema/workout";
import { and, eq, or, sql } from "drizzle-orm";

import { cannotModifyDefault, duplicate, notFound, notOwner, resourceInUse } from "../../errors";

import type {
  CheckNameAvailabilityRouteHandler,
  CreateRouteHandler,
  DeleteRouteHandler,
  GetByIdRouteHandler,
  ListRouteHandler,
  UpdateRouteHandler,
} from "./contracts";

// ============================================================================
// List Exercises Handler
// ============================================================================

export const listExercisesHandler: ListRouteHandler = async ({ input, context }) => {
  const conditions: ReturnType<typeof eq>[] = [];

  // Category filter
  if (input.category) {
    conditions.push(eq(exercise.category, input.category));
  }

  // Exercise type filter
  if (input.exerciseType) {
    conditions.push(eq(exercise.exerciseType, input.exerciseType));
  }

  // Equipment filter
  if (input.equipment) {
    conditions.push(eq(exercise.equipment, input.equipment));
  }

  // Build user/default exercise filter
  const userId = context.session?.user?.id;
  if (input.onlyUserExercises && userId) {
    // Only user's custom exercises
    conditions.push(eq(exercise.createdByUserId, userId));
  } else if (input.includeUserExercises && userId) {
    // Default exercises OR user's custom exercises
    conditions.push(or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId))!);
  } else {
    // Only default exercises
    conditions.push(eq(exercise.isDefault, true));
  }

  // Build the base where clause
  let whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Search filter (applied separately for LIKE support)
  if (input.search) {
    const searchPattern = `%${input.search}%`;
    whereClause = whereClause
      ? and(whereClause, sql`LOWER(${exercise.name}) LIKE LOWER(${searchPattern})`)
      : sql`LOWER(${exercise.name}) LIKE LOWER(${searchPattern})`;
  }

  // Get total count (before pagination)
  const countQuery = db.select({ count: sql<number>`COUNT(*)` }).from(exercise);

  if (whereClause) {
    countQuery.where(whereClause);
  }

  const countResult = await countQuery;
  const total = countResult[0]?.count ?? 0;

  // Get paginated results
  let query = db.select().from(exercise);

  if (whereClause) {
    query = query.where(whereClause) as typeof query;
  }

  // Apply pagination and sorting
  const results = await query.orderBy(exercise.name).limit(input.limit).offset(input.offset);

  // Filter by muscle group in memory (JSON field)
  // Note: This affects pagination accuracy for muscle group filter
  let filteredResults = results;
  let adjustedTotal = total;

  if (input.muscleGroup) {
    // For muscle group filter, we need to get all results to filter correctly
    const allResults = await db
      .select()
      .from(exercise)
      .where(whereClause ?? sql`1=1`)
      .orderBy(exercise.name);

    const allFiltered = allResults.filter((ex) => {
      const muscleGroups = ex.muscleGroups as string[];
      return muscleGroups.some((mg) => mg.toLowerCase() === input.muscleGroup?.toLowerCase());
    });

    adjustedTotal = allFiltered.length;
    filteredResults = allFiltered.slice(input.offset, input.offset + input.limit);
  }

  return {
    exercises: filteredResults,
    total: adjustedTotal,
    limit: input.limit,
    offset: input.offset,
  };
};

// ============================================================================
// Get Exercise By ID Handler
// ============================================================================

export const getExerciseByIdHandler: GetByIdRouteHandler = async ({ input, context }) => {
  const result = await db.select().from(exercise).where(eq(exercise.id, input.id)).limit(1);

  const ex = result[0];
  if (!ex) {
    notFound("Exercise", input.id);
  }

  // Check if user can access this exercise
  const userId = context.session?.user?.id;
  if (!ex.isDefault && ex.createdByUserId !== userId) {
    notFound("Exercise", input.id);
  }

  return ex;
};

// ============================================================================
// Create Exercise Handler
// ============================================================================

export const createExerciseHandler: CreateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Check for duplicate exercise name (case-insensitive)
  const existingExercise = await db
    .select({
      id: exercise.id,
      name: exercise.name,
      isDefault: exercise.isDefault,
    })
    .from(exercise)
    .where(
      and(
        sql`LOWER(${exercise.name}) = LOWER(${input.name.trim()})`,
        or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)),
      ),
    )
    .limit(1);

  if (existingExercise[0]) {
    const existing = existingExercise[0];
    duplicate("Exercise", "name", existing.name);
  }

  const result = await db
    .insert(exercise)
    .values({
      name: input.name.trim(),
      description: input.description,
      category: input.category as ExerciseCategory,
      muscleGroups: input.muscleGroups,
      equipment: input.equipment,
      exerciseType: input.exerciseType as ExerciseType,
      isDefault: false,
      createdByUserId: userId,
    })
    .returning();

  return result[0];
};

// ============================================================================
// Update Exercise Handler
// ============================================================================

export const updateExerciseHandler: UpdateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // First, verify the exercise exists and user owns it
  const existing = await db.select().from(exercise).where(eq(exercise.id, input.id)).limit(1);

  const ex = existing[0];
  if (!ex) {
    notFound("Exercise", input.id);
  }

  // Cannot update default exercises
  if (ex.isDefault) {
    cannotModifyDefault("exercise");
  }

  // Only owner can update
  if (ex.createdByUserId !== userId) {
    notOwner("exercise");
  }

  // Check for duplicate name if name is being changed
  if (input.name !== undefined && input.name.trim().toLowerCase() !== ex.name.toLowerCase()) {
    const existingExercise = await db
      .select({
        id: exercise.id,
        name: exercise.name,
        isDefault: exercise.isDefault,
      })
      .from(exercise)
      .where(
        and(
          sql`LOWER(${exercise.name}) = LOWER(${input.name.trim()})`,
          or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)),
        ),
      )
      .limit(1);

    if (existingExercise[0]) {
      const existingEx = existingExercise[0];
      duplicate("Exercise", "name", existingEx.name);
    }
  }

  // Build update object
  const updateData: Partial<typeof exercise.$inferInsert> = {};
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.description !== undefined) updateData.description = input.description;
  if (input.category !== undefined) updateData.category = input.category as ExerciseCategory;
  if (input.muscleGroups !== undefined) updateData.muscleGroups = input.muscleGroups;
  if (input.equipment !== undefined) updateData.equipment = input.equipment;
  if (input.exerciseType !== undefined)
    updateData.exerciseType = input.exerciseType as ExerciseType;

  const result = await db
    .update(exercise)
    .set(updateData)
    .where(eq(exercise.id, input.id))
    .returning();

  return result[0];
};

// ============================================================================
// Delete Exercise Handler
// ============================================================================

export const deleteExerciseHandler: DeleteRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Verify the exercise exists and user owns it
  const existing = await db.select().from(exercise).where(eq(exercise.id, input.id)).limit(1);

  const ex = existing[0];
  if (!ex) {
    notFound("Exercise", input.id);
  }

  // Cannot delete default exercises
  if (ex.isDefault) {
    cannotModifyDefault("exercise");
  }

  // Only owner can delete
  if (ex.createdByUserId !== userId) {
    notOwner("exercise");
  }

  // Check if exercise is used in any workouts
  const usageCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(workoutExercise)
    .where(eq(workoutExercise.exerciseId, input.id));

  if (usageCount[0] && usageCount[0].count > 0) {
    resourceInUse("exercise", "workouts");
  }

  await db.delete(exercise).where(eq(exercise.id, input.id));

  return { success: true };
};

// ============================================================================
// Get Equipment List Handler
// ============================================================================

export const getEquipmentListHandler = async () => {
  const results = await db
    .selectDistinct({ equipment: exercise.equipment })
    .from(exercise)
    .where(and(eq(exercise.isDefault, true), sql`${exercise.equipment} IS NOT NULL`));

  return results.map((r) => r.equipment).filter(Boolean) as string[];
};

// ============================================================================
// Get Muscle Groups Handler
// ============================================================================

export const getMuscleGroupsHandler = async () => {
  const results = await db
    .select({ muscleGroups: exercise.muscleGroups })
    .from(exercise)
    .where(eq(exercise.isDefault, true));

  const allMuscleGroups = new Set<string>();
  for (const result of results) {
    const groups = result.muscleGroups as string[];
    for (const group of groups) {
      allMuscleGroups.add(group);
    }
  }

  return [...allMuscleGroups].sort();
};

// ============================================================================
// Check Name Availability Handler
// ============================================================================

export const checkNameAvailabilityHandler: CheckNameAvailabilityRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const existingExercise = await db
    .select({
      id: exercise.id,
      name: exercise.name,
      isDefault: exercise.isDefault,
    })
    .from(exercise)
    .where(
      and(
        sql`LOWER(${exercise.name}) = LOWER(${input.name.trim()})`,
        or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)),
      ),
    )
    .limit(1);

  const existing = existingExercise[0];

  // If we're excluding an ID (for updates), check if the found exercise is the one being updated
  if (existing && input.excludeId && existing.id === input.excludeId) {
    return { available: true };
  }

  if (existing) {
    const message = existing.isDefault
      ? `An exercise named "${existing.name}" already exists in the default library`
      : `You already have an exercise named "${existing.name}"`;
    return { available: false, message };
  }

  return { available: true };
};
