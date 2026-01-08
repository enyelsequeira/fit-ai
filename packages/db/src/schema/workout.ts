import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { exercise } from "./exercise";
import { workoutTemplate } from "./workout-template";

/**
 * Set classification types
 */
export type SetType = "normal" | "warmup" | "failure" | "drop";

/**
 * Workout mood for post-workout feedback
 */
export type WorkoutMood = "great" | "good" | "okay" | "tired" | "bad";

/**
 * Workout table - represents a workout session
 */
export const workout = sqliteTable(
  "workout",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name"),
    notes: text("notes"),
    startedAt: integer("started_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),

    // Template reference
    /** Reference to the template this workout was created from */
    templateId: integer("template_id").references(() => workoutTemplate.id, {
      onDelete: "set null",
    }),

    // Post-workout feedback
    /** User rating of the workout (1-5 stars) */
    rating: integer("rating"),
    /** User's mood/energy level during the workout */
    mood: text("mood").$type<WorkoutMood>(),
  },
  (table) => [
    index("workout_user_id_idx").on(table.userId),
    index("workout_started_at_idx").on(table.startedAt),
    index("workout_completed_at_idx").on(table.completedAt),
  ],
);

/**
 * Workout Exercise table - represents an exercise within a workout
 * Links workouts to exercises with ordering
 */
export const workoutExercise = sqliteTable(
  "workout_exercise",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workout.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "restrict" }),
    /** Order of exercise in the workout (1-based) */
    order: integer("order").notNull().default(1),
    notes: text("notes"),

    // Superset grouping
    /** NULL = not in superset, same ID = exercises in the same superset */
    supersetGroupId: integer("superset_group_id"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workout_exercise_workout_id_idx").on(table.workoutId),
    index("workout_exercise_exercise_id_idx").on(table.exerciseId),
  ],
);

/**
 * Weight units for exercise sets
 */
export type WeightUnit = "kg" | "lb";

/**
 * Distance units for cardio exercises
 */
export type DistanceUnit = "km" | "mi" | "m";

/**
 * Exercise Set table - represents individual sets within a workout exercise
 * Supports strength (reps/weight), cardio (duration/distance), and flexibility (duration/hold)
 */
export const exerciseSet = sqliteTable(
  "exercise_set",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutExerciseId: integer("workout_exercise_id")
      .notNull()
      .references(() => workoutExercise.id, { onDelete: "cascade" }),
    /** Set number within the exercise (1-based) */
    setNumber: integer("set_number").notNull().default(1),

    // Strength-specific fields
    reps: integer("reps"),
    weight: integer("weight"), // Stored as smallest unit (grams or hundredths)
    weightUnit: text("weight_unit").$type<WeightUnit>().default("kg"),

    // Cardio-specific fields
    durationSeconds: integer("duration_seconds"),
    distance: integer("distance"), // Stored in meters
    distanceUnit: text("distance_unit").$type<DistanceUnit>().default("km"),

    // Flexibility-specific fields
    holdTimeSeconds: integer("hold_time_seconds"),

    // Set classification
    /** Type of set: normal, warmup, failure, or drop set */
    setType: text("set_type").$type<SetType>().default("normal"),

    // Intensity tracking
    /** Rate of Perceived Exertion (6-10 scale, where 10 is max effort) */
    rpe: integer("rpe"),
    /** Reps in Reserve (0-5 scale, alternative to RPE) */
    rir: integer("rir"),

    // Target vs actual tracking
    /** Target number of reps for this set */
    targetReps: integer("target_reps"),
    /** Target weight for this set */
    targetWeight: real("target_weight"),

    // Rest tracking
    /** Actual rest time taken before this set (in seconds) */
    restTimeSeconds: integer("rest_time_seconds"),

    // Completion status
    /** Whether this set has been completed */
    isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
    /** Timestamp when the set was completed */
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),

    // Common fields
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("exercise_set_workout_exercise_id_idx").on(table.workoutExerciseId)],
);

// Relations
export const workoutRelations = relations(workout, ({ one, many }) => ({
  user: one(user, {
    fields: [workout.userId],
    references: [user.id],
  }),
  template: one(workoutTemplate, {
    fields: [workout.templateId],
    references: [workoutTemplate.id],
  }),
  workoutExercises: many(workoutExercise),
}));

export const workoutExerciseRelations = relations(workoutExercise, ({ one, many }) => ({
  workout: one(workout, {
    fields: [workoutExercise.workoutId],
    references: [workout.id],
  }),
  exercise: one(exercise, {
    fields: [workoutExercise.exerciseId],
    references: [exercise.id],
  }),
  sets: many(exerciseSet),
}));

export const exerciseSetRelations = relations(exerciseSet, ({ one }) => ({
  workoutExercise: one(workoutExercise, {
    fields: [exerciseSet.workoutExerciseId],
    references: [workoutExercise.id],
  }),
}));

// Extended user relations for workouts (merged with auth.ts userRelations by Drizzle)
export const userWorkoutRelations = relations(user, ({ many }) => ({
  workouts: many(workout),
}));

// Extended exercise relations for workout exercises (merged with exercise.ts by Drizzle)
export const exerciseWorkoutRelations = relations(exercise, ({ many }) => ({
  workoutExercises: many(workoutExercise),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Set type enum schema
 */
export const setTypeSchema = z.enum(["normal", "warmup", "failure", "drop"]);

/**
 * Workout mood enum schema
 */
export const workoutMoodSchema = z.enum(["great", "good", "okay", "tired", "bad"]);

/**
 * Weight unit enum schema
 */
export const weightUnitSchema = z.enum(["kg", "lb"]);

/**
 * Distance unit enum schema
 */
export const distanceUnitSchema = z.enum(["km", "mi", "m"]);

// ============================================================================
// Workout Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectWorkoutSchema = createSelectSchema(workout, {
  mood: workoutMoodSchema.nullable(),
});

/**
 * Insert schema - for validating data before insertion
 */
export const insertWorkoutSchema = createInsertSchema(workout, {
  name: (schema) => schema.max(100),
  notes: (schema) => schema.max(1000),
  mood: workoutMoodSchema.optional(),
  rating: (schema) => schema.min(1).max(5),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  startedAt: true,
  completedAt: true,
});

/**
 * Update schema - for validating partial updates
 */
export const updateWorkoutSchema = insertWorkoutSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectWorkout = z.infer<typeof selectWorkoutSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type UpdateWorkout = z.infer<typeof updateWorkoutSchema>;

// ============================================================================
// Workout Exercise Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectWorkoutExerciseSchema = createSelectSchema(workoutExercise);

/**
 * Insert schema - for validating data before insertion
 */
export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercise, {
  order: z.number().int().min(1).default(1),
  notes: (schema) => schema.max(500),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - for validating partial updates
 */
export const updateWorkoutExerciseSchema = insertWorkoutExerciseSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectWorkoutExercise = z.infer<typeof selectWorkoutExerciseSchema>;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type UpdateWorkoutExercise = z.infer<typeof updateWorkoutExerciseSchema>;

// ============================================================================
// Exercise Set Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectExerciseSetSchema = createSelectSchema(exerciseSet, {
  setType: setTypeSchema.nullable(),
  weightUnit: weightUnitSchema.nullable(),
  distanceUnit: distanceUnitSchema.nullable(),
});

/**
 * Insert schema - for validating data before insertion
 */
export const insertExerciseSetSchema = createInsertSchema(exerciseSet, {
  setNumber: z.number().int().min(1).default(1),
  reps: (schema) => schema.min(0),
  weight: (schema) => schema.min(0),
  weightUnit: weightUnitSchema.default("kg"),
  durationSeconds: (schema) => schema.min(0),
  distance: (schema) => schema.min(0),
  distanceUnit: distanceUnitSchema.default("km"),
  holdTimeSeconds: (schema) => schema.min(0),
  setType: setTypeSchema.default("normal"),
  rpe: (schema) => schema.min(6).max(10),
  rir: (schema) => schema.min(0).max(5),
  targetReps: (schema) => schema.min(0),
  targetWeight: (schema) => schema.min(0),
  restTimeSeconds: (schema) => schema.min(0),
  notes: (schema) => schema.max(500),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

/**
 * Update schema - for validating partial updates
 */
export const updateExerciseSetSchema = insertExerciseSetSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectExerciseSet = z.infer<typeof selectExerciseSetSchema>;
export type InsertExerciseSet = z.infer<typeof insertExerciseSetSchema>;
export type UpdateExerciseSet = z.infer<typeof updateExerciseSetSchema>;
