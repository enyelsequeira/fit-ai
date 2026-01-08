import type { MoodType, MuscleGroupType } from "@fit-ai/db/schema/recovery";
import {
  insertDailyCheckInSchema,
  insertMuscleRecoverySchema,
  moodSchema,
  muscleGroupSchema,
  selectDailyCheckInSchema,
  selectMuscleRecoverySchema,
  updateDailyCheckInSchema,
  updateMuscleRecoverySchema,
} from "@fit-ai/db/schema/recovery";
import z from "zod";

// ============================================================================
// Re-export schemas from DB
// ============================================================================

// Base enum schemas (re-exported from DB)
export { moodSchema, muscleGroupSchema };

// Daily Check-In schemas (re-exported from DB)
export { selectDailyCheckInSchema, insertDailyCheckInSchema, updateDailyCheckInSchema };

// Muscle Recovery schemas (re-exported from DB)
export { selectMuscleRecoverySchema, insertMuscleRecoverySchema, updateMuscleRecoverySchema };

// ============================================================================
// Constants
// ============================================================================

/**
 * Available muscle groups for recovery tracking
 */
export const MUSCLE_GROUPS: MuscleGroupType[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
];

/**
 * Mood options for check-ins
 */
export const MOOD_OPTIONS: MoodType[] = ["great", "good", "neutral", "low", "bad"];

// ============================================================================
// Base Schemas (additional custom schemas)
// ============================================================================

export type MoodInput = z.infer<typeof moodSchema>;
export type MuscleGroupInput = z.infer<typeof muscleGroupSchema>;

/**
 * Date string schema (YYYY-MM-DD format)
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .describe("Date in YYYY-MM-DD format");

export type DateStringInput = z.infer<typeof dateStringSchema>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Check-in output schema
 */
export const checkInOutputSchema = z.object({
  id: z.number().describe("Unique identifier for the check-in"),
  userId: z.string().describe("ID of the user who owns this check-in"),
  date: z.string().describe("Date of check-in (YYYY-MM-DD)"),
  sleepHours: z.number().nullable().describe("Hours of sleep"),
  sleepQuality: z.number().nullable().describe("Sleep quality (1-5)"),
  energyLevel: z.number().nullable().describe("Energy level (1-10)"),
  stressLevel: z.number().nullable().describe("Stress level (1-10)"),
  sorenessLevel: z.number().nullable().describe("Soreness level (1-10)"),
  soreAreas: z.array(z.string()).nullable().describe("List of sore muscle areas"),
  restingHeartRate: z.number().nullable().describe("Resting heart rate (BPM)"),
  hrvScore: z.number().nullable().describe("Heart rate variability score"),
  motivationLevel: z.number().nullable().describe("Motivation level (1-10)"),
  mood: moodSchema.nullable().describe("Mood category"),
  nutritionQuality: z.number().nullable().describe("Nutrition quality (1-5)"),
  hydrationLevel: z.number().nullable().describe("Hydration level (1-5)"),
  notes: z.string().nullable().describe("Additional notes"),
  createdAt: z.date().describe("When the check-in was created"),
  updatedAt: z.date().describe("When the check-in was last updated"),
});

export type CheckInOutput = z.infer<typeof checkInOutputSchema>;

/**
 * Check-in history output schema
 */
export const checkInHistoryOutputSchema = z.object({
  checkIns: z.array(checkInOutputSchema).describe("List of check-ins"),
  total: z.number().describe("Total number of check-ins matching the filter"),
  limit: z.number().describe("Number of results per page"),
  offset: z.number().describe("Offset for pagination"),
});

export type CheckInHistoryOutput = z.infer<typeof checkInHistoryOutputSchema>;

/**
 * Trends output schema
 */
export const trendsOutputSchema = z.object({
  period: z.string().describe("Time period of the trends"),
  startDate: z.string().nullable().describe("Start date of the data"),
  endDate: z.string().nullable().describe("End date of the data"),
  dataPoints: z.number().describe("Number of check-ins in the period"),
  averages: z
    .object({
      sleepHours: z.number().nullable().describe("Average sleep hours"),
      sleepQuality: z.number().nullable().describe("Average sleep quality"),
      energyLevel: z.number().nullable().describe("Average energy level"),
      stressLevel: z.number().nullable().describe("Average stress level"),
      sorenessLevel: z.number().nullable().describe("Average soreness level"),
      motivationLevel: z.number().nullable().describe("Average motivation level"),
      nutritionQuality: z.number().nullable().describe("Average nutrition quality"),
      hydrationLevel: z.number().nullable().describe("Average hydration level"),
    })
    .describe("Average values for each metric"),
  moodDistribution: z
    .object({
      great: z.number().describe("Number of 'great' mood days"),
      good: z.number().describe("Number of 'good' mood days"),
      neutral: z.number().describe("Number of 'neutral' mood days"),
      low: z.number().describe("Number of 'low' mood days"),
      bad: z.number().describe("Number of 'bad' mood days"),
    })
    .describe("Distribution of mood ratings"),
});

export type TrendsOutput = z.infer<typeof trendsOutputSchema>;

/**
 * Muscle recovery status output schema
 */
export const muscleRecoveryStatusSchema = z.object({
  muscleGroup: muscleGroupSchema.describe("Muscle group identifier"),
  recoveryScore: z.number().nullable().describe("Recovery score (0-100)"),
  fatigueLevel: z.number().nullable().describe("Fatigue level (0-100)"),
  lastWorkedAt: z.date().nullable().describe("When this muscle was last worked"),
  setsLast7Days: z.number().describe("Number of sets in the last 7 days"),
  volumeLast7Days: z.number().describe("Total volume (kg) in the last 7 days"),
  estimatedFullRecovery: z.date().nullable().describe("Estimated time of full recovery"),
  updatedAt: z.date().describe("When this status was last updated"),
});

export type MuscleRecoveryStatus = z.infer<typeof muscleRecoveryStatusSchema>;

/**
 * Recovery status output schema
 */
export const recoveryStatusOutputSchema = z.object({
  muscleGroups: z
    .array(muscleRecoveryStatusSchema)
    .describe("Recovery status for each muscle group"),
  overallRecovery: z.number().describe("Overall average recovery score (0-100)"),
  updatedAt: z.date().describe("When the status was last calculated"),
});

export type RecoveryStatusOutput = z.infer<typeof recoveryStatusOutputSchema>;

/**
 * Readiness score output schema
 */
export const readinessOutputSchema = z.object({
  score: z.number().describe("Overall training readiness score (0-100)"),
  recommendation: z
    .enum(["ready to train hard", "light training recommended", "rest day suggested"])
    .describe("Training recommendation based on readiness"),
  factors: z
    .object({
      sleepScore: z.number().nullable().describe("Sleep contribution to readiness"),
      energyScore: z.number().nullable().describe("Energy contribution to readiness"),
      sorenessScore: z.number().nullable().describe("Soreness contribution to readiness (inverse)"),
      stressScore: z.number().nullable().describe("Stress contribution to readiness (inverse)"),
      muscleRecoveryScore: z
        .number()
        .nullable()
        .describe("Muscle recovery contribution to readiness"),
    })
    .describe("Individual factors contributing to the readiness score"),
  todayCheckIn: z.boolean().describe("Whether a check-in exists for today"),
  lastCheckInDate: z.string().nullable().describe("Date of the last check-in"),
});

export type ReadinessOutput = z.infer<typeof readinessOutputSchema>;

/**
 * Refresh recovery output schema
 */
export const refreshRecoveryOutputSchema = z.object({
  success: z.boolean().describe("Whether the refresh was successful"),
  updatedMuscleGroups: z.number().describe("Number of muscle groups updated"),
  message: z.string().describe("Status message"),
});

export type RefreshRecoveryOutput = z.infer<typeof refreshRecoveryOutputSchema>;

/**
 * Delete result schema
 */
export const deleteResultSchema = z.object({
  success: z.boolean().describe("Whether deletion was successful"),
});

export type DeleteResult = z.infer<typeof deleteResultSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Create/Update check-in input schema
 */
export const checkInInputSchema = z.object({
  date: dateStringSchema.optional().describe("Date of check-in (defaults to today)"),
  sleepHours: z.number().min(0).max(24).optional().describe("Hours of sleep (0-24)"),
  sleepQuality: z.number().int().min(1).max(5).optional().describe("Sleep quality on 1-5 scale"),
  energyLevel: z.number().int().min(1).max(10).optional().describe("Energy level on 1-10 scale"),
  stressLevel: z.number().int().min(1).max(10).optional().describe("Stress level on 1-10 scale"),
  sorenessLevel: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Overall muscle soreness on 1-10 scale"),
  soreAreas: z.array(muscleGroupSchema).optional().describe("List of sore muscle areas"),
  restingHeartRate: z
    .number()
    .int()
    .min(30)
    .max(200)
    .optional()
    .describe("Resting heart rate in BPM"),
  hrvScore: z.number().min(0).optional().describe("Heart rate variability score (from wearable)"),
  motivationLevel: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Motivation level on 1-10 scale"),
  mood: moodSchema.optional().describe("Current mood"),
  nutritionQuality: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .describe("Nutrition quality on 1-5 scale"),
  hydrationLevel: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .describe("Hydration level on 1-5 scale"),
  notes: z.string().max(1000).optional().describe("Additional notes about how you're feeling"),
});

export type CheckInInput = z.infer<typeof checkInInputSchema>;

/**
 * Get check-in by date input schema
 */
export const getCheckInByDateSchema = z.object({
  date: dateStringSchema.describe("Date to retrieve check-in for (YYYY-MM-DD)"),
});

export type GetCheckInByDateInput = z.infer<typeof getCheckInByDateSchema>;

/**
 * Delete check-in input schema
 */
export const deleteCheckInSchema = z.object({
  date: dateStringSchema.describe("Date of check-in to delete (YYYY-MM-DD)"),
});

export type DeleteCheckInInput = z.infer<typeof deleteCheckInSchema>;

/**
 * Check-in history input schema
 */
export const checkInHistoryInputSchema = z.object({
  startDate: dateStringSchema.optional().describe("Filter check-ins from this date"),
  endDate: dateStringSchema.optional().describe("Filter check-ins until this date"),
  limit: z.coerce.number().int().min(1).max(100).default(30).describe("Maximum number of results"),
  offset: z.coerce.number().int().min(0).default(0).describe("Number of results to skip"),
});

export type CheckInHistoryInput = z.infer<typeof checkInHistoryInputSchema>;

/**
 * Trends input schema
 */
export const trendsInputSchema = z.object({
  startDate: dateStringSchema.optional().describe("Start date for trends calculation"),
  endDate: dateStringSchema.optional().describe("End date for trends calculation"),
  period: z
    .enum(["week", "month", "quarter", "year"])
    .default("month")
    .describe("Time period for trends calculation"),
});

export type TrendsInput = z.infer<typeof trendsInputSchema>;
