/**
 * AI Router Module
 *
 * This module provides a modular structure for the AI API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  generateWorkoutRoute,
  getGeneratedHistoryRoute,
  getPreferencesRoute,
  patchPreferencesRoute,
  submitFeedbackRoute,
  substituteExerciseRoute,
  suggestNextWorkoutRoute,
  updatePreferencesRoute,
} from "./routes";

// ============================================================================
// AI Router
// ============================================================================

/**
 * Complete AI router with all endpoints
 */
export const aiRouter = {
  /** Get user training preferences */
  getPreferences: getPreferencesRoute,

  /** Create or update training preferences */
  updatePreferences: updatePreferencesRoute,

  /** Partially update training preferences */
  patchPreferences: patchPreferencesRoute,

  /** Generate a personalized workout */
  generateWorkout: generateWorkoutRoute,

  /** Suggest next workout based on recovery */
  suggestNextWorkout: suggestNextWorkoutRoute,

  /** Get exercise alternatives */
  substituteExercise: substituteExerciseRoute,

  /** Get history of generated workouts */
  getGeneratedHistory: getGeneratedHistoryRoute,

  /** Submit feedback on generated workout */
  submitFeedback: submitFeedbackRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

export * from "./schemas";
export * from "./handlers";

export {
  generateWorkoutRoute,
  getGeneratedHistoryRoute,
  getPreferencesRoute,
  patchPreferencesRoute,
  submitFeedbackRoute,
  substituteExerciseRoute,
  suggestNextWorkoutRoute,
  updatePreferencesRoute,
} from "./routes";
