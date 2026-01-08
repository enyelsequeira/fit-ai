/**
 * Goals Router Module
 *
 * Provides goal management including:
 * - Weight goals (body weight targets)
 * - Strength goals (lift performance targets)
 * - Body measurement goals (waist, chest, etc.)
 * - Workout frequency goals (workouts per week)
 * - Custom goals (user-defined metrics)
 * - Progress tracking and history
 */

import {
  abandonGoalRoute,
  completeGoalRoute,
  createBodyMeasurementGoalRoute,
  createCustomGoalRoute,
  createStrengthGoalRoute,
  createWeightGoalRoute,
  createWorkoutFrequencyGoalRoute,
  deleteGoalRoute,
  getGoalByIdRoute,
  getGoalProgressHistoryRoute,
  getGoalsSummaryRoute,
  listGoalsRoute,
  pauseGoalRoute,
  resumeGoalRoute,
  updateGoalProgressRoute,
  updateGoalRoute,
} from "./routes";

// ============================================================================
// Goals Router
// ============================================================================

/**
 * Complete goals router with all endpoints
 */
export const goalsRouter = {
  // ========== Create Goals ==========
  /** Create a weight goal */
  createWeightGoal: createWeightGoalRoute,
  /** Create a strength goal */
  createStrengthGoal: createStrengthGoalRoute,
  /** Create a body measurement goal */
  createBodyMeasurementGoal: createBodyMeasurementGoalRoute,
  /** Create a workout frequency goal */
  createWorkoutFrequencyGoal: createWorkoutFrequencyGoalRoute,
  /** Create a custom goal */
  createCustomGoal: createCustomGoalRoute,

  // ========== Read Goals ==========
  /** Get a goal by ID with progress history */
  getById: getGoalByIdRoute,
  /** List goals with filtering */
  list: listGoalsRoute,
  /** Get goals summary for dashboard */
  getSummary: getGoalsSummaryRoute,
  /** Get goal progress history */
  getProgressHistory: getGoalProgressHistoryRoute,

  // ========== Update Goals ==========
  /** Update a goal */
  update: updateGoalRoute,
  /** Update goal progress (log new value) */
  updateProgress: updateGoalProgressRoute,

  // ========== Status Changes ==========
  /** Complete a goal */
  complete: completeGoalRoute,
  /** Abandon a goal */
  abandon: abandonGoalRoute,
  /** Pause a goal */
  pause: pauseGoalRoute,
  /** Resume a paused goal */
  resume: resumeGoalRoute,

  // ========== Delete ==========
  /** Delete a goal */
  delete: deleteGoalRoute,
};

// ============================================================================
// Re-exports
// ============================================================================

export * from "./schemas";
export * from "./handlers";
export {
  abandonGoalRoute,
  completeGoalRoute,
  createBodyMeasurementGoalRoute,
  createCustomGoalRoute,
  createStrengthGoalRoute,
  createWeightGoalRoute,
  createWorkoutFrequencyGoalRoute,
  deleteGoalRoute,
  getGoalByIdRoute,
  getGoalProgressHistoryRoute,
  getGoalsSummaryRoute,
  listGoalsRoute,
  pauseGoalRoute,
  resumeGoalRoute,
  updateGoalProgressRoute,
  updateGoalRoute,
} from "./routes";
