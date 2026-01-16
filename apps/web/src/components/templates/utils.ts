/**
 * Utility functions for the Templates module
 */

/**
 * Formats duration in minutes to a human-readable string
 * @param minutes - Duration in minutes (or null)
 * @returns Formatted string like "45 min", "1h 30m", or "-" if null
 */
export function formatDuration(minutes: number | null): string {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
