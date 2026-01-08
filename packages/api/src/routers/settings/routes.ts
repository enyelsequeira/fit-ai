// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  getRouteContract,
  resetRouteContract,
  updateDisplayPreferencesRouteContract,
  updateNotificationPreferencesRouteContract,
  updatePrivacyPreferencesRouteContract,
  updateRouteContract,
  updateUnitsRouteContract,
  updateWorkoutPreferencesRouteContract,
} from "./contracts";
import {
  getSettingsHandler,
  resetSettingsHandler,
  updateDisplayPreferencesHandler,
  updateNotificationPreferencesHandler,
  updatePrivacyPreferencesHandler,
  updateSettingsHandler,
  updateUnitsHandler,
  updateWorkoutPreferencesHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  GetRouteHandler,
  ResetRouteHandler,
  UpdateDisplayPreferencesRouteHandler,
  UpdateNotificationPreferencesRouteHandler,
  UpdatePrivacyPreferencesRouteHandler,
  UpdateRouteHandler,
  UpdateUnitsRouteHandler,
  UpdateWorkoutPreferencesRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const getRoute = getRouteContract.handler(getSettingsHandler);
export const updateRoute = updateRouteContract.handler(updateSettingsHandler);
export const updateUnitsRoute = updateUnitsRouteContract.handler(updateUnitsHandler);
export const updateWorkoutPreferencesRoute = updateWorkoutPreferencesRouteContract.handler(
  updateWorkoutPreferencesHandler,
);
export const updateDisplayPreferencesRoute = updateDisplayPreferencesRouteContract.handler(
  updateDisplayPreferencesHandler,
);
export const updateNotificationPreferencesRoute =
  updateNotificationPreferencesRouteContract.handler(updateNotificationPreferencesHandler);
export const updatePrivacyPreferencesRoute = updatePrivacyPreferencesRouteContract.handler(
  updatePrivacyPreferencesHandler,
);
export const resetRoute = resetRouteContract.handler(resetSettingsHandler);
