import z from "zod";

import { protectedProcedure, publicProcedure } from "../../index";
import {
  checkNameAvailabilitySchema,
  createExerciseSchema,
  deleteExerciseSchema,
  deleteResultSchema,
  exerciseOutputSchema,
  getExerciseByIdSchema,
  listExercisesSchema,
  nameAvailabilityResultSchema,
  paginatedExerciseListOutputSchema,
  updateExerciseSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * List all exercises with optional filtering
 * Returns default exercises and optionally user's custom exercises
 */
export const listRouteContract = publicProcedure
  .route({
    method: "GET",
    path: "/exercises",
    summary: "List exercises",
    description:
      "Retrieves a list of exercises with optional filtering by category, type, muscle group, and more",
    tags: ["Exercises"],
  })
  .input(listExercisesSchema)
  .output(paginatedExerciseListOutputSchema);

/**
 * Get a single exercise by ID
 */
export const getByIdRouteContract = publicProcedure
  .route({
    method: "GET",
    path: "/exercises/{id}",
    summary: "Get exercise by ID",
    description: "Retrieves a single exercise by its unique identifier",
    tags: ["Exercises"],
  })
  .input(getExerciseByIdSchema)
  .output(exerciseOutputSchema);

/**
 * Create a new custom exercise (requires authentication)
 */
export const createRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/exercises",
    summary: "Create exercise",
    description: "Creates a new custom exercise. Requires authentication.",
    tags: ["Exercises"],
  })
  .input(createExerciseSchema)
  .output(exerciseOutputSchema.optional());

/**
 * Update a custom exercise (only owner can update)
 */
export const updateRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/exercises/{id}",
    summary: "Update exercise",
    description: "Updates a custom exercise. Only the owner can update their exercises.",
    tags: ["Exercises"],
  })
  .input(updateExerciseSchema)
  .output(exerciseOutputSchema.optional());

/**
 * Delete a custom exercise (only owner can delete)
 * Cannot delete if exercise is used in workouts
 */
export const deleteRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/exercises/{id}",
    summary: "Delete exercise",
    description:
      "Deletes a custom exercise. Only the owner can delete. Cannot delete exercises used in workouts.",
    tags: ["Exercises"],
  })
  .input(deleteExerciseSchema)
  .output(deleteResultSchema);

/**
 * Get all unique equipment types from exercises
 */
export const getEquipmentListRouteContract = publicProcedure
  .route({
    method: "GET",
    path: "/exercises/equipment",
    summary: "Get equipment list",
    description: "Retrieves a list of all unique equipment types used in exercises",
    tags: ["Exercises"],
  })
  .output(z.array(z.string()).describe("List of unique equipment types"));

/**
 * Get all unique muscle groups from exercises
 */
export const getMuscleGroupsRouteContract = publicProcedure
  .route({
    method: "GET",
    path: "/exercises/muscle-groups",
    summary: "Get muscle groups",
    description: "Retrieves a list of all unique muscle groups from exercises",
    tags: ["Exercises"],
  })
  .output(z.array(z.string()).describe("List of unique muscle groups"));

/**
 * Check if an exercise name is available (not a duplicate)
 */
export const checkNameAvailabilityRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/exercises/check-name",
    summary: "Check exercise name availability",
    description:
      "Checks if an exercise name is available (not already used by default exercises or user's custom exercises)",
    tags: ["Exercises"],
  })
  .input(checkNameAvailabilitySchema)
  .output(nameAvailabilityResultSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type ListRouteHandler = Parameters<typeof listRouteContract.handler>[0];
export type GetByIdRouteHandler = Parameters<typeof getByIdRouteContract.handler>[0];
export type CreateRouteHandler = Parameters<typeof createRouteContract.handler>[0];
export type UpdateRouteHandler = Parameters<typeof updateRouteContract.handler>[0];
export type DeleteRouteHandler = Parameters<typeof deleteRouteContract.handler>[0];
export type GetEquipmentListRouteHandler = Parameters<
  typeof getEquipmentListRouteContract.handler
>[0];
export type GetMuscleGroupsRouteHandler = Parameters<
  typeof getMuscleGroupsRouteContract.handler
>[0];
export type CheckNameAvailabilityRouteHandler = Parameters<
  typeof checkNameAvailabilityRouteContract.handler
>[0];
