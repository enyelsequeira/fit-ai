/**
 * Workout Router Module
 *
 * This module provides a modular structure for the workout API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  addExerciseRoute,
  addSetRoute,
  completeRoute,
  completeSetRoute,
  createRoute,
  deleteRoute,
  deleteSetRoute,
  getByIdRoute,
  listRoute,
  removeExerciseRoute,
  reorderExercisesRoute,
  updateExerciseRoute,
  updateRoute,
  updateSetRoute,
} from "./routes";

// ============================================================================
// Workout Router
// ============================================================================

/**
 * Complete workout router with all endpoints
 */
export const workoutRouter = {
  // Workout session endpoints
  /** List user's workouts */
  list: listRoute,

  /** Get a single workout by ID */
  getById: getByIdRoute,

  /** Create a new workout */
  create: createRoute,

  /** Update a workout */
  update: updateRoute,

  /** Delete a workout */
  delete: deleteRoute,

  /** Mark a workout as completed */
  complete: completeRoute,

  // Workout exercise endpoints
  /** Add an exercise to a workout */
  addExercise: addExerciseRoute,

  /** Update a workout exercise */
  updateExercise: updateExerciseRoute,

  /** Remove an exercise from a workout */
  removeExercise: removeExerciseRoute,

  /** Reorder exercises in a workout */
  reorderExercises: reorderExercisesRoute,

  // Set endpoints
  /** Add a set to a workout exercise */
  addSet: addSetRoute,

  /** Update a set */
  updateSet: updateSetRoute,

  /** Delete a set */
  deleteSet: deleteSetRoute,

  /** Mark a set as completed */
  completeSet: completeSetRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

// Export schemas for use in other modules or tests
export * from "./schemas";

// Export handlers for testing or custom route composition
export * from "./handlers";

// Export individual routes for custom router composition
export {
  addExerciseRoute,
  addSetRoute,
  completeRoute,
  completeSetRoute,
  createRoute,
  deleteRoute,
  deleteSetRoute,
  getByIdRoute,
  listRoute,
  removeExerciseRoute,
  reorderExercisesRoute,
  updateExerciseRoute,
  updateRoute,
  updateSetRoute,
} from "./routes";
