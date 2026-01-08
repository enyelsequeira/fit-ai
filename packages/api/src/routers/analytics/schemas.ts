import {
  insertTrainingSummarySchema,
  periodTypeSchema,
  selectTrainingSummarySchema,
  updateTrainingSummarySchema,
} from "@fit-ai/db/schema/analytics";
import z from "zod";

// ============================================================================
// Re-export schemas from DB
// ============================================================================

// Base enum schemas (re-exported from DB)
export { periodTypeSchema };

// Training Summary schemas (re-exported from DB)
export { selectTrainingSummarySchema, insertTrainingSummarySchema, updateTrainingSummarySchema };

// ============================================================================
// Base Schemas
// ============================================================================

export type PeriodType = z.infer<typeof periodTypeSchema>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Training summary output schema
 */
export const trainingSummaryOutputSchema = z.object({
  id: z.number().describe("Unique identifier for the summary"),
  userId: z.string().describe("ID of the user"),
  periodType: periodTypeSchema,
  periodStart: z.string().describe("Start date of the period (YYYY-MM-DD)"),
  periodEnd: z.string().describe("End date of the period (YYYY-MM-DD)"),
  totalWorkouts: z.number().describe("Total number of workouts"),
  completedWorkouts: z.number().describe("Number of completed workouts"),
  totalDurationMinutes: z.number().describe("Total duration in minutes"),
  totalSets: z.number().describe("Total number of sets"),
  totalReps: z.number().describe("Total number of reps"),
  totalVolumeKg: z.number().describe("Total volume in kg"),
  volumeByMuscle: z.record(z.string(), z.number()).nullable().describe("Volume by muscle group"),
  setsByMuscle: z.record(z.string(), z.number()).nullable().describe("Sets by muscle group"),
  uniqueExercises: z.number().describe("Number of unique exercises"),
  favoriteExerciseId: z.number().nullable().describe("Most used exercise ID"),
  prsAchieved: z.number().describe("Number of PRs achieved"),
  avgWorkoutDuration: z.number().nullable().describe("Average workout duration"),
  avgRpe: z.number().nullable().describe("Average RPE"),
  avgSetsPerWorkout: z.number().nullable().describe("Average sets per workout"),
  plannedWorkouts: z.number().nullable().describe("Number of planned workouts"),
  completionRate: z.number().nullable().describe("Completion rate (0-1)"),
  createdAt: z.date().describe("When the summary was created"),
  updatedAt: z.date().describe("When the summary was last updated"),
});

export type TrainingSummaryOutput = z.infer<typeof trainingSummaryOutputSchema>;

/**
 * Volume trends output schema
 */
export const volumeTrendsOutputSchema = z.object({
  period: periodTypeSchema,
  dataPoints: z.array(
    z.object({
      periodStart: z.string().describe("Start date of the period"),
      totalVolume: z.number().describe("Total volume for the period"),
      volumeByMuscle: z.record(z.string(), z.number()).describe("Volume breakdown by muscle"),
    }),
  ),
});

export type VolumeTrendsOutput = z.infer<typeof volumeTrendsOutputSchema>;

/**
 * Strength trends data point schema
 */
export const strengthDataPointSchema = z.object({
  date: z.string().describe("Date of the data point"),
  estimated1RM: z.number().describe("Estimated one rep max"),
  maxWeight: z.number().describe("Maximum weight lifted"),
  maxReps: z.number().describe("Maximum reps performed"),
});

export type StrengthDataPoint = z.infer<typeof strengthDataPointSchema>;

/**
 * Strength trends output schema
 */
export const strengthTrendsOutputSchema = z.object({
  exerciseId: z.number().describe("ID of the exercise"),
  exerciseName: z.string().describe("Name of the exercise"),
  dataPoints: z.array(strengthDataPointSchema),
  percentageChange: z.number().describe("Percentage change from first to last data point"),
});

export type StrengthTrendsOutput = z.infer<typeof strengthTrendsOutputSchema>;

/**
 * Consistency metrics output schema
 */
export const consistencyOutputSchema = z.object({
  currentStreak: z.number().describe("Current consecutive workout days/weeks"),
  longestStreak: z.number().describe("Longest consecutive workout streak"),
  workoutsThisWeek: z.number().describe("Number of workouts this week"),
  workoutsThisMonth: z.number().describe("Number of workouts this month"),
  avgWorkoutsPerWeek: z.number().describe("Average workouts per week"),
  mostActiveDay: z.string().describe("Day of the week with most workouts"),
  completionRate: z.number().nullable().describe("Template completion rate if applicable"),
});

export type ConsistencyOutput = z.infer<typeof consistencyOutputSchema>;

/**
 * Comparison output schema
 */
export const comparisonOutputSchema = z.object({
  period1: z.object({
    start: z.string(),
    end: z.string(),
    summary: trainingSummaryOutputSchema.nullable(),
  }),
  period2: z.object({
    start: z.string(),
    end: z.string(),
    summary: trainingSummaryOutputSchema.nullable(),
  }),
  changes: z.object({
    volumeChange: z.number().describe("Volume percentage change"),
    workoutsChange: z.number().describe("Workouts count change"),
    avgDurationChange: z.number().describe("Average duration percentage change"),
  }),
});

export type ComparisonOutput = z.infer<typeof comparisonOutputSchema>;

/**
 * Volume by muscle output schema
 */
export const volumeByMuscleOutputSchema = z.object({
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  totalVolume: z.number().describe("Total volume for the period"),
  muscleGroups: z.array(
    z.object({
      muscle: z.string().describe("Muscle group name"),
      volume: z.number().describe("Volume for this muscle"),
      sets: z.number().describe("Sets for this muscle"),
      percentage: z.number().describe("Percentage of total volume"),
    }),
  ),
});

export type VolumeByMuscleOutput = z.infer<typeof volumeByMuscleOutputSchema>;

/**
 * Frequency analysis output schema
 */
export const frequencyOutputSchema = z.object({
  totalWorkouts: z.number().describe("Total workouts in analyzed period"),
  avgPerWeek: z.number().describe("Average workouts per week"),
  byDayOfWeek: z.record(z.string(), z.number()).describe("Workouts by day of week"),
  byTimeOfDay: z.record(z.string(), z.number()).describe("Workouts by time of day"),
  mostActiveDay: z.string().describe("Most active day of the week"),
  leastActiveDay: z.string().describe("Least active day of the week"),
});

export type FrequencyOutput = z.infer<typeof frequencyOutputSchema>;

/**
 * Exercise stats output schema
 */
export const exerciseStatsOutputSchema = z.object({
  exerciseId: z.number().describe("ID of the exercise"),
  exerciseName: z.string().describe("Name of the exercise"),
  category: z.string().describe("Exercise category"),
  totalSessions: z.number().describe("Total times this exercise was performed"),
  totalSets: z.number().describe("Total sets performed"),
  totalReps: z.number().describe("Total reps performed"),
  totalVolume: z.number().describe("Total volume (weight x reps)"),
  maxWeight: z.number().nullable().describe("Maximum weight lifted"),
  maxReps: z.number().nullable().describe("Maximum reps in a single set"),
  estimated1RM: z.number().nullable().describe("Current estimated 1RM"),
  recentProgress: z.array(strengthDataPointSchema).describe("Recent strength progress"),
  lastPerformed: z.string().nullable().describe("Date last performed"),
});

export type ExerciseStatsOutput = z.infer<typeof exerciseStatsOutputSchema>;

/**
 * Summary history list output
 */
export const summaryHistoryOutputSchema = z.object({
  summaries: z.array(trainingSummaryOutputSchema),
  total: z.number().describe("Total number of summaries"),
  limit: z.number().describe("Results per page"),
  offset: z.number().describe("Current offset"),
});

export type SummaryHistoryOutput = z.infer<typeof summaryHistoryOutputSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Summary history input schema
 */
export const summaryHistoryInputSchema = z.object({
  periodType: periodTypeSchema.optional().describe("Filter by period type"),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe("Maximum results"),
  offset: z.coerce.number().int().min(0).default(0).describe("Results to skip"),
});

export type SummaryHistoryInput = z.infer<typeof summaryHistoryInputSchema>;

/**
 * Volume trends input schema
 */
export const volumeTrendsInputSchema = z.object({
  period: periodTypeSchema.default("week").describe("Aggregation period"),
  weeks: z.coerce.number().int().min(1).max(52).default(12).describe("Number of weeks to analyze"),
});

export type VolumeTrendsInput = z.infer<typeof volumeTrendsInputSchema>;

/**
 * Volume by muscle input schema
 */
export const volumeByMuscleInputSchema = z.object({
  startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
  days: z.coerce.number().int().min(1).max(365).default(30).describe("Days to analyze if no dates"),
});

export type VolumeByMuscleInput = z.infer<typeof volumeByMuscleInputSchema>;

/**
 * Strength trends input schema
 */
export const strengthTrendsInputSchema = z.object({
  exerciseId: z.coerce.number().describe("Exercise ID to analyze"),
  weeks: z.coerce.number().int().min(1).max(52).default(12).describe("Number of weeks to analyze"),
});

export type StrengthTrendsInput = z.infer<typeof strengthTrendsInputSchema>;

/**
 * Frequency input schema
 */
export const frequencyInputSchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(90).describe("Days to analyze"),
});

export type FrequencyInput = z.infer<typeof frequencyInputSchema>;

/**
 * Exercise stats input schema
 */
export const exerciseStatsInputSchema = z.object({
  exerciseId: z.coerce.number().describe("Exercise ID"),
});

export type ExerciseStatsInput = z.infer<typeof exerciseStatsInputSchema>;

/**
 * Comparison input schema
 */
export const comparisonInputSchema = z.object({
  period1Start: z.string().describe("Start date of first period (YYYY-MM-DD)"),
  period1End: z.string().describe("End date of first period (YYYY-MM-DD)"),
  period2Start: z.string().describe("Start date of second period (YYYY-MM-DD)"),
  period2End: z.string().describe("End date of second period (YYYY-MM-DD)"),
});

export type ComparisonInput = z.infer<typeof comparisonInputSchema>;

/**
 * Generate summary input schema
 */
export const generateSummaryInputSchema = z.object({
  periodType: periodTypeSchema,
  periodStart: z.string().describe("Start date of the period (YYYY-MM-DD)"),
});

export type GenerateSummaryInput = z.infer<typeof generateSummaryInputSchema>;
