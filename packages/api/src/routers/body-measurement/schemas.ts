import {
  bodyWeightUnitSchema,
  insertBodyMeasurementSchema,
  lengthUnitSchema,
  selectBodyMeasurementSchema,
  updateBodyMeasurementSchema as dbUpdateBodyMeasurementSchema,
} from "@fit-ai/db/schema/body-measurement";
import z from "zod";

// ============================================================================
// Re-export schemas from DB package
// ============================================================================

// Re-export enum schemas
export { bodyWeightUnitSchema, lengthUnitSchema };

export type BodyWeightUnitInput = z.infer<typeof bodyWeightUnitSchema>;
export type LengthUnitInput = z.infer<typeof lengthUnitSchema>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Output schema for a single body measurement (from DB select schema)
 */
export const bodyMeasurementOutputSchema = selectBodyMeasurementSchema;

export type BodyMeasurementOutput = z.infer<typeof bodyMeasurementOutputSchema>;

/**
 * Paginated body measurement list output
 */
export const bodyMeasurementListOutputSchema = z.object({
  measurements: z.array(bodyMeasurementOutputSchema).describe("List of body measurements"),
  total: z.number().describe("Total number of measurements matching the filter"),
  limit: z.number().describe("Number of results per page"),
  offset: z.number().describe("Offset for pagination"),
});

export type BodyMeasurementListOutput = z.infer<typeof bodyMeasurementListOutputSchema>;

/**
 * Trend data point schema
 */
export const trendDataPointSchema = z.object({
  date: z.date().describe("Date of the measurement"),
  weight: z.number().nullable().describe("Weight at this date"),
  bodyFatPercentage: z.number().nullable().describe("Body fat percentage at this date"),
});

export type TrendDataPoint = z.infer<typeof trendDataPointSchema>;

/**
 * Trends output schema
 */
export const trendsOutputSchema = z.object({
  dataPoints: z.array(trendDataPointSchema).describe("Trend data points over time"),
  weightChange: z.number().nullable().describe("Total weight change over the period"),
  bodyFatChange: z.number().nullable().describe("Total body fat percentage change over the period"),
  startDate: z.date().nullable().describe("Start date of the data"),
  endDate: z.date().nullable().describe("End date of the data"),
  measurementCount: z.number().describe("Number of measurements in the period"),
});

export type TrendsOutput = z.infer<typeof trendsOutputSchema>;

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
 * List body measurements input schema
 */
export const listBodyMeasurementsSchema = z.object({
  startDate: z.coerce.date().optional().describe("Filter measurements from this date"),
  endDate: z.coerce.date().optional().describe("Filter measurements until this date"),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe("Maximum number of results"),
  offset: z.coerce.number().int().min(0).default(0).describe("Number of results to skip"),
});

export type ListBodyMeasurementsInput = z.infer<typeof listBodyMeasurementsSchema>;

/**
 * Get by ID input schema
 */
export const getByIdSchema = z.object({
  id: z.coerce.number().describe("ID of the body measurement"),
});

export type GetByIdInput = z.infer<typeof getByIdSchema>;

/**
 * Create body measurement input schema (from DB insert schema)
 */
export const createBodyMeasurementSchema = insertBodyMeasurementSchema;

export type CreateBodyMeasurementInput = z.infer<typeof createBodyMeasurementSchema>;

/**
 * Update body measurement input schema (from DB update schema)
 */
export const updateBodyMeasurementSchema = dbUpdateBodyMeasurementSchema;

export type UpdateBodyMeasurementInput = z.infer<typeof updateBodyMeasurementSchema>;

/**
 * Delete input schema
 */
export const deleteBodyMeasurementSchema = z.object({
  id: z.coerce.number().describe("ID of the measurement to delete"),
});

export type DeleteBodyMeasurementInput = z.infer<typeof deleteBodyMeasurementSchema>;

/**
 * Trends input schema
 */
export const getTrendsSchema = z.object({
  startDate: z.coerce.date().optional().describe("Start date for trends calculation"),
  endDate: z.coerce.date().optional().describe("End date for trends calculation"),
  period: z
    .enum(["week", "month", "quarter", "year", "all"])
    .default("month")
    .describe("Time period for trends"),
});

export type GetTrendsInput = z.infer<typeof getTrendsSchema>;
