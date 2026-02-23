// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  generateSummaryRouteContract,
  getComparisonRouteContract,
  getConsistencyRouteContract,
  getExerciseStatsRouteContract,
  getFrequencyRouteContract,
  getGoalAnalyticsRouteContract,
  getMonthlySummaryRouteContract,
  getRecoveryTrendsRouteContract,
  getStrengthTrendsRouteContract,
  getSummaryHistoryRouteContract,
  getVolumeByMuscleRouteContract,
  getVolumeTrendsRouteContract,
  getWeeklySummaryRouteContract,
} from "./contracts";
import { getGoalAnalyticsHandler } from "./goal-analytics-handler";
import {
  generateSummaryHandler,
  getComparisonHandler,
  getConsistencyHandler,
  getExerciseStatsHandler,
  getFrequencyHandler,
  getMonthlySummaryHandler,
  getStrengthTrendsHandler,
  getSummaryHistoryHandler,
  getVolumeByMuscleHandler,
  getVolumeTrendsHandler,
  getWeeklySummaryHandler,
} from "./handlers";
import { getRecoveryTrendsHandler } from "./recovery-trends-handler";

// Re-export handler types for convenience
export type {
  GenerateSummaryRouteHandler,
  GetComparisonRouteHandler,
  GetConsistencyRouteHandler,
  GetExerciseStatsRouteHandler,
  GetFrequencyRouteHandler,
  GetGoalAnalyticsRouteHandler,
  GetMonthlySummaryRouteHandler,
  GetRecoveryTrendsRouteHandler,
  GetStrengthTrendsRouteHandler,
  GetSummaryHistoryRouteHandler,
  GetVolumeByMuscleRouteHandler,
  GetVolumeTrendsRouteHandler,
  GetWeeklySummaryRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const getWeeklySummaryRoute = getWeeklySummaryRouteContract.handler(getWeeklySummaryHandler);
export const getMonthlySummaryRoute =
  getMonthlySummaryRouteContract.handler(getMonthlySummaryHandler);
export const getSummaryHistoryRoute =
  getSummaryHistoryRouteContract.handler(getSummaryHistoryHandler);
export const getVolumeTrendsRoute = getVolumeTrendsRouteContract.handler(getVolumeTrendsHandler);
export const getVolumeByMuscleRoute =
  getVolumeByMuscleRouteContract.handler(getVolumeByMuscleHandler);
export const getStrengthTrendsRoute =
  getStrengthTrendsRouteContract.handler(getStrengthTrendsHandler);
export const getFrequencyRoute = getFrequencyRouteContract.handler(getFrequencyHandler);
export const getConsistencyRoute = getConsistencyRouteContract.handler(getConsistencyHandler);
export const getExerciseStatsRoute = getExerciseStatsRouteContract.handler(getExerciseStatsHandler);
export const getComparisonRoute = getComparisonRouteContract.handler(getComparisonHandler);
export const getGoalAnalyticsRoute = getGoalAnalyticsRouteContract.handler(getGoalAnalyticsHandler);
export const getRecoveryTrendsRoute =
  getRecoveryTrendsRouteContract.handler(getRecoveryTrendsHandler);
export const generateSummaryRoute = generateSummaryRouteContract.handler(generateSummaryHandler);
