import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { exercise } from "./exercise";

/**
 * Template Folder table - Organization for workout templates
 */
export const templateFolder = sqliteTable(
  "template_folder",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Order for sorting folders (0-based) */
    order: integer("order").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("template_folder_user_id_idx").on(table.userId),
    index("template_folder_order_idx").on(table.order),
  ],
);

/**
 * Workout Template table - Reusable workout blueprints
 */
export const workoutTemplate = sqliteTable(
  "workout_template",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Optional folder for organization */
    folderId: integer("folder_id").references(() => templateFolder.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description"),
    /** Estimated workout duration in minutes */
    estimatedDurationMinutes: integer("estimated_duration_minutes"),
    /** Whether this template is publicly visible */
    isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
    /** Number of times this template has been used to create workouts */
    timesUsed: integer("times_used").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workout_template_user_id_idx").on(table.userId),
    index("workout_template_folder_id_idx").on(table.folderId),
    index("workout_template_is_public_idx").on(table.isPublic),
  ],
);

/**
 * Template Day table - Individual workout days within a multi-day template/routine
 * A template can have multiple days (e.g., "Push Day", "Pull Day", "Leg Day")
 */
export const templateDay = sqliteTable(
  "template_day",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    templateId: integer("template_id")
      .notNull()
      .references(() => workoutTemplate.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    /** Order of day in the template (1-based) */
    order: integer("order").notNull(),
    /** Whether this is a rest day (no exercises) */
    isRestDay: integer("is_rest_day", { mode: "boolean" }).default(false).notNull(),
    /** Estimated duration for this day in minutes */
    estimatedDurationMinutes: integer("estimated_duration_minutes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("template_day_template_id_idx").on(table.templateId),
    index("template_day_template_order_idx").on(table.templateId, table.order),
  ],
);

/**
 * Workout Template Exercise table - Exercises within a template
 * Includes target sets, reps, weight, and superset grouping
 */
export const workoutTemplateExercise = sqliteTable(
  "workout_template_exercise",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    templateId: integer("template_id")
      .notNull()
      .references(() => workoutTemplate.id, { onDelete: "cascade" }),
    /** Optional reference to template day (for multi-day templates) */
    templateDayId: integer("template_day_id").references(() => templateDay.id, {
      onDelete: "cascade",
    }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "restrict" }),
    /** Order of exercise in the template (1-based) */
    order: integer("order").notNull(),
    /** Group ID for superset exercises (exercises with same ID are performed together) */
    supersetGroupId: integer("superset_group_id"),
    notes: text("notes"),
    /** Target number of sets */
    targetSets: integer("target_sets").default(3).notNull(),
    /** Target reps (can be a range like "8-12") */
    targetReps: text("target_reps"),
    /** Target weight in user's preferred unit */
    targetWeight: real("target_weight"),
    /** Rest time between sets in seconds */
    restSeconds: integer("rest_seconds").default(90).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workout_template_exercise_template_id_idx").on(table.templateId),
    index("workout_template_exercise_template_day_id_idx").on(table.templateDayId),
    index("workout_template_exercise_exercise_id_idx").on(table.exerciseId),
    index("workout_template_exercise_order_idx").on(table.order),
    index("workout_template_exercise_superset_idx").on(table.supersetGroupId),
  ],
);

// Relations
export const templateFolderRelations = relations(templateFolder, ({ one, many }) => ({
  user: one(user, {
    fields: [templateFolder.userId],
    references: [user.id],
  }),
  templates: many(workoutTemplate),
}));

export const workoutTemplateRelations = relations(workoutTemplate, ({ one, many }) => ({
  user: one(user, {
    fields: [workoutTemplate.userId],
    references: [user.id],
  }),
  folder: one(templateFolder, {
    fields: [workoutTemplate.folderId],
    references: [templateFolder.id],
  }),
  days: many(templateDay),
  exercises: many(workoutTemplateExercise),
}));

export const templateDayRelations = relations(templateDay, ({ one, many }) => ({
  template: one(workoutTemplate, {
    fields: [templateDay.templateId],
    references: [workoutTemplate.id],
  }),
  exercises: many(workoutTemplateExercise),
}));

export const workoutTemplateExerciseRelations = relations(workoutTemplateExercise, ({ one }) => ({
  template: one(workoutTemplate, {
    fields: [workoutTemplateExercise.templateId],
    references: [workoutTemplate.id],
  }),
  templateDay: one(templateDay, {
    fields: [workoutTemplateExercise.templateDayId],
    references: [templateDay.id],
  }),
  exercise: one(exercise, {
    fields: [workoutTemplateExercise.exerciseId],
    references: [exercise.id],
  }),
}));

// Extended user relations for workout templates (merged with auth.ts userRelations by Drizzle)
export const userWorkoutTemplateRelations = relations(user, ({ many }) => ({
  templateFolders: many(templateFolder),
  workoutTemplates: many(workoutTemplate),
}));

// Extended exercise relations for template exercises (merged with exercise.ts by Drizzle)
export const exerciseWorkoutTemplateRelations = relations(exercise, ({ many }) => ({
  templateExercises: many(workoutTemplateExercise),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

// ============================================================================
// Template Folder Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectTemplateFolderSchema = createSelectSchema(templateFolder);

/**
 * Insert schema - for validating data before insertion
 */
export const insertTemplateFolderSchema = createInsertSchema(templateFolder, {
  name: (schema) => schema.min(1).max(100),
  order: (schema) => schema.min(0),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - for validating partial updates
 */
export const updateTemplateFolderSchema = insertTemplateFolderSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectTemplateFolder = z.infer<typeof selectTemplateFolderSchema>;
export type InsertTemplateFolder = z.infer<typeof insertTemplateFolderSchema>;
export type UpdateTemplateFolder = z.infer<typeof updateTemplateFolderSchema>;

// ============================================================================
// Workout Template Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectWorkoutTemplateSchema = createSelectSchema(workoutTemplate);

/**
 * Insert schema - for validating data before insertion
 */
export const insertWorkoutTemplateSchema = createInsertSchema(workoutTemplate, {
  name: (schema) => schema.min(1).max(100),
  description: (schema) => schema.max(500),
  estimatedDurationMinutes: (schema) => schema.min(1).max(600),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  timesUsed: true,
});

/**
 * Update schema - for validating partial updates
 */
export const updateWorkoutTemplateSchema = insertWorkoutTemplateSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectWorkoutTemplate = z.infer<typeof selectWorkoutTemplateSchema>;
export type InsertWorkoutTemplate = z.infer<typeof insertWorkoutTemplateSchema>;
export type UpdateWorkoutTemplate = z.infer<typeof updateWorkoutTemplateSchema>;

// ============================================================================
// Template Day Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectTemplateDaySchema = createSelectSchema(templateDay);

/**
 * Insert schema - for validating data before insertion
 */
export const insertTemplateDaySchema = createInsertSchema(templateDay, {
  name: (schema) => schema.min(1).max(100),
  description: (schema) => schema.max(500),
  order: (schema) => schema.min(1),
  estimatedDurationMinutes: (schema) => schema.min(1).max(600),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - for validating partial updates
 */
export const updateTemplateDaySchema = insertTemplateDaySchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectTemplateDay = z.infer<typeof selectTemplateDaySchema>;
export type InsertTemplateDay = z.infer<typeof insertTemplateDaySchema>;
export type UpdateTemplateDay = z.infer<typeof updateTemplateDaySchema>;

// ============================================================================
// Workout Template Exercise Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectWorkoutTemplateExerciseSchema = createSelectSchema(workoutTemplateExercise);

/**
 * Insert schema - for validating data before insertion
 */
export const insertWorkoutTemplateExerciseSchema = createInsertSchema(workoutTemplateExercise, {
  order: (schema) => schema.min(1),
  notes: (schema) => schema.max(500),
  targetSets: (schema) => schema.min(1).max(20),
  targetReps: (schema) => schema.max(20),
  targetWeight: (schema) => schema.min(0),
  restSeconds: (schema) => schema.min(0).max(600),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - for validating partial updates
 */
export const updateWorkoutTemplateExerciseSchema = insertWorkoutTemplateExerciseSchema
  .partial()
  .extend({
    id: z.number(),
  });

// Type exports
export type SelectWorkoutTemplateExercise = z.infer<typeof selectWorkoutTemplateExerciseSchema>;
export type InsertWorkoutTemplateExercise = z.infer<typeof insertWorkoutTemplateExerciseSchema>;
export type UpdateWorkoutTemplateExercise = z.infer<typeof updateWorkoutTemplateExerciseSchema>;
