import z from "zod";

import { protectedProcedure } from "../../index";
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
// Route Definitions
// ============================================================================

export const getPreferencesRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/ai/preferences",
    summary: "Get training preferences",
    description:
      "Retrieves the authenticated user's training preferences for AI workout generation",
    tags: ["AI"],
  })
  .output(preferencesOutputSchema.nullable())
  .handler(async ({ context }) => getPreferencesHandler(context));

export const updatePreferencesRoute = protectedProcedure
  .route({
    method: "PUT",
    path: "/ai/preferences",
    summary: "Create/update training preferences",
    description: "Creates or completely updates the user's training preferences",
    tags: ["AI"],
  })
  .input(updatePreferencesSchema)
  .output(preferencesOutputSchema)
  .handler(async ({ input, context }) => updatePreferencesHandler(input, context));

export const patchPreferencesRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/ai/preferences",
    summary: "Partially update training preferences",
    description: "Updates only the specified fields in training preferences",
    tags: ["AI"],
  })
  .input(updatePreferencesSchema)
  .output(preferencesOutputSchema)
  .handler(async ({ input, context }) => patchPreferencesHandler(input, context));

export const generateWorkoutRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/generate-workout",
    summary: "Generate AI workout",
    description:
      "Generates a personalized workout based on user preferences, recent history, and recovery status",
    tags: ["AI"],
  })
  .input(generateWorkoutSchema)
  .output(generatedWorkoutOutputSchema)
  .handler(async ({ input, context }) => generateWorkoutHandler(input, context));

export const suggestNextWorkoutRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/suggest-next-workout",
    summary: "Suggest next workout",
    description:
      "Suggests what muscle groups to train based on recovery status and recent workout history",
    tags: ["AI"],
  })
  .input(suggestNextWorkoutSchema)
  .output(nextWorkoutSuggestionSchema)
  .handler(async ({ input, context }) => suggestNextWorkoutHandler(input, context));

export const substituteExerciseRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/substitute-exercise",
    summary: "Get exercise alternatives",
    description: "Returns alternative exercises that can substitute the given exercise",
    tags: ["AI"],
  })
  .input(substituteExerciseSchema)
  .output(substituteExerciseOutputSchema)
  .handler(async ({ input, context }) => substituteExerciseHandler(input, context));

export const getGeneratedHistoryRoute = protectedProcedure
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
  )
  .handler(async ({ input, context }) => getGeneratedHistoryHandler(input, context));

export const submitFeedbackRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/ai/feedback",
    summary: "Submit workout feedback",
    description: "Submits feedback on an AI-generated workout for future improvement",
    tags: ["AI"],
  })
  .input(feedbackSchema)
  .output(generatedWorkoutOutputSchema)
  .handler(async ({ input, context }) => submitFeedbackHandler(input, context));
