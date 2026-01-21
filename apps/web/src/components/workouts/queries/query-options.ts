/**
 * Query options for workout-related data fetching
 * Using oRPC TanStack Query integration with automatic key generation
 * @see https://orpc.dev/docs/integrations/tanstack-query
 */

import { orpc } from "@/utils/orpc";

/**
 * Query options for fetching workouts list with optional filtering
 * Uses orpc.*.queryOptions() for automatic key generation
 */
export function workoutsListOptions(params?: {
  startDate?: Date;
  endDate?: Date;
  completed?: boolean;
  limit?: number;
  offset?: number;
}) {
  return orpc.workout.list.queryOptions({
    input: {
      startDate: params?.startDate,
      endDate: params?.endDate,
      completed: params?.completed,
      limit: params?.limit ?? 100,
      offset: params?.offset ?? 0,
    },
  });
}

/**
 * Query options for fetching a single workout by ID with all exercises and sets
 */
export function workoutDetailOptions(workoutId: number | null) {
  return orpc.workout.getById.queryOptions({
    input: { workoutId: workoutId! },
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
