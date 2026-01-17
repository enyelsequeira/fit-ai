/**
 * TypeScript types for the Workouts module
 */

import type { orpc } from "@/utils/orpc";

// ============================================================================
// API Response Types (inferred from oRPC)
// ============================================================================

/**
 * Workout output type from API
 */
export type Workout = Awaited<ReturnType<typeof orpc.workout.list.call>>["workouts"][number];

/**
 * Full workout with exercises and sets
 */
export type WorkoutFull = Awaited<ReturnType<typeof orpc.workout.getById.call>>;

/**
 * Workout exercise with nested exercise details and sets
 */
export type WorkoutExercise = NonNullable<WorkoutFull["workoutExercises"]>[number];

/**
 * Exercise set type
 */
export type ExerciseSet = NonNullable<WorkoutExercise["sets"]>[number];

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Time period filter options for workouts sidebar
 */
export type TimePeriodFilter = "today" | "week" | "month" | "all";

/**
 * Legacy date range type (for compatibility)
 */
export type DateRange = "week" | "month" | "all";

/**
 * Filter state for workouts list
 */
export interface WorkoutFilters {
  timePeriod: TimePeriodFilter;
  completed?: boolean;
  searchQuery?: string;
}

// ============================================================================
// Stats and Summary Types
// ============================================================================

export interface WorkoutSummary {
  id: number;
  name: string | null;
  date: Date;
  duration: number | null;
  exerciseCount: number;
  setCount: number;
  totalVolume: number;
  isCompleted: boolean;
  mood: string | null;
  rating: number | null;
}

export interface WorkoutStats {
  totalWorkouts: number;
  workoutsThisWeek: number;
  currentStreak: number;
  totalVolume: number;
  averageDuration: number;
  isLoading: boolean;
}

export interface CalendarWorkoutDay {
  date: Date;
  workoutCount: number;
  isCompleted: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for workout card click handler
 */
export interface WorkoutCardClickHandler {
  (workoutId: number): void;
}

/**
 * Workout completion data
 */
export interface WorkoutCompletionData {
  rating?: number;
  mood?: WorkoutMood;
  notes?: string;
}

// ============================================================================
// Mood and Rating Types
// ============================================================================

export const WORKOUT_MOODS = ["great", "good", "okay", "tired", "bad"] as const;
export type WorkoutMood = (typeof WORKOUT_MOODS)[number];

export const MOOD_LABELS: Record<WorkoutMood, string> = {
  great: "Great",
  good: "Good",
  okay: "Okay",
  tired: "Tired",
  bad: "Bad",
};

export const MOOD_COLORS: Record<WorkoutMood, string> = {
  great: "green",
  good: "teal",
  okay: "gray",
  tired: "orange",
  bad: "red",
};

// ============================================================================
// Time Period Labels
// ============================================================================

export const TIME_PERIOD_LABELS: Record<TimePeriodFilter, string> = {
  today: "Today",
  week: "This Week",
  month: "Last 30 Days",
  all: "All Workouts",
};
