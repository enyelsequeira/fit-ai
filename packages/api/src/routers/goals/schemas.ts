import {
  createBodyMeasurementGoalSchema,
  createCustomGoalSchema,
  createStrengthGoalSchema,
  createWeightGoalSchema,
  createWorkoutFrequencyGoalSchema,
  goalDirectionSchema,
  goalLengthUnitSchema,
  goalMeasurementTypeSchema,
  goalStatusSchema,
  goalTypeSchema,
  goalWeightUnitSchema,
  selectGoalProgressSchema,
  selectGoalSchema,
  updateGoalProgressSchema,
  updateGoalSchema,
} from "@fit-ai/db/schema/goals";
import z from "zod";

// ============================================================================
// Re-export base schemas from DB package
// ============================================================================

export {
  goalTypeSchema,
  goalStatusSchema,
  goalWeightUnitSchema,
  goalLengthUnitSchema,
  goalMeasurementTypeSchema,
  goalDirectionSchema,
  createWeightGoalSchema,
  createStrengthGoalSchema,
  createBodyMeasurementGoalSchema,
  createWorkoutFrequencyGoalSchema,
  createCustomGoalSchema,
  updateGoalSchema,
  updateGoalProgressSchema,
};

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Goal output schema (from drizzle-zod)
 */
export const goalOutputSchema = selectGoalSchema;

export type GoalOutput = z.infer<typeof goalOutputSchema>;

/**
 * Goal progress output schema
 */
export const goalProgressOutputSchema = selectGoalProgressSchema;

export type GoalProgressOutput = z.infer<typeof goalProgressOutputSchema>;

/**
 * Goal with exercise details (for strength goals)
 */
export const goalWithExerciseSchema = selectGoalSchema.extend({
  exercise: z
    .object({
      id: z.number(),
      name: z.string(),
      category: z.string(),
    })
    .nullable()
    .optional(),
});

export type GoalWithExercise = z.infer<typeof goalWithExerciseSchema>;

/**
 * Goal with progress history
 */
export const goalWithProgressSchema = selectGoalSchema.extend({
  progressHistory: z.array(goalProgressOutputSchema),
  exercise: z
    .object({
      id: z.number(),
      name: z.string(),
      category: z.string(),
    })
    .nullable()
    .optional(),
});

export type GoalWithProgress = z.infer<typeof goalWithProgressSchema>;

/**
 * Goals list output
 */
export const goalsListOutputSchema = z.array(goalWithExerciseSchema);

export type GoalsListOutput = z.infer<typeof goalsListOutputSchema>;

/**
 * Goals summary for dashboard
 */
export const goalsSummarySchema = z.object({
  totalGoals: z.number(),
  activeGoals: z.number(),
  completedGoals: z.number(),
  abandonedGoals: z.number(),
  pausedGoals: z.number(),
  averageProgress: z.number(),
  nearDeadlineGoals: z.array(goalWithExerciseSchema),
  recentlyCompletedGoals: z.array(goalWithExerciseSchema),
});

export type GoalsSummary = z.infer<typeof goalsSummarySchema>;

/**
 * Success result schema
 */
export const successResultSchema = z.object({
  success: z.boolean().describe("Whether the operation was successful"),
});

export type SuccessResult = z.infer<typeof successResultSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Get goal by ID input
 */
export const getGoalByIdSchema = z.object({
  id: z.number().int().positive(),
});

export type GetGoalByIdInput = z.infer<typeof getGoalByIdSchema>;

/**
 * List goals filter input
 */
export const listGoalsFilterSchema = z.object({
  goalType: goalTypeSchema.optional(),
  status: goalStatusSchema.optional(),
  exerciseId: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type ListGoalsFilterInput = z.infer<typeof listGoalsFilterSchema>;

/**
 * Delete goal input
 */
export const deleteGoalSchema = z.object({
  id: z.number().int().positive(),
});

export type DeleteGoalInput = z.infer<typeof deleteGoalSchema>;

/**
 * Complete goal input
 */
export const completeGoalSchema = z.object({
  id: z.number().int().positive(),
});

export type CompleteGoalInput = z.infer<typeof completeGoalSchema>;

/**
 * Abandon goal input
 */
export const abandonGoalSchema = z.object({
  id: z.number().int().positive(),
  reason: z.string().max(500).optional(),
});

export type AbandonGoalInput = z.infer<typeof abandonGoalSchema>;

/**
 * Pause goal input
 */
export const pauseGoalSchema = z.object({
  id: z.number().int().positive(),
});

export type PauseGoalInput = z.infer<typeof pauseGoalSchema>;

/**
 * Resume goal input
 */
export const resumeGoalSchema = z.object({
  id: z.number().int().positive(),
});

export type ResumeGoalInput = z.infer<typeof resumeGoalSchema>;

/**
 * Get goal progress history input
 */
export const getGoalProgressHistorySchema = z.object({
  goalId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type GetGoalProgressHistoryInput = z.infer<typeof getGoalProgressHistorySchema>;

// Re-export input types
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type UpdateGoalProgressInput = z.infer<typeof updateGoalProgressSchema>;
export type CreateWeightGoalInput = z.infer<typeof createWeightGoalSchema>;
export type CreateStrengthGoalInput = z.infer<typeof createStrengthGoalSchema>;
export type CreateBodyMeasurementGoalInput = z.infer<typeof createBodyMeasurementGoalSchema>;
export type CreateWorkoutFrequencyGoalInput = z.infer<typeof createWorkoutFrequencyGoalSchema>;
export type CreateCustomGoalInput = z.infer<typeof createCustomGoalSchema>;
