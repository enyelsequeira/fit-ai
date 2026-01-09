// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  generateWorkoutRouteContract,
  getGeneratedHistoryRouteContract,
  getPreferencesRouteContract,
  patchPreferencesRouteContract,
  submitFeedbackRouteContract,
  substituteExerciseRouteContract,
  suggestNextWorkoutRouteContract,
  updatePreferencesRouteContract,
} from "./contracts";
import {
  generateWorkoutHandler,
  getGeneratedHistoryHandler,
  getPreferencesHandler,
  patchPreferencesHandler,
  submitFeedbackHandler,
  substituteExerciseHandler,
  suggestNextWorkoutHandler,
  updatePreferencesHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  GenerateWorkoutRouteHandler,
  GetGeneratedHistoryRouteHandler,
  GetPreferencesRouteHandler,
  PatchPreferencesRouteHandler,
  SubmitFeedbackRouteHandler,
  SubstituteExerciseRouteHandler,
  SuggestNextWorkoutRouteHandler,
  UpdatePreferencesRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

export const getPreferencesRoute = getPreferencesRouteContract.handler(getPreferencesHandler);
export const updatePreferencesRoute =
  updatePreferencesRouteContract.handler(updatePreferencesHandler);
export const patchPreferencesRoute = patchPreferencesRouteContract.handler(patchPreferencesHandler);
export const generateWorkoutRoute = generateWorkoutRouteContract.handler(generateWorkoutHandler);
export const suggestNextWorkoutRoute =
  suggestNextWorkoutRouteContract.handler(suggestNextWorkoutHandler);
export const substituteExerciseRoute =
  substituteExerciseRouteContract.handler(substituteExerciseHandler);
export const getGeneratedHistoryRoute = getGeneratedHistoryRouteContract.handler(
  getGeneratedHistoryHandler,
);
export const submitFeedbackRoute = submitFeedbackRouteContract.handler(submitFeedbackHandler);
