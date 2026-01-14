/**
 * Utility functions and constants for CheckInSummary
 */

import type { Mood } from "./types";

export const MOOD_CONFIG: Record<Mood, { label: string; color: string }> = {
  great: { label: "Great", color: "teal" },
  good: { label: "Good", color: "green" },
  neutral: { label: "Neutral", color: "yellow" },
  low: { label: "Low", color: "orange" },
  bad: { label: "Bad", color: "red" },
};

export function getValueColor(value: number, max: number, inverse = false): string {
  const percentage = (value / max) * 100;
  if (inverse) {
    if (percentage <= 30) return "teal";
    if (percentage <= 60) return "yellow";
    return "red";
  }
  if (percentage >= 70) return "teal";
  if (percentage >= 40) return "yellow";
  return "red";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}
