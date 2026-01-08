/**
 * Analytics Router Module
 *
 * This module provides a modular structure for the analytics API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  generateSummaryRoute,
  getComparisonRoute,
  getConsistencyRoute,
  getExerciseStatsRoute,
  getFrequencyRoute,
  getMonthlySummaryRoute,
  getStrengthTrendsRoute,
  getSummaryHistoryRoute,
  getVolumeByMuscleRoute,
  getVolumeTrendsRoute,
  getWeeklySummaryRoute,
} from "./routes";

// ============================================================================
// Analytics Router
// ============================================================================

/**
 * Complete analytics router with all endpoints
 */
export const analyticsRouter = {
  /** Get weekly training summary */
  getWeeklySummary: getWeeklySummaryRoute,

  /** Get monthly training summary */
  getMonthlySummary: getMonthlySummaryRoute,

  /** Get paginated summary history */
  getSummaryHistory: getSummaryHistoryRoute,

  /** Get volume trends over time */
  getVolumeTrends: getVolumeTrendsRoute,

  /** Get volume breakdown by muscle group */
  getVolumeByMuscle: getVolumeByMuscleRoute,

  /** Get strength trends for an exercise */
  getStrengthTrends: getStrengthTrendsRoute,

  /** Get workout frequency analysis */
  getFrequency: getFrequencyRoute,

  /** Get consistency metrics */
  getConsistency: getConsistencyRoute,

  /** Get detailed stats for an exercise */
  getExerciseStats: getExerciseStatsRoute,

  /** Compare two time periods */
  getComparison: getComparisonRoute,

  /** Generate a training summary */
  generateSummary: generateSummaryRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

export * from "./schemas";
export * from "./handlers";

export {
  generateSummaryRoute,
  getComparisonRoute,
  getConsistencyRoute,
  getExerciseStatsRoute,
  getFrequencyRoute,
  getMonthlySummaryRoute,
  getStrengthTrendsRoute,
  getSummaryHistoryRoute,
  getVolumeByMuscleRoute,
  getVolumeTrendsRoute,
  getWeeklySummaryRoute,
} from "./routes";
