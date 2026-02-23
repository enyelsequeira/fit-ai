/**
 * Workout-specific utility functions
 */

import type { TimePeriodFilter } from "./types";

/**
 * Calculates workout duration from start and end times
 * @param startedAt - Start timestamp
 * @param completedAt - End timestamp (or null if in progress)
 * @returns Duration in minutes, or null if not calculable
 */
export function calculateWorkoutDuration(
  startedAt: string | Date | null,
  completedAt: string | Date | null,
): number | null {
  if (!startedAt) return null;

  const start = typeof startedAt === "string" ? new Date(startedAt) : startedAt;
  const end = completedAt
    ? typeof completedAt === "string"
      ? new Date(completedAt)
      : completedAt
    : new Date();

  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60));
}

/**
 * Gets the date range for a given time period filter
 * @param filter - Time period filter
 * @returns Object with startDate and endDate
 */
export function getDateRangeForFilter(filter: TimePeriodFilter): {
  startDate?: Date;
  endDate?: Date;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today":
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return {
        startDate: startOfWeek,
        endDate: now,
      };
    }
    case "month": {
      const startOfMonth = new Date(today);
      startOfMonth.setDate(today.getDate() - 30);
      return {
        startDate: startOfMonth,
        endDate: now,
      };
    }
    case "all":
    default:
      return {};
  }
}

/**
 * Counts completed sets in workout exercises
 * @param workoutExercises - Array of workout exercises with sets
 * @returns Object with total sets and completed sets
 */
export function countSets(
  workoutExercises: Array<{ sets?: Array<{ completedAt: string | Date | null }> }> | undefined,
): { total: number; completed: number } {
  if (!workoutExercises) return { total: 0, completed: 0 };

  let total = 0;
  let completed = 0;

  for (const exercise of workoutExercises) {
    if (exercise.sets) {
      total += exercise.sets.length;
      completed += exercise.sets.filter((s) => s.completedAt !== null).length;
    }
  }

  return { total, completed };
}
