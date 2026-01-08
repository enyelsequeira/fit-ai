import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";

/**
 * Exercise types supported by the system
 */
export type ExerciseType = "strength" | "cardio" | "flexibility";

/**
 * Exercise categories for organization
 */
export type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "flexibility"
  | "compound"
  | "other";

/**
 * External source for exercise data
 */
export type ExerciseSource = "free-exercise-db" | "wger" | "user" | null;

/**
 * Exercise table - stores both default exercises and user-created exercises
 * Default exercises have createdByUserId = null
 */
export const exercise = sqliteTable(
  "exercise",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").$type<ExerciseCategory>().notNull(),
    /** JSON array of muscle groups targeted */
    muscleGroups: text("muscle_groups", { mode: "json" }).$type<string[]>().notNull().default([]),
    /** Equipment needed (e.g., "barbell", "dumbbell", "bodyweight") */
    equipment: text("equipment"),
    exerciseType: text("exercise_type").$type<ExerciseType>().notNull().default("strength"),
    /** True for system-provided exercises, false for user-created */
    isDefault: integer("is_default", { mode: "boolean" }).default(false).notNull(),
    /** Null for default exercises, user ID for custom exercises */
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "cascade",
    }),

    // ========== Image & Media Fields ==========
    /** Primary image URL */
    primaryImage: text("primary_image"),
    /** JSON array of additional image URLs */
    images: text("images", { mode: "json" }).$type<string[]>().default([]),
    /** Video URL (optional) */
    videoUrl: text("video_url"),

    // ========== Instructions ==========
    /** JSON array of step-by-step instructions */
    instructions: text("instructions", { mode: "json" }).$type<string[]>().default([]),

    // ========== External Source Tracking ==========
    /** External ID from source (e.g., "Barbell_Bench_Press_-_Medium_Grip") */
    externalId: text("external_id"),
    /** Source of external data */
    externalSource: text("external_source").$type<ExerciseSource>(),

    // ========== Additional Metadata ==========
    /** Exercise difficulty level */
    level: text("level").$type<"beginner" | "intermediate" | "expert">(),
    /** Force type (push, pull, static) */
    force: text("force").$type<"push" | "pull" | "static" | null>(),
    /** Mechanic type (compound, isolation) */
    mechanic: text("mechanic").$type<"compound" | "isolation" | null>(),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("exercise_category_idx").on(table.category),
    index("exercise_type_idx").on(table.exerciseType),
    index("exercise_created_by_idx").on(table.createdByUserId),
    index("exercise_name_idx").on(table.name),
    index("exercise_external_id_idx").on(table.externalId),
  ],
);

// Note: Relations to workoutExercise and personalRecord are defined in their respective files
// to avoid circular dependencies. Drizzle merges relations automatically.
export const exerciseRelations = relations(exercise, ({ one }) => ({
  createdBy: one(user, {
    fields: [exercise.createdByUserId],
    references: [user.id],
  }),
}));

// Extended user relations for exercises (merged with auth.ts userRelations by Drizzle)
export const userExerciseRelations = relations(user, ({ many }) => ({
  customExercises: many(exercise),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Exercise category enum schema
 */
export const exerciseCategorySchema = z.enum([
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "cardio",
  "flexibility",
  "compound",
  "other",
]);

/**
 * Exercise type enum schema
 */
export const exerciseTypeSchema = z.enum(["strength", "cardio", "flexibility"]);

/**
 * Exercise source enum schema
 */
export const exerciseSourceSchema = z.enum(["free-exercise-db", "wger", "user"]).nullable();

/**
 * Exercise level enum schema
 */
export const exerciseLevelSchema = z.enum(["beginner", "intermediate", "expert"]).nullable();

/**
 * Exercise force enum schema
 */
export const exerciseForceSchema = z.enum(["push", "pull", "static"]).nullable();

/**
 * Exercise mechanic enum schema
 */
export const exerciseMechanicSchema = z.enum(["compound", "isolation"]).nullable();

/**
 * Select schema - for validating data returned from the database
 * Note: JSON fields may return null from the database even with defaults,
 * so we transform them to empty arrays
 */
export const selectExerciseSchema = createSelectSchema(exercise, {
  category: exerciseCategorySchema,
  exerciseType: exerciseTypeSchema,
  muscleGroups: z
    .array(z.string())
    .nullable()
    .transform((v) => v ?? []),
  images: z
    .array(z.string())
    .nullable()
    .transform((v) => v ?? []),
  instructions: z
    .array(z.string())
    .nullable()
    .transform((v) => v ?? []),
  externalSource: exerciseSourceSchema,
  level: exerciseLevelSchema,
  force: exerciseForceSchema,
  mechanic: exerciseMechanicSchema,
});

/**
 * Insert schema - for validating data before insertion
 * Omits auto-generated fields (id, createdAt, updatedAt, isDefault, createdByUserId)
 */
export const insertExerciseSchema = createInsertSchema(exercise, {
  name: (schema) => schema.min(1).max(100),
  description: (schema) => schema.max(500),
  category: exerciseCategorySchema,
  exerciseType: exerciseTypeSchema.default("strength"),
  muscleGroups: z.array(z.string()).default([]),
  equipment: (schema) => schema.max(100),
  primaryImage: (schema) => schema.url().optional(),
  images: z.array(z.string().url()).default([]),
  videoUrl: (schema) => schema.url().optional(),
  instructions: z.array(z.string()).default([]),
  externalId: (schema) => schema.max(200).optional(),
  externalSource: exerciseSourceSchema.optional(),
  level: exerciseLevelSchema.optional(),
  force: exerciseForceSchema.optional(),
  mechanic: exerciseMechanicSchema.optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDefault: true,
  createdByUserId: true,
});

/**
 * Update schema - for validating partial updates
 * All fields are optional except id
 */
export const updateExerciseSchema = insertExerciseSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectExercise = z.infer<typeof selectExerciseSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type UpdateExercise = z.infer<typeof updateExerciseSchema>;
