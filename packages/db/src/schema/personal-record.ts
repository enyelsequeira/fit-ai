import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { exercise } from "./exercise";
import { exerciseSet, workout } from "./workout";

/**
 * Types of personal records that can be tracked
 */
export type RecordType =
  | "one_rep_max" // Calculated 1RM from any set
  | "max_weight" // Maximum weight lifted (any reps)
  | "max_reps" // Maximum reps at any weight
  | "max_volume" // Maximum volume in a single workout (weight × reps)
  | "best_time" // Best time for cardio distance
  | "longest_duration" // Longest duration for cardio/flexibility
  | "longest_distance"; // Longest distance for cardio

/**
 * Personal Record table - tracks user's personal bests for exercises
 * PRs are automatically calculated when workouts are completed
 */
export const personalRecord = sqliteTable(
  "personal_record",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "cascade" }),

    /** Type of record */
    recordType: text("record_type").$type<RecordType>().notNull(),

    /**
     * Value of the record
     * - For weight: stored in kg (decimal)
     * - For reps: number of reps
     * - For volume: total kg lifted (weight × reps)
     * - For time: seconds
     * - For distance: meters
     */
    value: real("value").notNull(),

    /** Unit for display (kg, lb, km, mi, etc.) */
    displayUnit: text("display_unit"),

    /** When the record was achieved */
    achievedAt: integer("achieved_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),

    /** Reference to the workout where this PR was achieved (optional FK) */
    workoutId: integer("workout_id").references(() => workout.id, {
      onDelete: "set null",
    }),

    /** Reference to the specific set where this PR was achieved (optional FK) */
    exerciseSetId: integer("exercise_set_id").references(() => exerciseSet.id, {
      onDelete: "set null",
    }),

    notes: text("notes"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("personal_record_user_id_idx").on(table.userId),
    index("personal_record_exercise_id_idx").on(table.exerciseId),
    index("personal_record_type_idx").on(table.recordType),
    index("personal_record_user_exercise_idx").on(table.userId, table.exerciseId),
  ],
);

export const personalRecordRelations = relations(personalRecord, ({ one }) => ({
  user: one(user, {
    fields: [personalRecord.userId],
    references: [user.id],
  }),
  exercise: one(exercise, {
    fields: [personalRecord.exerciseId],
    references: [exercise.id],
  }),
  workout: one(workout, {
    fields: [personalRecord.workoutId],
    references: [workout.id],
  }),
  exerciseSet: one(exerciseSet, {
    fields: [personalRecord.exerciseSetId],
    references: [exerciseSet.id],
  }),
}));

// Extended user relations for personal records (merged with auth.ts userRelations by Drizzle)
export const userPersonalRecordRelations = relations(user, ({ many }) => ({
  personalRecords: many(personalRecord),
}));

// Extended exercise relations for personal records (merged with exercise.ts by Drizzle)
export const exercisePersonalRecordRelations = relations(exercise, ({ many }) => ({
  personalRecords: many(personalRecord),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Record type enum schema
 */
export const recordTypeSchema = z.enum([
  "one_rep_max",
  "max_weight",
  "max_reps",
  "max_volume",
  "best_time",
  "longest_duration",
  "longest_distance",
]);

/**
 * Select schema - for validating data returned from the database
 */
export const selectPersonalRecordSchema = createSelectSchema(personalRecord, {
  recordType: recordTypeSchema,
});

/**
 * Insert schema - for validating data before insertion
 * Omits auto-generated fields (id, userId, createdAt, updatedAt)
 */
export const insertPersonalRecordSchema = createInsertSchema(personalRecord, {
  exerciseId: z.number(),
  recordType: recordTypeSchema,
  value: z.number().positive(),
  displayUnit: (schema) => schema.max(20).optional(),
  achievedAt: z.coerce.date().optional(),
  workoutId: z.number().optional(),
  exerciseSetId: z.number().optional(),
  notes: (schema) => schema.max(500).optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - for validating partial updates
 * Only notes and displayUnit can be updated
 */
export const updatePersonalRecordSchema = z.object({
  id: z.coerce.number(),
  notes: z.string().max(500).optional(),
  displayUnit: z.string().max(20).optional(),
});

// Type exports
export type SelectPersonalRecord = z.infer<typeof selectPersonalRecordSchema>;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
export type UpdatePersonalRecord = z.infer<typeof updatePersonalRecordSchema>;
