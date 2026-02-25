import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { userTrainingPreferences } from "@fit-ai/db/schema/ai";
import { workout, workoutExercise } from "@fit-ai/db/schema/workout";
import { desc, eq, or, sql } from "drizzle-orm";

import {
  searchExercisesDef,
  getUserPreferencesDef,
  getWorkoutHistoryDef,
} from "../tool-definitions";

export function createQueryTools(userId: string) {
  const searchExercises = searchExercisesDef.server(async (input) => {
    try {
      // Defensive sanitization: clamp limit to valid range
      const limit = Math.min(Math.max(1, input.limit ?? 10), 50);

      let results = await db
        .select()
        .from(exercise)
        .where(or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)));

      // Filter by name query
      if (input.query) {
        const q = input.query.toLowerCase();
        results = results.filter((ex) => ex.name.toLowerCase().includes(q));
      }
      // Filter by category
      if (input.category) {
        results = results.filter((ex) => ex.category === input.category);
      }
      // Filter by equipment
      if (input.equipment) {
        const equip = input.equipment.toLowerCase();
        results = results.filter((ex) => ex.equipment?.toLowerCase().includes(equip));
      }
      // Filter by muscleGroup
      if (input.muscleGroup) {
        const mg = input.muscleGroup.toLowerCase();
        results = results.filter((ex) => {
          const muscles = ex.muscleGroups as string[];
          return muscles.some((m) => m.toLowerCase().includes(mg));
        });
      }
      // Apply limit
      const limited = results.slice(0, limit);
      return {
        exercises: limited.map((ex) => ({
          id: ex.id,
          name: ex.name,
          category: ex.category,
          muscleGroups: ex.muscleGroups as string[],
          equipment: ex.equipment,
          exerciseType: ex.exerciseType,
        })),
      };
    } catch (error) {
      console.error("[ai-tool] searchExercises failed:", error);
      return { exercises: [], error: "Failed to search exercises. Please try again." };
    }
  });

  const getUserPreferences = getUserPreferencesDef.server(async () => {
    try {
      const result = await db
        .select()
        .from(userTrainingPreferences)
        .where(eq(userTrainingPreferences.userId, userId))
        .limit(1);
      const prefs = result[0];
      if (!prefs) return { preferences: null };
      return {
        preferences: {
          primaryGoal: prefs.primaryGoal,
          secondaryGoal: prefs.secondaryGoal,
          experienceLevel: prefs.experienceLevel,
          workoutDaysPerWeek: prefs.workoutDaysPerWeek,
          preferredWorkoutDuration: prefs.preferredWorkoutDuration,
          availableEquipment: prefs.availableEquipment,
          trainingLocation: prefs.trainingLocation,
          injuries: prefs.injuries,
          avoidMuscleGroups: prefs.avoidMuscleGroups,
          preferredSplit: prefs.preferredSplit,
        },
      };
    } catch (error) {
      console.error("[ai-tool] getUserPreferences failed:", error);
      return { preferences: null, error: "Failed to load preferences." };
    }
  });

  const getWorkoutHistory = getWorkoutHistoryDef.server(async (input) => {
    try {
      // Defensive sanitization: clamp limit to valid range
      const historyLimit = Math.min(Math.max(1, input.limit ?? 5), 50);

      const workouts = await db
        .select({
          id: workout.id,
          name: workout.name,
          startedAt: workout.startedAt,
          completedAt: workout.completedAt,
        })
        .from(workout)
        .where(eq(workout.userId, userId))
        .orderBy(desc(workout.startedAt))
        .limit(historyLimit);

      const result = await Promise.all(
        workouts.map(async (w) => {
          const countResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(workoutExercise)
            .where(eq(workoutExercise.workoutId, w.id));
          return {
            id: w.id,
            name: w.name,
            startedAt: w.startedAt.toISOString(),
            completedAt: w.completedAt?.toISOString() ?? null,
            exerciseCount: countResult[0]?.count ?? 0,
          };
        }),
      );
      return { workouts: result };
    } catch (error) {
      console.error("[ai-tool] getWorkoutHistory failed:", error);
      return { workouts: [], error: "Failed to load workout history." };
    }
  });

  return [searchExercises, getUserPreferences, getWorkoutHistory];
}
