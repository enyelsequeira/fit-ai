/**
 * Type definitions for the Workouts module
 */

export type DateRange = "week" | "month" | "all";

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
