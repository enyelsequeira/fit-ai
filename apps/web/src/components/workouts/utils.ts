/**
 * Utility functions for the Workouts module
 */

import type { TimePeriodFilter } from "./types";

/**
 * Formats a date to a human-readable relative string
 * @param date - Date to format
 * @returns Formatted string like "Today", "Yesterday", "Monday", or "Jan 15"
 */
export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Formats workout duration in minutes to a human-readable string
 * @param minutes - Duration in minutes (or null)
 * @returns Formatted string like "45 min", "1h 30m", or "-" if null
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

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
 * Formats time as HH:MM AM/PM
 * @param date - Date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Gets a summary of exercises in a workout
 * @param exerciseCount - Number of exercises
 * @param setCount - Number of sets
 * @returns Formatted summary string
 */
export function getExerciseSummary(exerciseCount: number, setCount: number): string {
  const exercises = exerciseCount === 1 ? "exercise" : "exercises";
  const sets = setCount === 1 ? "set" : "sets";
  return `${exerciseCount} ${exercises}, ${setCount} ${sets}`;
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

/**
 * Gets time period label for display
 * @param filter - Time period filter
 * @returns Human-readable label
 */
export function getTimePeriodLabel(filter: TimePeriodFilter): string {
  switch (filter) {
    case "today":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "Last 30 Days";
    case "all":
      return "All Workouts";
    default:
      return "Workouts";
  }
}
