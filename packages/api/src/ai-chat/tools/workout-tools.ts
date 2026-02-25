import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { workout, workoutExercise, exerciseSet } from "@fit-ai/db/schema/workout";
import { eq, like, or } from "drizzle-orm";

import { logWorkoutDef } from "../tool-definitions";

export function createWorkoutTools(userId: string) {
  const logWorkout = logWorkoutDef.server(async (input) => {
    try {
      // Fuzzy-match the exercise name (case-insensitive via LIKE with % pattern)
      const searchPattern = `%${input.exerciseName}%`;
      const matchedExercises = await db
        .select({ id: exercise.id, name: exercise.name })
        .from(exercise)
        .where(or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)))
        .limit(500);

      // Filter in JS for case-insensitive fuzzy match
      const lowerQuery = input.exerciseName.toLowerCase();
      const matched = matchedExercises.find((ex) => ex.name.toLowerCase().includes(lowerQuery));

      if (!matched) {
        // Try a broader DB-level LIKE search as fallback
        const likeResults = await db
          .select({ id: exercise.id, name: exercise.name })
          .from(exercise)
          .where(like(exercise.name, searchPattern))
          .limit(1);

        const fallback = likeResults[0];
        if (!fallback) {
          return { workoutId: 0, exerciseName: input.exerciseName, setsLogged: 0 };
        }

        return await insertWorkoutData(userId, fallback.id, fallback.name, input);
      }

      return await insertWorkoutData(userId, matched.id, matched.name, input);
    } catch (error) {
      console.error("[ai-tool] logWorkout failed:", error);
      return {
        workoutId: 0,
        exerciseName: input.exerciseName,
        setsLogged: 0,
        error: "Failed to log workout.",
      };
    }
  });

  return [logWorkout];
}

async function insertWorkoutData(
  userId: string,
  exerciseId: number,
  exerciseName: string,
  input: {
    exerciseName: string;
    sets: Array<{ reps: number; weight: number; weightUnit?: "kg" | "lb" }>;
    notes?: string;
  },
) {
  // Defensive sanitization: clamp numeric values and truncate strings
  const sanitizedSets = input.sets.map((set) => ({
    reps: Math.max(0, Math.round(set.reps ?? 0)),
    weight: Math.max(0, set.weight ?? 0),
    weightUnit: set.weightUnit ?? "kg",
  }));
  const notes = input.notes?.slice(0, 500);

  const now = new Date();

  // Create workout row
  const workoutResult = await db
    .insert(workout)
    .values({
      userId,
      name: `AI-logged: ${exerciseName}`,
      notes: notes ?? null,
      startedAt: now,
      completedAt: now,
    })
    .returning({ id: workout.id });

  const workoutRow = workoutResult[0];
  if (!workoutRow) {
    return { workoutId: 0, exerciseName, setsLogged: 0 };
  }

  // Create workoutExercise row
  const weResult = await db
    .insert(workoutExercise)
    .values({
      workoutId: workoutRow.id,
      exerciseId,
      order: 1,
    })
    .returning({ id: workoutExercise.id });

  const weRow = weResult[0];
  if (!weRow) {
    return { workoutId: workoutRow.id, exerciseName, setsLogged: 0 };
  }

  // Create exerciseSet rows for each set
  for (let i = 0; i < sanitizedSets.length; i++) {
    const set = sanitizedSets[i];
    if (!set) continue;
    await db.insert(exerciseSet).values({
      workoutExerciseId: weRow.id,
      setNumber: i + 1,
      reps: set.reps,
      weight: set.weight,
      weightUnit: set.weightUnit,
      isCompleted: true,
      completedAt: now,
    });
  }

  return {
    workoutId: workoutRow.id,
    exerciseName,
    setsLogged: sanitizedSets.length,
  };
}
