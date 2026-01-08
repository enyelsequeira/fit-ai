// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  getBestPerformanceRouteContract,
  getLastPerformanceRouteContract,
  getMuscleVolumeRouteContract,
  getProgressionRouteContract,
  getRecentWorkoutsRouteContract,
  getSummaryRouteContract,
  getWorkoutDetailsRouteContract,
  getWorkoutHistoryRouteContract,
} from "./contracts";
import {
  getBestPerformanceHandler,
  getLastPerformanceHandler,
  getMuscleVolumeHandler,
  getProgressionHandler,
  getRecentWorkoutsHandler,
  getSummaryHandler,
  getWorkoutDetailsHandler,
  getWorkoutHistoryHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  GetBestPerformanceRouteHandler,
  GetLastPerformanceRouteHandler,
  GetMuscleVolumeRouteHandler,
  GetProgressionRouteHandler,
  GetRecentWorkoutsRouteHandler,
  GetSummaryRouteHandler,
  GetWorkoutDetailsRouteHandler,
  GetWorkoutHistoryRouteHandler,
} from "./contracts";

// ============================================================================
// Exercise History Routes
// ============================================================================

export const getLastPerformanceRoute =
  getLastPerformanceRouteContract.handler(getLastPerformanceHandler);
export const getBestPerformanceRoute =
  getBestPerformanceRouteContract.handler(getBestPerformanceHandler);
export const getProgressionRoute = getProgressionRouteContract.handler(getProgressionHandler);
export const getRecentWorkoutsRoute =
  getRecentWorkoutsRouteContract.handler(getRecentWorkoutsHandler);

// ============================================================================
// Workout History Routes
// ============================================================================

export const getWorkoutHistoryRoute =
  getWorkoutHistoryRouteContract.handler(getWorkoutHistoryHandler);
export const getWorkoutDetailsRoute =
  getWorkoutDetailsRouteContract.handler(getWorkoutDetailsHandler);

// ============================================================================
// Summary Routes
// ============================================================================

export const getSummaryRoute = getSummaryRouteContract.handler(getSummaryHandler);
export const getMuscleVolumeRoute = getMuscleVolumeRouteContract.handler(getMuscleVolumeHandler);
