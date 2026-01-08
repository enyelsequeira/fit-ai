import { protectedProcedure } from "../../index";
import {
  comparisonInputSchema,
  comparisonOutputSchema,
  consistencyOutputSchema,
  exerciseStatsInputSchema,
  exerciseStatsOutputSchema,
  frequencyInputSchema,
  frequencyOutputSchema,
  generateSummaryInputSchema,
  strengthTrendsInputSchema,
  strengthTrendsOutputSchema,
  summaryHistoryInputSchema,
  summaryHistoryOutputSchema,
  trainingSummaryOutputSchema,
  volumeByMuscleInputSchema,
  volumeByMuscleOutputSchema,
  volumeTrendsInputSchema,
  volumeTrendsOutputSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * Get weekly training summary
 */
export const getWeeklySummaryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/summary/weekly",
    summary: "Get weekly summary",
    description: "Retrieves the training summary for the current week",
    tags: ["Analytics"],
  })
  .output(trainingSummaryOutputSchema.nullable());

/**
 * Get monthly training summary
 */
export const getMonthlySummaryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/summary/monthly",
    summary: "Get monthly summary",
    description: "Retrieves the training summary for the current month",
    tags: ["Analytics"],
  })
  .output(trainingSummaryOutputSchema.nullable());

/**
 * Get summary history
 */
export const getSummaryHistoryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/summary/history",
    summary: "Get summary history",
    description: "Retrieves paginated historical training summaries",
    tags: ["Analytics"],
  })
  .input(summaryHistoryInputSchema)
  .output(summaryHistoryOutputSchema);

/**
 * Get volume trends
 */
export const getVolumeTrendsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/volume/trends",
    summary: "Get volume trends",
    description: "Retrieves volume trends over time for chart visualization",
    tags: ["Analytics"],
  })
  .input(volumeTrendsInputSchema)
  .output(volumeTrendsOutputSchema);

/**
 * Get volume by muscle
 */
export const getVolumeByMuscleRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/volume/by-muscle",
    summary: "Get volume by muscle",
    description: "Retrieves volume breakdown by muscle group for a time period",
    tags: ["Analytics"],
  })
  .input(volumeByMuscleInputSchema)
  .output(volumeByMuscleOutputSchema);

/**
 * Get strength trends
 */
export const getStrengthTrendsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/strength/trends",
    summary: "Get strength trends",
    description: "Retrieves estimated 1RM trends for a specific exercise over time",
    tags: ["Analytics"],
  })
  .input(strengthTrendsInputSchema)
  .output(strengthTrendsOutputSchema);

/**
 * Get workout frequency
 */
export const getFrequencyRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/frequency",
    summary: "Get workout frequency",
    description: "Analyzes workout frequency patterns by day and time",
    tags: ["Analytics"],
  })
  .input(frequencyInputSchema)
  .output(frequencyOutputSchema);

/**
 * Get consistency metrics
 */
export const getConsistencyRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/consistency",
    summary: "Get consistency metrics",
    description: "Retrieves workout consistency metrics including streaks and completion rates",
    tags: ["Analytics"],
  })
  .output(consistencyOutputSchema);

/**
 * Get exercise statistics
 */
export const getExerciseStatsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/exercise-stats/{exerciseId}",
    summary: "Get exercise statistics",
    description: "Retrieves detailed statistics and history for a specific exercise",
    tags: ["Analytics"],
  })
  .input(exerciseStatsInputSchema)
  .output(exerciseStatsOutputSchema);

/**
 * Compare time periods
 */
export const getComparisonRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/comparison",
    summary: "Compare time periods",
    description: "Compares training metrics between two time periods",
    tags: ["Analytics"],
  })
  .input(comparisonInputSchema)
  .output(comparisonOutputSchema);

/**
 * Generate training summary
 */
export const generateSummaryRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/analytics/generate",
    summary: "Generate training summary",
    description: "Generates or refreshes a training summary for a specific period",
    tags: ["Analytics"],
  })
  .input(generateSummaryInputSchema)
  .output(trainingSummaryOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type GetWeeklySummaryRouteHandler = Parameters<
  typeof getWeeklySummaryRouteContract.handler
>[0];
export type GetMonthlySummaryRouteHandler = Parameters<
  typeof getMonthlySummaryRouteContract.handler
>[0];
export type GetSummaryHistoryRouteHandler = Parameters<
  typeof getSummaryHistoryRouteContract.handler
>[0];
export type GetVolumeTrendsRouteHandler = Parameters<
  typeof getVolumeTrendsRouteContract.handler
>[0];
export type GetVolumeByMuscleRouteHandler = Parameters<
  typeof getVolumeByMuscleRouteContract.handler
>[0];
export type GetStrengthTrendsRouteHandler = Parameters<
  typeof getStrengthTrendsRouteContract.handler
>[0];
export type GetFrequencyRouteHandler = Parameters<typeof getFrequencyRouteContract.handler>[0];
export type GetConsistencyRouteHandler = Parameters<typeof getConsistencyRouteContract.handler>[0];
export type GetExerciseStatsRouteHandler = Parameters<
  typeof getExerciseStatsRouteContract.handler
>[0];
export type GetComparisonRouteHandler = Parameters<typeof getComparisonRouteContract.handler>[0];
export type GenerateSummaryRouteHandler = Parameters<
  typeof generateSummaryRouteContract.handler
>[0];
