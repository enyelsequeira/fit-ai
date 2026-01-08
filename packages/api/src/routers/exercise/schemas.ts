import {
  exerciseCategorySchema,
  exerciseTypeSchema,
  insertExerciseSchema,
  selectExerciseSchema,
  updateExerciseSchema as dbUpdateExerciseSchema,
} from "@fit-ai/db/schema/exercise";
import z from "zod";

// ============================================================================
// Re-export base schemas from DB package
// ============================================================================

export { exerciseCategorySchema, exerciseTypeSchema };

export type ExerciseCategoryInput = z.infer<typeof exerciseCategorySchema>;
export type ExerciseTypeInput = z.infer<typeof exerciseTypeSchema>;

// ============================================================================
// Output Schemas (from DB select schema)
// ============================================================================

/**
 * Single exercise output schema (from drizzle-zod)
 */
export const exerciseOutputSchema = selectExerciseSchema;

export type ExerciseOutput = z.infer<typeof exerciseOutputSchema>;

/**
 * List of exercises output schema
 */
export const exerciseListOutputSchema = z.array(exerciseOutputSchema);

export type ExerciseListOutput = z.infer<typeof exerciseListOutputSchema>;

/**
 * Paginated exercises response schema
 */
export const paginatedExerciseListOutputSchema = z.object({
  exercises: z.array(exerciseOutputSchema).describe("List of exercises"),
  total: z.number().describe("Total number of exercises matching the filters"),
  limit: z.number().describe("Maximum number of results per page"),
  offset: z.number().describe("Number of results skipped"),
});

export type PaginatedExerciseListOutput = z.infer<typeof paginatedExerciseListOutputSchema>;

/**
 * Delete operation result
 */
export const deleteResultSchema = z.object({
  success: z.boolean().describe("Whether the deletion was successful"),
});

export type DeleteResult = z.infer<typeof deleteResultSchema>;

/**
 * Name availability check result
 */
export const nameAvailabilityResultSchema = z.object({
  available: z.boolean().describe("Whether the name is available"),
  message: z.string().optional().describe("Message explaining why the name is not available"),
});

export type NameAvailabilityResult = z.infer<typeof nameAvailabilityResultSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Helper to parse boolean from string, handling empty strings as undefined
 */
const booleanFromString = (defaultValue: boolean) =>
  z
    .union([
      z.boolean(),
      z
        .string()
        .transform((v) => {
          if (v === "" || v === undefined) return undefined;
          return v === "true";
        })
        .pipe(z.boolean().optional()),
    ])
    .transform((v) => v ?? defaultValue)
    .default(defaultValue);

/**
 * Helper to parse optional string, treating empty string as undefined
 */
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

/**
 * Helper to wrap an enum schema to treat empty string as undefined
 */
const optionalEnum = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === "" ? undefined : val), schema.optional());

/**
 * List exercises input schema with filtering and pagination
 * Note: limit and offset use z.coerce.number() to handle string inputs from query params
 * Empty strings are treated as undefined to allow defaults to take effect
 */
export const listExercisesSchema = z.object({
  category: optionalEnum(exerciseCategorySchema).describe("Filter by category"),
  exerciseType: optionalEnum(exerciseTypeSchema).describe("Filter by exercise type"),
  muscleGroup: optionalString.describe("Filter by muscle group"),
  equipment: optionalString.describe("Filter by equipment"),
  search: optionalString.describe("Search by name"),
  includeUserExercises: booleanFromString(true).describe("Include user-created exercises"),
  onlyUserExercises: booleanFromString(false).describe("Only return user-created exercises"),
  limit: z.coerce.number().min(1).max(100).default(50).describe("Maximum number of results"),
  offset: z.coerce.number().min(0).default(0).describe("Number of results to skip"),
});

export type ListExercisesInput = z.infer<typeof listExercisesSchema>;

/**
 * Get exercise by ID input schema
 */
export const getExerciseByIdSchema = z.object({
  id: z.coerce.number().describe("The unique identifier of the exercise"),
});

export type GetExerciseByIdInput = z.infer<typeof getExerciseByIdSchema>;

/**
 * Create exercise input schema (from drizzle-zod insert schema)
 */
export const createExerciseSchema = insertExerciseSchema;

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;

/**
 * Update exercise input schema (from drizzle-zod update schema)
 */
export const updateExerciseSchema = dbUpdateExerciseSchema;

export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

/**
 * Delete exercise input schema
 */
export const deleteExerciseSchema = z.object({
  id: z.coerce.number().describe("The ID of the exercise to delete"),
});

export type DeleteExerciseInput = z.infer<typeof deleteExerciseSchema>;

/**
 * Check name availability input schema
 */
export const checkNameAvailabilitySchema = z.object({
  name: z.string().min(1).describe("The exercise name to check"),
  excludeId: z
    .number()
    .optional()
    .describe("Exclude this exercise ID from the check (for updates)"),
});

export type CheckNameAvailabilityInput = z.infer<typeof checkNameAvailabilitySchema>;
