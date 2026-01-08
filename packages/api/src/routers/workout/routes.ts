import { protectedProcedure } from "../../index";
import {
  addExerciseHandler,
  addSetHandler,
  completeSetHandler,
  completeWorkoutHandler,
  createWorkoutHandler,
  deleteSetHandler,
  deleteWorkoutHandler,
  getWorkoutByIdHandler,
  listWorkoutsHandler,
  removeExerciseHandler,
  reorderExercisesHandler,
  updateSetHandler,
  updateWorkoutExerciseHandler,
  updateWorkoutHandler,
} from "./handlers";
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
// Workout Session Routes
// ============================================================================

/**
 * List user's workouts with pagination and date filtering
 */
export const listRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/workouts",
    summary: "List workouts",
    description:
      "Retrieves a paginated list of the authenticated user's workouts with optional date range filtering",
    tags: ["Workouts"],
  })
  .input(listWorkoutsSchema)
  .output(workoutListOutputSchema)
  .handler(async ({ input, context }) => {
    return listWorkoutsHandler(input, context);
  });

/**
 * Get a single workout with all exercises and sets
 */
export const getByIdRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/workouts/{workoutId}",
    summary: "Get workout by ID",
    description:
      "Retrieves a single workout with all its exercises and sets. Only the owner can access.",
    tags: ["Workouts"],
  })
  .input(getWorkoutByIdSchema)
  .output(workoutFullOutputSchema)
  .handler(async ({ input, context }) => {
    return getWorkoutByIdHandler(input, context);
  });

/**
 * Create a new workout (optionally from a template)
 */
export const createRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts",
    summary: "Create workout",
    description:
      "Creates a new workout session. Optionally, create from a template to pre-populate exercises.",
    tags: ["Workouts"],
  })
  .input(createWorkoutSchema)
  .output(workoutFullOutputSchema)
  .handler(async ({ input, context }) => {
    return createWorkoutHandler(input, context);
  });

/**
 * Update a workout (name, notes)
 */
export const updateRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}",
    summary: "Update workout",
    description: "Updates workout name and/or notes. Only the owner can update.",
    tags: ["Workouts"],
  })
  .input(updateWorkoutSchema)
  .output(workoutOutputSchema)
  .handler(async ({ input, context }) => {
    return updateWorkoutHandler(input, context);
  });

/**
 * Delete a workout
 */
export const deleteRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/workouts/{workoutId}",
    summary: "Delete workout",
    description: "Deletes a workout and all its exercises and sets. Only the owner can delete.",
    tags: ["Workouts"],
  })
  .input(deleteWorkoutSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return deleteWorkoutHandler(input, context);
  });

/**
 * Mark a workout as completed
 */
export const completeRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/complete",
    summary: "Complete workout",
    description:
      "Marks a workout as completed with optional rating and mood feedback. Sets completedAt timestamp.",
    tags: ["Workouts"],
  })
  .input(completeWorkoutSchema)
  .output(workoutOutputSchema)
  .handler(async ({ input, context }) => {
    return completeWorkoutHandler(input, context);
  });

// ============================================================================
// Workout Exercise Routes
// ============================================================================

/**
 * Add an exercise to a workout
 */
export const addExerciseRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/exercises",
    summary: "Add exercise to workout",
    description: "Adds an exercise to the workout. Order is auto-assigned if not provided.",
    tags: ["Workouts"],
  })
  .input(addExerciseSchema)
  .output(workoutExerciseOutputSchema)
  .handler(async ({ input, context }) => {
    return addExerciseHandler(input, context);
  });

/**
 * Update a workout exercise
 */
export const updateExerciseRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}/exercises/{workoutExerciseId}",
    summary: "Update workout exercise",
    description: "Updates notes or superset grouping for a workout exercise.",
    tags: ["Workouts"],
  })
  .input(updateWorkoutExerciseSchema)
  .output(workoutExerciseOutputSchema)
  .handler(async ({ input, context }) => {
    return updateWorkoutExerciseHandler(input, context);
  });

/**
 * Remove an exercise from a workout
 */
export const removeExerciseRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/workouts/{workoutId}/exercises/{workoutExerciseId}",
    summary: "Remove exercise from workout",
    description: "Removes an exercise and all its sets from the workout.",
    tags: ["Workouts"],
  })
  .input(removeExerciseSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return removeExerciseHandler(input, context);
  });

/**
 * Reorder exercises in a workout
 */
export const reorderExercisesRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}/exercises/reorder",
    summary: "Reorder exercises",
    description: "Reorders exercises within a workout by specifying new positions.",
    tags: ["Workouts"],
  })
  .input(reorderExercisesSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return reorderExercisesHandler(input, context);
  });

// ============================================================================
// Set Routes
// ============================================================================

/**
 * Add a set to a workout exercise
 */
export const addSetRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/exercises/{workoutExerciseId}/sets",
    summary: "Add set to exercise",
    description:
      "Adds a new set to a workout exercise. Supports strength, cardio, and flexibility data.",
    tags: ["Workouts"],
  })
  .input(addSetSchema)
  .output(exerciseSetOutputSchema)
  .handler(async ({ input, context }) => {
    return addSetHandler(input, context);
  });

/**
 * Update a set
 */
export const updateSetRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/workouts/{workoutId}/sets/{setId}",
    summary: "Update set",
    description: "Updates set data including reps, weight, RPE, set type, and other metrics.",
    tags: ["Workouts"],
  })
  .input(updateSetSchema)
  .output(exerciseSetOutputSchema)
  .handler(async ({ input, context }) => {
    return updateSetHandler(input, context);
  });

/**
 * Delete a set
 */
export const deleteSetRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/workouts/{workoutId}/sets/{setId}",
    summary: "Delete set",
    description: "Deletes a set from the workout.",
    tags: ["Workouts"],
  })
  .input(deleteSetSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return deleteSetHandler(input, context);
  });

/**
 * Mark a set as completed
 */
export const completeSetRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/workouts/{workoutId}/sets/{setId}/complete",
    summary: "Complete set",
    description: "Marks a set as completed with timestamp. Optionally records rest time taken.",
    tags: ["Workouts"],
  })
  .input(completeSetSchema)
  .output(exerciseSetOutputSchema)
  .handler(async ({ input, context }) => {
    return completeSetHandler(input, context);
  });
