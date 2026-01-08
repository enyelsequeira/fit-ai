// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  createRouteContract,
  deleteRouteContract,
  getByIdRouteContract,
  getLatestRouteContract,
  getTrendsRouteContract,
  listRouteContract,
  updateRouteContract,
} from "./contracts";
import {
  createBodyMeasurementHandler,
  deleteBodyMeasurementHandler,
  getByIdHandler,
  getLatestHandler,
  getTrendsHandler,
  listBodyMeasurementsHandler,
  updateBodyMeasurementHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  CreateRouteHandler,
  DeleteRouteHandler,
  GetByIdRouteHandler,
  GetLatestRouteHandler,
  GetTrendsRouteHandler,
  ListRouteHandler,
  UpdateRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const listRoute = listRouteContract.handler(listBodyMeasurementsHandler);
export const getByIdRoute = getByIdRouteContract.handler(getByIdHandler);
export const getLatestRoute = getLatestRouteContract.handler(getLatestHandler);
export const getTrendsRoute = getTrendsRouteContract.handler(getTrendsHandler);
export const createRoute = createRouteContract.handler(createBodyMeasurementHandler);
export const updateRoute = updateRouteContract.handler(updateBodyMeasurementHandler);
export const deleteRoute = deleteRouteContract.handler(deleteBodyMeasurementHandler);
