// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  abandonGoalRouteContract,
  completeGoalRouteContract,
  createBodyMeasurementGoalRouteContract,
  createCustomGoalRouteContract,
  createStrengthGoalRouteContract,
  createWeightGoalRouteContract,
  createWorkoutFrequencyGoalRouteContract,
  deleteGoalRouteContract,
  getGoalByIdRouteContract,
  getGoalProgressHistoryRouteContract,
  getGoalsSummaryRouteContract,
  listGoalsRouteContract,
  pauseGoalRouteContract,
  resumeGoalRouteContract,
  updateGoalProgressRouteContract,
  updateGoalRouteContract,
} from "./contracts";
import {
  abandonGoalHandler,
  completeGoalHandler,
  createBodyMeasurementGoalHandler,
  createCustomGoalHandler,
  createStrengthGoalHandler,
  createWeightGoalHandler,
  createWorkoutFrequencyGoalHandler,
  deleteGoalHandler,
  getGoalByIdHandler,
  getGoalProgressHistoryHandler,
  getGoalsSummaryHandler,
  listGoalsHandler,
  pauseGoalHandler,
  resumeGoalHandler,
  updateGoalHandler,
  updateGoalProgressHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  AbandonGoalRouteHandler,
  CompleteGoalRouteHandler,
  CreateBodyMeasurementGoalRouteHandler,
  CreateCustomGoalRouteHandler,
  CreateStrengthGoalRouteHandler,
  CreateWeightGoalRouteHandler,
  CreateWorkoutFrequencyGoalRouteHandler,
  DeleteGoalRouteHandler,
  GetGoalByIdRouteHandler,
  GetGoalProgressHistoryRouteHandler,
  GetGoalsSummaryRouteHandler,
  ListGoalsRouteHandler,
  PauseGoalRouteHandler,
  ResumeGoalRouteHandler,
  UpdateGoalProgressRouteHandler,
  UpdateGoalRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

// Goal Creation Routes
export const createWeightGoalRoute = createWeightGoalRouteContract.handler(createWeightGoalHandler);
export const createStrengthGoalRoute =
  createStrengthGoalRouteContract.handler(createStrengthGoalHandler);
export const createBodyMeasurementGoalRoute = createBodyMeasurementGoalRouteContract.handler(
  createBodyMeasurementGoalHandler,
);
export const createWorkoutFrequencyGoalRoute = createWorkoutFrequencyGoalRouteContract.handler(
  createWorkoutFrequencyGoalHandler,
);
export const createCustomGoalRoute = createCustomGoalRouteContract.handler(createCustomGoalHandler);

// Goal Query Routes
export const getGoalByIdRoute = getGoalByIdRouteContract.handler(getGoalByIdHandler);
export const listGoalsRoute = listGoalsRouteContract.handler(listGoalsHandler);
export const getGoalsSummaryRoute = getGoalsSummaryRouteContract.handler(getGoalsSummaryHandler);

// Goal Update Routes
export const updateGoalRoute = updateGoalRouteContract.handler(updateGoalHandler);
export const updateGoalProgressRoute =
  updateGoalProgressRouteContract.handler(updateGoalProgressHandler);

// Goal Status Routes
export const completeGoalRoute = completeGoalRouteContract.handler(completeGoalHandler);
export const abandonGoalRoute = abandonGoalRouteContract.handler(abandonGoalHandler);
export const pauseGoalRoute = pauseGoalRouteContract.handler(pauseGoalHandler);
export const resumeGoalRoute = resumeGoalRouteContract.handler(resumeGoalHandler);

// Goal Delete Route
export const deleteGoalRoute = deleteGoalRouteContract.handler(deleteGoalHandler);

// Goal Progress History Route
export const getGoalProgressHistoryRoute =
  getGoalProgressHistoryRouteContract.handler(getGoalProgressHistoryHandler);
