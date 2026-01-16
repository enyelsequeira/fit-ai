/**
 * Utility functions for goal detail components
 */

import {
  IconCalendar,
  IconChartLine,
  IconScale,
  IconStretching,
  IconTarget,
} from "@tabler/icons-react";
import type { GoalType, GoalWithProgress } from "./types";

/**
 * Get icon component for goal type
 */
export function getGoalTypeIcon(type: GoalType) {
  switch (type) {
    case "weight":
      return IconScale;
    case "strength":
      return IconStretching;
    case "body_measurement":
      return IconTarget;
    case "workout_frequency":
      return IconCalendar;
    case "custom":
    default:
      return IconChartLine;
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return "-";

  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

/**
 * Goal values with unit for display
 */
export interface GoalValues {
  current: number | null;
  target: number | null;
  start: number | null;
  unit: string;
}

/**
 * Get current, target, start values and unit for a goal based on its type
 */
export function getGoalValues(goal: GoalWithProgress): GoalValues {
  const type = goal.goalType as GoalType;

  switch (type) {
    case "weight":
      return {
        current: goal.currentWeight ?? null,
        target: goal.targetWeight ?? null,
        start: goal.startWeight ?? null,
        unit: goal.weightUnit ?? "kg",
      };
    case "strength":
      if (goal.targetLiftWeight) {
        return {
          current: goal.currentLiftWeight ?? null,
          target: goal.targetLiftWeight ?? null,
          start: goal.startLiftWeight ?? null,
          unit: goal.weightUnit ?? "kg",
        };
      }
      return {
        current: goal.currentReps ?? null,
        target: goal.targetReps ?? null,
        start: goal.startReps ?? null,
        unit: "reps",
      };
    case "body_measurement":
      return {
        current: goal.currentMeasurement ?? null,
        target: goal.targetMeasurement ?? null,
        start: goal.startMeasurement ?? null,
        unit: goal.lengthUnit ?? "cm",
      };
    case "workout_frequency":
      return {
        current: goal.currentWorkoutsPerWeek ?? null,
        target: goal.targetWorkoutsPerWeek ?? null,
        start: 0,
        unit: "per week",
      };
    case "custom":
      return {
        current: goal.currentCustomValue ?? null,
        target: goal.targetCustomValue ?? null,
        start: goal.startCustomValue ?? null,
        unit: goal.customMetricUnit ?? "",
      };
    default:
      return { current: null, target: null, start: null, unit: "" };
  }
}

/**
 * Get color for goal status badge
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "green";
    case "paused":
      return "yellow";
    case "completed":
      return "blue";
    case "abandoned":
      return "gray";
    default:
      return "gray";
  }
}
