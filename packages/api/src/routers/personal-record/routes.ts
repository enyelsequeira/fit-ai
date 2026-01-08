import z from "zod";

import { protectedProcedure } from "../../index";
import {
  calculatePRsHandler,
  createPersonalRecordHandler,
  deletePersonalRecordHandler,
  getByExerciseHandler,
  getByIdHandler,
  getRecentPersonalRecordsHandler,
  getSummaryHandler,
  listPersonalRecordsHandler,
  updatePersonalRecordHandler,
} from "./handlers";
import {
  calculatedPRsOutputSchema,
  calculatePRsSchema,
  createPersonalRecordSchema,
  deletePersonalRecordSchema,
  deleteResultSchema,
  getByExerciseSchema,
  getByIdSchema,
  getRecentPersonalRecordsSchema,
  listPersonalRecordsSchema,
  personalRecordListOutputSchema,
  personalRecordOutputSchema,
  personalRecordSummaryOutputSchema,
  personalRecordWithExerciseSchema,
  updatePersonalRecordSchema,
} from "./schemas";

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * List user's personal records with pagination and filtering
 */
export const listRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records",
    summary: "List personal records",
    description:
      "Retrieves a paginated list of the authenticated user's personal records with optional filtering by exercise and record type",
    tags: ["Personal Records"],
  })
  .input(listPersonalRecordsSchema)
  .output(personalRecordListOutputSchema)
  .handler(async ({ input, context }) => {
    return listPersonalRecordsHandler(input, context);
  });

/**
 * Get recently achieved personal records
 */
export const getRecentRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/recent",
    summary: "Get recent personal records",
    description: "Retrieves recently achieved personal records within a specified number of days",
    tags: ["Personal Records"],
  })
  .input(getRecentPersonalRecordsSchema)
  .output(z.array(personalRecordWithExerciseSchema))
  .handler(async ({ input, context }) => {
    return getRecentPersonalRecordsHandler(input, context);
  });

/**
 * Get all personal records for a specific exercise
 */
export const getByExerciseRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/exercise/{exerciseId}",
    summary: "Get personal records by exercise",
    description: "Retrieves all personal records for a specific exercise",
    tags: ["Personal Records"],
  })
  .input(getByExerciseSchema)
  .output(z.array(personalRecordOutputSchema))
  .handler(async ({ input, context }) => {
    return getByExerciseHandler(input, context);
  });

/**
 * Get personal record summary statistics
 */
export const getSummaryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/summary",
    summary: "Get personal records summary",
    description:
      "Retrieves a summary of personal records including count by type and recent achievements",
    tags: ["Personal Records"],
  })
  .output(personalRecordSummaryOutputSchema)
  .handler(async ({ context }) => {
    return getSummaryHandler(context);
  });

/**
 * Create a new personal record manually
 */
export const createRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/personal-records",
    summary: "Create personal record",
    description: "Manually creates a new personal record for an exercise",
    tags: ["Personal Records"],
  })
  .input(createPersonalRecordSchema)
  .output(personalRecordOutputSchema)
  .handler(async ({ input, context }) => {
    return createPersonalRecordHandler(input, context);
  });

/**
 * Get a single personal record by ID
 */
export const getByIdRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/{id}",
    summary: "Get personal record by ID",
    description: "Retrieves a single personal record by its unique identifier",
    tags: ["Personal Records"],
  })
  .input(getByIdSchema)
  .output(personalRecordWithExerciseSchema)
  .handler(async ({ input, context }) => {
    return getByIdHandler(input, context);
  });

/**
 * Update a personal record (notes, displayUnit only)
 */
export const updateRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/personal-records/{id}",
    summary: "Update personal record",
    description: "Updates personal record metadata (notes, display unit). Cannot modify the value.",
    tags: ["Personal Records"],
  })
  .input(updatePersonalRecordSchema)
  .output(personalRecordOutputSchema)
  .handler(async ({ input, context }) => {
    return updatePersonalRecordHandler(input, context);
  });

/**
 * Delete a personal record
 */
export const deleteRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/personal-records/{id}",
    summary: "Delete personal record",
    description: "Deletes a personal record. Only the owner can delete.",
    tags: ["Personal Records"],
  })
  .input(deletePersonalRecordSchema)
  .output(deleteResultSchema)
  .handler(async ({ input, context }) => {
    return deletePersonalRecordHandler(input, context);
  });

/**
 * Calculate personal records from a completed workout
 * This should be called after a workout is completed to automatically detect new PRs
 */
export const calculateRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/personal-records/calculate",
    summary: "Calculate PRs from workout",
    description:
      "Calculates and creates personal records from a completed workout. Checks each set for potential PRs including 1RM, max weight, max reps, and max volume.",
    tags: ["Personal Records"],
  })
  .input(calculatePRsSchema)
  .output(calculatedPRsOutputSchema)
  .handler(async ({ input, context }) => {
    return calculatePRsHandler(input, context);
  });
