import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { goal, goalProgress } from "@fit-ai/db/schema/goals";
import { and, desc, eq, inArray } from "drizzle-orm";

import { badRequest, notFound, notOwner } from "../../errors";
import type {
  AbandonGoalInput,
  CompleteGoalInput,
  CreateBodyMeasurementGoalInput,
  CreateCustomGoalInput,
  CreateStrengthGoalInput,
  CreateWeightGoalInput,
  CreateWorkoutFrequencyGoalInput,
  DeleteGoalInput,
  GetGoalByIdInput,
  GetGoalProgressHistoryInput,
  GoalOutput,
  GoalWithExercise,
  GoalWithProgress,
  GoalsSummary,
  ListGoalsFilterInput,
  PauseGoalInput,
  ResumeGoalInput,
  UpdateGoalInput,
  UpdateGoalProgressInput,
} from "./schemas";

// ============================================================================
// Types
// ============================================================================

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

/**
 * Calculate progress percentage based on goal type and values
 */
function calculateProgress(
  _goalType: string,
  direction: string,
  start: number,
  target: number,
  current: number,
): number {
  // Handle maintain goals
  if (direction === "maintain") {
    // For maintain, 100% if within 5% of target
    const tolerance = Math.abs(target * 0.05);
    if (Math.abs(current - target) <= tolerance) {
      return 100;
    }
    // Otherwise show how far from tolerance they are
    const distance = Math.abs(current - target);
    return Math.max(0, Math.min(100, 100 - (distance / tolerance) * 100));
  }

  const totalChange = Math.abs(target - start);
  if (totalChange === 0) return 100;

  const currentChange = Math.abs(current - start);
  let progress = (currentChange / totalChange) * 100;

  // For decrease goals, check if we're going the right direction
  if (direction === "decrease") {
    if (current > start) {
      // Going wrong direction
      return 0;
    }
    progress = ((start - current) / (start - target)) * 100;
  } else {
    // Increase goals
    if (current < start) {
      // Going wrong direction
      return 0;
    }
    progress = ((current - start) / (target - start)) * 100;
  }

  return Math.max(0, Math.min(100, progress));
}

/**
 * Get goal by ID and verify ownership
 */
async function getGoalWithOwnershipCheck(goalId: number, userId: string) {
  const goals = await db.select().from(goal).where(eq(goal.id, goalId)).limit(1);

  if (!goals[0]) {
    notFound("Goal", goalId);
  }

  if (goals[0].userId !== userId) {
    notOwner("goal");
  }

  return goals[0];
}

/**
 * Fetch exercise details for a goal
 */
async function getExerciseDetails(exerciseId: number | null) {
  if (!exerciseId) return null;

  const exercises = await db
    .select({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
    })
    .from(exercise)
    .where(eq(exercise.id, exerciseId))
    .limit(1);

  return exercises[0] ?? null;
}

// ============================================================================
// Handlers
// ============================================================================

/**
 * Create a weight goal
 */
export async function createWeightGoalHandler(
  input: CreateWeightGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;

  const result = await db
    .insert(goal)
    .values({
      userId,
      goalType: "weight",
      title: input.title,
      description: input.description,
      direction: input.direction,
      startWeight: input.startWeight,
      targetWeight: input.targetWeight,
      currentWeight: input.startWeight, // Initialize current to start
      weightUnit: input.weightUnit,
      targetDate: input.targetDate,
      progressPercentage: 0,
    })
    .returning();

  return result[0]!;
}

/**
 * Create a strength goal
 */
export async function createStrengthGoalHandler(
  input: CreateStrengthGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;

  // Verify exercise exists
  const exercises = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  if (!exercises[0]) {
    notFound("Exercise", input.exerciseId);
  }

  const result = await db
    .insert(goal)
    .values({
      userId,
      goalType: "strength",
      title: input.title,
      description: input.description,
      direction: input.direction,
      exerciseId: input.exerciseId,
      startLiftWeight: input.startLiftWeight,
      targetLiftWeight: input.targetLiftWeight,
      currentLiftWeight: input.startLiftWeight,
      weightUnit: input.weightUnit,
      startReps: input.startReps,
      targetReps: input.targetReps,
      currentReps: input.startReps,
      targetDate: input.targetDate,
      progressPercentage: 0,
    })
    .returning();

  return result[0]!;
}

/**
 * Create a body measurement goal
 */
export async function createBodyMeasurementGoalHandler(
  input: CreateBodyMeasurementGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;

  const result = await db
    .insert(goal)
    .values({
      userId,
      goalType: "body_measurement",
      title: input.title,
      description: input.description,
      direction: input.direction,
      measurementType: input.measurementType,
      startMeasurement: input.startMeasurement,
      targetMeasurement: input.targetMeasurement,
      currentMeasurement: input.startMeasurement,
      lengthUnit: input.lengthUnit,
      targetDate: input.targetDate,
      progressPercentage: 0,
    })
    .returning();

  return result[0]!;
}

/**
 * Create a workout frequency goal
 */
export async function createWorkoutFrequencyGoalHandler(
  input: CreateWorkoutFrequencyGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;

  const result = await db
    .insert(goal)
    .values({
      userId,
      goalType: "workout_frequency",
      title: input.title,
      description: input.description,
      direction: "increase",
      targetWorkoutsPerWeek: input.targetWorkoutsPerWeek,
      currentWorkoutsPerWeek: 0,
      targetDate: input.targetDate,
      progressPercentage: 0,
    })
    .returning();

  return result[0]!;
}

/**
 * Create a custom goal
 */
export async function createCustomGoalHandler(
  input: CreateCustomGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;

  const result = await db
    .insert(goal)
    .values({
      userId,
      goalType: "custom",
      title: input.title,
      description: input.description,
      direction: input.direction,
      customMetricName: input.customMetricName,
      customMetricUnit: input.customMetricUnit,
      startCustomValue: input.startCustomValue,
      targetCustomValue: input.targetCustomValue,
      currentCustomValue: input.startCustomValue,
      targetDate: input.targetDate,
      progressPercentage: 0,
    })
    .returning();

  return result[0]!;
}

/**
 * Get a goal by ID with exercise details
 */
export async function getGoalByIdHandler(
  input: GetGoalByIdInput,
  context: AuthenticatedContext,
): Promise<GoalWithProgress> {
  const userId = context.session.user.id;
  const existingGoal = await getGoalWithOwnershipCheck(input.id, userId);

  // Get exercise details if it's a strength goal
  const exerciseDetails = await getExerciseDetails(existingGoal.exerciseId);

  // Get progress history
  const progressHistory = await db
    .select()
    .from(goalProgress)
    .where(eq(goalProgress.goalId, input.id))
    .orderBy(desc(goalProgress.recordedAt))
    .limit(50);

  return {
    ...existingGoal,
    exercise: exerciseDetails,
    progressHistory,
  };
}

/**
 * List goals with filtering
 */
export async function listGoalsHandler(
  input: ListGoalsFilterInput,
  context: AuthenticatedContext,
): Promise<GoalWithExercise[]> {
  const userId = context.session.user.id;
  const limit = input.limit ?? 50;
  const offset = input.offset ?? 0;

  // Build conditions
  const conditions = [eq(goal.userId, userId)];

  if (input.goalType) {
    conditions.push(eq(goal.goalType, input.goalType));
  }

  if (input.status) {
    conditions.push(eq(goal.status, input.status));
  }

  if (input.exerciseId) {
    conditions.push(eq(goal.exerciseId, input.exerciseId));
  }

  // Fetch goals
  const goals = await db
    .select()
    .from(goal)
    .where(and(...conditions))
    .orderBy(desc(goal.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch exercise details for strength goals
  const exerciseIds = goals.filter((g) => g.exerciseId).map((g) => g.exerciseId as number);

  let exerciseMap: Map<number, { id: number; name: string; category: string }> = new Map();

  if (exerciseIds.length > 0) {
    const exercises = await db
      .select({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
      })
      .from(exercise)
      .where(inArray(exercise.id, exerciseIds));

    exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  }

  return goals.map((g) => ({
    ...g,
    exercise: g.exerciseId ? (exerciseMap.get(g.exerciseId) ?? null) : null,
  }));
}

/**
 * Get goals summary for dashboard
 */
export async function getGoalsSummaryHandler(context: AuthenticatedContext): Promise<GoalsSummary> {
  const userId = context.session.user.id;
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get all goals for this user
  const allGoals = await db.select().from(goal).where(eq(goal.userId, userId));

  // Calculate counts
  const totalGoals = allGoals.length;
  const activeGoals = allGoals.filter((g) => g.status === "active").length;
  const completedGoals = allGoals.filter((g) => g.status === "completed").length;
  const abandonedGoals = allGoals.filter((g) => g.status === "abandoned").length;
  const pausedGoals = allGoals.filter((g) => g.status === "paused").length;

  // Calculate average progress of active goals
  const activeGoalsList = allGoals.filter((g) => g.status === "active");
  const averageProgress =
    activeGoalsList.length > 0
      ? activeGoalsList.reduce((sum, g) => sum + g.progressPercentage, 0) / activeGoalsList.length
      : 0;

  // Get goals near deadline (active goals with target date within a week)
  const nearDeadlineGoals = allGoals.filter(
    (g) =>
      g.status === "active" &&
      g.targetDate &&
      g.targetDate >= now &&
      g.targetDate <= oneWeekFromNow,
  );

  // Get recently completed goals (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentlyCompleted = allGoals.filter(
    (g) => g.status === "completed" && g.completedAt && g.completedAt >= thirtyDaysAgo,
  );

  // Fetch exercise details
  const exerciseIds = [
    ...nearDeadlineGoals.filter((g) => g.exerciseId).map((g) => g.exerciseId as number),
    ...recentlyCompleted.filter((g) => g.exerciseId).map((g) => g.exerciseId as number),
  ];

  let exerciseMap: Map<number, { id: number; name: string; category: string }> = new Map();

  if (exerciseIds.length > 0) {
    const exercises = await db
      .select({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
      })
      .from(exercise)
      .where(inArray(exercise.id, [...new Set(exerciseIds)]));

    exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  }

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    abandonedGoals,
    pausedGoals,
    averageProgress: Math.round(averageProgress * 100) / 100,
    nearDeadlineGoals: nearDeadlineGoals.map((g) => ({
      ...g,
      exercise: g.exerciseId ? (exerciseMap.get(g.exerciseId) ?? null) : null,
    })),
    recentlyCompletedGoals: recentlyCompleted.map((g) => ({
      ...g,
      exercise: g.exerciseId ? (exerciseMap.get(g.exerciseId) ?? null) : null,
    })),
  };
}

/**
 * Update a goal
 */
export async function updateGoalHandler(
  input: UpdateGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;
  const existingGoal = await getGoalWithOwnershipCheck(input.id, userId);

  // Build update object (only include provided fields)
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.targetDate !== undefined) updateData.targetDate = input.targetDate;

  // Type-specific updates
  if (input.targetWeight !== undefined) updateData.targetWeight = input.targetWeight;
  if (input.currentWeight !== undefined) {
    updateData.currentWeight = input.currentWeight;
  }

  if (input.targetLiftWeight !== undefined) updateData.targetLiftWeight = input.targetLiftWeight;
  if (input.currentLiftWeight !== undefined) {
    updateData.currentLiftWeight = input.currentLiftWeight;
  }

  if (input.targetReps !== undefined) updateData.targetReps = input.targetReps;
  if (input.currentReps !== undefined) updateData.currentReps = input.currentReps;

  if (input.targetMeasurement !== undefined) updateData.targetMeasurement = input.targetMeasurement;
  if (input.currentMeasurement !== undefined)
    updateData.currentMeasurement = input.currentMeasurement;

  if (input.targetWorkoutsPerWeek !== undefined)
    updateData.targetWorkoutsPerWeek = input.targetWorkoutsPerWeek;

  if (input.targetCustomValue !== undefined) updateData.targetCustomValue = input.targetCustomValue;
  if (input.currentCustomValue !== undefined)
    updateData.currentCustomValue = input.currentCustomValue;

  // Recalculate progress if current values were updated
  if (
    input.currentWeight !== undefined ||
    input.currentLiftWeight !== undefined ||
    input.currentMeasurement !== undefined ||
    input.currentCustomValue !== undefined
  ) {
    let progress = 0;
    const goalType = existingGoal.goalType;
    const direction = existingGoal.direction;

    if (goalType === "weight" && existingGoal.startWeight && existingGoal.targetWeight) {
      const current = (input.currentWeight ?? existingGoal.currentWeight) as number;
      progress = calculateProgress(
        goalType,
        direction,
        existingGoal.startWeight,
        existingGoal.targetWeight,
        current,
      );
    } else if (
      goalType === "strength" &&
      existingGoal.startLiftWeight &&
      existingGoal.targetLiftWeight
    ) {
      const current = (input.currentLiftWeight ?? existingGoal.currentLiftWeight) as number;
      progress = calculateProgress(
        goalType,
        direction,
        existingGoal.startLiftWeight,
        existingGoal.targetLiftWeight,
        current,
      );
    } else if (
      goalType === "body_measurement" &&
      existingGoal.startMeasurement &&
      existingGoal.targetMeasurement
    ) {
      const current = (input.currentMeasurement ?? existingGoal.currentMeasurement) as number;
      progress = calculateProgress(
        goalType,
        direction,
        existingGoal.startMeasurement,
        existingGoal.targetMeasurement,
        current,
      );
    } else if (
      goalType === "custom" &&
      existingGoal.startCustomValue !== null &&
      existingGoal.targetCustomValue !== null
    ) {
      const current = (input.currentCustomValue ?? existingGoal.currentCustomValue) as number;
      progress = calculateProgress(
        goalType,
        direction,
        existingGoal.startCustomValue,
        existingGoal.targetCustomValue,
        current,
      );
    }

    updateData.progressPercentage = Math.round(progress * 100) / 100;
    updateData.updateCount = (existingGoal.updateCount ?? 0) + 1;
    updateData.lastProgressUpdate = new Date();
  }

  const result = await db.update(goal).set(updateData).where(eq(goal.id, input.id)).returning();

  return result[0]!;
}

/**
 * Update goal progress (logs progress history)
 */
export async function updateGoalProgressHandler(
  input: UpdateGoalProgressInput,
  context: AuthenticatedContext,
): Promise<GoalWithProgress> {
  const userId = context.session.user.id;
  const existingGoal = await getGoalWithOwnershipCheck(input.goalId, userId);

  if (existingGoal.status !== "active") {
    badRequest("Can only update progress on active goals");
  }

  // Calculate new progress
  let progress = 0;
  const updateData: Record<string, unknown> = {};

  switch (existingGoal.goalType) {
    case "weight":
      if (existingGoal.startWeight && existingGoal.targetWeight) {
        progress = calculateProgress(
          "weight",
          existingGoal.direction,
          existingGoal.startWeight,
          existingGoal.targetWeight,
          input.value,
        );
        updateData.currentWeight = input.value;
      }
      break;
    case "strength":
      if (existingGoal.startLiftWeight && existingGoal.targetLiftWeight) {
        progress = calculateProgress(
          "strength",
          existingGoal.direction,
          existingGoal.startLiftWeight,
          existingGoal.targetLiftWeight,
          input.value,
        );
        updateData.currentLiftWeight = input.value;
      }
      break;
    case "body_measurement":
      if (existingGoal.startMeasurement && existingGoal.targetMeasurement) {
        progress = calculateProgress(
          "body_measurement",
          existingGoal.direction,
          existingGoal.startMeasurement,
          existingGoal.targetMeasurement,
          input.value,
        );
        updateData.currentMeasurement = input.value;
      }
      break;
    case "workout_frequency":
      if (existingGoal.targetWorkoutsPerWeek) {
        progress = Math.min(100, (input.value / existingGoal.targetWorkoutsPerWeek) * 100);
        updateData.currentWorkoutsPerWeek = input.value;
      }
      break;
    case "custom":
      if (existingGoal.startCustomValue !== null && existingGoal.targetCustomValue !== null) {
        progress = calculateProgress(
          "custom",
          existingGoal.direction,
          existingGoal.startCustomValue,
          existingGoal.targetCustomValue,
          input.value,
        );
        updateData.currentCustomValue = input.value;
      }
      break;
  }

  progress = Math.round(progress * 100) / 100;
  updateData.progressPercentage = progress;
  updateData.updateCount = (existingGoal.updateCount ?? 0) + 1;
  updateData.lastProgressUpdate = new Date();

  // Insert progress history
  await db.insert(goalProgress).values({
    goalId: input.goalId,
    userId,
    value: input.value,
    progressPercentage: progress,
    note: input.note,
  });

  // Update goal
  const updatedGoals = await db
    .update(goal)
    .set(updateData)
    .where(eq(goal.id, input.goalId))
    .returning();

  // Get exercise details
  const exerciseDetails = await getExerciseDetails(existingGoal.exerciseId);

  // Get progress history
  const progressHistory = await db
    .select()
    .from(goalProgress)
    .where(eq(goalProgress.goalId, input.goalId))
    .orderBy(desc(goalProgress.recordedAt))
    .limit(50);

  return {
    ...updatedGoals[0]!,
    exercise: exerciseDetails,
    progressHistory,
  };
}

/**
 * Complete a goal
 */
export async function completeGoalHandler(
  input: CompleteGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;
  await getGoalWithOwnershipCheck(input.id, userId);

  const result = await db
    .update(goal)
    .set({
      status: "completed",
      completedAt: new Date(),
      progressPercentage: 100,
    })
    .where(eq(goal.id, input.id))
    .returning();

  return result[0]!;
}

/**
 * Abandon a goal
 */
export async function abandonGoalHandler(
  input: AbandonGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;
  await getGoalWithOwnershipCheck(input.id, userId);

  const updateData: Record<string, unknown> = {
    status: "abandoned",
  };

  // Add reason as a note in progress history if provided
  if (input.reason) {
    await db.insert(goalProgress).values({
      goalId: input.id,
      userId,
      value: 0,
      progressPercentage: 0,
      note: `Goal abandoned: ${input.reason}`,
    });
  }

  const result = await db.update(goal).set(updateData).where(eq(goal.id, input.id)).returning();

  return result[0]!;
}

/**
 * Pause a goal
 */
export async function pauseGoalHandler(
  input: PauseGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;
  const existingGoal = await getGoalWithOwnershipCheck(input.id, userId);

  if (existingGoal.status !== "active") {
    badRequest("Can only pause active goals");
  }

  const result = await db
    .update(goal)
    .set({ status: "paused" })
    .where(eq(goal.id, input.id))
    .returning();

  return result[0]!;
}

/**
 * Resume a goal
 */
export async function resumeGoalHandler(
  input: ResumeGoalInput,
  context: AuthenticatedContext,
): Promise<GoalOutput> {
  const userId = context.session.user.id;
  const existingGoal = await getGoalWithOwnershipCheck(input.id, userId);

  if (existingGoal.status !== "paused") {
    badRequest("Can only resume paused goals");
  }

  const result = await db
    .update(goal)
    .set({ status: "active" })
    .where(eq(goal.id, input.id))
    .returning();

  return result[0]!;
}

/**
 * Delete a goal
 */
export async function deleteGoalHandler(
  input: DeleteGoalInput,
  context: AuthenticatedContext,
): Promise<{ success: boolean }> {
  const userId = context.session.user.id;
  await getGoalWithOwnershipCheck(input.id, userId);

  // Delete progress history first (cascade should handle this, but being explicit)
  await db.delete(goalProgress).where(eq(goalProgress.goalId, input.id));

  // Delete goal
  await db.delete(goal).where(eq(goal.id, input.id));

  return { success: true };
}

/**
 * Get goal progress history
 */
export async function getGoalProgressHistoryHandler(
  input: GetGoalProgressHistoryInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getGoalWithOwnershipCheck(input.goalId, userId);

  const limit = input.limit ?? 50;
  const offset = input.offset ?? 0;

  const history = await db
    .select()
    .from(goalProgress)
    .where(eq(goalProgress.goalId, input.goalId))
    .orderBy(desc(goalProgress.recordedAt))
    .limit(limit)
    .offset(offset);

  return history;
}
