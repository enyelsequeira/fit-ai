import z from "zod";

import { protectedProcedure } from "../../index";
import {
  compareOutputSchema,
  comparePhotosSchema,
  createPhotoSchema,
  deletePhotoSchema,
  deleteResultSchema,
  getByIdSchema,
  linkMeasurementSchema,
  listPhotosSchema,
  photoOutputSchema,
  photoWithMeasurementSchema,
  timelineInputSchema,
  timelineOutputSchema,
  unlinkMeasurementSchema,
  updatePhotoSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * List all progress photos for the authenticated user
 */
export const listRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos",
    summary: "List progress photos",
    description:
      "Retrieves all progress photos for the authenticated user with optional filtering by pose type and date range",
    tags: ["Progress Photos"],
  })
  .input(listPhotosSchema)
  .output(z.array(photoOutputSchema));

/**
 * Get a single progress photo by ID
 */
export const getByIdRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos/{id}",
    summary: "Get progress photo by ID",
    description: "Retrieves a single progress photo with linked body measurement data if available",
    tags: ["Progress Photos"],
  })
  .input(getByIdSchema)
  .output(photoWithMeasurementSchema);

/**
 * Create a new progress photo record
 */
export const createRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/progress-photos",
    summary: "Create progress photo",
    description:
      "Creates a new progress photo record. The photo should already be uploaded and the URL provided.",
    tags: ["Progress Photos"],
  })
  .input(createPhotoSchema)
  .output(photoOutputSchema.optional());

/**
 * Update a progress photo's metadata
 */
export const updateRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/progress-photos/{id}",
    summary: "Update progress photo",
    description:
      "Updates a progress photo's metadata including notes, pose type, and privacy setting",
    tags: ["Progress Photos"],
  })
  .input(updatePhotoSchema)
  .output(photoOutputSchema.optional());

/**
 * Delete a progress photo
 */
export const deleteRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/progress-photos/{id}",
    summary: "Delete progress photo",
    description: "Deletes a progress photo record. Only the owner can delete their photos.",
    tags: ["Progress Photos"],
  })
  .input(deletePhotoSchema)
  .output(deleteResultSchema);

/**
 * Link a progress photo to a body measurement
 */
export const linkMeasurementRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/progress-photos/{id}/link-measurement",
    summary: "Link photo to body measurement",
    description:
      "Links a progress photo to a body measurement for correlation. Both must belong to the same user.",
    tags: ["Progress Photos"],
  })
  .input(linkMeasurementSchema)
  .output(photoWithMeasurementSchema);

/**
 * Remove the body measurement link from a progress photo
 */
export const unlinkMeasurementRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/progress-photos/{id}/unlink-measurement",
    summary: "Unlink photo from body measurement",
    description: "Removes the body measurement link from a progress photo",
    tags: ["Progress Photos"],
  })
  .input(unlinkMeasurementSchema)
  .output(photoOutputSchema.optional());

/**
 * Compare two progress photos side by side
 */
export const compareRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos/compare",
    summary: "Compare two progress photos",
    description:
      "Retrieves two progress photos with their linked measurement data for side-by-side comparison",
    tags: ["Progress Photos"],
  })
  .input(comparePhotosSchema)
  .output(compareOutputSchema);

/**
 * Get photos grouped by month for timeline view
 */
export const timelineRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos/timeline",
    summary: "Get progress photos timeline",
    description:
      "Retrieves progress photos grouped by month for displaying a timeline view of progress",
    tags: ["Progress Photos"],
  })
  .input(timelineInputSchema)
  .output(timelineOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type ListRouteHandler = Parameters<typeof listRouteContract.handler>[0];
export type GetByIdRouteHandler = Parameters<typeof getByIdRouteContract.handler>[0];
export type CreateRouteHandler = Parameters<typeof createRouteContract.handler>[0];
export type UpdateRouteHandler = Parameters<typeof updateRouteContract.handler>[0];
export type DeleteRouteHandler = Parameters<typeof deleteRouteContract.handler>[0];
export type LinkMeasurementRouteHandler = Parameters<
  typeof linkMeasurementRouteContract.handler
>[0];
export type UnlinkMeasurementRouteHandler = Parameters<
  typeof unlinkMeasurementRouteContract.handler
>[0];
export type CompareRouteHandler = Parameters<typeof compareRouteContract.handler>[0];
export type TimelineRouteHandler = Parameters<typeof timelineRouteContract.handler>[0];
