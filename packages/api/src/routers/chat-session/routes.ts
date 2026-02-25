// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  createSessionRouteContract,
  deleteSessionRouteContract,
  getMessagesRouteContract,
  listSessionsRouteContract,
  saveMessagesRouteContract,
  updateSessionTitleRouteContract,
} from "./contracts";
import {
  createSessionHandler,
  deleteSessionHandler,
  getMessagesHandler,
  listSessionsHandler,
  saveMessagesHandler,
  updateSessionTitleHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  CreateSessionRouteHandler,
  DeleteSessionRouteHandler,
  GetMessagesRouteHandler,
  ListSessionsRouteHandler,
  SaveMessagesRouteHandler,
  UpdateSessionTitleRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const listSessionsRoute = listSessionsRouteContract.handler(listSessionsHandler);
export const getMessagesRoute = getMessagesRouteContract.handler(getMessagesHandler);
export const createSessionRoute = createSessionRouteContract.handler(createSessionHandler);
export const deleteSessionRoute = deleteSessionRouteContract.handler(deleteSessionHandler);
export const saveMessagesRoute = saveMessagesRouteContract.handler(saveMessagesHandler);
export const updateSessionTitleRoute =
  updateSessionTitleRouteContract.handler(updateSessionTitleHandler);
