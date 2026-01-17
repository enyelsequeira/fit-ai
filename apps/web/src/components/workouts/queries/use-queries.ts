/**
 * Query hooks for workout data fetching
 * Wraps query options with useQuery for convenient component usage
 */

import { useQuery } from "@tanstack/react-query";
import {
  workoutsListOptions,
  workoutDetailOptions,
  todayWorkoutsOptions,
  thisWeekWorkoutsOptions,
  lastMonthWorkoutsOptions,
} from "./query-options";

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

/**
 * Hook for fetching today's workouts
 */
export function useTodayWorkouts() {
  return useQuery(todayWorkoutsOptions());
}

/**
 * Hook for fetching this week's workouts
 */
export function useThisWeekWorkouts() {
  return useQuery(thisWeekWorkoutsOptions());
}

/**
 * Hook for fetching last 30 days workouts
 */
export function useLastMonthWorkouts() {
  return useQuery(lastMonthWorkoutsOptions());
}
