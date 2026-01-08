// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  checkAuthRouteContract,
  deleteAccountRouteContract,
  getProfileRouteContract,
  getSessionRouteContract,
  updateProfileRouteContract,
} from "./contracts";
import {
  checkAuthHandler,
  deleteAccountHandler,
  getProfileHandler,
  getSessionHandler,
  updateProfileHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  CheckAuthRouteHandler,
  DeleteAccountRouteHandler,
  GetProfileRouteHandler,
  GetSessionRouteHandler,
  UpdateProfileRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const getSessionRoute = getSessionRouteContract.handler(getSessionHandler);
export const getProfileRoute = getProfileRouteContract.handler(getProfileHandler);
export const updateProfileRoute = updateProfileRouteContract.handler(updateProfileHandler);
export const deleteAccountRoute = deleteAccountRouteContract.handler(deleteAccountHandler);
export const checkAuthRoute = checkAuthRouteContract.handler(checkAuthHandler);
