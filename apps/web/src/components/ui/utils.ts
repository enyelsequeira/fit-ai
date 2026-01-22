/**
 * Shared utility functions for the FitAi UI components
 */

/**
 * Formats duration in minutes to a human-readable string
 * @param minutes - Duration in minutes (or null/undefined)
 * @returns Formatted string like "45 min", "1h 30m", or "-" if null/undefined
 * @example
 * formatDuration(0) // "0 min"
 * formatDuration(45) // "45 min"
 * formatDuration(90) // "1h 30m"
 * formatDuration(120) // "2h"
 * formatDuration(null) // "-"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Formats a date to a human-readable relative string
 * @param date - Date to format (Date object, ISO string, or null)
 * @returns Formatted string like "Today", "Yesterday", "Monday", or "Jan 15"
 * @example
 * formatRelativeDate(new Date()) // "Today"
 * formatRelativeDate(yesterday) // "Yesterday"
 * formatRelativeDate(lastWeek) // "Monday"
 * formatRelativeDate(lastMonth) // "Jan 15"
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
 * Formats time as HH:MM AM/PM
 * @param date - Date to format (Date object, ISO string, or null)
 * @returns Formatted time string like "3:45 PM" or "-" if null
 * @example
 * formatTime(new Date()) // "3:45 PM"
 * formatTime("2024-01-15T15:45:00Z") // "3:45 PM"
 * formatTime(null) // "-"
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
 * Pluralizes a word based on count
 * @param count - The number to check
 * @param singular - Singular form of the word
 * @param plural - Optional plural form (defaults to singular + 's')
 * @returns The appropriate word form
 * @example
 * pluralize(1, "exercise") // "exercise"
 * pluralize(5, "exercise") // "exercises"
 * pluralize(1, "day", "days") // "day"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Item for count summary formatting
 */
type CountSummaryItem = {
  count: number;
  singular: string;
  plural?: string;
};

/**
 * Creates a summary string for counts (e.g., "3 exercises, 12 sets")
 * @param items - Array of count summary items
 * @returns Formatted summary string
 * @example
 * formatCountSummary([
 *   { count: 3, singular: "exercise" },
 *   { count: 12, singular: "set" }
 * ]) // "3 exercises, 12 sets"
 */
export function formatCountSummary(items: CountSummaryItem[]): string {
  return items
    .map((item) => `${item.count} ${pluralize(item.count, item.singular, item.plural)}`)
    .join(", ");
}
