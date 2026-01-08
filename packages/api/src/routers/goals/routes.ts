import z from "zod";

import { protectedProcedure } from "../../index";
import {
  abandonGoalHandler,
  completeGoalHandler,
  createBodyMeasurementGoalHandler,
  createCustomGoalHandler,
  createStrengthGoalHandler,
  createWeightGoalHandler,
  createWorkoutFrequencyGoalHandler,
  deleteGoalHandler,
  getGoalByIdHandler,
  getGoalProgressHistoryHandler,
  getGoalsSummaryHandler,
  listGoalsHandler,
  pauseGoalHandler,
  resumeGoalHandler,
  updateGoalHandler,
  updateGoalProgressHandler,
} from "./handlers";
import {
  abandonGoalSchema,
  completeGoalSchema,
  createBodyMeasurementGoalSchema,
  createCustomGoalSchema,
  createStrengthGoalSchema,
  createWeightGoalSchema,
  createWorkoutFrequencyGoalSchema,
  deleteGoalSchema,
  getGoalByIdSchema,
  getGoalProgressHistorySchema,
  goalOutputSchema,
  goalProgressOutputSchema,
  goalsSummarySchema,
  goalWithProgressSchema,
  goalsListOutputSchema,
  listGoalsFilterSchema,
  pauseGoalSchema,
  resumeGoalSchema,
  successResultSchema,
  updateGoalProgressSchema,
  updateGoalSchema,
} from "./schemas";

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * Create a weight goal
 */
export const createWeightGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/weight",
    summary: "Create a weight goal",
    description: "Create a new weight goal to track body weight changes.",
    tags: ["Goals"],
  })
  .input(createWeightGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return createWeightGoalHandler(input, context);
  });

/**
 * Create a strength goal
 */
export const createStrengthGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/strength",
    summary: "Create a strength goal",
    description: "Create a new strength goal to track lift performance for a specific exercise.",
    tags: ["Goals"],
  })
  .input(createStrengthGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return createStrengthGoalHandler(input, context);
  });

/**
 * Create a body measurement goal
 */
export const createBodyMeasurementGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/body-measurement",
    summary: "Create a body measurement goal",
    description: "Create a new goal to track body measurement changes (waist, chest, etc.).",
    tags: ["Goals"],
  })
  .input(createBodyMeasurementGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return createBodyMeasurementGoalHandler(input, context);
  });

/**
 * Create a workout frequency goal
 */
export const createWorkoutFrequencyGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/workout-frequency",
    summary: "Create a workout frequency goal",
    description: "Create a new goal to track workout frequency (workouts per week).",
    tags: ["Goals"],
  })
  .input(createWorkoutFrequencyGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return createWorkoutFrequencyGoalHandler(input, context);
  });

/**
 * Create a custom goal
 */
export const createCustomGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/custom",
    summary: "Create a custom goal",
    description: "Create a custom goal with your own metric and unit.",
    tags: ["Goals"],
  })
  .input(createCustomGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return createCustomGoalHandler(input, context);
  });

/**
 * Get a goal by ID
 */
export const getGoalByIdRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/goals/{id}",
    summary: "Get goal by ID",
    description: "Get a goal by ID with exercise details and progress history.",
    tags: ["Goals"],
  })
  .input(getGoalByIdSchema)
  .output(goalWithProgressSchema)
  .handler(async ({ input, context }) => {
    return getGoalByIdHandler(input, context);
  });

/**
 * List goals with filtering
 */
export const listGoalsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/goals",
    summary: "List goals",
    description: "List all goals with optional filtering by type, status, or exercise.",
    tags: ["Goals"],
  })
  .input(listGoalsFilterSchema)
  .output(goalsListOutputSchema)
  .handler(async ({ input, context }) => {
    return listGoalsHandler(input, context);
  });

/**
 * Get goals summary for dashboard
 */
export const getGoalsSummaryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/goals/summary",
    summary: "Get goals summary",
    description: "Get a summary of all goals including counts, averages, and near-deadline goals.",
    tags: ["Goals"],
  })
  .output(goalsSummarySchema)
  .handler(async ({ context }) => {
    return getGoalsSummaryHandler(context);
  });

/**
 * Update a goal
 */
export const updateGoalRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/goals/{id}",
    summary: "Update goal",
    description: "Update a goal's title, description, status, targets, or current values.",
    tags: ["Goals"],
  })
  .input(updateGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return updateGoalHandler(input, context);
  });

/**
 * Update goal progress
 */
export const updateGoalProgressRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{goalId}/progress",
    summary: "Update goal progress",
    description: "Log a new progress entry for a goal and update its current value.",
    tags: ["Goals"],
  })
  .input(updateGoalProgressSchema)
  .output(goalWithProgressSchema)
  .handler(async ({ input, context }) => {
    return updateGoalProgressHandler(input, context);
  });

/**
 * Complete a goal
 */
export const completeGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/complete",
    summary: "Complete goal",
    description: "Mark a goal as completed.",
    tags: ["Goals"],
  })
  .input(completeGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return completeGoalHandler(input, context);
  });

/**
 * Abandon a goal
 */
export const abandonGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/abandon",
    summary: "Abandon goal",
    description: "Mark a goal as abandoned with an optional reason.",
    tags: ["Goals"],
  })
  .input(abandonGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return abandonGoalHandler(input, context);
  });

/**
 * Pause a goal
 */
export const pauseGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/pause",
    summary: "Pause goal",
    description: "Pause an active goal.",
    tags: ["Goals"],
  })
  .input(pauseGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return pauseGoalHandler(input, context);
  });

/**
 * Resume a goal
 */
export const resumeGoalRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/resume",
    summary: "Resume goal",
    description: "Resume a paused goal.",
    tags: ["Goals"],
  })
  .input(resumeGoalSchema)
  .output(goalOutputSchema)
  .handler(async ({ input, context }) => {
    return resumeGoalHandler(input, context);
  });

/**
 * Delete a goal
 */
export const deleteGoalRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/goals/{id}",
    summary: "Delete goal",
    description: "Delete a goal and all its progress history.",
    tags: ["Goals"],
  })
  .input(deleteGoalSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return deleteGoalHandler(input, context);
  });

/**
 * Get goal progress history
 */
export const getGoalProgressHistoryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/goals/{goalId}/progress",
    summary: "Get goal progress history",
    description: "Get the progress history for a goal.",
    tags: ["Goals"],
  })
  .input(getGoalProgressHistorySchema)
  .output(z.array(goalProgressOutputSchema))
  .handler(async ({ input, context }) => {
    return getGoalProgressHistoryHandler(input, context);
  });
