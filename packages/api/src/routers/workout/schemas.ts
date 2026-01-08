import {
  distanceUnitSchema,
  insertExerciseSetSchema,
  insertWorkoutExerciseSchema,
  insertWorkoutSchema,
  selectExerciseSetSchema,
  selectWorkoutExerciseSchema,
  selectWorkoutSchema,
  setTypeSchema,
  weightUnitSchema,
  workoutMoodSchema,
} from "@fit-ai/db/schema/workout";
import z from "zod";

// ============================================================================
// Re-export base schemas from DB package
// ============================================================================

export { setTypeSchema, workoutMoodSchema, weightUnitSchema, distanceUnitSchema };

export type SetType = z.infer<typeof setTypeSchema>;
export type WorkoutMood = z.infer<typeof workoutMoodSchema>;
export type WeightUnit = z.infer<typeof weightUnitSchema>;
export type DistanceUnit = z.infer<typeof distanceUnitSchema>;

/**
 * RPE (Rate of Perceived Exertion) scale
 */
export const rpeSchema = z
  .number()
  .int()
  .min(6)
  .max(10)
  .describe("Rate of Perceived Exertion (6-10 scale, where 10 is max effort)");

/**
 * RIR (Reps in Reserve) scale
 */
export const rirSchema = z
  .number()
  .int()
  .min(0)
  .max(5)
  .describe("Reps in Reserve (0-5 scale, alternative to RPE)");

/**
 * Workout rating (1-5 stars)
 */
export const workoutRatingSchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .describe("User rating of the workout (1-5 stars)");

// ============================================================================
// Output Schemas (from DB select schemas, extended for API responses)
// ============================================================================

/**
 * Exercise set output schema (from drizzle-zod)
 */
export const exerciseSetOutputSchema = selectExerciseSetSchema;

export type ExerciseSetOutput = z.infer<typeof exerciseSetOutputSchema>;

/**
 * Workout exercise base output schema (from drizzle-zod)
 */
export const workoutExerciseBaseOutputSchema = selectWorkoutExerciseSchema;

/**
 * Workout exercise output schema (with nested exercise details and sets)
 */
export const workoutExerciseOutputSchema = workoutExerciseBaseOutputSchema.extend({
  // Nested exercise details
  exercise: z
    .object({
      id: z.number(),
      name: z.string(),
      category: z.string(),
      exerciseType: z.string(),
      equipment: z.string().nullable(),
    })
    .optional()
    .describe("Exercise details"),

  // Nested sets
  sets: z.array(exerciseSetOutputSchema).optional().describe("Sets for this exercise"),
});

export type WorkoutExerciseOutput = z.infer<typeof workoutExerciseOutputSchema>;

/**
 * Workout output schema (from drizzle-zod)
 */
export const workoutOutputSchema = selectWorkoutSchema;

export type WorkoutOutput = z.infer<typeof workoutOutputSchema>;

/**
 * Full workout output with exercises and sets
 */
export const workoutFullOutputSchema = workoutOutputSchema.extend({
  workoutExercises: z
    .array(workoutExerciseOutputSchema)
    .optional()
    .describe("Exercises in workout"),
});

export type WorkoutFullOutput = z.infer<typeof workoutFullOutputSchema>;

/**
 * Paginated workout list output
 */
export const workoutListOutputSchema = z.object({
  workouts: z.array(workoutOutputSchema).describe("List of workouts"),
  total: z.number().describe("Total number of workouts matching the filter"),
  limit: z.number().describe("Number of results per page"),
  offset: z.number().describe("Offset for pagination"),
});

export type WorkoutListOutput = z.infer<typeof workoutListOutputSchema>;

/**
 * Success result schema
 */
export const successResultSchema = z.object({
  success: z.boolean().describe("Whether the operation was successful"),
});

export type SuccessResult = z.infer<typeof successResultSchema>;

// ============================================================================
// Input Schemas (custom API schemas + DB insert schemas)
// ============================================================================

/**
 * List workouts input (custom filter schema)
 */
export const listWorkoutsSchema = z.object({
  startDate: z.coerce.date().optional().describe("Filter workouts starting from this date"),
  endDate: z.coerce.date().optional().describe("Filter workouts until this date"),
  completed: z.boolean().optional().describe("Filter by completion status"),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe("Maximum number of results"),
  offset: z.coerce.number().int().min(0).default(0).describe("Number of results to skip"),
});

export type ListWorkoutsInput = z.infer<typeof listWorkoutsSchema>;

/**
 * Get workout by ID input
 */
export const getWorkoutByIdSchema = z.object({
  workoutId: z.coerce.number().describe("The workout ID"),
});

export type GetWorkoutByIdInput = z.infer<typeof getWorkoutByIdSchema>;

/**
 * Create workout input (from drizzle-zod insert schema)
 */
export const createWorkoutSchema = insertWorkoutSchema;

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

/**
 * Update workout input
 */
export const updateWorkoutSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout to update"),
  name: z.string().max(100).optional().describe("New name for the workout"),
  notes: z.string().max(1000).optional().describe("New notes for the workout"),
});

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

/**
 * Delete workout input
 */
export const deleteWorkoutSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout to delete"),
});

export type DeleteWorkoutInput = z.infer<typeof deleteWorkoutSchema>;

/**
 * Complete workout input
 */
export const completeWorkoutSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout to complete"),
  rating: workoutRatingSchema.optional().describe("Rating for the workout (1-5)"),
  mood: workoutMoodSchema.optional().describe("Mood during the workout"),
  notes: z.string().max(1000).optional().describe("Final notes for the workout"),
});

export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;

/**
 * Add exercise to workout input (based on drizzle-zod insert schema)
 */
export const addExerciseSchema = insertWorkoutExerciseSchema.omit({ workoutId: true }).extend({
  workoutId: z.coerce.number().describe("ID of the workout"),
});

export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

/**
 * Update workout exercise input
 */
export const updateWorkoutExerciseSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout"),
  workoutExerciseId: z.coerce.number().describe("ID of the workout exercise to update"),
  notes: z.string().max(500).optional().describe("New notes"),
  supersetGroupId: z.number().nullable().optional().describe("New superset group ID"),
});

export type UpdateWorkoutExerciseInput = z.infer<typeof updateWorkoutExerciseSchema>;

/**
 * Remove exercise from workout input
 */
export const removeExerciseSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout"),
  workoutExerciseId: z.coerce.number().describe("ID of the workout exercise to remove"),
});

export type RemoveExerciseInput = z.infer<typeof removeExerciseSchema>;

/**
 * Reorder exercises input
 */
export const reorderExercisesSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout"),
  exerciseOrder: z
    .array(
      z.object({
        workoutExerciseId: z.number().describe("ID of the workout exercise"),
        order: z.number().int().min(1).describe("New position"),
      }),
    )
    .describe("New order for exercises"),
});

export type ReorderExercisesInput = z.infer<typeof reorderExercisesSchema>;

/**
 * Add set to workout exercise input (based on drizzle-zod insert schema)
 */
export const addSetSchema = insertExerciseSetSchema.omit({ workoutExerciseId: true }).extend({
  workoutId: z.coerce.number().describe("ID of the workout"),
  workoutExerciseId: z.coerce.number().describe("ID of the workout exercise"),
});

export type AddSetInput = z.infer<typeof addSetSchema>;

/**
 * Update set input
 */
export const updateSetSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout"),
  setId: z.coerce.number().describe("ID of the set to update"),

  // Strength fields
  reps: z.number().int().min(0).optional().describe("Number of repetitions"),
  weight: z.number().min(0).optional().describe("Weight used"),
  weightUnit: weightUnitSchema.optional().describe("Weight unit"),

  // Cardio fields
  durationSeconds: z.number().int().min(0).optional().describe("Duration in seconds"),
  distance: z.number().min(0).optional().describe("Distance in meters"),
  distanceUnit: distanceUnitSchema.optional().describe("Distance unit"),

  // Flexibility fields
  holdTimeSeconds: z.number().int().min(0).optional().describe("Hold time in seconds"),

  // Set classification and intensity
  setType: setTypeSchema.optional().describe("Type of set"),
  rpe: rpeSchema.optional().describe("Rate of Perceived Exertion (6-10)"),
  rir: rirSchema.optional().describe("Reps in Reserve (0-5)"),

  // Targets
  targetReps: z.number().int().min(0).optional().describe("Target reps"),
  targetWeight: z.number().min(0).optional().describe("Target weight"),

  // Rest
  restTimeSeconds: z.number().int().min(0).optional().describe("Rest time before set"),

  notes: z.string().max(500).optional().describe("Notes for this set"),
});

export type UpdateSetInput = z.infer<typeof updateSetSchema>;

/**
 * Delete set input
 */
export const deleteSetSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout"),
  setId: z.coerce.number().describe("ID of the set to delete"),
});

export type DeleteSetInput = z.infer<typeof deleteSetSchema>;

/**
 * Complete set input
 */
export const completeSetSchema = z.object({
  workoutId: z.coerce.number().describe("ID of the workout"),
  setId: z.coerce.number().describe("ID of the set to complete"),
  restTimeSeconds: z.number().int().min(0).optional().describe("Actual rest time taken"),
});

export type CompleteSetInput = z.infer<typeof completeSetSchema>;
