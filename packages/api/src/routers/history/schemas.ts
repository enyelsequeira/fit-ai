import z from "zod";

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Weight unit schema
 */
export const weightUnitSchema = z.enum(["kg", "lb"]).describe("Unit of weight measurement");

export type WeightUnitInput = z.infer<typeof weightUnitSchema>;

/**
 * Set type schema
 */
export const setTypeSchema = z
  .enum(["normal", "warmup", "failure", "drop"])
  .describe("Type of set: normal, warmup, failure, or drop set");

export type SetTypeInput = z.infer<typeof setTypeSchema>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Set data schema for history
 */
export const historySetSchema = z.object({
  setNumber: z.number().describe("Set number (1-based)"),
  weight: z.number().nullable().describe("Weight used"),
  weightUnit: weightUnitSchema.nullable().describe("Unit of weight"),
  reps: z.number().nullable().describe("Number of repetitions"),
  rpe: z.number().nullable().describe("Rate of Perceived Exertion"),
  setType: setTypeSchema.nullable().describe("Type of set"),
});

export type HistorySet = z.infer<typeof historySetSchema>;

/**
 * Last performance output schema
 */
export const lastPerformanceOutputSchema = z.object({
  exerciseId: z.number().describe("Exercise ID"),
  exerciseName: z.string().describe("Exercise name"),
  lastWorkoutDate: z.date().describe("Date of last workout with this exercise"),
  sets: z.array(historySetSchema).describe("Sets performed"),
  totalVolume: z.number().describe("Total volume (weight x reps summed)"),
  topSet: z
    .object({
      weight: z.number().describe("Weight of heaviest set"),
      reps: z.number().describe("Reps of heaviest set"),
    })
    .nullable()
    .describe("Heaviest set by weight"),
});

export type LastPerformanceOutput = z.infer<typeof lastPerformanceOutputSchema>;

/**
 * Max weight record schema
 */
export const maxWeightRecordSchema = z.object({
  value: z.number().describe("Max weight value"),
  reps: z.number().describe("Reps at max weight"),
  date: z.date().describe("Date of record"),
});

export type MaxWeightRecord = z.infer<typeof maxWeightRecordSchema>;

/**
 * Max reps record schema
 */
export const maxRepsRecordSchema = z.object({
  value: z.number().describe("Max reps value"),
  weight: z.number().describe("Weight at max reps"),
  date: z.date().describe("Date of record"),
});

export type MaxRepsRecord = z.infer<typeof maxRepsRecordSchema>;

/**
 * Max volume record schema
 */
export const maxVolumeRecordSchema = z.object({
  value: z.number().describe("Max volume value"),
  date: z.date().describe("Date of record"),
});

export type MaxVolumeRecord = z.infer<typeof maxVolumeRecordSchema>;

/**
 * Estimated 1RM record schema
 */
export const estimated1RMRecordSchema = z.object({
  value: z.number().describe("Estimated 1RM value"),
  date: z.date().describe("Date of record"),
});

export type Estimated1RMRecord = z.infer<typeof estimated1RMRecordSchema>;

/**
 * Best performance output schema
 */
export const bestPerformanceOutputSchema = z.object({
  exerciseId: z.number().describe("Exercise ID"),
  exerciseName: z.string().describe("Exercise name"),
  maxWeight: maxWeightRecordSchema.nullable().describe("Maximum weight lifted"),
  maxReps: maxRepsRecordSchema.nullable().describe("Maximum reps at any weight"),
  maxVolume: maxVolumeRecordSchema.nullable().describe("Maximum single-workout volume"),
  estimated1RM: estimated1RMRecordSchema.nullable().describe("Best estimated 1 rep max"),
});

export type BestPerformanceOutput = z.infer<typeof bestPerformanceOutputSchema>;

/**
 * Progression data point schema
 */
export const progressionDataPointSchema = z.object({
  date: z.date().describe("Workout date"),
  workoutId: z.number().describe("Workout ID"),
  topSetWeight: z.number().describe("Top set weight"),
  topSetReps: z.number().describe("Top set reps"),
  totalVolume: z.number().describe("Total volume for this exercise"),
  estimated1RM: z.number().describe("Estimated 1RM based on top set"),
});

export type ProgressionDataPoint = z.infer<typeof progressionDataPointSchema>;

/**
 * Progression output schema
 */
export const progressionOutputSchema = z.object({
  exerciseId: z.number().describe("Exercise ID"),
  exerciseName: z.string().describe("Exercise name"),
  dataPoints: z.array(progressionDataPointSchema).describe("Performance data over time"),
});

export type ProgressionOutput = z.infer<typeof progressionOutputSchema>;

/**
 * Recent workout with exercise schema
 */
export const recentWorkoutSchema = z.object({
  workoutId: z.number().describe("Workout ID"),
  workoutName: z.string().nullable().describe("Workout name"),
  date: z.date().describe("Workout date"),
  sets: z.array(historySetSchema).describe("Sets performed"),
  totalVolume: z.number().describe("Total volume"),
  topSet: z
    .object({
      weight: z.number(),
      reps: z.number(),
    })
    .nullable()
    .describe("Top set"),
});

export type RecentWorkout = z.infer<typeof recentWorkoutSchema>;

/**
 * Recent workouts with exercise output schema
 */
export const recentWorkoutsOutputSchema = z.object({
  exerciseId: z.number().describe("Exercise ID"),
  exerciseName: z.string().describe("Exercise name"),
  workouts: z.array(recentWorkoutSchema).describe("Recent workouts with this exercise"),
});

export type RecentWorkoutsOutput = z.infer<typeof recentWorkoutsOutputSchema>;

/**
 * Workout summary schema
 */
export const workoutSummarySchema = z.object({
  id: z.number().describe("Workout ID"),
  name: z.string().nullable().describe("Workout name"),
  date: z.date().describe("Workout date"),
  duration: z.number().nullable().describe("Duration in minutes"),
  exerciseCount: z.number().describe("Number of exercises"),
  setCount: z.number().describe("Total sets"),
  totalVolume: z.number().describe("Total volume"),
  rating: z.number().nullable().describe("User rating"),
  mood: z.string().nullable().describe("User mood"),
});

export type WorkoutSummary = z.infer<typeof workoutSummarySchema>;

/**
 * Workout history output schema
 */
export const workoutHistoryOutputSchema = z.object({
  workouts: z.array(workoutSummarySchema).describe("List of workouts"),
  total: z.number().describe("Total number of workouts"),
  limit: z.number().describe("Page size"),
  offset: z.number().describe("Page offset"),
});

export type WorkoutHistoryOutput = z.infer<typeof workoutHistoryOutputSchema>;

/**
 * Workout details set schema
 */
export const workoutDetailsSetSchema = z.object({
  id: z.number().describe("Set ID"),
  setNumber: z.number().describe("Set number"),
  reps: z.number().nullable().describe("Reps performed"),
  weight: z.number().nullable().describe("Weight used"),
  weightUnit: z.string().nullable().describe("Weight unit"),
  rpe: z.number().nullable().describe("RPE"),
  rir: z.number().nullable().describe("Reps in reserve"),
  setType: z.string().nullable().describe("Set type"),
  isCompleted: z.boolean().nullable().describe("Whether completed"),
  notes: z.string().nullable().describe("Set notes"),
});

export type WorkoutDetailsSet = z.infer<typeof workoutDetailsSetSchema>;

/**
 * Workout details exercise schema
 */
export const workoutDetailsExerciseSchema = z.object({
  id: z.number().describe("Workout exercise ID"),
  exerciseId: z.number().describe("Exercise ID"),
  exerciseName: z.string().describe("Exercise name"),
  category: z.string().describe("Exercise category"),
  muscleGroups: z.array(z.string()).describe("Muscle groups targeted"),
  order: z.number().describe("Exercise order"),
  notes: z.string().nullable().describe("Exercise notes"),
  sets: z.array(workoutDetailsSetSchema).describe("Sets for this exercise"),
  totalVolume: z.number().describe("Volume for this exercise"),
});

export type WorkoutDetailsExercise = z.infer<typeof workoutDetailsExerciseSchema>;

/**
 * Full workout details output schema
 */
export const workoutDetailsOutputSchema = z.object({
  id: z.number().describe("Workout ID"),
  name: z.string().nullable().describe("Workout name"),
  notes: z.string().nullable().describe("Workout notes"),
  startedAt: z.date().describe("Start time"),
  completedAt: z.date().nullable().describe("Completion time"),
  duration: z.number().nullable().describe("Duration in minutes"),
  rating: z.number().nullable().describe("User rating"),
  mood: z.string().nullable().describe("User mood"),
  exercises: z.array(workoutDetailsExerciseSchema).describe("Exercises in workout"),
  totalVolume: z.number().describe("Total workout volume"),
  totalSets: z.number().describe("Total sets"),
});

export type WorkoutDetailsOutput = z.infer<typeof workoutDetailsOutputSchema>;

/**
 * Training summary output schema
 */
export const trainingSummaryOutputSchema = z.object({
  totalWorkouts: z.number().describe("Total completed workouts"),
  totalVolume: z.number().describe("Total volume lifted (all time)"),
  totalSets: z.number().describe("Total sets completed"),
  totalExercises: z.number().describe("Unique exercises performed"),
  averageWorkoutDuration: z.number().nullable().describe("Average workout duration in minutes"),
  averageWorkoutsPerWeek: z.number().describe("Average workouts per week"),
  currentStreak: z.number().describe("Current workout streak in days"),
  longestStreak: z.number().describe("Longest workout streak"),
  favoriteExercise: z
    .object({
      id: z.number(),
      name: z.string(),
      count: z.number(),
    })
    .nullable()
    .describe("Most frequently performed exercise"),
  recentActivity: z
    .object({
      lastWorkoutDate: z.date().nullable(),
      workoutsThisWeek: z.number(),
      workoutsThisMonth: z.number(),
    })
    .describe("Recent activity summary"),
});

export type TrainingSummaryOutput = z.infer<typeof trainingSummaryOutputSchema>;

/**
 * Muscle volume item schema
 */
export const muscleVolumeItemSchema = z.object({
  muscleGroup: z.string().describe("Muscle group name"),
  volume: z.number().describe("Total volume for muscle group"),
  setCount: z.number().describe("Number of sets targeting this muscle"),
  exerciseCount: z.number().describe("Number of exercises targeting this muscle"),
});

export type MuscleVolumeItem = z.infer<typeof muscleVolumeItemSchema>;

/**
 * Weekly muscle volume output schema
 */
export const muscleVolumeOutputSchema = z.object({
  weekStart: z.date().describe("Start of the week"),
  weekEnd: z.date().describe("End of the week"),
  muscleGroups: z.array(muscleVolumeItemSchema).describe("Volume per muscle group"),
  totalVolume: z.number().describe("Total volume for the week"),
});

export type MuscleVolumeOutput = z.infer<typeof muscleVolumeOutputSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Exercise ID input schema
 */
export const exerciseIdInputSchema = z.object({
  exerciseId: z.coerce.number().describe("Exercise ID"),
});

export type ExerciseIdInput = z.infer<typeof exerciseIdInputSchema>;

/**
 * Recent workouts input schema
 */
export const recentWorkoutsInputSchema = z.object({
  exerciseId: z.coerce.number().describe("Exercise ID"),
  limit: z.coerce.number().int().min(1).max(20).default(5).describe("Number of recent workouts"),
});

export type RecentWorkoutsInput = z.infer<typeof recentWorkoutsInputSchema>;

/**
 * Progression input schema
 */
export const progressionInputSchema = z.object({
  exerciseId: z.coerce.number().describe("Exercise ID"),
  days: z.coerce.number().int().min(7).max(365).default(90).describe("Number of days to look back"),
});

export type ProgressionInput = z.infer<typeof progressionInputSchema>;

/**
 * Workout history input schema
 */
export const workoutHistoryInputSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20).describe("Page size"),
  offset: z.coerce.number().int().min(0).default(0).describe("Page offset"),
  startDate: z.coerce.date().optional().describe("Filter from date"),
  endDate: z.coerce.date().optional().describe("Filter until date"),
});

export type WorkoutHistoryInput = z.infer<typeof workoutHistoryInputSchema>;

/**
 * Workout ID input schema
 */
export const workoutIdInputSchema = z.object({
  workoutId: z.coerce.number().describe("Workout ID"),
});

export type WorkoutIdInput = z.infer<typeof workoutIdInputSchema>;

/**
 * Muscle volume input schema
 */
export const muscleVolumeInputSchema = z.object({
  weeksBack: z.coerce.number().int().min(1).max(12).default(1).describe("Number of weeks back"),
});

export type MuscleVolumeInput = z.infer<typeof muscleVolumeInputSchema>;
