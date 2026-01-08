// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  calculateRouteContract,
  createRouteContract,
  deleteRouteContract,
  getByExerciseRouteContract,
  getByIdRouteContract,
  getRecentRouteContract,
  getSummaryRouteContract,
  listRouteContract,
  updateRouteContract,
} from "./contracts";
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

// Re-export handler types for convenience
export type {
  CalculateRouteHandler,
  CreateRouteHandler,
  DeleteRouteHandler,
  GetByExerciseRouteHandler,
  GetByIdRouteHandler,
  GetRecentRouteHandler,
  GetSummaryRouteHandler,
  ListRouteHandler,
  UpdateRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const listRoute = listRouteContract.handler(listPersonalRecordsHandler);
export const getRecentRoute = getRecentRouteContract.handler(getRecentPersonalRecordsHandler);
export const getByExerciseRoute = getByExerciseRouteContract.handler(getByExerciseHandler);
export const getSummaryRoute = getSummaryRouteContract.handler(getSummaryHandler);
export const createRoute = createRouteContract.handler(createPersonalRecordHandler);
export const getByIdRoute = getByIdRouteContract.handler(getByIdHandler);
export const updateRoute = updateRouteContract.handler(updatePersonalRecordHandler);
export const deleteRoute = deleteRouteContract.handler(deletePersonalRecordHandler);
export const calculateRoute = calculateRouteContract.handler(calculatePRsHandler);
