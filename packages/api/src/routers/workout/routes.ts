// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  addExerciseRouteContract,
  addSetRouteContract,
  completeRouteContract,
  completeSetRouteContract,
  createRouteContract,
  deleteRouteContract,
  deleteSetRouteContract,
  getByIdRouteContract,
  listRouteContract,
  removeExerciseRouteContract,
  reorderExercisesRouteContract,
  updateExerciseRouteContract,
  updateRouteContract,
  updateSetRouteContract,
} from "./contracts";
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

// Re-export handler types for convenience
export type {
  AddExerciseRouteHandler,
  AddSetRouteHandler,
  CompleteRouteHandler,
  CompleteSetRouteHandler,
  CreateRouteHandler,
  DeleteRouteHandler,
  DeleteSetRouteHandler,
  GetByIdRouteHandler,
  ListRouteHandler,
  RemoveExerciseRouteHandler,
  ReorderExercisesRouteHandler,
  UpdateExerciseRouteHandler,
  UpdateRouteHandler,
  UpdateSetRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

// Workout Session Routes
export const listRoute = listRouteContract.handler(listWorkoutsHandler);
export const getByIdRoute = getByIdRouteContract.handler(getWorkoutByIdHandler);
export const createRoute = createRouteContract.handler(createWorkoutHandler);
export const updateRoute = updateRouteContract.handler(updateWorkoutHandler);
export const deleteRoute = deleteRouteContract.handler(deleteWorkoutHandler);
export const completeRoute = completeRouteContract.handler(completeWorkoutHandler);

// Workout Exercise Routes
export const addExerciseRoute = addExerciseRouteContract.handler(addExerciseHandler);
export const updateExerciseRoute = updateExerciseRouteContract.handler(
  updateWorkoutExerciseHandler,
);
export const removeExerciseRoute = removeExerciseRouteContract.handler(removeExerciseHandler);
export const reorderExercisesRoute = reorderExercisesRouteContract.handler(reorderExercisesHandler);

// Set Routes
export const addSetRoute = addSetRouteContract.handler(addSetHandler);
export const updateSetRoute = updateSetRouteContract.handler(updateSetHandler);
export const deleteSetRoute = deleteSetRouteContract.handler(deleteSetHandler);
export const completeSetRoute = completeSetRouteContract.handler(completeSetHandler);
