import { protectedProcedure } from "../../index";
import {
  bestPerformanceOutputSchema,
  exerciseIdInputSchema,
  lastPerformanceOutputSchema,
  muscleVolumeInputSchema,
  muscleVolumeOutputSchema,
  progressionInputSchema,
  progressionOutputSchema,
  recentWorkoutsInputSchema,
  recentWorkoutsOutputSchema,
  trainingSummaryOutputSchema,
  workoutDetailsOutputSchema,
  workoutHistoryInputSchema,
  workoutHistoryOutputSchema,
  workoutIdInputSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

// ============================================================================
// Exercise History Route Contracts
// ============================================================================

/**
 * Get last performance for exercise
 */
export const getLastPerformanceRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/last",
    summary: "Get last performance for exercise",
    description:
      "Returns the most recent workout performance for a specific exercise, including all sets, total volume, and top set.",
    tags: ["History"],
  })
  .input(exerciseIdInputSchema)
  .output(lastPerformanceOutputSchema.nullable());

/**
 * Get best performance for exercise
 */
export const getBestPerformanceRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/best",
    summary: "Get best performance for exercise",
    description:
      "Returns personal records for an exercise including max weight, max reps, max volume, and estimated 1RM.",
    tags: ["History"],
  })
  .input(exerciseIdInputSchema)
  .output(bestPerformanceOutputSchema);

/**
 * Get exercise progression
 */
export const getProgressionRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/progression",
    summary: "Get exercise progression",
    description:
      "Returns performance data over time for charting progression. Shows top set weight, volume, and estimated 1RM per workout.",
    tags: ["History"],
  })
  .input(progressionInputSchema)
  .output(progressionOutputSchema);

/**
 * Get recent workouts with exercise
 */
export const getRecentWorkoutsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/recent",
    summary: "Get recent workouts with exercise",
    description:
      "Returns the last N workouts that included a specific exercise, with full set details.",
    tags: ["History"],
  })
  .input(recentWorkoutsInputSchema)
  .output(recentWorkoutsOutputSchema);

// ============================================================================
// Workout History Route Contracts
// ============================================================================

/**
 * Get workout history
 */
export const getWorkoutHistoryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/workouts",
    summary: "Get workout history",
    description:
      "Returns a paginated list of completed workouts with summary statistics including duration, volume, and exercise/set counts.",
    tags: ["History"],
  })
  .input(workoutHistoryInputSchema)
  .output(workoutHistoryOutputSchema);

/**
 * Get workout details
 */
export const getWorkoutDetailsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/workouts/{workoutId}/details",
    summary: "Get workout details",
    description:
      "Returns complete details for a specific workout including all exercises and their sets.",
    tags: ["History"],
  })
  .input(workoutIdInputSchema)
  .output(workoutDetailsOutputSchema);

// ============================================================================
// Summary Route Contracts
// ============================================================================

/**
 * Get training summary
 */
export const getSummaryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/summary",
    summary: "Get training summary",
    description:
      "Returns overall training statistics including total workouts, volume, streaks, and favorite exercise.",
    tags: ["History"],
  })
  .output(trainingSummaryOutputSchema);

/**
 * Get weekly muscle volume
 */
export const getMuscleVolumeRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/history/muscle-volume",
    summary: "Get weekly muscle volume",
    description: "Returns volume breakdown by muscle group for a specific week.",
    tags: ["History"],
  })
  .input(muscleVolumeInputSchema)
  .output(muscleVolumeOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type GetLastPerformanceRouteHandler = Parameters<
  typeof getLastPerformanceRouteContract.handler
>[0];
export type GetBestPerformanceRouteHandler = Parameters<
  typeof getBestPerformanceRouteContract.handler
>[0];
export type GetProgressionRouteHandler = Parameters<typeof getProgressionRouteContract.handler>[0];
export type GetRecentWorkoutsRouteHandler = Parameters<
  typeof getRecentWorkoutsRouteContract.handler
>[0];
export type GetWorkoutHistoryRouteHandler = Parameters<
  typeof getWorkoutHistoryRouteContract.handler
>[0];
export type GetWorkoutDetailsRouteHandler = Parameters<
  typeof getWorkoutDetailsRouteContract.handler
>[0];
export type GetSummaryRouteHandler = Parameters<typeof getSummaryRouteContract.handler>[0];
export type GetMuscleVolumeRouteHandler = Parameters<
  typeof getMuscleVolumeRouteContract.handler
>[0];
