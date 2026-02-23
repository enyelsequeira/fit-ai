import dayjs from "dayjs";

/**
 * Format a record value based on its type
 */
export function formatRecordValue(
  value: number,
  recordType: string,
  displayUnit: string | null,
): string {
  if (recordType === "max_reps") {
    return `${value} reps`;
  }

  if (recordType === "best_time" || recordType === "longest_duration") {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  if (recordType === "longest_distance") {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} km`;
    }
    return `${value} m`;
  }

  const unit = displayUnit ?? "kg";
  return `${value.toFixed(1)} ${unit}`;
}

/**
 * Check if a date is within the last N days
 */
export function isWithinDays(date: Date, days: number): boolean {
  return dayjs().startOf("day").diff(dayjs(date).startOf("day"), "day") < days;
}

/**
 * Format a date for display (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date): string {
  return dayjs(date).format("MMM D, YYYY");
}
