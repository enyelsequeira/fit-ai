import z from "zod";

import { protectedProcedure } from "../../index";
import {
  feedbackSchema,
  generatedHistorySchema,
  generatedWorkoutOutputSchema,
  generateWorkoutSchema,
  nextWorkoutSuggestionSchema,
  preferencesOutputSchema,
  substituteExerciseOutputSchema,
  substituteExerciseSchema,
  suggestNextWorkoutSchema,
  updatePreferencesSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * Get user's training preferences
 */
export const getPreferencesRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/ai/preferences",
    summary: "Get training preferences",
    description:
      "Retrieves the authenticated user's training preferences for AI workout generation",
    tags: ["AI"],
  })
  .output(preferencesOutputSchema.nullable());

/**
 * Create or completely update training preferences
 */
export const updatePreferencesRouteContract = protectedProcedure
  .route({
    method: "PUT",
    path: "/ai/preferences",
    summary: "Create/update training preferences",
    description: "Creates or completely updates the user's training preferences",
    tags: ["AI"],
  })
  .input(updatePreferencesSchema)
  .output(preferencesOutputSchema);

/**
 * Partially update training preferences
 */
export const patchPreferencesRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/ai/preferences",
    summary: "Partially update training preferences",
    description: "Updates only the specified fields in training preferences",
    tags: ["AI"],
  })
  .input(updatePreferencesSchema)
  .output(preferencesOutputSchema);

/**
 * Generate an AI workout
 */
export const generateWorkoutRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/generate-workout",
    summary: "Generate AI workout",
    description:
      "Generates a personalized workout based on user preferences, recent history, and recovery status",
    tags: ["AI"],
  })
  .input(generateWorkoutSchema)
  .output(generatedWorkoutOutputSchema);

/**
 * Suggest next workout based on recovery and history
 */
export const suggestNextWorkoutRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/suggest-next-workout",
    summary: "Suggest next workout",
    description:
      "Suggests what muscle groups to train based on recovery status and recent workout history",
    tags: ["AI"],
  })
  .input(suggestNextWorkoutSchema)
  .output(nextWorkoutSuggestionSchema);

/**
 * Get exercise alternatives for substitution
 */
export const substituteExerciseRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/substitute-exercise",
    summary: "Get exercise alternatives",
    description: "Returns alternative exercises that can substitute the given exercise",
    tags: ["AI"],
  })
  .input(substituteExerciseSchema)
  .output(substituteExerciseOutputSchema);

/**
 * Get history of AI-generated workouts
 */
export const getGeneratedHistoryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/ai/generated-history",
    summary: "Get generated workout history",
    description: "Retrieves the history of AI-generated workouts for the user",
    tags: ["AI"],
  })
  .input(generatedHistorySchema)
  .output(
    z.object({
      workouts: z.array(generatedWorkoutOutputSchema),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  );

/**
 * Submit feedback on an AI-generated workout
 */
export const submitFeedbackRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/feedback",
    summary: "Submit workout feedback",
    description: "Submits feedback on an AI-generated workout for future improvement",
    tags: ["AI"],
  })
  .input(feedbackSchema)
  .output(generatedWorkoutOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type GetPreferencesRouteHandler = Parameters<
  typeof getPreferencesRouteContract.handler
>[0];
export type UpdatePreferencesRouteHandler = Parameters<
  typeof updatePreferencesRouteContract.handler
>[0];
export type PatchPreferencesRouteHandler = Parameters<
  typeof patchPreferencesRouteContract.handler
>[0];
export type GenerateWorkoutRouteHandler = Parameters<
  typeof generateWorkoutRouteContract.handler
>[0];
export type SuggestNextWorkoutRouteHandler = Parameters<
  typeof suggestNextWorkoutRouteContract.handler
>[0];
export type SubstituteExerciseRouteHandler = Parameters<
  typeof substituteExerciseRouteContract.handler
>[0];
export type GetGeneratedHistoryRouteHandler = Parameters<
  typeof getGeneratedHistoryRouteContract.handler
>[0];
export type SubmitFeedbackRouteHandler = Parameters<typeof submitFeedbackRouteContract.handler>[0];
