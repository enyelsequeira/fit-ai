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
