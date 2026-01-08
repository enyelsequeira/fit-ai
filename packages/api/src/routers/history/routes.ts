import { protectedProcedure } from "../../index";
import {
  getBestPerformanceHandler,
  getLastPerformanceHandler,
  getMuscleVolumeHandler,
  getProgressionHandler,
  getRecentWorkoutsHandler,
  getSummaryHandler,
  getWorkoutDetailsHandler,
  getWorkoutHistoryHandler,
} from "./handlers";
import {
  bestPerformanceOutputSchema,
  exerciseIdInputSchema,
  lastPerformanceOutputSchema,
  muscleVolumeInputSchema,
  muscleVolumeOutputSchema,
  progressionInputSchema,
  progressionOutputSchema,
  recentWorkoutsInputSchema,
  recentWorkoutsOutputSchema,
  trainingSummaryOutputSchema,
  workoutDetailsOutputSchema,
  workoutHistoryInputSchema,
  workoutHistoryOutputSchema,
  workoutIdInputSchema,
} from "./schemas";

// ============================================================================
// Exercise History Routes
// ============================================================================

export const getLastPerformanceRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/last",
    summary: "Get last performance for exercise",
    description:
      "Returns the most recent workout performance for a specific exercise, including all sets, total volume, and top set.",
    tags: ["History"],
  })
  .input(exerciseIdInputSchema)
  .output(lastPerformanceOutputSchema.nullable())
  .handler(async ({ input, context }) => getLastPerformanceHandler(input, context));

export const getBestPerformanceRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/best",
    summary: "Get best performance for exercise",
    description:
      "Returns personal records for an exercise including max weight, max reps, max volume, and estimated 1RM.",
    tags: ["History"],
  })
  .input(exerciseIdInputSchema)
  .output(bestPerformanceOutputSchema)
  .handler(async ({ input, context }) => getBestPerformanceHandler(input, context));

export const getProgressionRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/progression",
    summary: "Get exercise progression",
    description:
      "Returns performance data over time for charting progression. Shows top set weight, volume, and estimated 1RM per workout.",
    tags: ["History"],
  })
  .input(progressionInputSchema)
  .output(progressionOutputSchema)
  .handler(async ({ input, context }) => getProgressionHandler(input, context));

export const getRecentWorkoutsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/exercise/{exerciseId}/recent",
    summary: "Get recent workouts with exercise",
    description:
      "Returns the last N workouts that included a specific exercise, with full set details.",
    tags: ["History"],
  })
  .input(recentWorkoutsInputSchema)
  .output(recentWorkoutsOutputSchema)
  .handler(async ({ input, context }) => getRecentWorkoutsHandler(input, context));

// ============================================================================
// Workout History Routes
// ============================================================================

export const getWorkoutHistoryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/workouts",
    summary: "Get workout history",
    description:
      "Returns a paginated list of completed workouts with summary statistics including duration, volume, and exercise/set counts.",
    tags: ["History"],
  })
  .input(workoutHistoryInputSchema)
  .output(workoutHistoryOutputSchema)
  .handler(async ({ input, context }) => getWorkoutHistoryHandler(input, context));

export const getWorkoutDetailsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/workouts/{workoutId}/details",
    summary: "Get workout details",
    description:
      "Returns complete details for a specific workout including all exercises and their sets.",
    tags: ["History"],
  })
  .input(workoutIdInputSchema)
  .output(workoutDetailsOutputSchema)
  .handler(async ({ input, context }) => getWorkoutDetailsHandler(input, context));

// ============================================================================
// Summary Routes
// ============================================================================

export const getSummaryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/summary",
    summary: "Get training summary",
    description:
      "Returns overall training statistics including total workouts, volume, streaks, and favorite exercise.",
    tags: ["History"],
  })
  .output(trainingSummaryOutputSchema)
  .handler(async ({ context }) => getSummaryHandler(context));

export const getMuscleVolumeRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/history/muscle-volume",
    summary: "Get weekly muscle volume",
    description: "Returns volume breakdown by muscle group for a specific week.",
    tags: ["History"],
  })
  .input(muscleVolumeInputSchema)
  .output(muscleVolumeOutputSchema)
  .handler(async ({ input, context }) => getMuscleVolumeHandler(input, context));
