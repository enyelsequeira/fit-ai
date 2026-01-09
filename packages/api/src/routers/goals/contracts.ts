import z from "zod";

import { protectedProcedure } from "../../index";
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
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * Create a weight goal
 */
export const createWeightGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/weight",
    summary: "Create a weight goal",
    description: "Create a new weight goal to track body weight changes.",
    tags: ["Goals"],
  })
  .input(createWeightGoalSchema)
  .output(goalOutputSchema);

/**
 * Create a strength goal
 */
export const createStrengthGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/strength",
    summary: "Create a strength goal",
    description: "Create a new strength goal to track lift performance for a specific exercise.",
    tags: ["Goals"],
  })
  .input(createStrengthGoalSchema)
  .output(goalOutputSchema);

/**
 * Create a body measurement goal
 */
export const createBodyMeasurementGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/body-measurement",
    summary: "Create a body measurement goal",
    description: "Create a new goal to track body measurement changes (waist, chest, etc.).",
    tags: ["Goals"],
  })
  .input(createBodyMeasurementGoalSchema)
  .output(goalOutputSchema);

/**
 * Create a workout frequency goal
 */
export const createWorkoutFrequencyGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/workout-frequency",
    summary: "Create a workout frequency goal",
    description: "Create a new goal to track workout frequency (workouts per week).",
    tags: ["Goals"],
  })
  .input(createWorkoutFrequencyGoalSchema)
  .output(goalOutputSchema);

/**
 * Create a custom goal
 */
export const createCustomGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/custom",
    summary: "Create a custom goal",
    description: "Create a custom goal with your own metric and unit.",
    tags: ["Goals"],
  })
  .input(createCustomGoalSchema)
  .output(goalOutputSchema);

/**
 * Get a goal by ID
 */
export const getGoalByIdRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/goals/{id}",
    summary: "Get goal by ID",
    description: "Get a goal by ID with exercise details and progress history.",
    tags: ["Goals"],
  })
  .input(getGoalByIdSchema)
  .output(goalWithProgressSchema);

/**
 * List goals with filtering
 */
export const listGoalsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/goals",
    summary: "List goals",
    description: "List all goals with optional filtering by type, status, or exercise.",
    tags: ["Goals"],
  })
  .input(listGoalsFilterSchema)
  .output(goalsListOutputSchema);

/**
 * Get goals summary for dashboard
 */
export const getGoalsSummaryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/goals/summary",
    summary: "Get goals summary",
    description: "Get a summary of all goals including counts, averages, and near-deadline goals.",
    tags: ["Goals"],
  })
  .output(goalsSummarySchema);

/**
 * Update a goal
 */
export const updateGoalRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/goals/{id}",
    summary: "Update goal",
    description: "Update a goal's title, description, status, targets, or current values.",
    tags: ["Goals"],
  })
  .input(updateGoalSchema)
  .output(goalOutputSchema);

/**
 * Update goal progress
 */
export const updateGoalProgressRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{goalId}/progress",
    summary: "Update goal progress",
    description: "Log a new progress entry for a goal and update its current value.",
    tags: ["Goals"],
  })
  .input(updateGoalProgressSchema)
  .output(goalWithProgressSchema);

/**
 * Complete a goal
 */
export const completeGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/complete",
    summary: "Complete goal",
    description: "Mark a goal as completed.",
    tags: ["Goals"],
  })
  .input(completeGoalSchema)
  .output(goalOutputSchema);

/**
 * Abandon a goal
 */
export const abandonGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/abandon",
    summary: "Abandon goal",
    description: "Mark a goal as abandoned with an optional reason.",
    tags: ["Goals"],
  })
  .input(abandonGoalSchema)
  .output(goalOutputSchema);

/**
 * Pause a goal
 */
export const pauseGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/pause",
    summary: "Pause goal",
    description: "Pause an active goal.",
    tags: ["Goals"],
  })
  .input(pauseGoalSchema)
  .output(goalOutputSchema);

/**
 * Resume a goal
 */
export const resumeGoalRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/goals/{id}/resume",
    summary: "Resume goal",
    description: "Resume a paused goal.",
    tags: ["Goals"],
  })
  .input(resumeGoalSchema)
  .output(goalOutputSchema);

/**
 * Delete a goal
 */
export const deleteGoalRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/goals/{id}",
    summary: "Delete goal",
    description: "Delete a goal and all its progress history.",
    tags: ["Goals"],
  })
  .input(deleteGoalSchema)
  .output(successResultSchema);

/**
 * Get goal progress history
 */
export const getGoalProgressHistoryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/goals/{goalId}/progress",
    summary: "Get goal progress history",
    description: "Get the progress history for a goal.",
    tags: ["Goals"],
  })
  .input(getGoalProgressHistorySchema)
  .output(z.array(goalProgressOutputSchema));

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type CreateWeightGoalRouteHandler = Parameters<
  typeof createWeightGoalRouteContract.handler
>[0];
export type CreateStrengthGoalRouteHandler = Parameters<
  typeof createStrengthGoalRouteContract.handler
>[0];
export type CreateBodyMeasurementGoalRouteHandler = Parameters<
  typeof createBodyMeasurementGoalRouteContract.handler
>[0];
export type CreateWorkoutFrequencyGoalRouteHandler = Parameters<
  typeof createWorkoutFrequencyGoalRouteContract.handler
>[0];
export type CreateCustomGoalRouteHandler = Parameters<
  typeof createCustomGoalRouteContract.handler
>[0];
export type GetGoalByIdRouteHandler = Parameters<typeof getGoalByIdRouteContract.handler>[0];
export type ListGoalsRouteHandler = Parameters<typeof listGoalsRouteContract.handler>[0];
export type GetGoalsSummaryRouteHandler = Parameters<
  typeof getGoalsSummaryRouteContract.handler
>[0];
export type UpdateGoalRouteHandler = Parameters<typeof updateGoalRouteContract.handler>[0];
export type UpdateGoalProgressRouteHandler = Parameters<
  typeof updateGoalProgressRouteContract.handler
>[0];
export type CompleteGoalRouteHandler = Parameters<typeof completeGoalRouteContract.handler>[0];
export type AbandonGoalRouteHandler = Parameters<typeof abandonGoalRouteContract.handler>[0];
export type PauseGoalRouteHandler = Parameters<typeof pauseGoalRouteContract.handler>[0];
export type ResumeGoalRouteHandler = Parameters<typeof resumeGoalRouteContract.handler>[0];
export type DeleteGoalRouteHandler = Parameters<typeof deleteGoalRouteContract.handler>[0];
export type GetGoalProgressHistoryRouteHandler = Parameters<
  typeof getGoalProgressHistoryRouteContract.handler
>[0];
