// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  createCheckInRouteContract,
  deleteCheckInRouteContract,
  getCheckInByDateRouteContract,
  getCheckInHistoryRouteContract,
  getReadinessRouteContract,
  getRecoveryStatusRouteContract,
  getTodayCheckInRouteContract,
  getTrendsRouteContract,
  refreshRecoveryRouteContract,
} from "./contracts";
import {
  createCheckInHandler,
  deleteCheckInHandler,
  getCheckInByDateHandler,
  getCheckInHistoryHandler,
  getReadinessHandler,
  getRecoveryStatusHandler,
  getTodayCheckInHandler,
  getTrendsHandler,
  refreshRecoveryHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  CreateCheckInRouteHandler,
  DeleteCheckInRouteHandler,
  GetCheckInByDateRouteHandler,
  GetCheckInHistoryRouteHandler,
  GetReadinessRouteHandler,
  GetRecoveryStatusRouteHandler,
  GetTodayCheckInRouteHandler,
  GetTrendsRouteHandler,
  RefreshRecoveryRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const createCheckInRoute = createCheckInRouteContract.handler(createCheckInHandler);
export const getTodayCheckInRoute = getTodayCheckInRouteContract.handler(getTodayCheckInHandler);
export const getCheckInByDateRoute = getCheckInByDateRouteContract.handler(getCheckInByDateHandler);
export const getCheckInHistoryRoute =
  getCheckInHistoryRouteContract.handler(getCheckInHistoryHandler);
export const getTrendsRoute = getTrendsRouteContract.handler(getTrendsHandler);
export const deleteCheckInRoute = deleteCheckInRouteContract.handler(deleteCheckInHandler);
export const getRecoveryStatusRoute =
  getRecoveryStatusRouteContract.handler(getRecoveryStatusHandler);
export const getReadinessRoute = getReadinessRouteContract.handler(getReadinessHandler);
export const refreshRecoveryRoute = refreshRecoveryRouteContract.handler(refreshRecoveryHandler);
