import z from "zod";

import { protectedProcedure } from "../../index";
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
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * List user's personal records with pagination and filtering
 */
export const listRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records",
    summary: "List personal records",
    description:
      "Retrieves a paginated list of the authenticated user's personal records with optional filtering by exercise and record type",
    tags: ["Personal Records"],
  })
  .input(listPersonalRecordsSchema)
  .output(personalRecordListOutputSchema);

/**
 * Get recently achieved personal records
 */
export const getRecentRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/recent",
    summary: "Get recent personal records",
    description: "Retrieves recently achieved personal records within a specified number of days",
    tags: ["Personal Records"],
  })
  .input(getRecentPersonalRecordsSchema)
  .output(z.array(personalRecordWithExerciseSchema));

/**
 * Get all personal records for a specific exercise
 */
export const getByExerciseRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/exercise/{exerciseId}",
    summary: "Get personal records by exercise",
    description: "Retrieves all personal records for a specific exercise",
    tags: ["Personal Records"],
  })
  .input(getByExerciseSchema)
  .output(z.array(personalRecordOutputSchema));

/**
 * Get personal record summary statistics
 */
export const getSummaryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/summary",
    summary: "Get personal records summary",
    description:
      "Retrieves a summary of personal records including count by type and recent achievements",
    tags: ["Personal Records"],
  })
  .output(personalRecordSummaryOutputSchema);

/**
 * Create a new personal record manually
 */
export const createRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/personal-records",
    summary: "Create personal record",
    description: "Manually creates a new personal record for an exercise",
    tags: ["Personal Records"],
  })
  .input(createPersonalRecordSchema)
  .output(personalRecordOutputSchema);

/**
 * Get a single personal record by ID
 */
export const getByIdRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/personal-records/{id}",
    summary: "Get personal record by ID",
    description: "Retrieves a single personal record by its unique identifier",
    tags: ["Personal Records"],
  })
  .input(getByIdSchema)
  .output(personalRecordWithExerciseSchema);

/**
 * Update a personal record (notes, displayUnit only)
 */
export const updateRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/personal-records/{id}",
    summary: "Update personal record",
    description: "Updates personal record metadata (notes, display unit). Cannot modify the value.",
    tags: ["Personal Records"],
  })
  .input(updatePersonalRecordSchema)
  .output(personalRecordOutputSchema);

/**
 * Delete a personal record
 */
export const deleteRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/personal-records/{id}",
    summary: "Delete personal record",
    description: "Deletes a personal record. Only the owner can delete.",
    tags: ["Personal Records"],
  })
  .input(deletePersonalRecordSchema)
  .output(deleteResultSchema);

/**
 * Calculate personal records from a completed workout
 * This should be called after a workout is completed to automatically detect new PRs
 */
export const calculateRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/personal-records/calculate",
    summary: "Calculate PRs from workout",
    description:
      "Calculates and creates personal records from a completed workout. Checks each set for potential PRs including 1RM, max weight, max reps, and max volume.",
    tags: ["Personal Records"],
  })
  .input(calculatePRsSchema)
  .output(calculatedPRsOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type ListRouteHandler = Parameters<typeof listRouteContract.handler>[0];
export type GetRecentRouteHandler = Parameters<typeof getRecentRouteContract.handler>[0];
export type GetByExerciseRouteHandler = Parameters<typeof getByExerciseRouteContract.handler>[0];
export type GetSummaryRouteHandler = Parameters<typeof getSummaryRouteContract.handler>[0];
export type CreateRouteHandler = Parameters<typeof createRouteContract.handler>[0];
export type GetByIdRouteHandler = Parameters<typeof getByIdRouteContract.handler>[0];
export type UpdateRouteHandler = Parameters<typeof updateRouteContract.handler>[0];
export type DeleteRouteHandler = Parameters<typeof deleteRouteContract.handler>[0];
export type CalculateRouteHandler = Parameters<typeof calculateRouteContract.handler>[0];
