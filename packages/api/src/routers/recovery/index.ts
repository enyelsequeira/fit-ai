/**
 * Recovery Router Module
 *
 * This module provides a modular structure for the recovery API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  createCheckInRoute,
  deleteCheckInRoute,
  getCheckInByDateRoute,
  getCheckInHistoryRoute,
  getReadinessRoute,
  getRecoveryStatusRoute,
  getTodayCheckInRoute,
  getTrendsRoute,
  refreshRecoveryRoute,
} from "./routes";

// ============================================================================
// Recovery Router
// ============================================================================

/**
 * Complete recovery router with all endpoints
 */
export const recoveryRouter = {
  /** Create or update daily check-in */
  createCheckIn: createCheckInRoute,

  /** Get today's check-in */
  getTodayCheckIn: getTodayCheckInRoute,

  /** Get check-in for a specific date */
  getCheckInByDate: getCheckInByDateRoute,

  /** Get check-in history with pagination */
  getCheckInHistory: getCheckInHistoryRoute,

  /** Get trends over time */
  getTrends: getTrendsRoute,

  /** Delete check-in for a specific date */
  deleteCheckIn: deleteCheckInRoute,

  /** Get current recovery status per muscle group */
  getRecoveryStatus: getRecoveryStatusRoute,

  /** Get overall training readiness score */
  getReadiness: getReadinessRoute,

  /** Recalculate muscle recovery based on recent workouts */
  refreshRecovery: refreshRecoveryRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

// Export schemas for use in other modules or tests
export * from "./schemas";

// Export handlers for testing or custom route composition
export * from "./handlers";

// Export individual routes for custom router composition
export {
  createCheckInRoute,
  deleteCheckInRoute,
  getCheckInByDateRoute,
  getCheckInHistoryRoute,
  getReadinessRoute,
  getRecoveryStatusRoute,
  getTodayCheckInRoute,
  getTrendsRoute,
  refreshRecoveryRoute,
} from "./routes";
