import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { exerciseSet, workout, workoutExercise } from "@fit-ai/db/schema/workout";
import {
  templateFolder,
  workoutTemplate,
  workoutTemplateExercise,
} from "@fit-ai/db/schema/workout-template";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { badRequest, notFound, notOwner } from "../../errors";

import type {
  AddExerciseRouteHandler,
  CreateFolderRouteHandler,
  CreateTemplateRouteHandler,
  DeleteFolderRouteHandler,
  DeleteTemplateRouteHandler,
  DuplicateTemplateRouteHandler,
  GetTemplateByIdRouteHandler,
  ListFoldersRouteHandler,
  ListTemplatesRouteHandler,
  RemoveExerciseRouteHandler,
  ReorderExercisesRouteHandler,
  ReorderFoldersRouteHandler,
  StartWorkoutRouteHandler,
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

  const conditions: ReturnType<typeof eq>[] = [];

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

  const exercises = await db
    .select({
      id: workoutTemplateExercise.id,
      templateId: workoutTemplateExercise.templateId,
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

  return {
    ...template,
    exercises: exercises.map((e) => ({
      ...e,
      exercise: e.exercise ?? undefined,
    })),
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

  const template = await verifyTemplateOwnership(input.id, userId);

  const newTemplateResult = await db
    .insert(workoutTemplate)
    .values({
      userId,
      folderId: template.folderId,
      name: `${template.name} (Copy)`,
      description: template.description,
      estimatedDurationMinutes: template.estimatedDurationMinutes,
      isPublic: false,
    })
    .returning();

  const newTemplate = newTemplateResult[0];
  if (!newTemplate) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create template copy" });
  }

  const originalExercises = await db
    .select()
    .from(workoutTemplateExercise)
    .where(eq(workoutTemplateExercise.templateId, input.id))
    .orderBy(asc(workoutTemplateExercise.order));

  for (const ex of originalExercises) {
    await db.insert(workoutTemplateExercise).values({
      templateId: newTemplate.id,
      exerciseId: ex.exerciseId,
      order: ex.order,
      supersetGroupId: ex.supersetGroupId,
      notes: ex.notes,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      targetWeight: ex.targetWeight,
      restSeconds: ex.restSeconds,
    });
  }

  const exerciseDetails = await db
    .select({
      id: workoutTemplateExercise.id,
      templateId: workoutTemplateExercise.templateId,
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

  return {
    ...newTemplate,
    exercises: exerciseDetails.map((e) => ({
      ...e,
      exercise: e.exercise ?? undefined,
    })),
  };
};

export const startWorkoutHandler: StartWorkoutRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const template = await verifyTemplateAccess(input.id, userId);

  const workoutResult = await db
    .insert(workout)
    .values({
      userId,
      name: template.name,
      templateId: template.id,
    })
    .returning();

  const newWorkout = workoutResult[0];
  if (!newWorkout) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create workout" });
  }

  const templateExercises = await db
    .select()
    .from(workoutTemplateExercise)
    .where(eq(workoutTemplateExercise.templateId, input.id))
    .orderBy(asc(workoutTemplateExercise.order));

  for (const templateEx of templateExercises) {
    const workoutExerciseResult = await db
      .insert(workoutExercise)
      .values({
        workoutId: newWorkout.id,
        exerciseId: templateEx.exerciseId,
        order: templateEx.order,
        notes: templateEx.notes,
        supersetGroupId: templateEx.supersetGroupId,
      })
      .returning();

    const newWorkoutExercise = workoutExerciseResult[0];
    if (newWorkoutExercise) {
      for (let setNum = 1; setNum <= templateEx.targetSets; setNum++) {
        await db.insert(exerciseSet).values({
          workoutExerciseId: newWorkoutExercise.id,
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

  const exerciseResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  if (!exerciseResult[0]) {
    notFound("Exercise", input.exerciseId);
  }

  let order = input.order;
  if (order === undefined) {
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${workoutTemplateExercise.order}), 0)` })
      .from(workoutTemplateExercise)
      .where(eq(workoutTemplateExercise.templateId, input.id));
    order = (maxOrderResult[0]?.maxOrder ?? 0) + 1;
  }

  const result = await db
    .insert(workoutTemplateExercise)
    .values({
      templateId: input.id,
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

  return templateExercise;
};

export const updateExerciseHandler: UpdateExerciseRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyTemplateOwnership(input.templateId, userId);

  const existing = await db
    .select()
    .from(workoutTemplateExercise)
    .where(
      and(
        eq(workoutTemplateExercise.id, input.exerciseId),
        eq(workoutTemplateExercise.templateId, input.templateId),
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

  const existing = await db
    .select()
    .from(workoutTemplateExercise)
    .where(
      and(
        eq(workoutTemplateExercise.id, input.exerciseId),
        eq(workoutTemplateExercise.templateId, input.templateId),
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

  const exercises = await db
    .select()
    .from(workoutTemplateExercise)
    .where(
      and(
        eq(workoutTemplateExercise.templateId, input.id),
        inArray(workoutTemplateExercise.id, input.exerciseIds),
      ),
    );

  if (exercises.length !== input.exerciseIds.length) {
    badRequest("Some exercise IDs are invalid or do not belong to this template");
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
