import z from "zod";

import { protectedProcedure } from "../../index";
import {
  createBodyMeasurementHandler,
  deleteBodyMeasurementHandler,
  getByIdHandler,
  getLatestHandler,
  getTrendsHandler,
  listBodyMeasurementsHandler,
  updateBodyMeasurementHandler,
} from "./handlers";
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
// Route Definitions
// ============================================================================

export const listRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements",
    summary: "List body measurements",
    description:
      "Retrieves a paginated list of body measurements for the authenticated user with optional date range filtering",
    tags: ["Body Measurements"],
  })
  .input(listBodyMeasurementsSchema)
  .output(bodyMeasurementListOutputSchema)
  .handler(async ({ input, context }) => listBodyMeasurementsHandler(input, context));

export const getByIdRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements/{id}",
    summary: "Get body measurement by ID",
    description: "Retrieves a single body measurement. Only the owner can access.",
    tags: ["Body Measurements"],
  })
  .input(getByIdSchema)
  .output(bodyMeasurementOutputSchema)
  .handler(async ({ input, context }) => getByIdHandler(input, context));

export const getLatestRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements/latest",
    summary: "Get latest body measurement",
    description: "Retrieves the most recent body measurement for the authenticated user",
    tags: ["Body Measurements"],
  })
  .input(z.object({}).optional())
  .output(bodyMeasurementOutputSchema.nullable())
  .handler(async ({ context }) => getLatestHandler(context));

export const getTrendsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/body-measurements/trends",
    summary: "Get body measurement trends",
    description: "Retrieves weight and body fat percentage trends over a specified time period",
    tags: ["Body Measurements"],
  })
  .input(getTrendsSchema)
  .output(trendsOutputSchema)
  .handler(async ({ input, context }) => getTrendsHandler(input, context));

export const createRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/body-measurements",
    summary: "Create body measurement",
    description: "Creates a new body measurement record for the authenticated user",
    tags: ["Body Measurements"],
  })
  .input(createBodyMeasurementSchema)
  .output(bodyMeasurementOutputSchema.optional())
  .handler(async ({ input, context }) => createBodyMeasurementHandler(input, context));

export const updateRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/body-measurements/{id}",
    summary: "Update body measurement",
    description: "Updates an existing body measurement. Only the owner can update.",
    tags: ["Body Measurements"],
  })
  .input(updateBodyMeasurementSchema)
  .output(bodyMeasurementOutputSchema.optional())
  .handler(async ({ input, context }) => updateBodyMeasurementHandler(input, context));

export const deleteRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/body-measurements/{id}",
    summary: "Delete body measurement",
    description: "Deletes a body measurement record. Only the owner can delete.",
    tags: ["Body Measurements"],
  })
  .input(deleteBodyMeasurementSchema)
  .output(deleteResultSchema)
  .handler(async ({ input, context }) => deleteBodyMeasurementHandler(input, context));
