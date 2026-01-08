import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";

/**
 * Period types for training summaries
 */
export type PeriodType = "week" | "month";

/**
 * Weekly/monthly training summaries (cached for performance)
 * Aggregates workout data for analytics and reporting
 */
export const trainingSummary = sqliteTable(
  "training_summary",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Period definition
    /** Type of period: "week" or "month" */
    periodType: text("period_type").$type<PeriodType>().notNull(),
    /** Start date of the period (YYYY-MM-DD format, Monday for weeks, 1st for months) */
    periodStart: text("period_start").notNull(),
    /** End date of the period (YYYY-MM-DD format) */
    periodEnd: text("period_end").notNull(),

    // Workout counts
    /** Total number of workouts in the period */
    totalWorkouts: integer("total_workouts").default(0).notNull(),
    /** Number of completed workouts */
    completedWorkouts: integer("completed_workouts").default(0).notNull(),
    /** Total duration of all workouts in minutes */
    totalDurationMinutes: integer("total_duration_minutes").default(0).notNull(),

    // Volume metrics
    /** Total number of sets performed */
    totalSets: integer("total_sets").default(0).notNull(),
    /** Total number of reps performed */
    totalReps: integer("total_reps").default(0).notNull(),
    /** Total volume in kg (weight × reps for all sets) */
    totalVolumeKg: real("total_volume_kg").default(0).notNull(),

    // Per muscle group (JSON objects)
    /** Volume breakdown by muscle group (e.g., {"chest": 5000, "back": 4500}) */
    volumeByMuscle: text("volume_by_muscle", { mode: "json" }).$type<Record<string, number>>(),
    /** Sets count by muscle group */
    setsByMuscle: text("sets_by_muscle", { mode: "json" }).$type<Record<string, number>>(),

    // Exercise stats
    /** Number of unique exercises performed */
    uniqueExercises: integer("unique_exercises").default(0).notNull(),
    /** ID of the most frequently performed exercise */
    favoriteExerciseId: integer("favorite_exercise_id"),

    // PRs and achievements
    /** Number of personal records achieved in this period */
    prsAchieved: integer("prs_achieved").default(0).notNull(),

    // Averages
    /** Average workout duration in minutes */
    avgWorkoutDuration: real("avg_workout_duration"),
    /** Average RPE across all sets */
    avgRpe: real("avg_rpe"),
    /** Average number of sets per workout */
    avgSetsPerWorkout: real("avg_sets_per_workout"),

    // Consistency
    /** Number of planned workouts (if using templates) */
    plannedWorkouts: integer("planned_workouts"),
    /** Completion rate (completed/planned) as a decimal 0-1 */
    completionRate: real("completion_rate"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("training_summary_user_id_idx").on(table.userId),
    index("training_summary_period_idx").on(table.periodType, table.periodStart),
    index("training_summary_user_period_idx").on(table.userId, table.periodType, table.periodStart),
  ],
);

// Relations
export const trainingSummaryRelations = relations(trainingSummary, ({ one }) => ({
  user: one(user, {
    fields: [trainingSummary.userId],
    references: [user.id],
  }),
}));

// Extended user relations for training summaries (merged with auth.ts userRelations by Drizzle)
export const userTrainingSummaryRelations = relations(user, ({ many }) => ({
  trainingSummaries: many(trainingSummary),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Period type enum schema
 */
export const periodTypeSchema = z.enum(["week", "month"]);

/**
 * Select schema - for validating data returned from the database
 */
export const selectTrainingSummarySchema = createSelectSchema(trainingSummary, {
  periodType: periodTypeSchema,
  volumeByMuscle: z.record(z.string(), z.number()).nullable(),
  setsByMuscle: z.record(z.string(), z.number()).nullable(),
});

/**
 * Insert schema - for validating data before insertion
 */
export const insertTrainingSummarySchema = createInsertSchema(trainingSummary, {
  periodType: periodTypeSchema,
  periodStart: (schema) => schema.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  periodEnd: (schema) => schema.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  totalWorkouts: (schema) => schema.int().min(0),
  completedWorkouts: (schema) => schema.int().min(0),
  totalDurationMinutes: (schema) => schema.int().min(0),
  totalSets: (schema) => schema.int().min(0),
  totalReps: (schema) => schema.int().min(0),
  totalVolumeKg: (schema) => schema.min(0),
  volumeByMuscle: z.record(z.string(), z.number()).nullable().optional(),
  setsByMuscle: z.record(z.string(), z.number()).nullable().optional(),
  uniqueExercises: (schema) => schema.int().min(0),
  prsAchieved: (schema) => schema.int().min(0),
  avgWorkoutDuration: (schema) => schema.min(0),
  avgRpe: (schema) => schema.min(1).max(10),
  avgSetsPerWorkout: (schema) => schema.min(0),
  completionRate: (schema) => schema.min(0).max(1),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - partial insert with required id
 */
export const updateTrainingSummarySchema = insertTrainingSummarySchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectTrainingSummary = z.infer<typeof selectTrainingSummarySchema>;
export type InsertTrainingSummary = z.infer<typeof insertTrainingSummarySchema>;
export type UpdateTrainingSummary = z.infer<typeof updateTrainingSummarySchema>;
