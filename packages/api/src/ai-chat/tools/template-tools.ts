import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import {
  workoutTemplate,
  templateDay,
  workoutTemplateExercise,
} from "@fit-ai/db/schema/workout-template";
import { and, desc, eq, sql } from "drizzle-orm";

import {
  createTemplateDef,
  addTemplateDayDef,
  addExerciseToTemplateDef,
  listUserTemplatesDef,
  getTemplateDetailsDef,
  deleteTemplateDef,
} from "../tool-definitions";

export function createTemplateTools(userId: string) {
  const createTemplate = createTemplateDef.server(async (input) => {
    try {
      // Defensive sanitization: truncate strings to max lengths
      const name = input.name.slice(0, 100);
      const description = input.description?.slice(0, 500);

      const result = await db
        .insert(workoutTemplate)
        .values({
          userId,
          name,
          description: description ?? null,
          estimatedDurationMinutes: input.estimatedDurationMinutes ?? null,
        })
        .returning({ id: workoutTemplate.id, name: workoutTemplate.name });
      const created = result[0];
      if (!created) return { id: 0, name: input.name };
      return created;
    } catch (error) {
      console.error("[ai-tool] createTemplate failed:", error);
      return { id: 0, name: input.name, error: "Failed to create template." };
    }
  });

  const addTemplateDay = addTemplateDayDef.server(async (input) => {
    try {
      // Defensive sanitization: truncate strings to max lengths
      const dayName = input.name.slice(0, 100);
      const dayDescription = input.description?.slice(0, 500);

      const existing = await db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${templateDay.order}), 0)`,
        })
        .from(templateDay)
        .where(eq(templateDay.templateId, input.templateId));
      const nextOrder = (existing[0]?.maxOrder ?? 0) + 1;

      const result = await db
        .insert(templateDay)
        .values({
          templateId: input.templateId,
          name: dayName,
          description: dayDescription ?? null,
          isRestDay: input.isRestDay,
          order: nextOrder,
        })
        .returning({
          id: templateDay.id,
          name: templateDay.name,
          order: templateDay.order,
        });
      const created = result[0];
      if (!created) return { id: 0, name: input.name, order: nextOrder };
      return created;
    } catch (error) {
      console.error("[ai-tool] addTemplateDay failed:", error);
      return { id: 0, name: input.name, order: 0, error: "Failed to add template day." };
    }
  });

  const addExerciseToTemplate = addExerciseToTemplateDef.server(async (input) => {
    try {
      // Defensive sanitization: clamp numeric values and truncate strings
      const targetSets = Math.max(1, Math.round(input.targetSets ?? 3));
      const targetReps = input.targetReps?.slice(0, 20) ?? "8-12";
      const targetWeight = input.targetWeight != null ? Math.max(0, input.targetWeight) : null;
      const restSeconds = Math.max(0, Math.round(input.restSeconds ?? 90));
      const exerciseNotes = input.notes?.slice(0, 500);

      const exerciseResult = await db
        .select({ name: exercise.name })
        .from(exercise)
        .where(eq(exercise.id, input.exerciseId))
        .limit(1);
      const exerciseName = exerciseResult[0]?.name ?? "Unknown Exercise";

      const existing = await db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${workoutTemplateExercise.order}), 0)`,
        })
        .from(workoutTemplateExercise)
        .where(eq(workoutTemplateExercise.templateDayId, input.dayId));
      const nextOrder = (existing[0]?.maxOrder ?? 0) + 1;

      const result = await db
        .insert(workoutTemplateExercise)
        .values({
          templateId: input.templateId,
          templateDayId: input.dayId,
          exerciseId: input.exerciseId,
          order: nextOrder,
          targetSets,
          targetReps,
          targetWeight,
          restSeconds,
          notes: exerciseNotes ?? null,
        })
        .returning({ id: workoutTemplateExercise.id });
      const created = result[0];
      return { id: created?.id ?? 0, exerciseName };
    } catch (error) {
      console.error("[ai-tool] addExerciseToTemplate failed:", error);
      return {
        id: 0,
        exerciseName: "Error adding exercise",
        error: "Failed to add exercise to template.",
      };
    }
  });

  const listUserTemplates = listUserTemplatesDef.server(async (input) => {
    try {
      // Defensive sanitization: clamp limit to valid range
      const limit = Math.min(Math.max(1, input.limit ?? 10), 50);

      const results = await db
        .select({
          id: workoutTemplate.id,
          name: workoutTemplate.name,
          description: workoutTemplate.description,
          timesUsed: workoutTemplate.timesUsed,
        })
        .from(workoutTemplate)
        .where(eq(workoutTemplate.userId, userId))
        .orderBy(desc(workoutTemplate.createdAt))
        .limit(limit);
      return { templates: results };
    } catch (error) {
      console.error("[ai-tool] listUserTemplates failed:", error);
      return { templates: [], error: "Failed to list templates." };
    }
  });

  const getTemplateDetails = getTemplateDetailsDef.server(async (input) => {
    try {
      const templateResult = await db
        .select()
        .from(workoutTemplate)
        .where(and(eq(workoutTemplate.id, input.templateId), eq(workoutTemplate.userId, userId)))
        .limit(1);
      const tmpl = templateResult[0];
      if (!tmpl) {
        return { id: 0, name: "Not found", description: null, days: [] };
      }

      const days = await db
        .select()
        .from(templateDay)
        .where(eq(templateDay.templateId, input.templateId))
        .orderBy(templateDay.order);

      const daysWithExercises = await Promise.all(
        days.map(async (day) => {
          const exercises = await db
            .select({
              id: workoutTemplateExercise.id,
              exerciseName: exercise.name,
              targetSets: workoutTemplateExercise.targetSets,
              targetReps: workoutTemplateExercise.targetReps,
              restSeconds: workoutTemplateExercise.restSeconds,
              notes: workoutTemplateExercise.notes,
            })
            .from(workoutTemplateExercise)
            .leftJoin(exercise, eq(exercise.id, workoutTemplateExercise.exerciseId))
            .where(eq(workoutTemplateExercise.templateDayId, day.id))
            .orderBy(workoutTemplateExercise.order);

          return {
            id: day.id,
            name: day.name,
            isRestDay: day.isRestDay ?? false,
            exercises: exercises.map((e) => ({
              id: e.id,
              exerciseName: e.exerciseName ?? "Unknown",
              targetSets: e.targetSets ?? 3,
              targetReps: e.targetReps,
              restSeconds: e.restSeconds ?? 90,
              notes: e.notes,
            })),
          };
        }),
      );

      return {
        id: tmpl.id,
        name: tmpl.name,
        description: tmpl.description,
        days: daysWithExercises,
      };
    } catch (error) {
      console.error("[ai-tool] getTemplateDetails failed:", error);
      return {
        id: 0,
        name: "Error",
        description: null,
        days: [],
        error: "Failed to get template details.",
      };
    }
  });

  const deleteTemplate = deleteTemplateDef.server(async (input) => {
    try {
      const existing = await db
        .select()
        .from(workoutTemplate)
        .where(and(eq(workoutTemplate.id, input.templateId), eq(workoutTemplate.userId, userId)))
        .limit(1);
      if (!existing[0]) {
        return {
          success: false,
          message: "Template not found or not owned by you",
        };
      }
      await db.delete(workoutTemplate).where(eq(workoutTemplate.id, input.templateId));
      return {
        success: true,
        message: `Deleted template "${existing[0].name}"`,
      };
    } catch (error) {
      console.error("[ai-tool] deleteTemplate failed:", error);
      return {
        success: false,
        message: "Failed to delete template",
        error: "Failed to delete template.",
      };
    }
  });

  return [
    createTemplate,
    addTemplateDay,
    addExerciseToTemplate,
    listUserTemplates,
    getTemplateDetails,
    deleteTemplate,
  ];
}
