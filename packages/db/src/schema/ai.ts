import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";

/**
 * Training goal options
 */
export type TrainingGoal =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "weight_loss"
  | "general_fitness";

/**
 * Experience level options
 */
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

/**
 * Training location options
 */
export type TrainingLocation = "gym" | "home" | "outdoor";

/**
 * Workout split options
 */
export type WorkoutSplit = "push_pull_legs" | "upper_lower" | "full_body" | "bro_split";

/**
 * Day of week options for preferred training days
 */
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/**
 * Workout type for generated workouts
 */
export type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full_body"
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "core";

/**
 * User training preferences for AI workout generation
 */
export const userTrainingPreferences = sqliteTable(
  "user_training_preferences",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    // Goals
    primaryGoal: text("primary_goal").$type<TrainingGoal>().default("general_fitness"),
    secondaryGoal: text("secondary_goal").$type<TrainingGoal>(),
    experienceLevel: text("experience_level").$type<ExperienceLevel>().default("beginner"),

    // Availability
    workoutDaysPerWeek: integer("workout_days_per_week").default(3), // 1-7
    preferredWorkoutDuration: integer("preferred_duration_minutes").default(60), // minutes
    preferredDays: text("preferred_days", { mode: "json" }).$type<DayOfWeek[]>(), // ["monday", "wednesday", "friday"]

    // Equipment access
    availableEquipment: text("available_equipment", { mode: "json" }).$type<string[]>(), // ["barbell", "dumbbell", "cables"]
    trainingLocation: text("training_location").$type<TrainingLocation>().default("gym"),

    // Preferences
    preferredExercises: text("preferred_exercises", { mode: "json" }).$type<number[]>(), // exercise IDs
    dislikedExercises: text("disliked_exercises", { mode: "json" }).$type<number[]>(), // exercise IDs

    // Limitations
    injuries: text("injuries"), // free text description
    avoidMuscleGroups: text("avoid_muscle_groups", { mode: "json" }).$type<string[]>(),

    // Split preference
    preferredSplit: text("preferred_split").$type<WorkoutSplit>(),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_training_preferences_user_id_idx").on(table.userId)],
);

/**
 * Type for generated workout content
 */
export interface GeneratedWorkoutContent {
  name: string;
  estimatedDuration: number;
  exercises: Array<{
    exerciseId: number;
    exerciseName: string;
    sets: number;
    reps: string; // "8-12" or "5"
    restSeconds: number;
    notes?: string;
    alternatives?: number[]; // alternative exercise IDs
  }>;
  warmup?: string;
  cooldown?: string;
}

/**
 * AI-generated workout history
 * Track what the AI generated for learning/improvement
 */
export const aiGeneratedWorkout = sqliteTable(
  "ai_generated_workout",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Generation context
    generatedAt: integer("generated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    targetMuscleGroups: text("target_muscle_groups", { mode: "json" }).$type<string[]>(),
    workoutType: text("workout_type").$type<WorkoutType>(),

    // Generated content (JSON structure of the workout)
    generatedContent: text("generated_content", { mode: "json" }).$type<GeneratedWorkoutContent>(),

    // User feedback
    wasUsed: integer("was_used", { mode: "boolean" }).default(false),
    userRating: integer("user_rating"), // 1-5
    feedback: text("feedback"),

    // Link to actual workout if used
    workoutId: integer("workout_id"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("ai_generated_workout_user_id_idx").on(table.userId),
    index("ai_generated_workout_date_idx").on(table.generatedAt),
  ],
);

// Relations
export const userTrainingPreferencesRelations = relations(userTrainingPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userTrainingPreferences.userId],
    references: [user.id],
  }),
}));

export const aiGeneratedWorkoutRelations = relations(aiGeneratedWorkout, ({ one }) => ({
  user: one(user, {
    fields: [aiGeneratedWorkout.userId],
    references: [user.id],
  }),
}));

// Extended user relations for AI (merged with auth.ts userRelations by Drizzle)
export const userAiRelations = relations(user, ({ one, many }) => ({
  trainingPreferences: one(userTrainingPreferences, {
    fields: [user.id],
    references: [userTrainingPreferences.userId],
  }),
  aiGeneratedWorkouts: many(aiGeneratedWorkout),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Training goal enum schema
 */
export const trainingGoalSchema = z.enum([
  "strength",
  "hypertrophy",
  "endurance",
  "weight_loss",
  "general_fitness",
]);

/**
 * Experience level enum schema
 */
export const experienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

/**
 * Training location enum schema
 */
export const trainingLocationSchema = z.enum(["gym", "home", "outdoor"]);

/**
 * Workout split enum schema
 */
export const workoutSplitSchema = z.enum([
  "push_pull_legs",
  "upper_lower",
  "full_body",
  "bro_split",
]);

/**
 * Day of week enum schema
 */
export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

/**
 * Workout type enum schema
 */
export const workoutTypeSchema = z.enum([
  "push",
  "pull",
  "legs",
  "upper",
  "lower",
  "full_body",
  "chest",
  "back",
  "shoulders",
  "arms",
  "core",
]);

/**
 * Generated workout content schema (for JSON field)
 */
export const generatedWorkoutContentSchema = z.object({
  name: z.string(),
  estimatedDuration: z.number(),
  exercises: z.array(
    z.object({
      exerciseId: z.number(),
      exerciseName: z.string(),
      sets: z.number(),
      reps: z.string(),
      restSeconds: z.number(),
      notes: z.string().optional(),
      alternatives: z.array(z.number()).optional(),
    }),
  ),
  warmup: z.string().optional(),
  cooldown: z.string().optional(),
});

// ============================================================================
// User Training Preferences Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectUserTrainingPreferencesSchema = createSelectSchema(userTrainingPreferences, {
  primaryGoal: trainingGoalSchema.nullable(),
  secondaryGoal: trainingGoalSchema.nullable(),
  experienceLevel: experienceLevelSchema.nullable(),
  preferredDays: z.array(dayOfWeekSchema).nullable(),
  availableEquipment: z.array(z.string()).nullable(),
  trainingLocation: trainingLocationSchema.nullable(),
  preferredExercises: z.array(z.number()).nullable(),
  dislikedExercises: z.array(z.number()).nullable(),
  avoidMuscleGroups: z.array(z.string()).nullable(),
  preferredSplit: workoutSplitSchema.nullable(),
});

/**
 * Insert schema - for validating data before insertion
 */
export const insertUserTrainingPreferencesSchema = createInsertSchema(userTrainingPreferences, {
  primaryGoal: trainingGoalSchema.optional(),
  secondaryGoal: trainingGoalSchema.nullable().optional(),
  experienceLevel: experienceLevelSchema.optional(),
  workoutDaysPerWeek: (schema) => schema.int().min(1).max(7),
  preferredWorkoutDuration: (schema) => schema.int().min(15).max(180),
  preferredDays: z.array(dayOfWeekSchema).nullable().optional(),
  availableEquipment: z.array(z.string()).nullable().optional(),
  trainingLocation: trainingLocationSchema.optional(),
  preferredExercises: z.array(z.number()).nullable().optional(),
  dislikedExercises: z.array(z.number()).nullable().optional(),
  injuries: (schema) => schema.max(500),
  avoidMuscleGroups: z.array(z.string()).nullable().optional(),
  preferredSplit: workoutSplitSchema.nullable().optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - partial insert with required id
 */
export const updateUserTrainingPreferencesSchema = insertUserTrainingPreferencesSchema
  .partial()
  .extend({
    id: z.number(),
  });

// Type exports for User Training Preferences
export type SelectUserTrainingPreferences = z.infer<typeof selectUserTrainingPreferencesSchema>;
export type InsertUserTrainingPreferences = z.infer<typeof insertUserTrainingPreferencesSchema>;
export type UpdateUserTrainingPreferences = z.infer<typeof updateUserTrainingPreferencesSchema>;

// ============================================================================
// AI Generated Workout Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectAiGeneratedWorkoutSchema = createSelectSchema(aiGeneratedWorkout, {
  targetMuscleGroups: z.array(z.string()).nullable(),
  workoutType: workoutTypeSchema.nullable(),
  generatedContent: generatedWorkoutContentSchema.nullable(),
});

/**
 * Insert schema - for validating data before insertion
 */
export const insertAiGeneratedWorkoutSchema = createInsertSchema(aiGeneratedWorkout, {
  targetMuscleGroups: z.array(z.string()).nullable().optional(),
  workoutType: workoutTypeSchema.nullable().optional(),
  generatedContent: generatedWorkoutContentSchema.nullable().optional(),
  wasUsed: z.boolean().optional(),
  userRating: (schema) => schema.int().min(1).max(5),
  feedback: (schema) => schema.max(500),
}).omit({
  id: true,
  userId: true,
  generatedAt: true,
  createdAt: true,
});

/**
 * Update schema - partial insert with required id
 */
export const updateAiGeneratedWorkoutSchema = insertAiGeneratedWorkoutSchema.partial().extend({
  id: z.number(),
});

// Type exports for AI Generated Workout
export type SelectAiGeneratedWorkout = z.infer<typeof selectAiGeneratedWorkoutSchema>;
export type InsertAiGeneratedWorkout = z.infer<typeof insertAiGeneratedWorkoutSchema>;
export type UpdateAiGeneratedWorkout = z.infer<typeof updateAiGeneratedWorkoutSchema>;
