import { protectedProcedure } from "../../index";
import {
  addExerciseSchema,
  addSetSchema,
  completeSetSchema,
  completeWorkoutSchema,
  createWorkoutSchema,
  deleteSetSchema,
  deleteWorkoutSchema,
  exerciseSetOutputSchema,
  getWorkoutByIdSchema,
  listWorkoutsSchema,
  removeExerciseSchema,
  reorderExercisesSchema,
  successResultSchema,
  updateSetSchema,
  updateWorkoutExerciseSchema,
  updateWorkoutSchema,
  workoutExerciseOutputSchema,
  workoutFullOutputSchema,
  workoutListOutputSchema,
  workoutOutputSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

// ============================================================================
// Workout Session Route Contracts
// ============================================================================

/**
 * List user's workouts with pagination and date filtering
 */
export const listRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/workouts",
    summary: "List workouts",
    description:
      "Retrieves a paginated list of the authenticated user's workouts with optional date range filtering",
    tags: ["Workouts"],
  })
  .input(listWorkoutsSchema)
  .output(workoutListOutputSchema);

/**
 * Get a single workout with all exercises and sets
 */
export const getByIdRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/workouts/{workoutId}",
    summary: "Get workout by ID",
    description:
      "Retrieves a single workout with all its exercises and sets. Only the owner can access.",
    tags: ["Workouts"],
  })
  .input(getWorkoutByIdSchema)
  .output(workoutFullOutputSchema);

/**
 * Create a new workout (optionally from a template)
 */
export const createRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts",
    summary: "Create workout",
    description:
      "Creates a new workout session. Optionally, create from a template to pre-populate exercises.",
    tags: ["Workouts"],
  })
  .input(createWorkoutSchema)
  .output(workoutFullOutputSchema);

/**
 * Update a workout (name, notes)
 */
export const updateRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}",
    summary: "Update workout",
    description: "Updates workout name and/or notes. Only the owner can update.",
    tags: ["Workouts"],
  })
  .input(updateWorkoutSchema)
  .output(workoutOutputSchema);

/**
 * Delete a workout
 */
export const deleteRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/workouts/{workoutId}",
    summary: "Delete workout",
    description: "Deletes a workout and all its exercises and sets. Only the owner can delete.",
    tags: ["Workouts"],
  })
  .input(deleteWorkoutSchema)
  .output(successResultSchema);

/**
 * Mark a workout as completed
 */
export const completeRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/complete",
    summary: "Complete workout",
    description:
      "Marks a workout as completed with optional rating and mood feedback. Sets completedAt timestamp.",
    tags: ["Workouts"],
  })
  .input(completeWorkoutSchema)
  .output(workoutOutputSchema);

// ============================================================================
// Workout Exercise Route Contracts
// ============================================================================

/**
 * Add an exercise to a workout
 */
export const addExerciseRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/exercises",
    summary: "Add exercise to workout",
    description: "Adds an exercise to the workout. Order is auto-assigned if not provided.",
    tags: ["Workouts"],
  })
  .input(addExerciseSchema)
  .output(workoutExerciseOutputSchema);

/**
 * Update a workout exercise
 */
export const updateExerciseRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}/exercises/{workoutExerciseId}",
    summary: "Update workout exercise",
    description: "Updates notes or superset grouping for a workout exercise.",
    tags: ["Workouts"],
  })
  .input(updateWorkoutExerciseSchema)
  .output(workoutExerciseOutputSchema);

/**
 * Remove an exercise from a workout
 */
export const removeExerciseRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/workouts/{workoutId}/exercises/{workoutExerciseId}",
    summary: "Remove exercise from workout",
    description: "Removes an exercise and all its sets from the workout.",
    tags: ["Workouts"],
  })
  .input(removeExerciseSchema)
  .output(successResultSchema);

/**
 * Reorder exercises in a workout
 */
export const reorderExercisesRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}/exercises/reorder",
    summary: "Reorder exercises",
    description: "Reorders exercises within a workout by specifying new positions.",
    tags: ["Workouts"],
  })
  .input(reorderExercisesSchema)
  .output(successResultSchema);

// ============================================================================
// Set Route Contracts
// ============================================================================

/**
 * Add a set to a workout exercise
 */
export const addSetRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/exercises/{workoutExerciseId}/sets",
    summary: "Add set to exercise",
    description:
      "Adds a new set to a workout exercise. Supports strength, cardio, and flexibility data.",
    tags: ["Workouts"],
  })
  .input(addSetSchema)
  .output(exerciseSetOutputSchema);

/**
 * Update a set
 */
export const updateSetRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}/sets/{setId}",
    summary: "Update set",
    description: "Updates set data including reps, weight, RPE, set type, and other metrics.",
    tags: ["Workouts"],
  })
  .input(updateSetSchema)
  .output(exerciseSetOutputSchema);

/**
 * Delete a set
 */
export const deleteSetRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/workouts/{workoutId}/sets/{setId}",
    summary: "Delete set",
    description: "Deletes a set from the workout.",
    tags: ["Workouts"],
  })
  .input(deleteSetSchema)
  .output(successResultSchema);

/**
 * Mark a set as completed
 */
export const completeSetRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/sets/{setId}/complete",
    summary: "Complete set",
    description: "Marks a set as completed with timestamp. Optionally records rest time taken.",
    tags: ["Workouts"],
  })
  .input(completeSetSchema)
  .output(exerciseSetOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type ListRouteHandler = Parameters<typeof listRouteContract.handler>[0];
export type GetByIdRouteHandler = Parameters<typeof getByIdRouteContract.handler>[0];
export type CreateRouteHandler = Parameters<typeof createRouteContract.handler>[0];
export type UpdateRouteHandler = Parameters<typeof updateRouteContract.handler>[0];
export type DeleteRouteHandler = Parameters<typeof deleteRouteContract.handler>[0];
export type CompleteRouteHandler = Parameters<typeof completeRouteContract.handler>[0];
export type AddExerciseRouteHandler = Parameters<typeof addExerciseRouteContract.handler>[0];
export type UpdateExerciseRouteHandler = Parameters<typeof updateExerciseRouteContract.handler>[0];
export type RemoveExerciseRouteHandler = Parameters<typeof removeExerciseRouteContract.handler>[0];
export type ReorderExercisesRouteHandler = Parameters<
  typeof reorderExercisesRouteContract.handler
>[0];
export type AddSetRouteHandler = Parameters<typeof addSetRouteContract.handler>[0];
export type UpdateSetRouteHandler = Parameters<typeof updateSetRouteContract.handler>[0];
export type DeleteSetRouteHandler = Parameters<typeof deleteSetRouteContract.handler>[0];
export type CompleteSetRouteHandler = Parameters<typeof completeSetRouteContract.handler>[0];
