import { protectedProcedure } from "../../index";
import {
  comparePhotosHandler,
  createPhotoHandler,
  deletePhotoHandler,
  getByIdHandler,
  linkMeasurementHandler,
  listPhotosHandler,
  timelineHandler,
  unlinkMeasurementHandler,
  updatePhotoHandler,
} from "./handlers";
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
import z from "zod";

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * List all progress photos for the authenticated user
 */
export const listRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos",
    summary: "List progress photos",
    description:
      "Retrieves all progress photos for the authenticated user with optional filtering by pose type and date range",
    tags: ["Progress Photos"],
  })
  .input(listPhotosSchema)
  .output(z.array(photoOutputSchema))
  .handler(async ({ input, context }) => {
    return listPhotosHandler(input, context);
  });

/**
 * Get a single progress photo by ID
 */
export const getByIdRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos/{id}",
    summary: "Get progress photo by ID",
    description: "Retrieves a single progress photo with linked body measurement data if available",
    tags: ["Progress Photos"],
  })
  .input(getByIdSchema)
  .output(photoWithMeasurementSchema)
  .handler(async ({ input, context }) => {
    return getByIdHandler(input, context);
  });

/**
 * Create a new progress photo record
 */
export const createRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/progress-photos",
    summary: "Create progress photo",
    description:
      "Creates a new progress photo record. The photo should already be uploaded and the URL provided.",
    tags: ["Progress Photos"],
  })
  .input(createPhotoSchema)
  .output(photoOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return createPhotoHandler(input, context);
  });

/**
 * Update a progress photo's metadata
 */
export const updateRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/progress-photos/{id}",
    summary: "Update progress photo",
    description:
      "Updates a progress photo's metadata including notes, pose type, and privacy setting",
    tags: ["Progress Photos"],
  })
  .input(updatePhotoSchema)
  .output(photoOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return updatePhotoHandler(input, context);
  });

/**
 * Delete a progress photo
 */
export const deleteRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/progress-photos/{id}",
    summary: "Delete progress photo",
    description: "Deletes a progress photo record. Only the owner can delete their photos.",
    tags: ["Progress Photos"],
  })
  .input(deletePhotoSchema)
  .output(deleteResultSchema)
  .handler(async ({ input, context }) => {
    return deletePhotoHandler(input, context);
  });

/**
 * Link a progress photo to a body measurement
 */
export const linkMeasurementRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/progress-photos/{id}/link-measurement",
    summary: "Link photo to body measurement",
    description:
      "Links a progress photo to a body measurement for correlation. Both must belong to the same user.",
    tags: ["Progress Photos"],
  })
  .input(linkMeasurementSchema)
  .output(photoWithMeasurementSchema)
  .handler(async ({ input, context }) => {
    return linkMeasurementHandler(input, context);
  });

/**
 * Remove the body measurement link from a progress photo
 */
export const unlinkMeasurementRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/progress-photos/{id}/unlink-measurement",
    summary: "Unlink photo from body measurement",
    description: "Removes the body measurement link from a progress photo",
    tags: ["Progress Photos"],
  })
  .input(unlinkMeasurementSchema)
  .output(photoOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return unlinkMeasurementHandler(input, context);
  });

/**
 * Compare two progress photos side by side
 */
export const compareRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos/compare",
    summary: "Compare two progress photos",
    description:
      "Retrieves two progress photos with their linked measurement data for side-by-side comparison",
    tags: ["Progress Photos"],
  })
  .input(comparePhotosSchema)
  .output(compareOutputSchema)
  .handler(async ({ input, context }) => {
    return comparePhotosHandler(input, context);
  });

/**
 * Get photos grouped by month for timeline view
 */
export const timelineRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/progress-photos/timeline",
    summary: "Get progress photos timeline",
    description:
      "Retrieves progress photos grouped by month for displaying a timeline view of progress",
    tags: ["Progress Photos"],
  })
  .input(timelineInputSchema)
  .output(timelineOutputSchema)
  .handler(async ({ input, context }) => {
    return timelineHandler(input, context);
  });
