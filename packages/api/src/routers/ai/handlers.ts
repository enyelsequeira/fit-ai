import type {
  DayOfWeek,
  ExperienceLevel,
  GeneratedWorkoutContent,
  TrainingGoal,
  TrainingLocation,
  WorkoutSplit,
  WorkoutType,
} from "@fit-ai/db/schema/ai";

import { db } from "@fit-ai/db";
import { aiGeneratedWorkout, userTrainingPreferences } from "@fit-ai/db/schema/ai";
import { exercise } from "@fit-ai/db/schema/exercise";
import { muscleRecovery } from "@fit-ai/db/schema/recovery";
import { workout, workoutExercise } from "@fit-ai/db/schema/workout";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, or, sql } from "drizzle-orm";

import { APP_ERROR_CODES, badRequest, businessRuleViolation, notFound } from "../../errors";

import type {
  GenerateWorkoutRouteHandler,
  GetGeneratedHistoryRouteHandler,
  GetPreferencesRouteHandler,
  PatchPreferencesRouteHandler,
  SubmitFeedbackRouteHandler,
  SubstituteExerciseRouteHandler,
  SuggestNextWorkoutRouteHandler,
  UpdatePreferencesRouteHandler,
} from "./contracts";

// ============================================================================
// Helper Functions
// ============================================================================

function getGoalConfig(
  goal: TrainingGoal | null | undefined,
  difficulty: "easy" | "moderate" | "hard" = "moderate",
) {
  const difficultyMultiplier = { easy: 0.8, moderate: 1, hard: 1.2 };
  const multiplier = difficultyMultiplier[difficulty];

  const configs: Record<TrainingGoal, { sets: number; reps: string; rest: number }> = {
    strength: { sets: Math.round(5 * multiplier), reps: "3-6", rest: 180 },
    hypertrophy: { sets: Math.round(4 * multiplier), reps: "8-12", rest: 90 },
    endurance: { sets: Math.round(3 * multiplier), reps: "15-20", rest: 45 },
    weight_loss: { sets: Math.round(3 * multiplier), reps: "12-15", rest: 60 },
    general_fitness: { sets: Math.round(3 * multiplier), reps: "10-15", rest: 60 },
  };

  return configs[goal ?? "general_fitness"];
}

function getTargetMusclesForType(type: WorkoutType): string[] {
  const muscleMap: Record<WorkoutType, string[]> = {
    push: ["chest", "shoulders", "triceps"],
    pull: ["back", "biceps", "rear_delts"],
    legs: ["quadriceps", "hamstrings", "glutes", "calves"],
    upper: ["chest", "back", "shoulders", "biceps", "triceps"],
    lower: ["quadriceps", "hamstrings", "glutes", "calves"],
    full_body: ["chest", "back", "shoulders", "quadriceps", "hamstrings"],
    chest: ["chest", "triceps"],
    back: ["back", "biceps"],
    shoulders: ["shoulders", "triceps"],
    arms: ["biceps", "triceps", "forearms"],
    core: ["abs", "obliques"],
  };

  return muscleMap[type];
}

async function autoSelectWorkoutType(
  userId: string,
  preferredSplit: WorkoutSplit | null | undefined,
  workoutDaysPerWeek: number | null | undefined,
): Promise<WorkoutType> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentWorkouts = await db
    .select({
      workout: workout,
      workoutExercise: workoutExercise,
      exercise: exercise,
    })
    .from(workout)
    .leftJoin(workoutExercise, eq(workoutExercise.workoutId, workout.id))
    .leftJoin(exercise, eq(exercise.id, workoutExercise.exerciseId))
    .where(and(eq(workout.userId, userId), gte(workout.startedAt, sevenDaysAgo)))
    .orderBy(desc(workout.startedAt));

  const muscleUsage: Record<string, { count: number; lastWorked: Date }> = {};
  for (const row of recentWorkouts) {
    if (row.exercise?.muscleGroups) {
      const muscles = row.exercise.muscleGroups as string[];
      for (const muscle of muscles) {
        const existing = muscleUsage[muscle];
        if (!existing || row.workout.startedAt > existing.lastWorked) {
          muscleUsage[muscle] = {
            count: (existing?.count ?? 0) + 1,
            lastWorked: row.workout.startedAt,
          };
        }
      }
    }
  }

  if (preferredSplit === "push_pull_legs") {
    const pushMuscles = ["chest", "shoulders", "triceps"];
    const pullMuscles = ["back", "biceps"];
    const legMuscles = ["quadriceps", "hamstrings", "glutes", "calves"];

    const pushScore = pushMuscles.reduce((sum, m) => sum + (muscleUsage[m]?.count ?? 0), 0);
    const pullScore = pullMuscles.reduce((sum, m) => sum + (muscleUsage[m]?.count ?? 0), 0);
    const legScore = legMuscles.reduce((sum, m) => sum + (muscleUsage[m]?.count ?? 0), 0);

    if (legScore <= pushScore && legScore <= pullScore) return "legs";
    if (pullScore <= pushScore) return "pull";
    return "push";
  }

  if (preferredSplit === "upper_lower") {
    const upperMuscles = ["chest", "back", "shoulders", "biceps", "triceps"];
    const lowerMuscles = ["quadriceps", "hamstrings", "glutes", "calves"];

    const upperScore = upperMuscles.reduce((sum, m) => sum + (muscleUsage[m]?.count ?? 0), 0);
    const lowerScore = lowerMuscles.reduce((sum, m) => sum + (muscleUsage[m]?.count ?? 0), 0);

    return lowerScore <= upperScore ? "lower" : "upper";
  }

  const days = workoutDaysPerWeek ?? 3;
  if (days <= 3) return "full_body";

  const majorGroups: WorkoutType[] = ["chest", "back", "legs", "shoulders"];
  let leastWorked: WorkoutType = "full_body";
  let lowestScore = Number.POSITIVE_INFINITY;

  for (const group of majorGroups) {
    const targetMuscles = getTargetMusclesForType(group);
    const score = targetMuscles.reduce((sum, m) => sum + (muscleUsage[m]?.count ?? 0), 0);
    if (score < lowestScore) {
      lowestScore = score;
      leastWorked = group;
    }
  }

  return leastWorked;
}

function generateWarmup(workoutType: WorkoutType): string {
  const warmups: Partial<Record<WorkoutType, string>> = {
    push: "5 min light cardio, arm circles, push-up walkouts, band pull-aparts (2x15)",
    pull: "5 min rowing/cycling, band pull-aparts (2x15), scapular retractions, lat hangs",
    legs: "5 min cycling/walking, leg swings (10 each), bodyweight squats (2x10), hip circles",
    upper: "5 min light cardio, arm circles, band pull-aparts, shoulder dislocations",
    lower: "5 min cycling, leg swings, hip circles, bodyweight squats and lunges",
    full_body: "5 min light cardio, dynamic stretches, arm circles, leg swings, hip circles",
    chest: "5 min light cardio, arm circles, push-up walkouts, band chest flyes",
    back: "5 min rowing, band pull-aparts, cat-cow stretches, lat hangs",
    shoulders: "5 min cardio, arm circles, band pull-aparts, shoulder dislocations",
    arms: "5 min light cardio, wrist circles, light bicep curls, tricep stretches",
    core: "5 min light cardio, cat-cow, bird dogs, dead bugs (10 each side)",
  };

  return warmups[workoutType] ?? "5-10 minutes light cardio and dynamic stretching";
}

function generateCooldown(workoutType: WorkoutType): string {
  const cooldowns: Partial<Record<WorkoutType, string>> = {
    push: "Chest doorway stretch (30s each), tricep stretch (30s each), shoulder stretch",
    pull: "Lat stretch (30s each), bicep stretch (30s each), upper back stretch",
    legs: "Quad stretch (30s each), hamstring stretch (30s each), hip flexor stretch, calf stretch",
    upper: "Full upper body stretching routine: chest, lats, shoulders, arms (30s each)",
    lower: "Full lower body stretching: quads, hamstrings, glutes, hip flexors, calves",
    full_body: "Full body stretch routine targeting all major muscle groups (5-10 min)",
    chest: "Chest doorway stretch, tricep stretch, shoulder stretch (30s each)",
    back: "Child's pose, lat stretch, thoracic rotation (30s each)",
    shoulders: "Cross-body shoulder stretch, overhead tricep stretch, neck stretches",
    arms: "Bicep stretch against wall, tricep stretch, wrist stretches",
    core: "Cobra stretch, child's pose, spinal twist (30s each side)",
  };

  return cooldowns[workoutType] ?? "5-10 minutes of static stretching for worked muscles";
}

// ============================================================================
// Handlers
// ============================================================================

export const getPreferencesHandler: GetPreferencesRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  const result = await db
    .select()
    .from(userTrainingPreferences)
    .where(eq(userTrainingPreferences.userId, userId))
    .limit(1);

  return result[0] ?? null;
};

export const updatePreferencesHandler: UpdatePreferencesRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const existing = await db
    .select()
    .from(userTrainingPreferences)
    .where(eq(userTrainingPreferences.userId, userId))
    .limit(1);

  if (existing[0]) {
    const result = await db
      .update(userTrainingPreferences)
      .set({
        primaryGoal: input.primaryGoal as TrainingGoal | undefined,
        secondaryGoal: input.secondaryGoal as TrainingGoal | null | undefined,
        experienceLevel: input.experienceLevel as ExperienceLevel | undefined,
        workoutDaysPerWeek: input.workoutDaysPerWeek,
        preferredWorkoutDuration: input.preferredWorkoutDuration,
        preferredDays: input.preferredDays as DayOfWeek[] | undefined,
        availableEquipment: input.availableEquipment,
        trainingLocation: input.trainingLocation as TrainingLocation | undefined,
        preferredExercises: input.preferredExercises,
        dislikedExercises: input.dislikedExercises,
        injuries: input.injuries,
        avoidMuscleGroups: input.avoidMuscleGroups,
        preferredSplit: input.preferredSplit as WorkoutSplit | null | undefined,
      })
      .where(eq(userTrainingPreferences.userId, userId))
      .returning();

    const updated = result[0];
    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update preferences" });
    }
    return updated;
  }

  const result = await db
    .insert(userTrainingPreferences)
    .values({
      userId,
      primaryGoal: input.primaryGoal as TrainingGoal | undefined,
      secondaryGoal: input.secondaryGoal as TrainingGoal | null | undefined,
      experienceLevel: input.experienceLevel as ExperienceLevel | undefined,
      workoutDaysPerWeek: input.workoutDaysPerWeek,
      preferredWorkoutDuration: input.preferredWorkoutDuration,
      preferredDays: input.preferredDays as DayOfWeek[] | undefined,
      availableEquipment: input.availableEquipment,
      trainingLocation: input.trainingLocation as TrainingLocation | undefined,
      preferredExercises: input.preferredExercises,
      dislikedExercises: input.dislikedExercises,
      injuries: input.injuries,
      avoidMuscleGroups: input.avoidMuscleGroups,
      preferredSplit: input.preferredSplit as WorkoutSplit | null | undefined,
    })
    .returning();

  const created = result[0];
  if (!created) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create preferences" });
  }
  return created;
};

export const patchPreferencesHandler: PatchPreferencesRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const existing = await db
    .select()
    .from(userTrainingPreferences)
    .where(eq(userTrainingPreferences.userId, userId))
    .limit(1);

  if (!existing[0]) {
    businessRuleViolation(
      APP_ERROR_CODES.PREFERENCES_NOT_SET,
      "Training preferences not found",
      "Use PUT to create them first",
    );
  }

  const updateData: Partial<typeof userTrainingPreferences.$inferInsert> = {};

  if (input.primaryGoal !== undefined) updateData.primaryGoal = input.primaryGoal as TrainingGoal;
  if (input.secondaryGoal !== undefined)
    updateData.secondaryGoal = input.secondaryGoal as TrainingGoal | null;
  if (input.experienceLevel !== undefined)
    updateData.experienceLevel = input.experienceLevel as ExperienceLevel;
  if (input.workoutDaysPerWeek !== undefined)
    updateData.workoutDaysPerWeek = input.workoutDaysPerWeek;
  if (input.preferredWorkoutDuration !== undefined)
    updateData.preferredWorkoutDuration = input.preferredWorkoutDuration;
  if (input.preferredDays !== undefined)
    updateData.preferredDays = input.preferredDays as DayOfWeek[];
  if (input.availableEquipment !== undefined)
    updateData.availableEquipment = input.availableEquipment;
  if (input.trainingLocation !== undefined)
    updateData.trainingLocation = input.trainingLocation as TrainingLocation;
  if (input.preferredExercises !== undefined)
    updateData.preferredExercises = input.preferredExercises;
  if (input.dislikedExercises !== undefined) updateData.dislikedExercises = input.dislikedExercises;
  if (input.injuries !== undefined) updateData.injuries = input.injuries;
  if (input.avoidMuscleGroups !== undefined) updateData.avoidMuscleGroups = input.avoidMuscleGroups;
  if (input.preferredSplit !== undefined)
    updateData.preferredSplit = input.preferredSplit as WorkoutSplit | null;

  if (Object.keys(updateData).length === 0) {
    badRequest("No fields to update");
  }

  const result = await db
    .update(userTrainingPreferences)
    .set(updateData)
    .where(eq(userTrainingPreferences.userId, userId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update preferences" });
  }
  return updated;
};

export const generateWorkoutHandler: GenerateWorkoutRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const prefsResult = await db
    .select()
    .from(userTrainingPreferences)
    .where(eq(userTrainingPreferences.userId, userId))
    .limit(1);

  const prefs = prefsResult[0];

  const workoutType: WorkoutType =
    (input.workoutType as WorkoutType) ??
    (await autoSelectWorkoutType(userId, prefs?.preferredSplit, prefs?.workoutDaysPerWeek));

  const targetMuscleGroups = input.targetMuscleGroups ?? getTargetMusclesForType(workoutType);

  const dislikedExercises = [
    ...(prefs?.dislikedExercises ?? []),
    ...(input.excludeExercises ?? []),
  ];

  const avoidMuscles = prefs?.avoidMuscleGroups ?? [];
  const availableEquipment = prefs?.availableEquipment;

  const allExercises = await db
    .select()
    .from(exercise)
    .where(or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)));

  let filteredExercises = allExercises.filter((ex) => {
    const exMuscles = ex.muscleGroups as string[];
    const targetsCorrectMuscle = exMuscles.some((m) =>
      targetMuscleGroups.some((target) => m.toLowerCase().includes(target.toLowerCase())),
    );

    if (!targetsCorrectMuscle) return false;

    const usesAvoidedMuscle = exMuscles.some((m) =>
      avoidMuscles.some((avoid) => m.toLowerCase().includes(avoid.toLowerCase())),
    );

    if (usesAvoidedMuscle) return false;
    if (dislikedExercises.includes(ex.id)) return false;

    if (availableEquipment && availableEquipment.length > 0 && ex.equipment) {
      const hasEquipment =
        availableEquipment.some((equip) =>
          ex.equipment?.toLowerCase().includes(equip.toLowerCase()),
        ) || ex.equipment.toLowerCase() === "bodyweight";

      if (!hasEquipment) return false;
    }

    return true;
  });

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const recentExerciseIds = await db
    .select({ exerciseId: workoutExercise.exerciseId })
    .from(workout)
    .innerJoin(workoutExercise, eq(workoutExercise.workoutId, workout.id))
    .where(and(eq(workout.userId, userId), gte(workout.startedAt, threeDaysAgo)));

  const recentIds = new Set(recentExerciseIds.map((r) => r.exerciseId));

  filteredExercises.sort((a, b) => {
    const aRecent = recentIds.has(a.id) ? 1 : 0;
    const bRecent = recentIds.has(b.id) ? 1 : 0;
    if (aRecent !== bRecent) return aRecent - bRecent;

    const aCompound = a.category === "compound" ? 0 : 1;
    const bCompound = b.category === "compound" ? 0 : 1;
    return aCompound - bCompound;
  });

  const goalConfig = getGoalConfig(prefs?.primaryGoal, input.difficulty);
  const duration = input.duration ?? prefs?.preferredWorkoutDuration ?? 60;

  const avgExerciseTime = goalConfig.sets * 1.5 + (goalConfig.sets * goalConfig.rest) / 60;
  const targetExerciseCount = Math.min(Math.floor(duration / avgExerciseTime), 8);

  const selectedExercises: typeof filteredExercises = [];
  const usedCategories = new Set<string>();

  for (const ex of filteredExercises) {
    if (selectedExercises.length >= targetExerciseCount) break;
    if (ex.category === "compound" && !usedCategories.has("compound")) {
      selectedExercises.push(ex);
      usedCategories.add("compound");
    }
  }

  for (const ex of filteredExercises) {
    if (selectedExercises.length >= targetExerciseCount) break;
    if (!selectedExercises.includes(ex)) {
      selectedExercises.push(ex);
      usedCategories.add(ex.category);
    }
  }

  if (selectedExercises.length === 0) {
    businessRuleViolation(
      APP_ERROR_CODES.NO_EXERCISES_AVAILABLE,
      "No suitable exercises found for this workout type",
      "Try adjusting your preferences or equipment settings",
    );
  }

  const workoutContent: GeneratedWorkoutContent = {
    name: `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1).replace("_", " ")} Workout`,
    estimatedDuration: duration,
    exercises: selectedExercises.map((ex) => {
      const alternatives = filteredExercises
        .filter((alt) => {
          if (alt.id === ex.id) return false;
          const altMuscles = alt.muscleGroups as string[];
          const exMuscles = ex.muscleGroups as string[];
          return altMuscles.some((m) => exMuscles.includes(m));
        })
        .slice(0, 3)
        .map((alt) => alt.id);

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: goalConfig.sets,
        reps: goalConfig.reps,
        restSeconds: goalConfig.rest,
        alternatives: alternatives.length > 0 ? alternatives : undefined,
      };
    }),
    warmup: generateWarmup(workoutType),
    cooldown: generateCooldown(workoutType),
  };

  const savedResult = await db
    .insert(aiGeneratedWorkout)
    .values({
      userId,
      targetMuscleGroups,
      workoutType,
      generatedContent: workoutContent,
      wasUsed: false,
    })
    .returning();

  const saved = savedResult[0];
  if (!saved) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to save generated workout",
    });
  }

  return saved;
};

export const suggestNextWorkoutHandler: SuggestNextWorkoutRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const prefsResult = await db
    .select()
    .from(userTrainingPreferences)
    .where(eq(userTrainingPreferences.userId, userId))
    .limit(1);

  const prefs = prefsResult[0];

  const recoveryData = await db
    .select()
    .from(muscleRecovery)
    .where(eq(muscleRecovery.userId, userId));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentWorkouts = await db
    .select({
      workout: workout,
      exercise: exercise,
    })
    .from(workout)
    .leftJoin(workoutExercise, eq(workoutExercise.workoutId, workout.id))
    .leftJoin(exercise, eq(exercise.id, workoutExercise.exerciseId))
    .where(and(eq(workout.userId, userId), gte(workout.startedAt, sevenDaysAgo)));

  const muscleStatus: Record<string, { recoveryScore: number; lastWorked: Date | null }> = {};
  const allMuscles = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "quadriceps",
    "hamstrings",
    "glutes",
    "calves",
    "abs",
  ];

  for (const muscle of allMuscles) {
    const recovery = recoveryData.find((r) => r.muscleGroup === muscle);
    if (recovery) {
      muscleStatus[muscle] = {
        recoveryScore: recovery.recoveryScore ?? 100,
        lastWorked: recovery.lastWorkedAt,
      };
    } else {
      let lastWorked: Date | null = null;
      for (const row of recentWorkouts) {
        if (row.exercise?.muscleGroups) {
          const muscles = row.exercise.muscleGroups as string[];
          if (muscles.some((m) => m.toLowerCase().includes(muscle.toLowerCase()))) {
            if (!lastWorked || row.workout.startedAt > lastWorked) {
              lastWorked = row.workout.startedAt;
            }
          }
        }
      }

      let recoveryScore = 100;
      if (lastWorked) {
        const hoursSince = (Date.now() - lastWorked.getTime()) / (1000 * 60 * 60);
        recoveryScore = Math.min(100, Math.round((hoursSince / 72) * 100));
      }

      muscleStatus[muscle] = { recoveryScore, lastWorked };
    }
  }

  const suggestedType = await autoSelectWorkoutType(
    userId,
    prefs?.preferredSplit,
    prefs?.workoutDaysPerWeek,
  );
  const targetMuscles = getTargetMusclesForType(suggestedType);

  const recoveredMuscles = targetMuscles.filter(
    (m) => (muscleStatus[m]?.recoveryScore ?? 100) >= 70,
  );
  const reasoning =
    recoveredMuscles.length === targetMuscles.length
      ? `All target muscles (${targetMuscles.join(", ")}) are well recovered and ready to train.`
      : `Suggested based on your ${prefs?.preferredSplit ?? "training"} split. ${recoveredMuscles.length}/${targetMuscles.length} target muscles are sufficiently recovered.`;

  const muscleRecoveryStatus = allMuscles.map((muscle) => ({
    muscleGroup: muscle,
    recoveryScore: muscleStatus[muscle]?.recoveryScore ?? 100,
    lastWorked: muscleStatus[muscle]?.lastWorked ?? null,
  }));

  let generatedWorkout: GeneratedWorkoutContent | null = null;

  if (input.includeGeneratedWorkout) {
    const result = await db
      .select()
      .from(exercise)
      .where(or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)));

    const filteredExercises = result.filter((ex) => {
      const exMuscles = ex.muscleGroups as string[];
      return exMuscles.some((m) =>
        targetMuscles.some((target) => m.toLowerCase().includes(target.toLowerCase())),
      );
    });

    if (filteredExercises.length > 0) {
      const goalConfig = getGoalConfig(prefs?.primaryGoal);
      const duration = prefs?.preferredWorkoutDuration ?? 60;
      const targetCount = Math.min(Math.floor(duration / 10), 8);

      const selectedExercises = filteredExercises.slice(0, targetCount);

      generatedWorkout = {
        name: `${suggestedType.charAt(0).toUpperCase() + suggestedType.slice(1).replace("_", " ")} Workout`,
        estimatedDuration: duration,
        exercises: selectedExercises.map((ex) => ({
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets: goalConfig.sets,
          reps: goalConfig.reps,
          restSeconds: goalConfig.rest,
        })),
        warmup: generateWarmup(suggestedType),
        cooldown: generateCooldown(suggestedType),
      };
    }
  }

  return {
    suggestedType,
    targetMuscleGroups: targetMuscles,
    reasoning,
    muscleRecoveryStatus,
    generatedWorkout,
  };
};

export const substituteExerciseHandler: SubstituteExerciseRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const originalResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  const original = originalResult[0];
  if (!original) {
    notFound("Exercise", input.exerciseId);
  }

  const originalMuscles = original.muscleGroups as string[];

  const prefsResult = await db
    .select()
    .from(userTrainingPreferences)
    .where(eq(userTrainingPreferences.userId, userId))
    .limit(1);

  const prefs = prefsResult[0];
  const dislikedExercises = prefs?.dislikedExercises ?? [];
  const availableEquipment = prefs?.availableEquipment;

  const allExercises = await db
    .select()
    .from(exercise)
    .where(
      and(
        or(eq(exercise.isDefault, true), eq(exercise.createdByUserId, userId)),
        sql`${exercise.id} != ${input.exerciseId}`,
      ),
    );

  const alternatives = allExercises
    .map((ex) => {
      const exMuscles = ex.muscleGroups as string[];

      const commonMuscles = exMuscles.filter((m) =>
        originalMuscles.some((om) => m.toLowerCase() === om.toLowerCase()),
      );
      const muscleMatchScore =
        (commonMuscles.length / Math.max(originalMuscles.length, exMuscles.length)) * 50;

      const categoryBonus = ex.category === original.category ? 20 : 0;
      const typeBonus = ex.exerciseType === original.exerciseType ? 15 : 0;

      let equipmentPenalty = 0;
      if (input.reason === "equipment" && ex.equipment === original.equipment) {
        equipmentPenalty = -100;
      }

      let equipmentBonus = 0;
      if (availableEquipment && availableEquipment.length > 0) {
        if (
          ex.equipment &&
          availableEquipment.some((e) => ex.equipment?.toLowerCase().includes(e.toLowerCase()))
        ) {
          equipmentBonus = 10;
        } else if (ex.equipment?.toLowerCase() === "bodyweight") {
          equipmentBonus = 5;
        } else if (ex.equipment) {
          equipmentBonus = -20;
        }
      }

      const dislikedPenalty = dislikedExercises.includes(ex.id) ? -50 : 0;

      const matchScore = Math.max(
        0,
        Math.min(
          100,
          muscleMatchScore +
            categoryBonus +
            typeBonus +
            equipmentPenalty +
            equipmentBonus +
            dislikedPenalty,
        ),
      );

      return {
        id: ex.id,
        name: ex.name,
        category: ex.category,
        muscleGroups: exMuscles,
        equipment: ex.equipment,
        matchScore: Math.round(matchScore),
      };
    })
    .filter((ex) => ex.matchScore > 30)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return { alternatives };
};

export const getGeneratedHistoryHandler: GetGeneratedHistoryRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(aiGeneratedWorkout)
    .where(eq(aiGeneratedWorkout.userId, userId));

  const total = countResult[0]?.count ?? 0;

  const workouts = await db
    .select()
    .from(aiGeneratedWorkout)
    .where(eq(aiGeneratedWorkout.userId, userId))
    .orderBy(desc(aiGeneratedWorkout.generatedAt))
    .limit(input.limit)
    .offset(input.offset);

  return {
    workouts,
    total,
    limit: input.limit,
    offset: input.offset,
  };
};

export const submitFeedbackHandler: SubmitFeedbackRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const existing = await db
    .select()
    .from(aiGeneratedWorkout)
    .where(
      and(
        eq(aiGeneratedWorkout.id, input.generatedWorkoutId),
        eq(aiGeneratedWorkout.userId, userId),
      ),
    )
    .limit(1);

  if (!existing[0]) {
    notFound("Generated workout", input.generatedWorkoutId);
  }

  const result = await db
    .update(aiGeneratedWorkout)
    .set({
      userRating: input.rating,
      feedback: input.feedback,
      wasUsed: input.wasUsed ?? existing[0].wasUsed,
      workoutId: input.workoutId ?? existing[0].workoutId,
    })
    .where(eq(aiGeneratedWorkout.id, input.generatedWorkoutId))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to save feedback" });
  }

  return updated;
};
