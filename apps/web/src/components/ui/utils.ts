/**
 * Shared utility functions for the FitAi UI components
 */

import dayjs from "dayjs";
import isToday_plugin from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(isToday_plugin);
dayjs.extend(isYesterday);

/**
 * Formats duration in minutes to a human-readable string
 * @param minutes - Duration in minutes (or null/undefined)
 * @returns Formatted string like "45 min", "1h 30m", or "-" if null/undefined
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
 */
export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "-";

  const d = dayjs(date);
  if (d.isToday()) return "Today";
  if (d.isYesterday()) return "Yesterday";

  const diffDays = dayjs().startOf("day").diff(d.startOf("day"), "day");
  if (diffDays < 7) return d.format("dddd");

  return d.format("MMM D");
}

/**
 * Formats time as HH:MM AM/PM
 * @param date - Date to format (Date object, ISO string, or null)
 * @returns Formatted time string like "3:45 PM" or "-" if null
 */
export function formatTime(date: Date | string | null): string {
  if (!date) return "-";
  return dayjs(date).format("h:mm A");
}

/**
 * Pluralizes a word based on count
 * @param count - The number to check
 * @param singular - Singular form of the word
 * @param plural - Optional plural form (defaults to singular + 's')
 * @returns The appropriate word form
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
 */
export function formatCountSummary(items: CountSummaryItem[]): string {
  return items
    .map((item) => `${item.count} ${pluralize(item.count, item.singular, item.plural)}`)
    .join(", ");
}

/**
 * Formats a volume number into a human-readable string with kg units
 * @param volume - The volume in kg
 * @returns Formatted string (e.g., "1.5M kg", "12.3k kg", "500 kg")
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M kg`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume} kg`;
}

/**
 * Formats a date with short weekday, short month, and day
 * @param date - Date to format
 * @returns Formatted string like "Mon, Jan 15"
 */
export function formatShortDate(date: Date): string {
  return dayjs(date).format("ddd, MMM D");
}

/**
 * Formats a date with long weekday, long month, and day
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted string like "Monday, January 15"
 */
export function formatLongDate(date: Date | string): string {
  return dayjs(date).format("dddd, MMMM D");
}

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns true if the date is today
 */
export function isToday(date: Date): boolean {
  return dayjs(date).isToday();
}
