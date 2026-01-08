import {
  insertTemplateFolderSchema,
  insertWorkoutTemplateExerciseSchema,
  insertWorkoutTemplateSchema,
  selectTemplateFolderSchema,
  selectWorkoutTemplateExerciseSchema,
  selectWorkoutTemplateSchema,
} from "@fit-ai/db/schema/workout-template";
import z from "zod";

// ============================================================================
// Folder Output Schemas (from DB select schema)
// ============================================================================

/**
 * Folder output schema (from drizzle-zod)
 */
export const folderOutputSchema = selectTemplateFolderSchema;

export type FolderOutput = z.infer<typeof folderOutputSchema>;

// ============================================================================
// Template Exercise Output Schemas (from DB select schema, extended)
// ============================================================================

/**
 * Template exercise base output schema (from drizzle-zod)
 */
export const templateExerciseBaseOutputSchema = selectWorkoutTemplateExerciseSchema;

/**
 * Template exercise output schema (with nested exercise details)
 */
export const templateExerciseOutputSchema = templateExerciseBaseOutputSchema.extend({
  exercise: z
    .object({
      id: z.number(),
      name: z.string(),
      category: z.string(),
      exerciseType: z.string(),
    })
    .optional()
    .describe("Exercise details"),
});

export type TemplateExerciseOutput = z.infer<typeof templateExerciseOutputSchema>;

// ============================================================================
// Template Output Schemas (from DB select schema)
// ============================================================================

/**
 * Template output schema (from drizzle-zod)
 */
export const templateOutputSchema = selectWorkoutTemplateSchema;

export type TemplateOutput = z.infer<typeof templateOutputSchema>;

/**
 * Template with exercises output schema
 */
export const templateWithExercisesOutputSchema = templateOutputSchema.extend({
  exercises: z.array(templateExerciseOutputSchema).describe("Exercises in this template"),
});

export type TemplateWithExercisesOutput = z.infer<typeof templateWithExercisesOutputSchema>;

/**
 * Workout output schema (for startWorkout)
 */
export const workoutOutputSchema = z.object({
  id: z.number().describe("Unique identifier for the workout"),
  userId: z.string().describe("ID of the user"),
  name: z.string().nullable().describe("Name of the workout"),
  templateId: z.number().nullable().describe("ID of the source template"),
  startedAt: z.date().describe("When the workout started"),
  createdAt: z.date().describe("When the workout was created"),
  updatedAt: z.date().describe("When the workout was last updated"),
});

export type WorkoutOutput = z.infer<typeof workoutOutputSchema>;

/**
 * Success result schema
 */
export const successResultSchema = z.object({
  success: z.boolean().describe("Whether the operation was successful"),
});

export type SuccessResult = z.infer<typeof successResultSchema>;

// ============================================================================
// Folder Input Schemas
// ============================================================================

/**
 * Create folder input schema (from drizzle-zod insert schema)
 */
export const createFolderSchema = insertTemplateFolderSchema.pick({
  name: true,
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;

/**
 * Update folder input schema
 */
export const updateFolderSchema = z.object({
  id: z.coerce.number().describe("ID of the folder to update"),
  name: z.string().min(1).max(100).optional().describe("New name for the folder"),
});

export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;

/**
 * Delete folder input schema
 */
export const deleteFolderSchema = z.object({
  id: z.coerce.number().describe("ID of the folder to delete"),
});

export type DeleteFolderInput = z.infer<typeof deleteFolderSchema>;

/**
 * Reorder folders input schema
 */
export const reorderFoldersSchema = z.object({
  folderIds: z.array(z.number()).describe("Array of folder IDs in the desired order"),
});

export type ReorderFoldersInput = z.infer<typeof reorderFoldersSchema>;

// ============================================================================
// Template Input Schemas
// ============================================================================

/**
 * List templates input schema (custom filter schema)
 */
export const listTemplatesSchema = z.object({
  folderId: z.coerce.number().optional().describe("Filter by folder ID"),
  includeNoFolder: z.boolean().default(true).describe("Include templates without a folder"),
  includePublic: z.boolean().default(true).describe("Include public templates from other users"),
  limit: z.number().min(1).max(100).default(50).describe("Maximum number of results"),
  offset: z.number().min(0).default(0).describe("Number of results to skip"),
});

export type ListTemplatesInput = z.infer<typeof listTemplatesSchema>;

/**
 * Get template by ID input schema
 */
export const getTemplateByIdSchema = z.object({
  id: z.coerce.number().describe("ID of the template"),
});

export type GetTemplateByIdInput = z.infer<typeof getTemplateByIdSchema>;

/**
 * Create template input schema (from drizzle-zod insert schema)
 */
export const createTemplateSchema = insertWorkoutTemplateSchema;

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

/**
 * Update template input schema
 */
export const updateTemplateSchema = z.object({
  id: z.coerce.number().describe("ID of the template to update"),
  name: z.string().min(1).max(100).optional().describe("New name for the template"),
  description: z.string().max(500).optional().describe("New description"),
  folderId: z.number().nullable().optional().describe("New folder ID (null to remove from folder)"),
  estimatedDurationMinutes: z
    .number()
    .min(1)
    .max(600)
    .optional()
    .describe("New estimated duration"),
  isPublic: z.boolean().optional().describe("New visibility setting"),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

/**
 * Delete template input schema
 */
export const deleteTemplateSchema = z.object({
  id: z.coerce.number().describe("ID of the template to delete"),
});

export type DeleteTemplateInput = z.infer<typeof deleteTemplateSchema>;

/**
 * Duplicate template input schema
 */
export const duplicateTemplateSchema = z.object({
  id: z.coerce.number().describe("ID of the template to duplicate"),
});

export type DuplicateTemplateInput = z.infer<typeof duplicateTemplateSchema>;

/**
 * Start workout from template input schema
 */
export const startWorkoutSchema = z.object({
  id: z.coerce.number().describe("ID of the template to start"),
});

export type StartWorkoutInput = z.infer<typeof startWorkoutSchema>;

// ============================================================================
// Template Exercise Input Schemas
// ============================================================================

/**
 * Add exercise to template input schema (based on drizzle-zod insert schema)
 */
export const addExerciseSchema = insertWorkoutTemplateExerciseSchema
  .omit({ templateId: true })
  .extend({
    id: z.coerce.number().describe("ID of the template to add exercise to"),
  });

export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

/**
 * Update template exercise input schema
 */
export const updateExerciseSchema = z.object({
  templateId: z.coerce.number().describe("ID of the template"),
  exerciseId: z.coerce.number().describe("ID of the template exercise entry to update"),
  order: z.number().optional().describe("New order"),
  supersetGroupId: z.number().nullable().optional().describe("New superset group ID"),
  notes: z.string().max(500).optional().describe("New notes"),
  targetSets: z.number().min(1).max(20).optional().describe("New target sets"),
  targetReps: z.string().max(20).optional().describe("New target reps"),
  targetWeight: z.number().optional().describe("New target weight"),
  restSeconds: z.number().min(0).max(600).optional().describe("New rest time"),
});

export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

/**
 * Remove exercise from template input schema
 */
export const removeExerciseSchema = z.object({
  templateId: z.coerce.number().describe("ID of the template"),
  exerciseId: z.coerce.number().describe("ID of the template exercise entry to remove"),
});

export type RemoveExerciseInput = z.infer<typeof removeExerciseSchema>;

/**
 * Reorder template exercises input schema
 */
export const reorderExercisesSchema = z.object({
  id: z.coerce.number().describe("ID of the template"),
  exerciseIds: z.array(z.number()).describe("Array of template exercise IDs in the desired order"),
});

export type ReorderExercisesInput = z.infer<typeof reorderExercisesSchema>;
