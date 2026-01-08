import z from "zod";

import { protectedProcedure } from "../../index";
import {
  bodyMeasurementListOutputSchema,
  bodyMeasurementOutputSchema,
  createBodyMeasurementSchema,
  deleteBodyMeasurementSchema,
  deleteResultSchema,
  getByIdSchema,
  getTrendsSchema,
  listBodyMeasurementsSchema,
  trendsOutputSchema,
  updateBodyMeasurementSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * List body measurements with pagination and filtering
 */
export const listRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements",
    summary: "List body measurements",
    description:
      "Retrieves a paginated list of body measurements for the authenticated user with optional date range filtering",
    tags: ["Body Measurements"],
  })
  .input(listBodyMeasurementsSchema)
  .output(bodyMeasurementListOutputSchema);

/**
 * Get a single body measurement by ID
 */
export const getByIdRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements/{id}",
    summary: "Get body measurement by ID",
    description: "Retrieves a single body measurement. Only the owner can access.",
    tags: ["Body Measurements"],
  })
  .input(getByIdSchema)
  .output(bodyMeasurementOutputSchema);

/**
 * Get the latest body measurement
 */
export const getLatestRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements/latest",
    summary: "Get latest body measurement",
    description: "Retrieves the most recent body measurement for the authenticated user",
    tags: ["Body Measurements"],
  })
  .input(z.object({}).optional())
  .output(bodyMeasurementOutputSchema.nullable());

/**
 * Get body measurement trends
 */
export const getTrendsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements/trends",
    summary: "Get body measurement trends",
    description: "Retrieves weight and body fat percentage trends over a specified time period",
    tags: ["Body Measurements"],
  })
  .input(getTrendsSchema)
  .output(trendsOutputSchema);

/**
 * Create a new body measurement
 */
export const createRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/body-measurements",
    summary: "Create body measurement",
    description: "Creates a new body measurement record for the authenticated user",
    tags: ["Body Measurements"],
  })
  .input(createBodyMeasurementSchema)
  .output(bodyMeasurementOutputSchema.optional());

/**
 * Update a body measurement
 */
export const updateRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/body-measurements/{id}",
    summary: "Update body measurement",
    description: "Updates an existing body measurement. Only the owner can update.",
    tags: ["Body Measurements"],
  })
  .input(updateBodyMeasurementSchema)
  .output(bodyMeasurementOutputSchema.optional());

/**
 * Delete a body measurement
 */
export const deleteRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/body-measurements/{id}",
    summary: "Delete body measurement",
    description: "Deletes a body measurement record. Only the owner can delete.",
    tags: ["Body Measurements"],
  })
  .input(deleteBodyMeasurementSchema)
  .output(deleteResultSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type ListRouteHandler = Parameters<typeof listRouteContract.handler>[0];
export type GetByIdRouteHandler = Parameters<typeof getByIdRouteContract.handler>[0];
export type GetLatestRouteHandler = Parameters<typeof getLatestRouteContract.handler>[0];
export type GetTrendsRouteHandler = Parameters<typeof getTrendsRouteContract.handler>[0];
export type CreateRouteHandler = Parameters<typeof createRouteContract.handler>[0];
export type UpdateRouteHandler = Parameters<typeof updateRouteContract.handler>[0];
export type DeleteRouteHandler = Parameters<typeof deleteRouteContract.handler>[0];
