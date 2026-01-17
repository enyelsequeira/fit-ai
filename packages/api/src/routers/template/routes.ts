// ============================================================================
// Route Definitions
// ============================================================================
// Import contracts and handlers, then attach handlers to contracts

import {
  addExerciseRouteContract,
  createDayRouteContract,
  createFolderRouteContract,
  createTemplateRouteContract,
  deleteDayRouteContract,
  deleteFolderRouteContract,
  deleteTemplateRouteContract,
  duplicateTemplateRouteContract,
  getDayByIdRouteContract,
  getTemplateByIdRouteContract,
  listDaysRouteContract,
  listFoldersRouteContract,
  listTemplatesRouteContract,
  removeExerciseRouteContract,
  reorderDaysRouteContract,
  reorderExercisesRouteContract,
  reorderFoldersRouteContract,
  startWorkoutRouteContract,
  updateDayRouteContract,
  updateExerciseRouteContract,
  updateFolderRouteContract,
  updateTemplateRouteContract,
} from "./contracts";
import {
  addExerciseHandler,
  createDayHandler,
  createFolderHandler,
  createTemplateHandler,
  deleteDayHandler,
  deleteFolderHandler,
  deleteTemplateHandler,
  duplicateTemplateHandler,
  getDayByIdHandler,
  getTemplateByIdHandler,
  listDaysHandler,
  listFoldersHandler,
  listTemplatesHandler,
  removeExerciseHandler,
  reorderDaysHandler,
  reorderExercisesHandler,
  reorderFoldersHandler,
  startWorkoutHandler,
  updateDayHandler,
  updateExerciseHandler,
  updateFolderHandler,
  updateTemplateHandler,
} from "./handlers";

// Re-export handler types for convenience
export type {
  // Folder handler types
  CreateFolderRouteHandler,
  DeleteFolderRouteHandler,
  ListFoldersRouteHandler,
  ReorderFoldersRouteHandler,
  UpdateFolderRouteHandler,
  // Template handler types
  CreateTemplateRouteHandler,
  DeleteTemplateRouteHandler,
  DuplicateTemplateRouteHandler,
  GetTemplateByIdRouteHandler,
  ListTemplatesRouteHandler,
  StartWorkoutRouteHandler,
  UpdateTemplateRouteHandler,
  // Template exercise handler types
  AddExerciseRouteHandler,
  RemoveExerciseRouteHandler,
  ReorderExercisesRouteHandler,
  UpdateExerciseRouteHandler,
  // Template day handler types
  CreateDayRouteHandler,
  DeleteDayRouteHandler,
  GetDayByIdRouteHandler,
  ListDaysRouteHandler,
  ReorderDaysRouteHandler,
  UpdateDayRouteHandler,
} from "./contracts";

// ============================================================================
// Final Route Exports (contracts + handlers combined)
// ============================================================================

// Folder Routes
export const listFoldersRoute = listFoldersRouteContract.handler(listFoldersHandler);
export const createFolderRoute = createFolderRouteContract.handler(createFolderHandler);
export const updateFolderRoute = updateFolderRouteContract.handler(updateFolderHandler);
export const deleteFolderRoute = deleteFolderRouteContract.handler(deleteFolderHandler);
export const reorderFoldersRoute = reorderFoldersRouteContract.handler(reorderFoldersHandler);

// Template Routes
export const listTemplatesRoute = listTemplatesRouteContract.handler(listTemplatesHandler);
export const getTemplateByIdRoute = getTemplateByIdRouteContract.handler(getTemplateByIdHandler);
export const createTemplateRoute = createTemplateRouteContract.handler(createTemplateHandler);
export const updateTemplateRoute = updateTemplateRouteContract.handler(updateTemplateHandler);
export const deleteTemplateRoute = deleteTemplateRouteContract.handler(deleteTemplateHandler);
export const duplicateTemplateRoute =
  duplicateTemplateRouteContract.handler(duplicateTemplateHandler);
export const startWorkoutRoute = startWorkoutRouteContract.handler(startWorkoutHandler);

// Template Day Routes
export const listDaysRoute = listDaysRouteContract.handler(listDaysHandler);
export const getDayByIdRoute = getDayByIdRouteContract.handler(getDayByIdHandler);
export const createDayRoute = createDayRouteContract.handler(createDayHandler);
export const updateDayRoute = updateDayRouteContract.handler(updateDayHandler);
export const deleteDayRoute = deleteDayRouteContract.handler(deleteDayHandler);
export const reorderDaysRoute = reorderDaysRouteContract.handler(reorderDaysHandler);

// Template Exercise Routes
export const addExerciseRoute = addExerciseRouteContract.handler(addExerciseHandler);
export const updateExerciseRoute = updateExerciseRouteContract.handler(updateExerciseHandler);
export const removeExerciseRoute = removeExerciseRouteContract.handler(removeExerciseHandler);
export const reorderExercisesRoute = reorderExercisesRouteContract.handler(reorderExercisesHandler);
