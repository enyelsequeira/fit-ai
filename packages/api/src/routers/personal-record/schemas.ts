import {
  insertPersonalRecordSchema,
  recordTypeSchema,
  selectPersonalRecordSchema,
  updatePersonalRecordSchema as dbUpdatePersonalRecordSchema,
} from "@fit-ai/db/schema/personal-record";
import z from "zod";

// ============================================================================
// Re-export schemas from DB package
// ============================================================================

// Re-export enum schema
export { recordTypeSchema };

export type RecordTypeInput = z.infer<typeof recordTypeSchema>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Personal record output schema (from DB select schema)
 */
export const personalRecordOutputSchema = selectPersonalRecordSchema;

export type PersonalRecordOutput = z.infer<typeof personalRecordOutputSchema>;

/**
 * Personal record with exercise details
 */
export const personalRecordWithExerciseSchema = personalRecordOutputSchema.extend({
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

export type PersonalRecordWithExercise = z.infer<typeof personalRecordWithExerciseSchema>;

/**
 * Paginated personal records list output
 */
export const personalRecordListOutputSchema = z.object({
  records: z.array(personalRecordWithExerciseSchema).describe("List of personal records"),
  total: z.number().describe("Total number of records matching the filter"),
  limit: z.number().describe("Number of results per page"),
  offset: z.number().describe("Offset for pagination"),
});

export type PersonalRecordListOutput = z.infer<typeof personalRecordListOutputSchema>;

/**
 * Personal record summary output
 */
export const personalRecordSummaryOutputSchema = z.object({
  totalRecords: z.number().describe("Total number of personal records"),
  countByType: z.record(z.string(), z.number()).describe("Count of records by type"),
  recentRecords: z.array(personalRecordWithExerciseSchema).describe("Recently achieved records"),
  exercisesWithRecords: z.number().describe("Number of exercises with at least one PR"),
});

export type PersonalRecordSummaryOutput = z.infer<typeof personalRecordSummaryOutputSchema>;

/**
 * Calculated PRs output from workout
 */
export const calculatedPRsOutputSchema = z.object({
  newRecords: z.array(personalRecordWithExerciseSchema).describe("Newly achieved personal records"),
  totalChecked: z.number().describe("Total number of sets checked for PRs"),
});

export type CalculatedPRsOutput = z.infer<typeof calculatedPRsOutputSchema>;

/**
 * Delete result schema
 */
export const deleteResultSchema = z.object({
  success: z.boolean().describe("Whether deletion was successful"),
});

export type DeleteResult = z.infer<typeof deleteResultSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * List personal records input
 */
export const listPersonalRecordsSchema = z.object({
  exerciseId: z.coerce.number().optional().describe("Filter by exercise ID"),
  recordType: recordTypeSchema.optional().describe("Filter by record type"),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe("Maximum number of results"),
  offset: z.coerce.number().int().min(0).default(0).describe("Number of results to skip"),
});

export type ListPersonalRecordsInput = z.infer<typeof listPersonalRecordsSchema>;

/**
 * Get recent personal records input
 */
export const getRecentPersonalRecordsSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30).describe("Number of days to look back"),
  limit: z.coerce.number().int().min(1).max(50).default(10).describe("Maximum number of results"),
});

export type GetRecentPersonalRecordsInput = z.infer<typeof getRecentPersonalRecordsSchema>;

/**
 * Get by exercise ID input
 */
export const getByExerciseSchema = z.object({
  exerciseId: z.coerce.number().describe("The exercise ID"),
});

export type GetByExerciseInput = z.infer<typeof getByExerciseSchema>;

/**
 * Get by ID input
 */
export const getByIdSchema = z.object({
  id: z.coerce.number().describe("The personal record ID"),
});

export type GetByIdInput = z.infer<typeof getByIdSchema>;

/**
 * Create personal record input (from DB insert schema)
 */
export const createPersonalRecordSchema = insertPersonalRecordSchema;

export type CreatePersonalRecordInput = z.infer<typeof createPersonalRecordSchema>;

/**
 * Update personal record input (from DB update schema)
 */
export const updatePersonalRecordSchema = dbUpdatePersonalRecordSchema;

export type UpdatePersonalRecordInput = z.infer<typeof updatePersonalRecordSchema>;

/**
 * Delete personal record input
 */
export const deletePersonalRecordSchema = z.object({
  id: z.coerce.number().describe("ID of the personal record to delete"),
});

export type DeletePersonalRecordInput = z.infer<typeof deletePersonalRecordSchema>;

/**
 * Calculate PRs from workout input
 */
export const calculatePRsSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout to calculate PRs from"),
});

export type CalculatePRsInput = z.infer<typeof calculatePRsSchema>;
