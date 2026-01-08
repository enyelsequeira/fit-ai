import z from "zod";

import { protectedProcedure, publicProcedure } from "../../index";
import {
  checkNameAvailabilityHandler,
  createExerciseHandler,
  deleteExerciseHandler,
  getEquipmentListHandler,
  getExerciseByIdHandler,
  getMuscleGroupsHandler,
  listExercisesHandler,
  updateExerciseHandler,
} from "./handlers";
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
// Route Definitions
// ============================================================================

/**
 * List all exercises with optional filtering
 * Returns default exercises and optionally user's custom exercises
 */
export const listRoute = publicProcedure
  .route({
    method: "GET",
    path: "/exercises",
    summary: "List exercises",
    description:
      "Retrieves a list of exercises with optional filtering by category, type, muscle group, and more",
    tags: ["Exercises"],
  })
  .input(listExercisesSchema)
  .output(paginatedExerciseListOutputSchema)
  .handler(async ({ input, context }) => {
    return listExercisesHandler(input, context);
  });

/**
 * Get a single exercise by ID
 */
export const getByIdRoute = publicProcedure
  .route({
    method: "GET",
    path: "/exercises/{id}",
    summary: "Get exercise by ID",
    description: "Retrieves a single exercise by its unique identifier",
    tags: ["Exercises"],
  })
  .input(getExerciseByIdSchema)
  .output(exerciseOutputSchema)
  .handler(async ({ input, context }) => {
    return getExerciseByIdHandler(input, context);
  });

/**
 * Create a new custom exercise (requires authentication)
 */
export const createRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/exercises",
    summary: "Create exercise",
    description: "Creates a new custom exercise. Requires authentication.",
    tags: ["Exercises"],
  })
  .input(createExerciseSchema)
  .output(exerciseOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return createExerciseHandler(input, context);
  });

/**
 * Update a custom exercise (only owner can update)
 */
export const updateRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/exercises/{id}",
    summary: "Update exercise",
    description: "Updates a custom exercise. Only the owner can update their exercises.",
    tags: ["Exercises"],
  })
  .input(updateExerciseSchema)
  .output(exerciseOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return updateExerciseHandler(input, context);
  });

/**
 * Delete a custom exercise (only owner can delete)
 * Cannot delete if exercise is used in workouts
 */
export const deleteRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/exercises/{id}",
    summary: "Delete exercise",
    description:
      "Deletes a custom exercise. Only the owner can delete. Cannot delete exercises used in workouts.",
    tags: ["Exercises"],
  })
  .input(deleteExerciseSchema)
  .output(deleteResultSchema)
  .handler(async ({ input, context }) => {
    return deleteExerciseHandler(input, context);
  });

/**
 * Get all unique equipment types from exercises
 */
export const getEquipmentListRoute = publicProcedure
  .route({
    method: "GET",
    path: "/exercises/equipment",
    summary: "Get equipment list",
    description: "Retrieves a list of all unique equipment types used in exercises",
    tags: ["Exercises"],
  })
  .output(z.array(z.string()).describe("List of unique equipment types"))
  .handler(async () => {
    return getEquipmentListHandler();
  });

/**
 * Get all unique muscle groups from exercises
 */
export const getMuscleGroupsRoute = publicProcedure
  .route({
    method: "GET",
    path: "/exercises/muscle-groups",
    summary: "Get muscle groups",
    description: "Retrieves a list of all unique muscle groups from exercises",
    tags: ["Exercises"],
  })
  .output(z.array(z.string()).describe("List of unique muscle groups"))
  .handler(async () => {
    return getMuscleGroupsHandler();
  });

/**
 * Check if an exercise name is available (not a duplicate)
 */
export const checkNameAvailabilityRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/exercises/check-name",
    summary: "Check exercise name availability",
    description:
      "Checks if an exercise name is available (not already used by default exercises or user's custom exercises)",
    tags: ["Exercises"],
  })
  .input(checkNameAvailabilitySchema)
  .output(nameAvailabilityResultSchema)
  .handler(async ({ input, context }) => {
    return checkNameAvailabilityHandler(input, context);
  });
