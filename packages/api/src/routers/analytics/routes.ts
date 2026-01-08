import { protectedProcedure } from "../../index";
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
// Route Definitions
// ============================================================================

export const getWeeklySummaryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/summary/weekly",
    summary: "Get weekly summary",
    description: "Retrieves the training summary for the current week",
    tags: ["Analytics"],
  })
  .output(trainingSummaryOutputSchema.nullable())
  .handler(async ({ context }) => getWeeklySummaryHandler(context));

export const getMonthlySummaryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/summary/monthly",
    summary: "Get monthly summary",
    description: "Retrieves the training summary for the current month",
    tags: ["Analytics"],
  })
  .output(trainingSummaryOutputSchema.nullable())
  .handler(async ({ context }) => getMonthlySummaryHandler(context));

export const getSummaryHistoryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/summary/history",
    summary: "Get summary history",
    description: "Retrieves paginated historical training summaries",
    tags: ["Analytics"],
  })
  .input(summaryHistoryInputSchema)
  .output(summaryHistoryOutputSchema)
  .handler(async ({ input, context }) => getSummaryHistoryHandler(input, context));

export const getVolumeTrendsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/volume/trends",
    summary: "Get volume trends",
    description: "Retrieves volume trends over time for chart visualization",
    tags: ["Analytics"],
  })
  .input(volumeTrendsInputSchema)
  .output(volumeTrendsOutputSchema)
  .handler(async ({ input, context }) => getVolumeTrendsHandler(input, context));

export const getVolumeByMuscleRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/volume/by-muscle",
    summary: "Get volume by muscle",
    description: "Retrieves volume breakdown by muscle group for a time period",
    tags: ["Analytics"],
  })
  .input(volumeByMuscleInputSchema)
  .output(volumeByMuscleOutputSchema)
  .handler(async ({ input, context }) => getVolumeByMuscleHandler(input, context));

export const getStrengthTrendsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/strength/trends",
    summary: "Get strength trends",
    description: "Retrieves estimated 1RM trends for a specific exercise over time",
    tags: ["Analytics"],
  })
  .input(strengthTrendsInputSchema)
  .output(strengthTrendsOutputSchema)
  .handler(async ({ input, context }) => getStrengthTrendsHandler(input, context));

export const getFrequencyRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/frequency",
    summary: "Get workout frequency",
    description: "Analyzes workout frequency patterns by day and time",
    tags: ["Analytics"],
  })
  .input(frequencyInputSchema)
  .output(frequencyOutputSchema)
  .handler(async ({ input, context }) => getFrequencyHandler(input, context));

export const getConsistencyRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/consistency",
    summary: "Get consistency metrics",
    description: "Retrieves workout consistency metrics including streaks and completion rates",
    tags: ["Analytics"],
  })
  .output(consistencyOutputSchema)
  .handler(async ({ context }) => getConsistencyHandler(context));

export const getExerciseStatsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/exercise-stats/{exerciseId}",
    summary: "Get exercise statistics",
    description: "Retrieves detailed statistics and history for a specific exercise",
    tags: ["Analytics"],
  })
  .input(exerciseStatsInputSchema)
  .output(exerciseStatsOutputSchema)
  .handler(async ({ input, context }) => getExerciseStatsHandler(input, context));

export const getComparisonRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/analytics/comparison",
    summary: "Compare time periods",
    description: "Compares training metrics between two time periods",
    tags: ["Analytics"],
  })
  .input(comparisonInputSchema)
  .output(comparisonOutputSchema)
  .handler(async ({ input, context }) => getComparisonHandler(input, context));

export const generateSummaryRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/analytics/generate",
    summary: "Generate training summary",
    description: "Generates or refreshes a training summary for a specific period",
    tags: ["Analytics"],
  })
  .input(generateSummaryInputSchema)
  .output(trainingSummaryOutputSchema)
  .handler(async ({ input, context }) => generateSummaryHandler(input, context));
