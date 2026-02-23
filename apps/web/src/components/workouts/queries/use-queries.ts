import { useQuery } from "@tanstack/react-query";
import { workoutsListOptions, workoutDetailOptions } from "./query-options";

/**
 * Hook for fetching workouts list with optional filters
 */
export function useWorkoutsList(params?: {
  startDate?: Date;
  endDate?: Date;
  completed?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery(workoutsListOptions(params));
}

/**
 * Hook for fetching a single workout by ID
 */
export function useWorkoutById(workoutId: number | null) {
  return useQuery(workoutDetailOptions(workoutId));
}
