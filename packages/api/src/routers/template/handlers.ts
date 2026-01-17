import type { SQL } from "drizzle-orm";
import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { exerciseSet, workout, workoutExercise } from "@fit-ai/db/schema/workout";
import {
  templateDay,
  templateFolder,
  workoutTemplate,
  workoutTemplateExercise,
} from "@fit-ai/db/schema/workout-template";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, inArray, like, sql } from "drizzle-orm";

import { badRequest, notFound, notOwner } from "../../errors";

import type {
  AddExerciseRouteHandler,
  CreateDayRouteHandler,
  CreateFolderRouteHandler,
  CreateTemplateRouteHandler,
  DeleteDayRouteHandler,
  DeleteFolderRouteHandler,
  DeleteTemplateRouteHandler,
  DuplicateTemplateRouteHandler,
  GetDayByIdRouteHandler,
  GetTemplateByIdRouteHandler,
  ListDaysRouteHandler,
  ListFoldersRouteHandler,
  ListTemplatesRouteHandler,
  RemoveExerciseRouteHandler,
  ReorderDaysRouteHandler,
  ReorderExercisesRouteHandler,
  ReorderFoldersRouteHandler,
  StartWorkoutRouteHandler,
  UpdateDayRouteHandler,
  UpdateExerciseRouteHandler,
  UpdateFolderRouteHandler,
  UpdateTemplateRouteHandler,
} from "./contracts";

// ============================================================================
// Helper Functions
// ============================================================================

async function verifyTemplateOwnership(
  templateId: number,
  userId: string,
): Promise<typeof workoutTemplate.$inferSelect> {
  const result = await db
    .select()
    .from(workoutTemplate)
    .where(eq(workoutTemplate.id, templateId))
    .limit(1);

  const template = result[0];
  if (!template) {
    notFound("Template", templateId);
  }

  if (template.userId !== userId) {
    notOwner("template");
  }

  return template;
}

async function verifyTemplateAccess(
  templateId: number,
  userId: string,
): Promise<typeof workoutTemplate.$inferSelect> {
  const result = await db
    .select()
    .from(workoutTemplate)
    .where(eq(workoutTemplate.id, templateId))
    .limit(1);

  const template = result[0];
  if (!template) {
    notFound("Template", templateId);
  }

  if (template.userId !== userId && !template.isPublic) {
    notOwner("template");
  }

  return template;
}

async function verifyFolderOwnership(
  folderId: number,
  userId: string,
): Promise<typeof templateFolder.$inferSelect> {
  const result = await db
    .select()
    .from(templateFolder)
    .where(eq(templateFolder.id, folderId))
    .limit(1);

  const folder = result[0];
  if (!folder) {
    notFound("Folder", folderId);
  }

  if (folder.userId !== userId) {
    notOwner("folder");
  }

  return folder;
}

/**
 * Verify that a day belongs to a template
 * @throws ORPCError NOT_FOUND if day doesn't exist or doesn't belong to template
 * @throws ORPCError BAD_REQUEST if day is a rest day (when checkRestDay is true)
 */
async function verifyDayBelongsToTemplate(
  dayId: number,
  templateId: number,
  options: { checkRestDay?: boolean } = {},
): Promise<typeof templateDay.$inferSelect> {
  const result = await db
    .select()
    .from(templateDay)
    .where(and(eq(templateDay.id, dayId), eq(templateDay.templateId, templateId)))
    .limit(1);

  const day = result[0];
  if (!day) {
    notFound("Day", dayId);
  }

  if (options.checkRestDay && day.isRestDay) {
    throw new ORPCError("BAD_REQUEST", { message: "Cannot add exercises to a rest day" });
  }

  return day;
}

// ============================================================================
// Folder Handlers
// ============================================================================

export const listFoldersHandler: ListFoldersRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  const folders = await db
    .select()
    .from(templateFolder)
    .where(eq(templateFolder.userId, userId))
    .orderBy(asc(templateFolder.order));

  return folders;
};

export const createFolderHandler: CreateFolderRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Check for existing folder with same name for this user
  const existingFolder = await db
    .select({ id: templateFolder.id })
    .from(templateFolder)
    .where(and(eq(templateFolder.userId, userId), eq(templateFolder.name, input.name)))
    .limit(1);

  if (existingFolder.length > 0) {
    throw new ORPCError("CONFLICT", { message: "A folder with this name already exists" });
  }

  const maxOrderResult = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${templateFolder.order}), -1)` })
    .from(templateFolder)
    .where(eq(templateFolder.userId, userId));

  const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

  const result = await db
    .insert(templateFolder)
    .values({
      userId,
      name: input.name,
      order: nextOrder,
    })
    .returning();

  return result[0];
};

export const updateFolderHandler: UpdateFolderRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyFolderOwnership(input.id, userId);

  // Check for existing folder with same name (excluding current folder)
  if (input.name !== undefined) {
    const existingFolder = await db
      .select({ id: templateFolder.id })
      .from(templateFolder)
      .where(
        and(
          eq(templateFolder.userId, userId),
          eq(templateFolder.name, input.name),
          sql`${templateFolder.id} != ${input.id}`,
        ),
      )
      .limit(1);

    if (existingFolder.length > 0) {
      throw new ORPCError("CONFLICT", { message: "A folder with this name already exists" });
    }
  }

  const updateData: Partial<typeof templateFolder.$inferInsert> = {};
  if (input.name !== undefined) updateData.name = input.name;

  const result = await db
    .update(templateFolder)
    .set(updateData)
    .where(eq(templateFolder.id, input.id))
    .returning();

  return result[0];
};

export const deleteFolderHandler: DeleteFolderRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyFolderOwnership(input.id, userId);

  await db.delete(templateFolder).where(eq(templateFolder.id, input.id));

  return { success: true };
};

export const reorderFoldersHandler: ReorderFoldersRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const folders = await db
    .select()
    .from(templateFolder)
    .where(and(eq(templateFolder.userId, userId), inArray(templateFolder.id, input.folderIds)));

  if (folders.length !== input.folderIds.length) {
    badRequest("Some folder IDs are invalid or do not belong to you");
  }

  for (let i = 0; i < input.folderIds.length; i++) {
    const folderId = input.folderIds[i];
    if (folderId !== undefined) {
      await db.update(templateFolder).set({ order: i }).where(eq(templateFolder.id, folderId));
    }
  }

  return { success: true };
};

// ============================================================================
// Template Handlers
// ============================================================================

export const listTemplatesHandler: ListTemplatesRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  let ownershipCondition;
  if (input.includePublic) {
    ownershipCondition = sql`(${workoutTemplate.userId} = ${userId} OR ${workoutTemplate.isPublic} = 1)`;
  } else {
    ownershipCondition = eq(workoutTemplate.userId, userId);
  }

  const conditions: SQL[] = [];

  if (input.folderId !== undefined) {
    if (input.includeNoFolder) {
      conditions.push(
        sql`(${workoutTemplate.folderId} = ${input.folderId} OR ${workoutTemplate.folderId} IS NULL)`,
      );
    } else {
      conditions.push(eq(workoutTemplate.folderId, input.folderId));
    }
  }

  const templates = await db
    .select()
    .from(workoutTemplate)
    .where(conditions.length > 0 ? and(ownershipCondition, ...conditions) : ownershipCondition)
    .orderBy(desc(workoutTemplate.updatedAt))
    .limit(input.limit)
    .offset(input.offset);

  return templates;
};

export const getTemplateByIdHandler: GetTemplateByIdRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const template = await verifyTemplateAccess(input.id, userId);

  // Get all days for this template
  const days = await db
    .select()
    .from(templateDay)
    .where(eq(templateDay.templateId, input.id))
    .orderBy(asc(templateDay.order));

  // Get all exercises for this template
  const allExercises = await db
    .select({
      id: workoutTemplateExercise.id,
      templateId: workoutTemplateExercise.templateId,
      templateDayId: workoutTemplateExercise.templateDayId,
      exerciseId: workoutTemplateExercise.exerciseId,
      order: workoutTemplateExercise.order,
      supersetGroupId: workoutTemplateExercise.supersetGroupId,
      notes: workoutTemplateExercise.notes,
      targetSets: workoutTemplateExercise.targetSets,
      targetReps: workoutTemplateExercise.targetReps,
      targetWeight: workoutTemplateExercise.targetWeight,
      restSeconds: workoutTemplateExercise.restSeconds,
      createdAt: workoutTemplateExercise.createdAt,
      updatedAt: workoutTemplateExercise.updatedAt,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
      },
    })
    .from(workoutTemplateExercise)
    .leftJoin(exercise, eq(workoutTemplateExercise.exerciseId, exercise.id))
    .where(eq(workoutTemplateExercise.templateId, input.id))
    .orderBy(asc(workoutTemplateExercise.order));

  // Map exercises to their respective days
  // Note: LEFT JOIN may return an object with all null fields instead of null itself
  const daysWithExercises = days.map((day) => ({
    ...day,
    exercises: allExercises
      .filter((e) => e.templateDayId === day.id)
      .map((e) => ({
        ...e,
        exercise: e.exercise?.id != null ? e.exercise : undefined,
      })),
  }));

  // Legacy exercises (those without a day assignment)
  const legacyExercises = allExercises
    .filter((e) => e.templateDayId === null)
    .map((e) => ({
      ...e,
      exercise: e.exercise?.id != null ? e.exercise : undefined,
    }));

  return {
    ...template,
    days: daysWithExercises,
    exercises: legacyExercises,
  };
};

export const createTemplateHandler: CreateTemplateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  if (input.folderId) {
    await verifyFolderOwnership(input.folderId, userId);
  }

  const result = await db
    .insert(workoutTemplate)
    .values({
      userId,
      folderId: input.folderId,
      name: input.name,
      description: input.description,
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      isPublic: input.isPublic,
    })
    .returning();

  return result[0];
};

export const updateTemplateHandler: UpdateTemplateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.id, userId);

  if (input.folderId !== undefined && input.folderId !== null) {
    await verifyFolderOwnership(input.folderId, userId);
  }

  const updateData: Partial<typeof workoutTemplate.$inferInsert> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.folderId !== undefined) updateData.folderId = input.folderId;
  if (input.estimatedDurationMinutes !== undefined)
    updateData.estimatedDurationMinutes = input.estimatedDurationMinutes;
  if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

  const result = await db
    .update(workoutTemplate)
    .set(updateData)
    .where(eq(workoutTemplate.id, input.id))
    .returning();

  return result[0];
};

export const deleteTemplateHandler: DeleteTemplateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.id, userId);

  await db.delete(workoutTemplate).where(eq(workoutTemplate.id, input.id));

  return { success: true };
};

export const duplicateTemplateHandler: DuplicateTemplateRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  // Use verifyTemplateAccess to allow duplicating both owned and public templates
  const template = await verifyTemplateAccess(input.id, userId);

  // Generate smart copy name: "Template Copy 1", "Template Copy 2", etc.
  // First, strip any existing copy suffixes to get the base name
  const baseName = template.name.replace(/ Copy \d+$/, "").replace(/ \(Copy\)$/, "");

  // Find existing copies to determine the next copy number
  const existingCopies = await db
    .select({ name: workoutTemplate.name })
    .from(workoutTemplate)
    .where(
      and(eq(workoutTemplate.userId, userId), like(workoutTemplate.name, `${baseName} Copy%`)),
    );

  // Extract the highest copy number from existing copies
  let maxCopyNum = 0;
  for (const copy of existingCopies) {
    const match = copy.name.match(/ Copy (\d+)$/);
    if (match?.[1]) {
      maxCopyNum = Math.max(maxCopyNum, Number.parseInt(match[1], 10));
    }
  }

  const newName = `${baseName} Copy ${maxCopyNum + 1}`;

  const newTemplateResult = await db
    .insert(workoutTemplate)
    .values({
      userId,
      folderId: template.folderId,
      name: newName,
      description: template.description,
      estimatedDurationMinutes: template.estimatedDurationMinutes,
      isPublic: false,
    })
    .returning();

  const newTemplate = newTemplateResult[0];
  if (!newTemplate) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create template copy" });
  }

  // Get original days
  const originalDays = await db
    .select()
    .from(templateDay)
    .where(eq(templateDay.templateId, input.id))
    .orderBy(asc(templateDay.order));

  // Create a mapping from old day IDs to new day IDs
  const dayIdMapping = new Map<number, number>();

  // Duplicate days
  for (const day of originalDays) {
    const [newDay] = await db
      .insert(templateDay)
      .values({
        templateId: newTemplate.id,
        name: day.name,
        description: day.description,
        order: day.order,
        isRestDay: day.isRestDay,
        estimatedDurationMinutes: day.estimatedDurationMinutes,
      })
      .returning();
    if (newDay) {
      dayIdMapping.set(day.id, newDay.id);
    }
  }

  // Get original exercises
  const originalExercises = await db
    .select()
    .from(workoutTemplateExercise)
    .where(eq(workoutTemplateExercise.templateId, input.id))
    .orderBy(asc(workoutTemplateExercise.order));

  // Batch insert all exercises with mapped day IDs
  if (originalExercises.length > 0) {
    await db.insert(workoutTemplateExercise).values(
      originalExercises.map((ex) => ({
        templateId: newTemplate.id,
        templateDayId: ex.templateDayId ? (dayIdMapping.get(ex.templateDayId) ?? null) : null,
        exerciseId: ex.exerciseId,
        order: ex.order,
        supersetGroupId: ex.supersetGroupId,
        notes: ex.notes,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        targetWeight: ex.targetWeight,
        restSeconds: ex.restSeconds,
      })),
    );
  }

  // Get duplicated days
  const newDays = await db
    .select()
    .from(templateDay)
    .where(eq(templateDay.templateId, newTemplate.id))
    .orderBy(asc(templateDay.order));

  // Get all exercises for the new template
  const allExercises = await db
    .select({
      id: workoutTemplateExercise.id,
      templateId: workoutTemplateExercise.templateId,
      templateDayId: workoutTemplateExercise.templateDayId,
      exerciseId: workoutTemplateExercise.exerciseId,
      order: workoutTemplateExercise.order,
      supersetGroupId: workoutTemplateExercise.supersetGroupId,
      notes: workoutTemplateExercise.notes,
      targetSets: workoutTemplateExercise.targetSets,
      targetReps: workoutTemplateExercise.targetReps,
      targetWeight: workoutTemplateExercise.targetWeight,
      restSeconds: workoutTemplateExercise.restSeconds,
      createdAt: workoutTemplateExercise.createdAt,
      updatedAt: workoutTemplateExercise.updatedAt,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
      },
    })
    .from(workoutTemplateExercise)
    .leftJoin(exercise, eq(workoutTemplateExercise.exerciseId, exercise.id))
    .where(eq(workoutTemplateExercise.templateId, newTemplate.id))
    .orderBy(asc(workoutTemplateExercise.order));

  // Map exercises to their respective days
  // Note: LEFT JOIN may return an object with all null fields instead of null itself
  const daysWithExercises = newDays.map((day) => ({
    ...day,
    exercises: allExercises
      .filter((e) => e.templateDayId === day.id)
      .map((e) => ({
        ...e,
        exercise: e.exercise?.id != null ? e.exercise : undefined,
      })),
  }));

  // Legacy exercises (those without a day assignment)
  const legacyExercises = allExercises
    .filter((e) => e.templateDayId === null)
    .map((e) => ({
      ...e,
      exercise: e.exercise?.id != null ? e.exercise : undefined,
    }));

  return {
    ...newTemplate,
    days: daysWithExercises,
    exercises: legacyExercises,
  };
};

export const startWorkoutHandler: StartWorkoutRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const template = await verifyTemplateAccess(input.id, userId);

  // Get template days
  const days = await db
    .select()
    .from(templateDay)
    .where(eq(templateDay.templateId, input.id))
    .orderBy(asc(templateDay.order));

  let selectedDay: (typeof days)[0] | undefined;
  let workoutName = template.name;

  if (days.length === 0) {
    // Legacy template - no days yet
    // Check for legacy exercises (exercises with null templateDayId)
    const legacyExercises = await db
      .select()
      .from(workoutTemplateExercise)
      .where(
        and(
          eq(workoutTemplateExercise.templateId, input.id),
          sql`${workoutTemplateExercise.templateDayId} IS NULL`,
        ),
      )
      .limit(1);

    if (legacyExercises.length > 0) {
      // Auto-create default day and migrate exercises
      const [defaultDay] = await db
        .insert(templateDay)
        .values({
          templateId: template.id,
          name: template.name,
          order: 1,
          isRestDay: false,
        })
        .returning();

      if (defaultDay) {
        // Migrate existing exercises to this day
        await db
          .update(workoutTemplateExercise)
          .set({ templateDayId: defaultDay.id })
          .where(
            and(
              eq(workoutTemplateExercise.templateId, template.id),
              sql`${workoutTemplateExercise.templateDayId} IS NULL`,
            ),
          );

        selectedDay = defaultDay;
      }
    } else {
      throw new ORPCError("BAD_REQUEST", {
        message: "Template has no workout days",
      });
    }
  } else if (input.dayId) {
    // Specific day requested
    selectedDay = days.find((d) => d.id === input.dayId);
    if (!selectedDay) {
      throw new ORPCError("NOT_FOUND", { message: "Day not found in this template" });
    }
    if (selectedDay.isRestDay) {
      throw new ORPCError("BAD_REQUEST", { message: "Cannot start workout from rest day" });
    }
    // Include day name in workout name for multi-day templates
    if (days.length > 1) {
      workoutName = `${template.name} - ${selectedDay.name}`;
    }
  } else if (days.length === 1) {
    // Single day - auto-select
    selectedDay = days[0];
    if (selectedDay?.isRestDay) {
      throw new ORPCError("BAD_REQUEST", { message: "Template only has a rest day" });
    }
  } else {
    // Multiple days, no selection - error
    const availableDays = days
      .filter((d) => !d.isRestDay)
      .map((d) => ({ id: d.id, name: d.name, order: d.order }));

    throw new ORPCError("BAD_REQUEST", {
      message: "Template has multiple days. Please specify dayId.",
      data: { availableDays },
    });
  }

  if (!selectedDay) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to determine workout day" });
  }

  // Create workout
  const workoutResult = await db
    .insert(workout)
    .values({
      userId,
      name: workoutName,
      templateId: template.id,
    })
    .returning();

  const newWorkout = workoutResult[0];
  if (!newWorkout) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create workout" });
  }

  // Get exercises for selected day
  const templateExercises = await db
    .select()
    .from(workoutTemplateExercise)
    .where(eq(workoutTemplateExercise.templateDayId, selectedDay.id))
    .orderBy(asc(workoutTemplateExercise.order));

  // Batch insert all workout exercises at once to avoid N+1 queries
  if (templateExercises.length > 0) {
    const createdWorkoutExercises = await db
      .insert(workoutExercise)
      .values(
        templateExercises.map((templateEx) => ({
          workoutId: newWorkout.id,
          exerciseId: templateEx.exerciseId,
          order: templateEx.order,
          notes: templateEx.notes,
          supersetGroupId: templateEx.supersetGroupId,
        })),
      )
      .returning();

    // Prepare all exercise sets for batch insert
    const allSets: {
      workoutExerciseId: number;
      setNumber: number;
      targetReps: number | null;
      targetWeight: number | null;
      restTimeSeconds: number | null;
      isCompleted: boolean;
    }[] = [];

    for (let i = 0; i < templateExercises.length; i++) {
      const templateEx = templateExercises[i];
      const workoutEx = createdWorkoutExercises[i];

      if (templateEx && workoutEx) {
        for (let setNum = 1; setNum <= templateEx.targetSets; setNum++) {
          allSets.push({
            workoutExerciseId: workoutEx.id,
            setNumber: setNum,
            targetReps: templateEx.targetReps
              ? Number.parseInt(templateEx.targetReps.split("-")[0] ?? "0", 10)
              : null,
            targetWeight: templateEx.targetWeight,
            restTimeSeconds: templateEx.restSeconds,
            isCompleted: false,
          });
        }
      }
    }

    // Insert exercise sets one at a time to avoid SQLite/D1 variable limits
    // D1 has stricter limits than standard SQLite
    for (const set of allSets) {
      await db.insert(exerciseSet).values(set);
    }
  }

  await db
    .update(workoutTemplate)
    .set({ timesUsed: sql`${workoutTemplate.timesUsed} + 1` })
    .where(eq(workoutTemplate.id, template.id));

  return newWorkout;
};

// ============================================================================
// Template Exercise Handlers
// ============================================================================

export const addExerciseHandler: AddExerciseRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.id, userId);

  // Verify day belongs to template and is not a rest day
  await verifyDayBelongsToTemplate(input.dayId, input.id, { checkRestDay: true });

  const exerciseResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  const foundExercise = exerciseResult[0];
  if (!foundExercise) {
    notFound("Exercise", input.exerciseId);
  }

  // Get max order for this DAY (not template)
  let order = input.order;
  if (order === undefined) {
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${workoutTemplateExercise.order}), 0)` })
      .from(workoutTemplateExercise)
      .where(eq(workoutTemplateExercise.templateDayId, input.dayId));
    order = (maxOrderResult[0]?.maxOrder ?? 0) + 1;
  }

  const result = await db
    .insert(workoutTemplateExercise)
    .values({
      templateId: input.id,
      templateDayId: input.dayId,
      exerciseId: input.exerciseId,
      order,
      supersetGroupId: input.supersetGroupId,
      notes: input.notes,
      targetSets: input.targetSets,
      targetReps: input.targetReps,
      targetWeight: input.targetWeight,
      restSeconds: input.restSeconds,
    })
    .returning();

  const templateExercise = result[0];
  if (!templateExercise) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to add exercise" });
  }

  // Return with nested exercise details
  return {
    ...templateExercise,
    exercise: {
      id: foundExercise.id,
      name: foundExercise.name,
      category: foundExercise.category,
      exerciseType: foundExercise.exerciseType,
    },
  };
};

export const updateExerciseHandler: UpdateExerciseRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);

  // Verify day belongs to template
  await verifyDayBelongsToTemplate(input.dayId, input.templateId);

  const existing = await db
    .select()
    .from(workoutTemplateExercise)
    .where(
      and(
        eq(workoutTemplateExercise.id, input.exerciseId),
        eq(workoutTemplateExercise.templateDayId, input.dayId),
      ),
    )
    .limit(1);

  if (!existing[0]) {
    notFound("Template exercise", input.exerciseId);
  }

  const updateData: Partial<typeof workoutTemplateExercise.$inferInsert> = {};
  if (input.order !== undefined) updateData.order = input.order;
  if (input.supersetGroupId !== undefined) updateData.supersetGroupId = input.supersetGroupId;
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.targetSets !== undefined) updateData.targetSets = input.targetSets;
  if (input.targetReps !== undefined) updateData.targetReps = input.targetReps;
  if (input.targetWeight !== undefined) updateData.targetWeight = input.targetWeight;
  if (input.restSeconds !== undefined) updateData.restSeconds = input.restSeconds;

  const result = await db
    .update(workoutTemplateExercise)
    .set(updateData)
    .where(eq(workoutTemplateExercise.id, input.exerciseId))
    .returning();

  return result[0];
};

export const removeExerciseHandler: RemoveExerciseRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);

  // Verify day belongs to template
  await verifyDayBelongsToTemplate(input.dayId, input.templateId);

  const existing = await db
    .select()
    .from(workoutTemplateExercise)
    .where(
      and(
        eq(workoutTemplateExercise.id, input.exerciseId),
        eq(workoutTemplateExercise.templateDayId, input.dayId),
      ),
    )
    .limit(1);

  if (!existing[0]) {
    notFound("Template exercise", input.exerciseId);
  }

  await db.delete(workoutTemplateExercise).where(eq(workoutTemplateExercise.id, input.exerciseId));

  return { success: true };
};

export const reorderExercisesHandler: ReorderExercisesRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.id, userId);

  // Verify day belongs to template
  await verifyDayBelongsToTemplate(input.dayId, input.id);

  const exercises = await db
    .select()
    .from(workoutTemplateExercise)
    .where(
      and(
        eq(workoutTemplateExercise.templateDayId, input.dayId),
        inArray(workoutTemplateExercise.id, input.exerciseIds),
      ),
    );

  if (exercises.length !== input.exerciseIds.length) {
    badRequest("Some exercise IDs are invalid or do not belong to this day");
  }

  for (let i = 0; i < input.exerciseIds.length; i++) {
    const exerciseId = input.exerciseIds[i];
    if (exerciseId !== undefined) {
      await db
        .update(workoutTemplateExercise)
        .set({ order: i + 1 })
        .where(eq(workoutTemplateExercise.id, exerciseId));
    }
  }

  return { success: true };
};

// ============================================================================
// Template Day Handlers
// ============================================================================

export const listDaysHandler: ListDaysRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);

  const days = await db
    .select()
    .from(templateDay)
    .where(eq(templateDay.templateId, input.templateId))
    .orderBy(asc(templateDay.order));

  return days;
};

export const getDayByIdHandler: GetDayByIdRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);

  const day = await verifyDayBelongsToTemplate(input.dayId, input.templateId);

  const exercises = await db
    .select({
      id: workoutTemplateExercise.id,
      templateId: workoutTemplateExercise.templateId,
      templateDayId: workoutTemplateExercise.templateDayId,
      exerciseId: workoutTemplateExercise.exerciseId,
      order: workoutTemplateExercise.order,
      supersetGroupId: workoutTemplateExercise.supersetGroupId,
      notes: workoutTemplateExercise.notes,
      targetSets: workoutTemplateExercise.targetSets,
      targetReps: workoutTemplateExercise.targetReps,
      targetWeight: workoutTemplateExercise.targetWeight,
      restSeconds: workoutTemplateExercise.restSeconds,
      createdAt: workoutTemplateExercise.createdAt,
      updatedAt: workoutTemplateExercise.updatedAt,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
      },
    })
    .from(workoutTemplateExercise)
    .leftJoin(exercise, eq(workoutTemplateExercise.exerciseId, exercise.id))
    .where(eq(workoutTemplateExercise.templateDayId, input.dayId))
    .orderBy(asc(workoutTemplateExercise.order));

  return {
    ...day,
    exercises: exercises.map((e) => ({
      ...e,
      // Note: LEFT JOIN may return an object with all null fields instead of null itself
      exercise: e.exercise?.id != null ? e.exercise : undefined,
    })),
  };
};

export const createDayHandler: CreateDayRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);

  // Get max order for days in this template
  const maxOrderResult = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${templateDay.order}), 0)` })
    .from(templateDay)
    .where(eq(templateDay.templateId, input.templateId));

  const newOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

  const result = await db
    .insert(templateDay)
    .values({
      templateId: input.templateId,
      name: input.name,
      description: input.description,
      order: newOrder,
      isRestDay: input.isRestDay ?? false,
      estimatedDurationMinutes: input.estimatedDurationMinutes,
    })
    .returning();

  const newDay = result[0];
  if (!newDay) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create day" });
  }

  return newDay;
};

export const updateDayHandler: UpdateDayRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);
  await verifyDayBelongsToTemplate(input.dayId, input.templateId);

  const updateData: Partial<typeof templateDay.$inferInsert> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.order !== undefined) updateData.order = input.order;
  if (input.isRestDay !== undefined) updateData.isRestDay = input.isRestDay;
  if (input.estimatedDurationMinutes !== undefined)
    updateData.estimatedDurationMinutes = input.estimatedDurationMinutes;

  const result = await db
    .update(templateDay)
    .set(updateData)
    .where(eq(templateDay.id, input.dayId))
    .returning();

  return result[0];
};

export const deleteDayHandler: DeleteDayRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);
  await verifyDayBelongsToTemplate(input.dayId, input.templateId);

  // Delete the day (exercises will be cascaded due to ON DELETE CASCADE)
  await db.delete(templateDay).where(eq(templateDay.id, input.dayId));

  return { success: true };
};

export const reorderDaysHandler: ReorderDaysRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);

  // Verify all days belong to this template
  const days = await db
    .select()
    .from(templateDay)
    .where(
      and(eq(templateDay.templateId, input.templateId), inArray(templateDay.id, input.dayIds)),
    );

  if (days.length !== input.dayIds.length) {
    badRequest("Some day IDs are invalid or do not belong to this template");
  }

  // Update order for each day
  for (let i = 0; i < input.dayIds.length; i++) {
    const dayId = input.dayIds[i];
    if (dayId !== undefined) {
      await db
        .update(templateDay)
        .set({ order: i + 1 })
        .where(eq(templateDay.id, dayId));
    }
  }

  return { success: true };
};
