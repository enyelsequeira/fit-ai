import {
  insertProgressPhotoSchema,
  poseTypeSchema,
  selectProgressPhotoSchema,
  updateProgressPhotoSchema as dbUpdateProgressPhotoSchema,
} from "@fit-ai/db/schema/progress-photo";
import z from "zod";

// ============================================================================
// Re-export schemas from DB package
// ============================================================================

// Re-export enum schema
export { poseTypeSchema };

export type PoseTypeInput = z.infer<typeof poseTypeSchema>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Output schema for a single progress photo (from DB select schema)
 */
export const photoOutputSchema = selectProgressPhotoSchema;

export type PhotoOutput = z.infer<typeof photoOutputSchema>;

/**
 * Output schema for photo with linked measurement data
 */
export const photoWithMeasurementSchema = photoOutputSchema.extend({
  bodyMeasurement: z
    .object({
      id: z.number().describe("Measurement ID"),
      measuredAt: z.date().describe("When measurement was taken"),
      weight: z.number().nullable().describe("Body weight"),
      weightUnit: z.enum(["kg", "lb"]).nullable().describe("Weight unit"),
      bodyFatPercentage: z.number().nullable().describe("Body fat percentage"),
    })
    .nullable()
    .describe("Linked body measurement data"),
});

export type PhotoWithMeasurement = z.infer<typeof photoWithMeasurementSchema>;

/**
 * Compare photos output schema
 */
export const compareOutputSchema = z.object({
  photo1: photoWithMeasurementSchema.describe("First photo with measurement data"),
  photo2: photoWithMeasurementSchema.describe("Second photo with measurement data"),
  daysBetween: z.number().describe("Number of days between the two photos"),
});

export type CompareOutput = z.infer<typeof compareOutputSchema>;

/**
 * Timeline group output schema
 */
export const timelineGroupSchema = z.object({
  yearMonth: z.string().describe("Year and month in YYYY-MM format"),
  photos: z.array(photoOutputSchema).describe("Photos in this month"),
  count: z.number().describe("Number of photos in this month"),
});

export type TimelineGroup = z.infer<typeof timelineGroupSchema>;

/**
 * Timeline output schema
 */
export const timelineOutputSchema = z.object({
  groups: z.array(timelineGroupSchema).describe("Photos grouped by month"),
  totalCount: z.number().describe("Total number of photos"),
});

export type TimelineOutput = z.infer<typeof timelineOutputSchema>;

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
 * List photos input schema
 */
export const listPhotosSchema = z.object({
  poseType: poseTypeSchema.optional().describe("Filter by pose type"),
  startDate: z.coerce.date().optional().describe("Filter photos taken on or after this date"),
  endDate: z.coerce.date().optional().describe("Filter photos taken on or before this date"),
  limit: z.number().min(1).max(100).default(50).describe("Maximum number of results"),
  offset: z.number().min(0).default(0).describe("Number of results to skip"),
});

export type ListPhotosInput = z.infer<typeof listPhotosSchema>;

/**
 * Get by ID input schema
 */
export const getByIdSchema = z.object({
  id: z.coerce.number().describe("ID of the progress photo"),
});

export type GetByIdInput = z.infer<typeof getByIdSchema>;

/**
 * Create photo input schema (from DB insert schema)
 */
export const createPhotoSchema = insertProgressPhotoSchema;

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;

/**
 * Update photo input schema (from DB update schema)
 */
export const updatePhotoSchema = dbUpdateProgressPhotoSchema;

export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;

/**
 * Delete photo input schema
 */
export const deletePhotoSchema = z.object({
  id: z.coerce.number().describe("ID of the photo to delete"),
});

export type DeletePhotoInput = z.infer<typeof deletePhotoSchema>;

/**
 * Link measurement input schema
 */
export const linkMeasurementSchema = z.object({
  id: z.coerce.number().describe("ID of the photo"),
  bodyMeasurementId: z.number().describe("ID of the body measurement to link"),
});

export type LinkMeasurementInput = z.infer<typeof linkMeasurementSchema>;

/**
 * Unlink measurement input schema
 */
export const unlinkMeasurementSchema = z.object({
  id: z.coerce.number().describe("ID of the photo"),
});

export type UnlinkMeasurementInput = z.infer<typeof unlinkMeasurementSchema>;

/**
 * Compare photos input schema
 */
export const comparePhotosSchema = z.object({
  photoId1: z.coerce.number().describe("ID of the first photo"),
  photoId2: z.coerce.number().describe("ID of the second photo"),
});

export type ComparePhotosInput = z.infer<typeof comparePhotosSchema>;

/**
 * Timeline input schema
 */
export const timelineInputSchema = z.object({
  limit: z.number().min(1).max(500).default(100).describe("Maximum total photos to retrieve"),
});

export type TimelineInput = z.infer<typeof timelineInputSchema>;
