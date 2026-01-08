import type {
  DistanceUnit as DistanceUnitType,
  SetType as SetTypeDb,
  WeightUnit as WeightUnitType,
  WorkoutMood as WorkoutMoodType,
} from "@fit-ai/db/schema/workout";

import type {
  AddExerciseInput,
  AddSetInput,
  CompleteSetInput,
  CompleteWorkoutInput,
  CreateWorkoutInput,
  DeleteSetInput,
  DeleteWorkoutInput,
  GetWorkoutByIdInput,
  ListWorkoutsInput,
  RemoveExerciseInput,
  ReorderExercisesInput,
  UpdateSetInput,
  UpdateWorkoutExerciseInput,
  UpdateWorkoutInput,
} from "./schemas";

import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { exerciseSet, workout, workoutExercise } from "@fit-ai/db/schema/workout";
import { workoutTemplate, workoutTemplateExercise } from "@fit-ai/db/schema/workout-template";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import {
  APP_ERROR_CODES,
  badRequest,
  businessRuleViolation,
  duplicate,
  notFound,
  notOwner,
} from "../../errors";

// ============================================================================
// Types
// ============================================================================

export interface HandlerContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  } | null;
}

export interface AuthenticatedContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getWorkoutWithOwnershipCheck(workoutId: number, userId: string) {
  const result = await db.select().from(workout).where(eq(workout.id, workoutId)).limit(1);

  const w = result[0];
  if (!w) {
    notFound("Workout", workoutId);
  }

  if (w.userId !== userId) {
    notOwner("workout");
  }

  return w;
}

async function getWorkoutExerciseWithCheck(workoutExerciseId: number, workoutId: number) {
  const result = await db
    .select()
    .from(workoutExercise)
    .where(and(eq(workoutExercise.id, workoutExerciseId), eq(workoutExercise.workoutId, workoutId)))
    .limit(1);

  const we = result[0];
  if (!we) {
    notFound("Workout exercise", workoutExerciseId);
  }

  return we;
}

async function getSetWithCheck(setId: number, workoutId: number) {
  const result = await db
    .select({
      set: exerciseSet,
      workoutExercise: workoutExercise,
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .where(and(eq(exerciseSet.id, setId), eq(workoutExercise.workoutId, workoutId)))
    .limit(1);

  const row = result[0];
  if (!row) {
    notFound("Set", setId);
  }

  return row;
}

async function getNextExerciseOrder(workoutId: number): Promise<number> {
  const result = await db
    .select({ maxOrder: sql<number>`MAX(${workoutExercise.order})` })
    .from(workoutExercise)
    .where(eq(workoutExercise.workoutId, workoutId));

  const maxOrder = result[0]?.maxOrder ?? 0;
  return maxOrder + 1;
}

async function getNextSetNumber(workoutExerciseId: number): Promise<number> {
  const result = await db
    .select({ maxSetNumber: sql<number>`MAX(${exerciseSet.setNumber})` })
    .from(exerciseSet)
    .where(eq(exerciseSet.workoutExerciseId, workoutExerciseId));

  const maxSetNumber = result[0]?.maxSetNumber ?? 0;
  return maxSetNumber + 1;
}

// ============================================================================
// Workout Session Handlers
// ============================================================================

export async function listWorkoutsHandler(input: ListWorkoutsInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  const conditions: ReturnType<typeof eq>[] = [eq(workout.userId, userId)];

  if (input.startDate) {
    conditions.push(gte(workout.startedAt, input.startDate));
  }
  if (input.endDate) {
    conditions.push(lte(workout.startedAt, input.endDate));
  }

  if (input.completed !== undefined) {
    if (input.completed) {
      conditions.push(sql`${workout.completedAt} IS NOT NULL`);
    } else {
      conditions.push(sql`${workout.completedAt} IS NULL`);
    }
  }

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(workout)
    .where(and(...conditions));

  const total = countResult[0]?.count ?? 0;

  const workouts = await db
    .select()
    .from(workout)
    .where(and(...conditions))
    .orderBy(desc(workout.startedAt))
    .limit(input.limit)
    .offset(input.offset);

  return {
    workouts,
    total,
    limit: input.limit,
    offset: input.offset,
  };
}

export async function getWorkoutByIdHandler(
  input: GetWorkoutByIdInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  const w = await getWorkoutWithOwnershipCheck(input.workoutId, userId);

  const exercisesWithDetails = await db
    .select({
      workoutExercise: workoutExercise,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
        equipment: exercise.equipment,
      },
    })
    .from(workoutExercise)
    .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .where(eq(workoutExercise.workoutId, input.workoutId))
    .orderBy(workoutExercise.order);

  const workoutExerciseIds = exercisesWithDetails.map((e) => e.workoutExercise.id);

  let allSets: (typeof exerciseSet.$inferSelect)[] = [];
  if (workoutExerciseIds.length > 0) {
    allSets = await db
      .select()
      .from(exerciseSet)
      .where(
        sql`${exerciseSet.workoutExerciseId} IN (${sql.join(
          workoutExerciseIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      )
      .orderBy(exerciseSet.setNumber);
  }

  const setsByExercise = new Map<number, (typeof exerciseSet.$inferSelect)[]>();
  for (const set of allSets) {
    const existing = setsByExercise.get(set.workoutExerciseId) ?? [];
    existing.push(set);
    setsByExercise.set(set.workoutExerciseId, existing);
  }

  const workoutExercises = exercisesWithDetails.map((e) => ({
    ...e.workoutExercise,
    exercise: e.exercise,
    sets: setsByExercise.get(e.workoutExercise.id) ?? [],
  }));

  return {
    ...w,
    workoutExercises,
  };
}

export async function createWorkoutHandler(
  input: CreateWorkoutInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;

  let templateData: {
    template: typeof workoutTemplate.$inferSelect;
    exercises: (typeof workoutTemplateExercise.$inferSelect)[];
  } | null = null;

  if (input.templateId) {
    const templateResult = await db
      .select()
      .from(workoutTemplate)
      .where(eq(workoutTemplate.id, input.templateId))
      .limit(1);

    const template = templateResult[0];
    if (!template) {
      notFound("Template", input.templateId);
    }

    if (template.userId !== userId && !template.isPublic) {
      notOwner("template");
    }

    const templateExercises = await db
      .select()
      .from(workoutTemplateExercise)
      .where(eq(workoutTemplateExercise.templateId, input.templateId))
      .orderBy(workoutTemplateExercise.order);

    templateData = { template, exercises: templateExercises };
  }

  const workoutResult = await db
    .insert(workout)
    .values({
      userId,
      name: input.name ?? templateData?.template.name ?? null,
      notes: input.notes ?? null,
      templateId: input.templateId ?? null,
    })
    .returning();

  const newWorkout = workoutResult[0];
  if (!newWorkout) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create workout" });
  }

  const workoutExercises: Array<{
    id: number;
    workoutId: number;
    exerciseId: number;
    order: number;
    notes: string | null;
    supersetGroupId: number | null;
    createdAt: Date;
    updatedAt: Date;
    exercise?: {
      id: number;
      name: string;
      category: string;
      exerciseType: string;
      equipment: string | null;
    };
    sets: (typeof exerciseSet.$inferSelect)[];
  }> = [];

  if (templateData && templateData.exercises.length > 0) {
    const exerciseValues = templateData.exercises.map((te) => ({
      workoutId: newWorkout.id,
      exerciseId: te.exerciseId,
      order: te.order,
      notes: te.notes,
      supersetGroupId: te.supersetGroupId,
    }));

    const insertedExercises = await db.insert(workoutExercise).values(exerciseValues).returning();

    const setValues: Array<{
      workoutExerciseId: number;
      setNumber: number;
      targetReps: number | null;
      targetWeight: number | null;
      setType: SetTypeDb;
    }> = [];

    for (let i = 0; i < templateData.exercises.length; i++) {
      const templateExercise = templateData.exercises[i];
      const insertedExercise = insertedExercises[i];
      if (templateExercise && insertedExercise) {
        let targetReps: number | null = null;
        if (templateExercise.targetReps) {
          const match = templateExercise.targetReps.match(/\d+/);
          if (match) {
            targetReps = Number.parseInt(match[0], 10);
          }
        }

        for (let setNum = 1; setNum <= templateExercise.targetSets; setNum++) {
          setValues.push({
            workoutExerciseId: insertedExercise.id,
            setNumber: setNum,
            targetReps,
            targetWeight: templateExercise.targetWeight,
            setType: "normal" as SetTypeDb,
          });
        }
      }
    }

    let insertedSets: (typeof exerciseSet.$inferSelect)[] = [];
    if (setValues.length > 0) {
      insertedSets = await db.insert(exerciseSet).values(setValues).returning();
    }

    const setsByExercise = new Map<number, (typeof exerciseSet.$inferSelect)[]>();
    for (const set of insertedSets) {
      const existing = setsByExercise.get(set.workoutExerciseId) ?? [];
      existing.push(set);
      setsByExercise.set(set.workoutExerciseId, existing);
    }

    const exerciseIds = insertedExercises.map((e) => e.exerciseId);
    const exerciseDetails = await db
      .select({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
        equipment: exercise.equipment,
      })
      .from(exercise)
      .where(
        sql`${exercise.id} IN (${sql.join(
          exerciseIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );

    const exerciseMap = new Map(exerciseDetails.map((e) => [e.id, e]));

    for (const we of insertedExercises) {
      workoutExercises.push({
        ...we,
        exercise: exerciseMap.get(we.exerciseId),
        sets: setsByExercise.get(we.id) ?? [],
      });
    }

    await db
      .update(workoutTemplate)
      .set({ timesUsed: sql`${workoutTemplate.timesUsed} + 1` })
      .where(eq(workoutTemplate.id, input.templateId!));
  }

  return {
    ...newWorkout,
    workoutExercises,
  };
}

export async function updateWorkoutHandler(
  input: UpdateWorkoutInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);

  const updateData: Partial<typeof workout.$inferInsert> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.notes !== undefined) updateData.notes = input.notes;

  if (Object.keys(updateData).length === 0) {
    badRequest("No fields to update");
  }

  const result = await db
    .update(workout)
    .set(updateData)
    .where(eq(workout.id, input.workoutId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update workout" });
  }

  return updated;
}

export async function deleteWorkoutHandler(
  input: DeleteWorkoutInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);

  await db.delete(workout).where(eq(workout.id, input.workoutId));

  return { success: true };
}

export async function completeWorkoutHandler(
  input: CompleteWorkoutInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  const w = await getWorkoutWithOwnershipCheck(input.workoutId, userId);

  if (w.completedAt) {
    businessRuleViolation(
      APP_ERROR_CODES.WORKOUT_ALREADY_COMPLETED,
      "Workout is already completed",
      "Start a new workout instead",
    );
  }

  const updateData: Partial<typeof workout.$inferInsert> = {
    completedAt: new Date(),
  };

  if (input.rating !== undefined) updateData.rating = input.rating;
  if (input.mood !== undefined) updateData.mood = input.mood as WorkoutMoodType;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const result = await db
    .update(workout)
    .set(updateData)
    .where(eq(workout.id, input.workoutId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to complete workout" });
  }

  return updated;
}

// ============================================================================
// Workout Exercise Handlers
// ============================================================================

export async function addExerciseHandler(input: AddExerciseInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);

  const exerciseResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  const ex = exerciseResult[0];
  if (!ex) {
    notFound("Exercise", input.exerciseId);
  }

  if (!ex.isDefault && ex.createdByUserId !== userId) {
    notOwner("exercise");
  }

  const existingExercise = await db
    .select()
    .from(workoutExercise)
    .where(
      and(
        eq(workoutExercise.workoutId, input.workoutId),
        eq(workoutExercise.exerciseId, input.exerciseId),
      ),
    )
    .limit(1);

  if (existingExercise[0]) {
    duplicate("Exercise", "workout", ex.name);
  }

  const order = input.order ?? (await getNextExerciseOrder(input.workoutId));

  const result = await db
    .insert(workoutExercise)
    .values({
      workoutId: input.workoutId,
      exerciseId: input.exerciseId,
      order,
      notes: input.notes ?? null,
      supersetGroupId: input.supersetGroupId ?? null,
    })
    .returning();

  const newExercise = result[0];
  if (!newExercise) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to add exercise" });
  }

  return {
    ...newExercise,
    exercise: {
      id: ex.id,
      name: ex.name,
      category: ex.category,
      exerciseType: ex.exerciseType,
      equipment: ex.equipment,
    },
    sets: [],
  };
}

export async function updateWorkoutExerciseHandler(
  input: UpdateWorkoutExerciseInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);
  await getWorkoutExerciseWithCheck(input.workoutExerciseId, input.workoutId);

  const updateData: Partial<typeof workoutExercise.$inferInsert> = {};
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.supersetGroupId !== undefined) updateData.supersetGroupId = input.supersetGroupId;

  if (Object.keys(updateData).length === 0) {
    badRequest("No fields to update");
  }

  const result = await db
    .update(workoutExercise)
    .set(updateData)
    .where(eq(workoutExercise.id, input.workoutExerciseId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update exercise" });
  }

  const exerciseResult = await db
    .select({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      exerciseType: exercise.exerciseType,
      equipment: exercise.equipment,
    })
    .from(exercise)
    .where(eq(exercise.id, updated.exerciseId))
    .limit(1);

  const sets = await db
    .select()
    .from(exerciseSet)
    .where(eq(exerciseSet.workoutExerciseId, updated.id))
    .orderBy(exerciseSet.setNumber);

  return {
    ...updated,
    exercise: exerciseResult[0],
    sets,
  };
}

export async function removeExerciseHandler(
  input: RemoveExerciseInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);
  await getWorkoutExerciseWithCheck(input.workoutExerciseId, input.workoutId);

  await db.delete(workoutExercise).where(eq(workoutExercise.id, input.workoutExerciseId));

  return { success: true };
}

export async function reorderExercisesHandler(
  input: ReorderExercisesInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);

  for (const item of input.exerciseOrder) {
    await db
      .update(workoutExercise)
      .set({ order: item.order })
      .where(
        and(
          eq(workoutExercise.id, item.workoutExerciseId),
          eq(workoutExercise.workoutId, input.workoutId),
        ),
      );
  }

  return { success: true };
}

// ============================================================================
// Set Handlers
// ============================================================================

export async function addSetHandler(input: AddSetInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);
  await getWorkoutExerciseWithCheck(input.workoutExerciseId, input.workoutId);

  const setNumber = await getNextSetNumber(input.workoutExerciseId);

  const result = await db
    .insert(exerciseSet)
    .values({
      workoutExerciseId: input.workoutExerciseId,
      setNumber,
      reps: input.reps ?? null,
      weight: input.weight ?? null,
      weightUnit: (input.weightUnit as WeightUnitType) ?? null,
      durationSeconds: input.durationSeconds ?? null,
      distance: input.distance ?? null,
      distanceUnit: (input.distanceUnit as DistanceUnitType) ?? null,
      holdTimeSeconds: input.holdTimeSeconds ?? null,
      setType: (input.setType as SetTypeDb) ?? "normal",
      rpe: input.rpe ?? null,
      rir: input.rir ?? null,
      targetReps: input.targetReps ?? null,
      targetWeight: input.targetWeight ?? null,
      notes: input.notes ?? null,
      isCompleted: false,
    })
    .returning();

  const newSet = result[0];
  if (!newSet) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to add set" });
  }

  return newSet;
}

export async function updateSetHandler(input: UpdateSetInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);
  await getSetWithCheck(input.setId, input.workoutId);

  const updateData: Partial<typeof exerciseSet.$inferInsert> = {};
  if (input.reps !== undefined) updateData.reps = input.reps;
  if (input.weight !== undefined) updateData.weight = input.weight;
  if (input.weightUnit !== undefined) updateData.weightUnit = input.weightUnit as WeightUnitType;
  if (input.durationSeconds !== undefined) updateData.durationSeconds = input.durationSeconds;
  if (input.distance !== undefined) updateData.distance = input.distance;
  if (input.distanceUnit !== undefined)
    updateData.distanceUnit = input.distanceUnit as DistanceUnitType;
  if (input.holdTimeSeconds !== undefined) updateData.holdTimeSeconds = input.holdTimeSeconds;
  if (input.setType !== undefined) updateData.setType = input.setType as SetTypeDb;
  if (input.rpe !== undefined) updateData.rpe = input.rpe;
  if (input.rir !== undefined) updateData.rir = input.rir;
  if (input.targetReps !== undefined) updateData.targetReps = input.targetReps;
  if (input.targetWeight !== undefined) updateData.targetWeight = input.targetWeight;
  if (input.restTimeSeconds !== undefined) updateData.restTimeSeconds = input.restTimeSeconds;
  if (input.notes !== undefined) updateData.notes = input.notes;

  if (Object.keys(updateData).length === 0) {
    badRequest("No fields to update");
  }

  const result = await db
    .update(exerciseSet)
    .set(updateData)
    .where(eq(exerciseSet.id, input.setId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update set" });
  }

  return updated;
}

export async function deleteSetHandler(input: DeleteSetInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);
  await getSetWithCheck(input.setId, input.workoutId);

  await db.delete(exerciseSet).where(eq(exerciseSet.id, input.setId));

  return { success: true };
}

export async function completeSetHandler(input: CompleteSetInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  await getWorkoutWithOwnershipCheck(input.workoutId, userId);
  const { set } = await getSetWithCheck(input.setId, input.workoutId);

  if (set.isCompleted) {
    businessRuleViolation(
      APP_ERROR_CODES.WORKOUT_ALREADY_COMPLETED,
      "Set is already completed",
      "Add a new set instead",
    );
  }

  const updateData: Partial<typeof exerciseSet.$inferInsert> = {
    isCompleted: true,
    completedAt: new Date(),
  };

  if (input.restTimeSeconds !== undefined) {
    updateData.restTimeSeconds = input.restTimeSeconds;
  }

  const result = await db
    .update(exerciseSet)
    .set(updateData)
    .where(eq(exerciseSet.id, input.setId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to complete set" });
  }

  return updated;
}
