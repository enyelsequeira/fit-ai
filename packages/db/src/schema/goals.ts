import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { exercise } from "./exercise";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Goal types supported by the system
 */
export type GoalType = "weight" | "strength" | "body_measurement" | "workout_frequency" | "custom";

/**
 * Goal status
 */
export type GoalStatus = "active" | "completed" | "abandoned" | "paused";

/**
 * Weight unit for goals
 */
export type GoalWeightUnit = "kg" | "lb";

/**
 * Length unit for body measurement goals
 */
export type GoalLengthUnit = "cm" | "in";

/**
 * Body measurement type for measurement goals
 */
export type GoalMeasurementType =
  | "chest"
  | "waist"
  | "hips"
  | "left_arm"
  | "right_arm"
  | "left_thigh"
  | "right_thigh"
  | "left_calf"
  | "right_calf"
  | "neck"
  | "shoulders"
  | "body_fat_percentage";

/**
 * Direction for goals (increase or decrease target)
 */
export type GoalDirection = "increase" | "decrease" | "maintain";

// ============================================================================
// Goals Table
// ============================================================================

/**
 * Goals table - stores user fitness goals
 * Supports weight goals, strength goals, body measurement goals, and custom goals
 */
export const goal = sqliteTable(
  "goal",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** Goal type */
    goalType: text("goal_type").$type<GoalType>().notNull(),

    /** User-friendly title for the goal */
    title: text("title").notNull(),

    /** Optional description/notes */
    description: text("description"),

    /** Goal status */
    status: text("status").$type<GoalStatus>().default("active").notNull(),

    /** Direction of the goal (increase, decrease, or maintain) */
    direction: text("direction").$type<GoalDirection>().default("increase").notNull(),

    // ========== Weight Goal Fields ==========
    /** Starting weight (when goal was created) */
    startWeight: real("start_weight"),
    /** Target weight */
    targetWeight: real("target_weight"),
    /** Current weight (updated when new measurements are logged) */
    currentWeight: real("current_weight"),
    /** Weight unit */
    weightUnit: text("weight_unit").$type<GoalWeightUnit>().default("kg"),

    // ========== Strength Goal Fields ==========
    /** Exercise ID for strength goals */
    exerciseId: integer("exercise_id").references(() => exercise.id, { onDelete: "set null" }),
    /** Starting weight lifted */
    startLiftWeight: real("start_lift_weight"),
    /** Target weight to lift */
    targetLiftWeight: real("target_lift_weight"),
    /** Current best weight lifted */
    currentLiftWeight: real("current_lift_weight"),
    /** Target reps (optional - for rep-based goals) */
    targetReps: integer("target_reps"),
    /** Current best reps */
    currentReps: integer("current_reps"),
    /** Starting reps */
    startReps: integer("start_reps"),

    // ========== Body Measurement Goal Fields ==========
    /** Type of measurement for body measurement goals */
    measurementType: text("measurement_type").$type<GoalMeasurementType>(),
    /** Starting measurement value */
    startMeasurement: real("start_measurement"),
    /** Target measurement value */
    targetMeasurement: real("target_measurement"),
    /** Current measurement value */
    currentMeasurement: real("current_measurement"),
    /** Length unit for measurements */
    lengthUnit: text("length_unit").$type<GoalLengthUnit>().default("cm"),

    // ========== Workout Frequency Goal Fields ==========
    /** Target workouts per week */
    targetWorkoutsPerWeek: integer("target_workouts_per_week"),
    /** Current average workouts per week (calculated) */
    currentWorkoutsPerWeek: real("current_workouts_per_week"),

    // ========== Custom Goal Fields ==========
    /** Custom metric name (e.g., "Running Distance", "Pull-ups") */
    customMetricName: text("custom_metric_name"),
    /** Custom metric unit (e.g., "km", "reps", "minutes") */
    customMetricUnit: text("custom_metric_unit"),
    /** Starting value for custom goal */
    startCustomValue: real("start_custom_value"),
    /** Target value for custom goal */
    targetCustomValue: real("target_custom_value"),
    /** Current value for custom goal */
    currentCustomValue: real("current_custom_value"),

    // ========== Timeline ==========
    /** When the goal was started */
    startDate: integer("start_date", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    /** Target deadline for the goal */
    targetDate: integer("target_date", { mode: "timestamp_ms" }),
    /** When the goal was completed (if completed) */
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),

    // ========== Progress Tracking ==========
    /** Progress percentage (0-100) */
    progressPercentage: real("progress_percentage").default(0).notNull(),
    /** Number of times progress was updated */
    updateCount: integer("update_count").default(0).notNull(),
    /** Last time progress was updated */
    lastProgressUpdate: integer("last_progress_update", { mode: "timestamp_ms" }),

    // ========== Timestamps ==========
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("goal_user_id_idx").on(table.userId),
    index("goal_type_idx").on(table.goalType),
    index("goal_status_idx").on(table.status),
    index("goal_exercise_id_idx").on(table.exerciseId),
    index("goal_target_date_idx").on(table.targetDate),
  ],
);

// ============================================================================
// Goal Progress History Table
// ============================================================================

/**
 * Tracks progress updates for goals over time
 * Allows users to see their progress journey
 */
export const goalProgress = sqliteTable(
  "goal_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    goalId: integer("goal_id")
      .notNull()
      .references(() => goal.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** The recorded value at this point */
    value: real("value").notNull(),

    /** Progress percentage at this point */
    progressPercentage: real("progress_percentage").notNull(),

    /** Optional note about this progress update */
    note: text("note"),

    /** When this progress was recorded */
    recordedAt: integer("recorded_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("goal_progress_goal_id_idx").on(table.goalId),
    index("goal_progress_user_id_idx").on(table.userId),
    index("goal_progress_recorded_at_idx").on(table.recordedAt),
  ],
);

// ============================================================================
// Relations
// ============================================================================

export const goalRelations = relations(goal, ({ one, many }) => ({
  user: one(user, {
    fields: [goal.userId],
    references: [user.id],
  }),
  exercise: one(exercise, {
    fields: [goal.exerciseId],
    references: [exercise.id],
  }),
  progressHistory: many(goalProgress),
}));

export const goalProgressRelations = relations(goalProgress, ({ one }) => ({
  goal: one(goal, {
    fields: [goalProgress.goalId],
    references: [goal.id],
  }),
  user: one(user, {
    fields: [goalProgress.userId],
    references: [user.id],
  }),
}));

// Extended user relations for goals (merged with auth.ts userRelations by Drizzle)
export const userGoalRelations = relations(user, ({ many }) => ({
  goals: many(goal),
  goalProgress: many(goalProgress),
}));

// Extended exercise relations for goals
export const exerciseGoalRelations = relations(exercise, ({ many }) => ({
  strengthGoals: many(goal),
}));

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Goal type enum schema
 */
export const goalTypeSchema = z.enum([
  "weight",
  "strength",
  "body_measurement",
  "workout_frequency",
  "custom",
]);

/**
 * Goal status enum schema
 */
export const goalStatusSchema = z.enum(["active", "completed", "abandoned", "paused"]);

/**
 * Goal weight unit enum schema
 */
export const goalWeightUnitSchema = z.enum(["kg", "lb"]);

/**
 * Goal length unit enum schema
 */
export const goalLengthUnitSchema = z.enum(["cm", "in"]);

/**
 * Goal measurement type enum schema
 */
export const goalMeasurementTypeSchema = z.enum([
  "chest",
  "waist",
  "hips",
  "left_arm",
  "right_arm",
  "left_thigh",
  "right_thigh",
  "left_calf",
  "right_calf",
  "neck",
  "shoulders",
  "body_fat_percentage",
]);

/**
 * Goal direction enum schema
 */
export const goalDirectionSchema = z.enum(["increase", "decrease", "maintain"]);

// ============================================================================
// Goal Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectGoalSchema = createSelectSchema(goal, {
  goalType: goalTypeSchema,
  status: goalStatusSchema,
  direction: goalDirectionSchema,
  weightUnit: goalWeightUnitSchema.nullable(),
  lengthUnit: goalLengthUnitSchema.nullable(),
  measurementType: goalMeasurementTypeSchema.nullable(),
});

/**
 * Base insert schema
 */
const baseInsertGoalSchema = createInsertSchema(goal, {
  title: (schema) => schema.min(1).max(200),
  description: (schema) => schema.max(1000).optional(),
  goalType: goalTypeSchema,
  status: goalStatusSchema.default("active"),
  direction: goalDirectionSchema.default("increase"),
  weightUnit: goalWeightUnitSchema.optional(),
  lengthUnit: goalLengthUnitSchema.optional(),
  measurementType: goalMeasurementTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  startWeight: z.number().positive().optional(),
  targetWeight: z.number().positive().optional(),
  currentWeight: z.number().positive().optional(),
  startLiftWeight: z.number().positive().optional(),
  targetLiftWeight: z.number().positive().optional(),
  currentLiftWeight: z.number().positive().optional(),
  targetReps: z.number().int().positive().optional(),
  currentReps: z.number().int().positive().optional(),
  startReps: z.number().int().positive().optional(),
  startMeasurement: z.number().positive().optional(),
  targetMeasurement: z.number().positive().optional(),
  currentMeasurement: z.number().positive().optional(),
  targetWorkoutsPerWeek: z.number().int().min(1).max(14).optional(),
  currentWorkoutsPerWeek: z.number().min(0).optional(),
  customMetricName: (schema) => schema.max(100).optional(),
  customMetricUnit: (schema) => schema.max(50).optional(),
  startCustomValue: z.number().optional(),
  targetCustomValue: z.number().optional(),
  currentCustomValue: z.number().optional(),
}).omit({
  id: true,
  userId: true,
  progressPercentage: true,
  updateCount: true,
  lastProgressUpdate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Insert schema for creating a new goal
 */
export const insertGoalSchema = baseInsertGoalSchema;

/**
 * Schema for creating a weight goal
 */
export const createWeightGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  direction: goalDirectionSchema.default("decrease"),
  startWeight: z.number().positive(),
  targetWeight: z.number().positive(),
  weightUnit: goalWeightUnitSchema.default("kg"),
  targetDate: z.coerce.date().optional(),
});

/**
 * Schema for creating a strength goal
 */
export const createStrengthGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  exerciseId: z.number().int().positive(),
  direction: goalDirectionSchema.default("increase"),
  // Weight-based goal
  startLiftWeight: z.number().positive().optional(),
  targetLiftWeight: z.number().positive().optional(),
  weightUnit: goalWeightUnitSchema.default("kg"),
  // Rep-based goal
  startReps: z.number().int().positive().optional(),
  targetReps: z.number().int().positive().optional(),
  targetDate: z.coerce.date().optional(),
});

/**
 * Schema for creating a body measurement goal
 */
export const createBodyMeasurementGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  measurementType: goalMeasurementTypeSchema,
  direction: goalDirectionSchema.default("decrease"),
  startMeasurement: z.number().positive(),
  targetMeasurement: z.number().positive(),
  lengthUnit: goalLengthUnitSchema.default("cm"),
  targetDate: z.coerce.date().optional(),
});

/**
 * Schema for creating a workout frequency goal
 */
export const createWorkoutFrequencyGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetWorkoutsPerWeek: z.number().int().min(1).max(14),
  targetDate: z.coerce.date().optional(),
});

/**
 * Schema for creating a custom goal
 */
export const createCustomGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  direction: goalDirectionSchema.default("increase"),
  customMetricName: z.string().min(1).max(100),
  customMetricUnit: z.string().max(50).optional(),
  startCustomValue: z.number(),
  targetCustomValue: z.number(),
  targetDate: z.coerce.date().optional(),
});

/**
 * Update schema - for partial updates
 */
export const updateGoalSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: goalStatusSchema.optional(),
  targetDate: z.coerce.date().optional().nullable(),
  // Weight goal updates
  targetWeight: z.number().positive().optional(),
  currentWeight: z.number().positive().optional(),
  // Strength goal updates
  targetLiftWeight: z.number().positive().optional(),
  currentLiftWeight: z.number().positive().optional(),
  targetReps: z.number().int().positive().optional(),
  currentReps: z.number().int().positive().optional(),
  // Body measurement updates
  targetMeasurement: z.number().positive().optional(),
  currentMeasurement: z.number().positive().optional(),
  // Workout frequency updates
  targetWorkoutsPerWeek: z.number().int().min(1).max(14).optional(),
  // Custom goal updates
  targetCustomValue: z.number().optional(),
  currentCustomValue: z.number().optional(),
});

/**
 * Schema for updating progress on a goal
 */
export const updateGoalProgressSchema = z.object({
  goalId: z.number().int().positive(),
  value: z.number(),
  note: z.string().max(500).optional(),
});

// ============================================================================
// Goal Progress Schemas
// ============================================================================

/**
 * Select schema for goal progress
 */
export const selectGoalProgressSchema = createSelectSchema(goalProgress);

/**
 * Insert schema for goal progress
 */
export const insertGoalProgressSchema = createInsertSchema(goalProgress, {
  value: z.number(),
  progressPercentage: z.number().min(0).max(100),
  note: (schema) => schema.max(500).optional(),
  recordedAt: z.coerce.date().optional(),
}).omit({
  id: true,
  goalId: true,
  userId: true,
  createdAt: true,
});

// ============================================================================
// Type Exports
// ============================================================================

export type SelectGoal = z.infer<typeof selectGoalSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type UpdateGoal = z.infer<typeof updateGoalSchema>;
export type CreateWeightGoal = z.infer<typeof createWeightGoalSchema>;
export type CreateStrengthGoal = z.infer<typeof createStrengthGoalSchema>;
export type CreateBodyMeasurementGoal = z.infer<typeof createBodyMeasurementGoalSchema>;
export type CreateWorkoutFrequencyGoal = z.infer<typeof createWorkoutFrequencyGoalSchema>;
export type CreateCustomGoal = z.infer<typeof createCustomGoalSchema>;
export type UpdateGoalProgress = z.infer<typeof updateGoalProgressSchema>;

export type SelectGoalProgress = z.infer<typeof selectGoalProgressSchema>;
export type InsertGoalProgress = z.infer<typeof insertGoalProgressSchema>;
