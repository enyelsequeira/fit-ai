import z from "zod";

import { protectedProcedure } from "../../index";
import {
  addExerciseHandler,
  createFolderHandler,
  createTemplateHandler,
  deleteFolderHandler,
  deleteTemplateHandler,
  duplicateTemplateHandler,
  getTemplateByIdHandler,
  listFoldersHandler,
  listTemplatesHandler,
  removeExerciseHandler,
  reorderExercisesHandler,
  reorderFoldersHandler,
  startWorkoutHandler,
  updateExerciseHandler,
  updateFolderHandler,
  updateTemplateHandler,
} from "./handlers";
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
// Folder Route Definitions
// ============================================================================

/**
 * List all template folders for the authenticated user
 */
export const listFoldersRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/template-folders",
    summary: "List template folders",
    description:
      "Retrieves all template folders for the authenticated user, ordered by their sort order",
    tags: ["Templates"],
  })
  .output(z.array(folderOutputSchema))
  .handler(async ({ context }) => {
    return listFoldersHandler(context);
  });

/**
 * Create a new template folder
 */
export const createFolderRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/template-folders",
    summary: "Create template folder",
    description: "Creates a new template folder for organizing workout templates",
    tags: ["Templates"],
  })
  .input(createFolderSchema)
  .output(folderOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return createFolderHandler(input, context);
  });

/**
 * Update a template folder
 */
export const updateFolderRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/template-folders/{id}",
    summary: "Update template folder",
    description: "Updates an existing template folder. Only the owner can update their folders.",
    tags: ["Templates"],
  })
  .input(updateFolderSchema)
  .output(folderOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return updateFolderHandler(input, context);
  });

/**
 * Delete a template folder
 */
export const deleteFolderRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/template-folders/{id}",
    summary: "Delete template folder",
    description:
      "Deletes a template folder. Templates in the folder will have their folder reference removed.",
    tags: ["Templates"],
  })
  .input(deleteFolderSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return deleteFolderHandler(input, context);
  });

/**
 * Reorder template folders
 */
export const reorderFoldersRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/template-folders/reorder",
    summary: "Reorder template folders",
    description:
      "Updates the sort order of template folders based on the provided array of folder IDs",
    tags: ["Templates"],
  })
  .input(reorderFoldersSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return reorderFoldersHandler(input, context);
  });

// ============================================================================
// Template Route Definitions
// ============================================================================

/**
 * List all templates for the authenticated user
 */
export const listTemplatesRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/templates",
    summary: "List templates",
    description:
      "Retrieves all workout templates for the authenticated user with optional folder filtering. Can also include public templates from other users.",
    tags: ["Templates"],
  })
  .input(listTemplatesSchema)
  .output(z.array(templateOutputSchema))
  .handler(async ({ input, context }) => {
    return listTemplatesHandler(input, context);
  });

/**
 * Get a template by ID with all exercises
 */
export const getTemplateByIdRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/templates/{id}",
    summary: "Get template by ID",
    description: "Retrieves a single template with all its exercises and exercise details",
    tags: ["Templates"],
  })
  .input(getTemplateByIdSchema)
  .output(templateWithExercisesOutputSchema)
  .handler(async ({ input, context }) => {
    return getTemplateByIdHandler(input, context);
  });

/**
 * Create a new template
 */
export const createTemplateRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/templates",
    summary: "Create template",
    description: "Creates a new workout template",
    tags: ["Templates"],
  })
  .input(createTemplateSchema)
  .output(templateOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return createTemplateHandler(input, context);
  });

/**
 * Update an existing template
 */
export const updateTemplateRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/templates/{id}",
    summary: "Update template",
    description: "Updates an existing workout template. Only the owner can update their templates.",
    tags: ["Templates"],
  })
  .input(updateTemplateSchema)
  .output(templateOutputSchema.optional())
  .handler(async ({ input, context }) => {
    return updateTemplateHandler(input, context);
  });

/**
 * Delete a template
 */
export const deleteTemplateRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/templates/{id}",
    summary: "Delete template",
    description: "Deletes a workout template and all its exercises. Only the owner can delete.",
    tags: ["Templates"],
  })
  .input(deleteTemplateSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return deleteTemplateHandler(input, context);
  });

/**
 * Duplicate a template
 */
export const duplicateTemplateRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/templates/{id}/duplicate",
    summary: "Duplicate template",
    description: "Creates a copy of an existing template with all its exercises",
    tags: ["Templates"],
  })
  .input(duplicateTemplateSchema)
  .output(templateWithExercisesOutputSchema)
  .handler(async ({ input, context }) => {
    return duplicateTemplateHandler(input, context);
  });

/**
 * Start a workout from a template
 */
export const startWorkoutRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/templates/{id}/start",
    summary: "Start workout from template",
    description:
      "Creates a new workout session based on a template, copying all exercises and their target values. Works with owned templates and public templates.",
    tags: ["Templates"],
  })
  .input(startWorkoutSchema)
  .output(workoutOutputSchema)
  .handler(async ({ input, context }) => {
    return startWorkoutHandler(input, context);
  });

// ============================================================================
// Template Exercise Route Definitions
// ============================================================================

/**
 * Add an exercise to a template
 */
export const addExerciseRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/templates/{id}/exercises",
    summary: "Add exercise to template",
    description: "Adds an exercise to a workout template with target sets, reps, and weight",
    tags: ["Templates"],
  })
  .input(addExerciseSchema)
  .output(templateExerciseOutputSchema.omit({ exercise: true }))
  .handler(async ({ input, context }) => {
    return addExerciseHandler(input, context);
  });

/**
 * Update an exercise in a template
 */
export const updateExerciseRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/templates/{templateId}/exercises/{exerciseId}",
    summary: "Update template exercise",
    description: "Updates an exercise's settings within a template",
    tags: ["Templates"],
  })
  .input(updateExerciseSchema)
  .output(templateExerciseOutputSchema.omit({ exercise: true }).optional())
  .handler(async ({ input, context }) => {
    return updateExerciseHandler(input, context);
  });

/**
 * Remove an exercise from a template
 */
export const removeExerciseRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/templates/{templateId}/exercises/{exerciseId}",
    summary: "Remove template exercise",
    description: "Removes an exercise from a workout template",
    tags: ["Templates"],
  })
  .input(removeExerciseSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return removeExerciseHandler(input, context);
  });

/**
 * Reorder exercises in a template
 */
export const reorderExercisesRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/templates/{id}/exercises/reorder",
    summary: "Reorder template exercises",
    description:
      "Updates the order of exercises within a template based on the provided array of exercise IDs",
    tags: ["Templates"],
  })
  .input(reorderExercisesSchema)
  .output(successResultSchema)
  .handler(async ({ input, context }) => {
    return reorderExercisesHandler(input, context);
  });
