/**
 * Type definitions for the Goals module
 */

import type {
  GoalOutput,
  GoalProgressOutput,
  GoalsSummary,
  GoalWithExercise,
  GoalWithProgress,
} from "@fit-ai/api/routers/goals";

// Re-export API types for convenience
export type { GoalOutput, GoalProgressOutput, GoalsSummary, GoalWithExercise, GoalWithProgress };

/**
 * Goal type union
 */
export type GoalType = "weight" | "strength" | "body_measurement" | "workout_frequency" | "custom";

/**
 * Goal status union
 */
export type GoalStatus = "active" | "completed" | "abandoned" | "paused";

/**
 * Filter options for goals list
 */
export interface GoalsFilter {
  goalType?: GoalType;
  status?: GoalStatus;
  exerciseId?: number;
}

/**
 * Tab configuration for status filtering
 */
export interface StatusTab {
  value: GoalStatus | "all";
  label: string;
  count?: number;
}

/**
 * Goal type configuration for display
 */
export interface GoalTypeConfig {
  type: GoalType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Summary statistics for goals
 */
export interface GoalsStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
  nearDeadlineCount: number;
  isLoading: boolean;
}

/**
 * Create goal form data base
 */
export interface CreateGoalFormBase {
  title: string;
  description?: string;
  targetDate?: Date;
}

/**
 * Weight goal form data
 */
export interface CreateWeightGoalForm extends CreateGoalFormBase {
  startWeight: number;
  targetWeight: number;
  weightUnit: "kg" | "lb";
  direction: "increase" | "decrease" | "maintain";
}

/**
 * Strength goal form data
 */
export interface CreateStrengthGoalForm extends CreateGoalFormBase {
  exerciseId: number;
  startLiftWeight?: number;
  targetLiftWeight?: number;
  startReps?: number;
  targetReps?: number;
  weightUnit: "kg" | "lb";
  direction: "increase" | "decrease" | "maintain";
}

/**
 * Body measurement goal form data
 */
export interface CreateBodyMeasurementGoalForm extends CreateGoalFormBase {
  measurementType: string;
  startMeasurement: number;
  targetMeasurement: number;
  lengthUnit: "cm" | "in";
  direction: "increase" | "decrease" | "maintain";
}

/**
 * Workout frequency goal form data
 */
export interface CreateWorkoutFrequencyGoalForm extends CreateGoalFormBase {
  targetWorkoutsPerWeek: number;
}

/**
 * Custom goal form data
 */
export interface CreateCustomGoalForm extends CreateGoalFormBase {
  customMetricName: string;
  customMetricUnit?: string;
  startCustomValue: number;
  targetCustomValue: number;
  direction: "increase" | "decrease" | "maintain";
}

/**
 * Log progress form data
 */
export interface LogProgressForm {
  goalId: number;
  value: number;
  note?: string;
}
