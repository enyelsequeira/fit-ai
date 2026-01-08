// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  checkNameAvailabilityRouteContract,
  createRouteContract,
  deleteRouteContract,
  getByIdRouteContract,
  getEquipmentListRouteContract,
  getMuscleGroupsRouteContract,
  listRouteContract,
  updateRouteContract,
} from "./contracts";
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

// Re-export handler types for convenience
export type {
  CheckNameAvailabilityRouteHandler,
  CreateRouteHandler,
  DeleteRouteHandler,
  GetByIdRouteHandler,
  GetEquipmentListRouteHandler,
  GetMuscleGroupsRouteHandler,
  ListRouteHandler,
  UpdateRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const listRoute = listRouteContract.handler(listExercisesHandler);
export const getByIdRoute = getByIdRouteContract.handler(getExerciseByIdHandler);
export const createRoute = createRouteContract.handler(createExerciseHandler);
export const updateRoute = updateRouteContract.handler(updateExerciseHandler);
export const deleteRoute = deleteRouteContract.handler(deleteExerciseHandler);
export const getEquipmentListRoute = getEquipmentListRouteContract.handler(getEquipmentListHandler);
export const getMuscleGroupsRoute = getMuscleGroupsRouteContract.handler(getMuscleGroupsHandler);
export const checkNameAvailabilityRoute = checkNameAvailabilityRouteContract.handler(
  checkNameAvailabilityHandler,
);
