/**
 * History Router Module
 *
 * This module provides a modular structure for the history API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  getBestPerformanceRoute,
  getLastPerformanceRoute,
  getMuscleVolumeRoute,
  getProgressionRoute,
  getRecentWorkoutsRoute,
  getSummaryRoute,
  getWorkoutDetailsRoute,
  getWorkoutHistoryRoute,
} from "./routes";

// ============================================================================
// History Router
// ============================================================================

/**
 * Complete history router with all endpoints
 */
export const historyRouter = {
  // Exercise History
  /** Get last performance for an exercise */
  getLastPerformance: getLastPerformanceRoute,

  /** Get best performance records for an exercise */
  getBestPerformance: getBestPerformanceRoute,

  /** Get exercise progression data for charts */
  getProgression: getProgressionRoute,

  /** Get recent workouts with a specific exercise */
  getRecentWorkouts: getRecentWorkoutsRoute,

  // Workout History
  /** Get paginated workout history */
  getWorkoutHistory: getWorkoutHistoryRoute,

  /** Get full details for a specific workout */
  getWorkoutDetails: getWorkoutDetailsRoute,

  // Summary
  /** Get overall training summary */
  getSummary: getSummaryRoute,

  /** Get weekly muscle volume breakdown */
  getMuscleVolume: getMuscleVolumeRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

export * from "./schemas";
export * from "./handlers";

export {
  getBestPerformanceRoute,
  getLastPerformanceRoute,
  getMuscleVolumeRoute,
  getProgressionRoute,
  getRecentWorkoutsRoute,
  getSummaryRoute,
  getWorkoutDetailsRoute,
  getWorkoutHistoryRoute,
} from "./routes";
