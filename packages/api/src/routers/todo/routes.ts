// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  createRouteContract,
  deleteRouteContract,
  getAllRouteContract,
  toggleRouteContract,
} from "./contracts";
import {
  createTodoHandler,
  deleteTodoHandler,
  getAllTodosHandler,
  toggleTodoHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  CreateRouteHandler,
  DeleteRouteHandler,
  GetAllRouteHandler,
  ToggleRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const getAllRoute = getAllRouteContract.handler(getAllTodosHandler);
export const createRoute = createRouteContract.handler(createTodoHandler);
export const toggleRoute = toggleRouteContract.handler(toggleTodoHandler);
export const deleteRoute = deleteRouteContract.handler(deleteTodoHandler);
