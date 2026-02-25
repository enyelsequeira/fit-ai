import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { eq, or } from "drizzle-orm";

import { suggestExerciseAlternativesDef } from "../tool-definitions";

export function createExerciseTools(userId: string) {
  const suggestExerciseAlternatives = suggestExerciseAlternativesDef.server(async (input) => {
    try {
      // Fetch the source exercise
      const sourceResult = await db
        .select({
          id: exercise.id,
          name: exercise.name,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
        })
        .from(exercise)
        .where(eq(exercise.id, input.exerciseId))
        .limit(1);

      const source = sourceResult[0];
      if (!source) {
        return {
          sourceExercise: { id: input.exerciseId, name: "Not found", muscleGroups: [] },
          alternatives: [],
        };
      }

      const sourceMuscles = (source.muscleGroups as string[]) ?? [];
      if (sourceMuscles.length === 0) {
        return {
          sourceExercise: { id: source.id, name: source.name, muscleGroups: sourceMuscles },
          alternatives: [],
        };
      }

      // Fetch all exercises (default + user's)
      const allExercises = await db
        .select({
          id: exercise.id,
          name: exercise.name,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
        })
        .from(exercise)
        .where(or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)));

      // Calculate overlap for each candidate
      const sourceMuscleSet = new Set(sourceMuscles.map((m) => m.toLowerCase()));

      const candidates = allExercises
        .filter((ex) => ex.id !== source.id)
        .map((ex) => {
          const exMuscles = (ex.muscleGroups as string[]) ?? [];
          const exMuscleSet = new Set(exMuscles.map((m) => m.toLowerCase()));

          // Calculate union and intersection
          const union = new Set([...sourceMuscleSet, ...exMuscleSet]);
          let shared = 0;
          for (const m of sourceMuscleSet) {
            if (exMuscleSet.has(m)) shared++;
          }

          const overlapPercentage = union.size > 0 ? Math.round((shared / union.size) * 100) : 0;

          return {
            id: ex.id,
            name: ex.name,
            muscleGroups: exMuscles,
            equipment: ex.equipment,
            overlapPercentage,
          };
        })
        .filter((c) => c.overlapPercentage > 0)
        .sort((a, b) => b.overlapPercentage - a.overlapPercentage)
        .slice(0, input.limit ?? 5);

      return {
        sourceExercise: { id: source.id, name: source.name, muscleGroups: sourceMuscles },
        alternatives: candidates,
      };
    } catch (error) {
      console.error("[ai-tool] suggestExerciseAlternatives failed:", error);
      return {
        sourceExercise: { id: input.exerciseId, name: "Error", muscleGroups: [] },
        alternatives: [],
        error: "Failed to suggest exercise alternatives.",
      };
    }
  });

  return [suggestExerciseAlternatives];
}
