import {
  dayOfWeekSchema,
  experienceLevelSchema,
  generatedWorkoutContentSchema,
  insertAiGeneratedWorkoutSchema,
  insertUserTrainingPreferencesSchema,
  selectAiGeneratedWorkoutSchema,
  selectUserTrainingPreferencesSchema,
  trainingGoalSchema,
  trainingLocationSchema,
  updateAiGeneratedWorkoutSchema,
  updateUserTrainingPreferencesSchema,
  workoutSplitSchema,
  workoutTypeSchema,
} from "@fit-ai/db/schema/ai";
import z from "zod";

// ============================================================================
// Re-export schemas from DB
// ============================================================================

// Base enum schemas (re-exported from DB)
export {
  trainingGoalSchema,
  experienceLevelSchema,
  trainingLocationSchema,
  workoutSplitSchema,
  dayOfWeekSchema,
  workoutTypeSchema,
  generatedWorkoutContentSchema,
};

// User Training Preferences schemas (re-exported from DB)
export {
  selectUserTrainingPreferencesSchema,
  insertUserTrainingPreferencesSchema,
  updateUserTrainingPreferencesSchema,
};

// AI Generated Workout schemas (re-exported from DB)
export {
  selectAiGeneratedWorkoutSchema,
  insertAiGeneratedWorkoutSchema,
  updateAiGeneratedWorkoutSchema,
};

// ============================================================================
// Base Schemas (additional custom schemas)
// ============================================================================

export type TrainingGoalInput = z.infer<typeof trainingGoalSchema>;
export type ExperienceLevelInput = z.infer<typeof experienceLevelSchema>;
export type TrainingLocationInput = z.infer<typeof trainingLocationSchema>;
export type WorkoutSplitInput = z.infer<typeof workoutSplitSchema>;
export type DayOfWeekInput = z.infer<typeof dayOfWeekSchema>;
export type WorkoutTypeInput = z.infer<typeof workoutTypeSchema>;

export const difficultySchema = z
  .enum(["easy", "moderate", "hard"])
  .describe("Workout difficulty level");

export type DifficultyInput = z.infer<typeof difficultySchema>;

// ============================================================================
// Output Schemas
// ============================================================================

export const preferencesOutputSchema = z.object({
  id: z.number().describe("Unique identifier"),
  userId: z.string().describe("User ID"),
  primaryGoal: trainingGoalSchema.nullable().describe("Primary training goal"),
  secondaryGoal: trainingGoalSchema.nullable().describe("Secondary training goal"),
  experienceLevel: experienceLevelSchema.nullable().describe("Experience level"),
  workoutDaysPerWeek: z.number().nullable().describe("Number of workout days per week"),
  preferredWorkoutDuration: z.number().nullable().describe("Preferred workout duration in minutes"),
  preferredDays: z.array(dayOfWeekSchema).nullable().describe("Preferred training days"),
  availableEquipment: z.array(z.string()).nullable().describe("Available equipment"),
  trainingLocation: trainingLocationSchema.nullable().describe("Training location"),
  preferredExercises: z.array(z.number()).nullable().describe("Preferred exercise IDs"),
  dislikedExercises: z.array(z.number()).nullable().describe("Disliked exercise IDs"),
  injuries: z.string().nullable().describe("Injury description"),
  avoidMuscleGroups: z.array(z.string()).nullable().describe("Muscle groups to avoid"),
  preferredSplit: workoutSplitSchema.nullable().describe("Preferred workout split"),
  createdAt: z.date().describe("Created timestamp"),
  updatedAt: z.date().describe("Updated timestamp"),
});

export type PreferencesOutput = z.infer<typeof preferencesOutputSchema>;

// Note: generatedWorkoutContentSchema is imported from DB
export type GeneratedWorkoutContent = z.infer<typeof generatedWorkoutContentSchema>;

export const generatedWorkoutOutputSchema = z.object({
  id: z.number().describe("Generated workout ID"),
  userId: z.string().describe("User ID"),
  generatedAt: z.date().describe("Generation timestamp"),
  targetMuscleGroups: z.array(z.string()).nullable().describe("Target muscle groups"),
  workoutType: workoutTypeSchema.nullable().describe("Type of workout"),
  generatedContent: generatedWorkoutContentSchema.nullable().describe("Generated workout content"),
  wasUsed: z.boolean().nullable().describe("Whether the workout was used"),
  userRating: z.number().nullable().describe("User rating (1-5)"),
  feedback: z.string().nullable().describe("User feedback"),
  workoutId: z.number().nullable().describe("Linked workout ID if used"),
  createdAt: z.date().describe("Created timestamp"),
});

export type GeneratedWorkoutOutput = z.infer<typeof generatedWorkoutOutputSchema>;

export const substituteExerciseOutputSchema = z.object({
  alternatives: z
    .array(
      z.object({
        id: z.number().describe("Exercise ID"),
        name: z.string().describe("Exercise name"),
        category: z.string().describe("Exercise category"),
        muscleGroups: z.array(z.string()).describe("Targeted muscle groups"),
        equipment: z.string().nullable().describe("Required equipment"),
        matchScore: z.number().describe("How well this matches as a substitute (0-100)"),
      }),
    )
    .describe("Alternative exercises"),
});

export type SubstituteExerciseOutput = z.infer<typeof substituteExerciseOutputSchema>;

export const nextWorkoutSuggestionSchema = z.object({
  suggestedType: workoutTypeSchema.describe("Suggested workout type"),
  targetMuscleGroups: z.array(z.string()).describe("Target muscle groups"),
  reasoning: z.string().describe("Why this workout is suggested"),
  muscleRecoveryStatus: z
    .array(
      z.object({
        muscleGroup: z.string(),
        recoveryScore: z.number(),
        lastWorked: z.date().nullable(),
      }),
    )
    .describe("Recovery status of each muscle group"),
  generatedWorkout: generatedWorkoutContentSchema
    .nullable()
    .describe("Pre-generated workout if requested"),
});

export type NextWorkoutSuggestion = z.infer<typeof nextWorkoutSuggestionSchema>;

export const recommendationSchema = z.object({
  type: z.enum(["training", "recovery", "nutrition", "schedule"]).describe("Recommendation type"),
  title: z.string().describe("Recommendation title"),
  description: z.string().describe("Detailed recommendation"),
  priority: z.enum(["high", "medium", "low"]).describe("Priority level"),
});

export type Recommendation = z.infer<typeof recommendationSchema>;

export const recommendationsOutputSchema = z.object({
  recommendations: z.array(recommendationSchema).describe("List of personalized recommendations"),
});

export type RecommendationsOutput = z.infer<typeof recommendationsOutputSchema>;

export const generatedHistoryOutputSchema = z.object({
  workouts: z.array(generatedWorkoutOutputSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type GeneratedHistoryOutput = z.infer<typeof generatedHistoryOutputSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

export const updatePreferencesSchema = z.object({
  primaryGoal: trainingGoalSchema.optional().describe("Primary training goal"),
  secondaryGoal: trainingGoalSchema.nullable().optional().describe("Secondary training goal"),
  experienceLevel: experienceLevelSchema.optional().describe("Experience level"),
  workoutDaysPerWeek: z
    .number()
    .int()
    .min(1)
    .max(7)
    .optional()
    .describe("Workout days per week (1-7)"),
  preferredWorkoutDuration: z
    .number()
    .int()
    .min(15)
    .max(180)
    .optional()
    .describe("Preferred duration in minutes"),
  preferredDays: z.array(dayOfWeekSchema).optional().describe("Preferred training days"),
  availableEquipment: z.array(z.string()).optional().describe("Available equipment"),
  trainingLocation: trainingLocationSchema.optional().describe("Training location"),
  preferredExercises: z.array(z.number()).optional().describe("Preferred exercise IDs"),
  dislikedExercises: z.array(z.number()).optional().describe("Disliked exercise IDs"),
  injuries: z.string().max(500).nullable().optional().describe("Injury description"),
  avoidMuscleGroups: z.array(z.string()).optional().describe("Muscle groups to avoid"),
  preferredSplit: workoutSplitSchema.nullable().optional().describe("Preferred workout split"),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const generateWorkoutSchema = z.object({
  targetMuscleGroups: z.array(z.string()).optional().describe("Override target muscle groups"),
  duration: z.number().int().min(15).max(180).optional().describe("Override workout duration"),
  difficulty: difficultySchema.optional().describe("Workout difficulty"),
  excludeExercises: z.array(z.number()).optional().describe("Exercise IDs to exclude"),
  workoutType: workoutTypeSchema.optional().describe("Specific workout type to generate"),
});

export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;

export const suggestNextWorkoutSchema = z.object({
  includeGeneratedWorkout: z.boolean().default(false).describe("Include a pre-generated workout"),
});

export type SuggestNextWorkoutInput = z.infer<typeof suggestNextWorkoutSchema>;

export const substituteExerciseSchema = z.object({
  exerciseId: z.number().describe("ID of exercise to substitute"),
  reason: z
    .enum(["equipment", "injury", "preference"])
    .optional()
    .describe("Reason for substitution"),
});

export type SubstituteExerciseInput = z.infer<typeof substituteExerciseSchema>;

export const feedbackSchema = z.object({
  generatedWorkoutId: z.number().describe("ID of the generated workout"),
  rating: z.number().int().min(1).max(5).describe("Rating (1-5)"),
  feedback: z.string().max(500).optional().describe("Written feedback"),
  wasUsed: z.boolean().optional().describe("Whether the workout was used"),
  workoutId: z.number().optional().describe("ID of the actual workout if used"),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const generatedHistorySchema = z.object({
  limit: z.number().int().min(1).max(50).default(20).describe("Max results"),
  offset: z.number().int().min(0).default(0).describe("Results to skip"),
});

export type GeneratedHistoryInput = z.infer<typeof generatedHistorySchema>;
