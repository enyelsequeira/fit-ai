// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  compareRouteContract,
  createRouteContract,
  deleteRouteContract,
  getByIdRouteContract,
  linkMeasurementRouteContract,
  listRouteContract,
  timelineRouteContract,
  unlinkMeasurementRouteContract,
  updateRouteContract,
} from "./contracts";
import {
  comparePhotosHandler,
  createPhotoHandler,
  deletePhotoHandler,
  getByIdHandler,
  linkMeasurementHandler,
  listPhotosHandler,
  timelineHandler,
  unlinkMeasurementHandler,
  updatePhotoHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  CompareRouteHandler,
  CreateRouteHandler,
  DeleteRouteHandler,
  GetByIdRouteHandler,
  LinkMeasurementRouteHandler,
  ListRouteHandler,
  TimelineRouteHandler,
  UnlinkMeasurementRouteHandler,
  UpdateRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const listRoute = listRouteContract.handler(listPhotosHandler);
export const getByIdRoute = getByIdRouteContract.handler(getByIdHandler);
export const createRoute = createRouteContract.handler(createPhotoHandler);
export const updateRoute = updateRouteContract.handler(updatePhotoHandler);
export const deleteRoute = deleteRouteContract.handler(deletePhotoHandler);
export const linkMeasurementRoute = linkMeasurementRouteContract.handler(linkMeasurementHandler);
export const unlinkMeasurementRoute =
  unlinkMeasurementRouteContract.handler(unlinkMeasurementHandler);
export const compareRoute = compareRouteContract.handler(comparePhotosHandler);
export const timelineRoute = timelineRouteContract.handler(timelineHandler);
