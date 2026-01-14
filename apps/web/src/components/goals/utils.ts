/**
 * Utility functions for the Goals module
 */

import {
  IconCalendar,
  IconChartLine,
  IconScale,
  IconStretching,
  IconTarget,
} from "@tabler/icons-react";

import type { GoalType, GoalWithExercise } from "./types";

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
 * Get display label for goal type
 */
export function getGoalTypeLabel(type: GoalType): string {
  switch (type) {
    case "weight":
      return "Weight";
    case "strength":
      return "Strength";
    case "body_measurement":
      return "Measurement";
    case "workout_frequency":
      return "Frequency";
    case "custom":
      return "Custom";
    default:
      return "Goal";
  }
}

/**
 * Format target value based on goal type
 */
export function formatTargetValue(goal: GoalWithExercise): string {
  const type = goal.goalType as GoalType;

  switch (type) {
    case "weight":
      if (goal.currentWeight && goal.targetWeight) {
        return `${goal.currentWeight} / ${goal.targetWeight} ${goal.weightUnit ?? "kg"}`;
      }
      return `Target: ${goal.targetWeight ?? "-"} ${goal.weightUnit ?? "kg"}`;

    case "strength":
      if (goal.targetLiftWeight) {
        return `${goal.currentLiftWeight ?? "-"} / ${goal.targetLiftWeight} ${goal.weightUnit ?? "kg"}`;
      }
      if (goal.targetReps) {
        return `${goal.currentReps ?? "-"} / ${goal.targetReps} reps`;
      }
      return "-";

    case "body_measurement":
      return `${goal.currentMeasurement ?? "-"} / ${goal.targetMeasurement ?? "-"} ${goal.lengthUnit ?? "cm"}`;

    case "workout_frequency":
      return `${goal.currentWorkoutsPerWeek?.toFixed(1) ?? "-"} / ${goal.targetWorkoutsPerWeek ?? "-"} per week`;

    case "custom":
      return `${goal.currentCustomValue ?? "-"} / ${goal.targetCustomValue ?? "-"} ${goal.customMetricUnit ?? ""}`;

    default:
      return "-";
  }
}

/**
 * Format deadline date with relative display
 */
export function formatDeadline(date: Date | null): string {
  if (!date) return "No deadline";

  const now = new Date();
  const target = new Date(date);
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `${diffDays} days left`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: target.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Get progress bar color based on percentage and status
 */
export function getProgressColor(percentage: number, status: string): string {
  if (status === "completed") return "blue";
  if (status === "abandoned") return "gray";
  if (status === "paused") return "yellow";
  if (percentage >= 75) return "green";
  if (percentage >= 50) return "teal";
  if (percentage >= 25) return "yellow";
  return "orange";
}
