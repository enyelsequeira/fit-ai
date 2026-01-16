import z from "zod";

import { protectedProcedure } from "../../index";
import {
  addExerciseSchema,
  createFolderSchema,
  createTemplateSchema,
  deleteFolderSchema,
  deleteTemplateSchema,
  duplicateTemplateSchema,
  folderOutputSchema,
  getTemplateByIdSchema,
  listTemplatesSchema,
  removeExerciseSchema,
  reorderExercisesSchema,
  reorderFoldersSchema,
  startWorkoutSchema,
  successResultSchema,
  templateExerciseOutputSchema,
  templateOutputSchema,
  templateWithExercisesOutputSchema,
  updateExerciseSchema,
  updateFolderSchema,
  updateTemplateSchema,
  workoutOutputSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

// ============================================================================
// Folder Route Contracts
// ============================================================================

/**
 * List all template folders for the authenticated user
 */
export const listFoldersRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/template-folders",
    summary: "List template folders",
    description:
      "Retrieves all template folders for the authenticated user, ordered by their sort order",
    tags: ["Templates"],
  })
  .output(z.array(folderOutputSchema));

/**
 * Create a new template folder
 */
export const createFolderRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/template-folders",
    summary: "Create template folder",
    description: "Creates a new template folder for organizing workout templates",
    tags: ["Templates"],
  })
  .input(createFolderSchema)
  .output(folderOutputSchema.optional());

/**
 * Update a template folder
 */
export const updateFolderRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/template-folders/{id}",
    summary: "Update template folder",
    description: "Updates an existing template folder. Only the owner can update their folders.",
    tags: ["Templates"],
  })
  .input(updateFolderSchema)
  .output(folderOutputSchema.optional());

/**
 * Delete a template folder
 */
export const deleteFolderRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/template-folders/{id}",
    summary: "Delete template folder",
    description:
      "Deletes a template folder. Templates in the folder will have their folder reference removed.",
    tags: ["Templates"],
  })
  .input(deleteFolderSchema)
  .output(successResultSchema);

/**
 * Reorder template folders
 */
export const reorderFoldersRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/template-folders/reorder",
    summary: "Reorder template folders",
    description:
      "Updates the sort order of template folders based on the provided array of folder IDs",
    tags: ["Templates"],
  })
  .input(reorderFoldersSchema)
  .output(successResultSchema);

// ============================================================================
// Template Route Contracts
// ============================================================================

/**
 * List all templates for the authenticated user
 */
export const listTemplatesRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/templates",
    summary: "List templates",
    description:
      "Retrieves all workout templates for the authenticated user with optional folder filtering. Can also include public templates from other users.",
    tags: ["Templates"],
  })
  .input(listTemplatesSchema)
  .output(z.array(templateOutputSchema));

/**
 * Get a template by ID with all exercises
 */
export const getTemplateByIdRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/templates/{id}",
    summary: "Get template by ID",
    description: "Retrieves a single template with all its exercises and exercise details",
    tags: ["Templates"],
  })
  .input(getTemplateByIdSchema)
  .output(templateWithExercisesOutputSchema);

/**
 * Create a new template
 */
export const createTemplateRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/templates",
    summary: "Create template",
    description: "Creates a new workout template",
    tags: ["Templates"],
  })
  .input(createTemplateSchema)
  .output(templateOutputSchema.optional());

/**
 * Update an existing template
 */
export const updateTemplateRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/templates/{id}",
    summary: "Update template",
    description: "Updates an existing workout template. Only the owner can update their templates.",
    tags: ["Templates"],
  })
  .input(updateTemplateSchema)
  .output(templateOutputSchema.optional());

/**
 * Delete a template
 */
export const deleteTemplateRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/templates/{id}",
    summary: "Delete template",
    description: "Deletes a workout template and all its exercises. Only the owner can delete.",
    tags: ["Templates"],
  })
  .input(deleteTemplateSchema)
  .output(successResultSchema);

/**
 * Duplicate a template
 */
export const duplicateTemplateRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/templates/{id}/duplicate",
    summary: "Duplicate template",
    description: "Creates a copy of an existing template with all its exercises",
    tags: ["Templates"],
  })
  .input(duplicateTemplateSchema)
  .output(templateWithExercisesOutputSchema);

/**
 * Start a workout from a template
 */
export const startWorkoutRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/templates/{id}/start",
    summary: "Start workout from template",
    description:
      "Creates a new workout session based on a template, copying all exercises and their target values. Works with owned templates and public templates.",
    tags: ["Templates"],
  })
  .input(startWorkoutSchema)
  .output(workoutOutputSchema);

// ============================================================================
// Template Exercise Route Contracts
// ============================================================================

/**
 * Add an exercise to a template
 */
export const addExerciseRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/templates/{id}/exercises",
    summary: "Add exercise to template",
    description: "Adds an exercise to a workout template with target sets, reps, and weight",
    tags: ["Templates"],
  })
  .input(addExerciseSchema)
  .output(templateExerciseOutputSchema);

/**
 * Update an exercise in a template
 */
export const updateExerciseRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/templates/{templateId}/exercises/{exerciseId}",
    summary: "Update template exercise",
    description: "Updates an exercise's settings within a template",
    tags: ["Templates"],
  })
  .input(updateExerciseSchema)
  .output(templateExerciseOutputSchema.omit({ exercise: true }).optional());

/**
 * Remove an exercise from a template
 */
export const removeExerciseRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/templates/{templateId}/exercises/{exerciseId}",
    summary: "Remove template exercise",
    description: "Removes an exercise from a workout template",
    tags: ["Templates"],
  })
  .input(removeExerciseSchema)
  .output(successResultSchema);

/**
 * Reorder exercises in a template
 */
export const reorderExercisesRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/templates/{id}/exercises/reorder",
    summary: "Reorder template exercises",
    description:
      "Updates the order of exercises within a template based on the provided array of exercise IDs",
    tags: ["Templates"],
  })
  .input(reorderExercisesSchema)
  .output(successResultSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

// Folder handler types
export type ListFoldersRouteHandler = Parameters<typeof listFoldersRouteContract.handler>[0];
export type CreateFolderRouteHandler = Parameters<typeof createFolderRouteContract.handler>[0];
export type UpdateFolderRouteHandler = Parameters<typeof updateFolderRouteContract.handler>[0];
export type DeleteFolderRouteHandler = Parameters<typeof deleteFolderRouteContract.handler>[0];
export type ReorderFoldersRouteHandler = Parameters<typeof reorderFoldersRouteContract.handler>[0];

// Template handler types
export type ListTemplatesRouteHandler = Parameters<typeof listTemplatesRouteContract.handler>[0];
export type GetTemplateByIdRouteHandler = Parameters<
  typeof getTemplateByIdRouteContract.handler
>[0];
export type CreateTemplateRouteHandler = Parameters<typeof createTemplateRouteContract.handler>[0];
export type UpdateTemplateRouteHandler = Parameters<typeof updateTemplateRouteContract.handler>[0];
export type DeleteTemplateRouteHandler = Parameters<typeof deleteTemplateRouteContract.handler>[0];
export type DuplicateTemplateRouteHandler = Parameters<
  typeof duplicateTemplateRouteContract.handler
>[0];
export type StartWorkoutRouteHandler = Parameters<typeof startWorkoutRouteContract.handler>[0];

// Template exercise handler types
export type AddExerciseRouteHandler = Parameters<typeof addExerciseRouteContract.handler>[0];
export type UpdateExerciseRouteHandler = Parameters<typeof updateExerciseRouteContract.handler>[0];
export type RemoveExerciseRouteHandler = Parameters<typeof removeExerciseRouteContract.handler>[0];
export type ReorderExercisesRouteHandler = Parameters<
  typeof reorderExercisesRouteContract.handler
>[0];
