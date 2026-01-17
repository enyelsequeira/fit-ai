/**
 * Query options for workout-related data fetching
 * Following TanStack Query v5 queryOptions pattern
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/query-options
 */

import { queryOptions } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

/**
 * Query keys factory for workout-related queries
 * Used for cache invalidation and query identification
 */
export const workoutKeys = {
  all: ["workout"] as const,
  lists: () => [...workoutKeys.all, "list"] as const,
  list: (filters: {
    startDate?: Date;
    endDate?: Date;
    completed?: boolean;
    limit?: number;
    offset?: number;
  }) => [...workoutKeys.lists(), filters] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: number) => [...workoutKeys.details(), id] as const,
};

/**
 * Query options for fetching workouts list with optional filtering
 */
export function workoutsListOptions(params?: {
  startDate?: Date;
  endDate?: Date;
  completed?: boolean;
  limit?: number;
  offset?: number;
}) {
  return queryOptions({
    queryKey: workoutKeys.list({
      startDate: params?.startDate,
      endDate: params?.endDate,
      completed: params?.completed,
      limit: params?.limit,
      offset: params?.offset,
    }),
    queryFn: () =>
      orpc.workout.list.call({
        startDate: params?.startDate,
        endDate: params?.endDate,
        completed: params?.completed,
        limit: params?.limit ?? 100,
        offset: params?.offset ?? 0,
      }),
  });
}

/**
 * Query options for fetching a single workout by ID with all exercises and sets
 */
export function workoutDetailOptions(workoutId: number | null) {
  return queryOptions({
    queryKey: workoutKeys.detail(workoutId ?? 0),
    queryFn: () => orpc.workout.getById.call({ workoutId: workoutId! }),
    enabled: workoutId !== null,
  });
}

/**
 * Query options for fetching workouts for today
 */
export function todayWorkoutsOptions() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  return workoutsListOptions({
    startDate: startOfDay,
    endDate: endOfDay,
  });
}

/**
 * Query options for fetching workouts for this week
 */
export function thisWeekWorkoutsOptions() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return workoutsListOptions({
    startDate: startOfWeek,
    endDate: today,
  });
}

/**
 * Query options for fetching workouts for last 30 days
 */
export function lastMonthWorkoutsOptions() {
  const today = new Date();
  const startOfMonth = new Date(today);
  startOfMonth.setDate(today.getDate() - 30);
  startOfMonth.setHours(0, 0, 0, 0);

  return workoutsListOptions({
    startDate: startOfMonth,
    endDate: today,
  });
}
