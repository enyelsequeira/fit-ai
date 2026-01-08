/**
 * Template Router Module
 *
 * This module provides a modular structure for the template API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  addExerciseRoute,
  createFolderRoute,
  createTemplateRoute,
  deleteFolderRoute,
  deleteTemplateRoute,
  duplicateTemplateRoute,
  getTemplateByIdRoute,
  listFoldersRoute,
  listTemplatesRoute,
  removeExerciseRoute,
  reorderExercisesRoute,
  reorderFoldersRoute,
  startWorkoutRoute,
  updateExerciseRoute,
  updateFolderRoute,
  updateTemplateRoute,
} from "./routes";

// ============================================================================
// Folder Router
// ============================================================================

/**
 * Folder router for template organization
 */
const folderRouter = {
  /** List all template folders */
  list: listFoldersRoute,

  /** Create a new folder */
  create: createFolderRoute,

  /** Update a folder */
  update: updateFolderRoute,

  /** Delete a folder */
  delete: deleteFolderRoute,

  /** Reorder folders */
  reorder: reorderFoldersRoute,
};

// ============================================================================
// Template Router
// ============================================================================

/**
 * Complete template router with all endpoints
 */
export const templateRouter = {
  /** Folder management */
  folder: folderRouter,

  /** List all templates */
  list: listTemplatesRoute,

  /** Get a template by ID */
  getById: getTemplateByIdRoute,

  /** Create a new template */
  create: createTemplateRoute,

  /** Update a template */
  update: updateTemplateRoute,

  /** Delete a template */
  delete: deleteTemplateRoute,

  /** Duplicate a template */
  duplicate: duplicateTemplateRoute,

  /** Start a workout from a template */
  startWorkout: startWorkoutRoute,

  /** Add an exercise to a template */
  addExercise: addExerciseRoute,

  /** Update an exercise in a template */
  updateExercise: updateExerciseRoute,

  /** Remove an exercise from a template */
  removeExercise: removeExerciseRoute,

  /** Reorder exercises in a template */
  reorderExercises: reorderExercisesRoute,
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
  createFolderRoute,
  createTemplateRoute,
  deleteFolderRoute,
  deleteTemplateRoute,
  duplicateTemplateRoute,
  getTemplateByIdRoute,
  listFoldersRoute,
  listTemplatesRoute,
  removeExerciseRoute,
  reorderExercisesRoute,
  reorderFoldersRoute,
  startWorkoutRoute,
  updateExerciseRoute,
  updateFolderRoute,
  updateTemplateRoute,
} from "./routes";
