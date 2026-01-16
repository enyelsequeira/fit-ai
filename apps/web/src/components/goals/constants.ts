/**
 * Constants for the Goals module
 */

import type { GoalType } from "./types";

export interface GoalTypeConfig {
  type: GoalType;
  label: string;
  description: string;
  color: string;
}

export const GOAL_TYPES: GoalTypeConfig[] = [
  {
    type: "weight",
    label: "Weight",
    description: "Track body weight changes",
    color: "green",
  },
  {
    type: "strength",
    label: "Strength",
    description: "Improve lift performance",
    color: "orange",
  },
  {
    type: "body_measurement",
    label: "Measurement",
    description: "Track body measurements",
    color: "violet",
  },
  {
    type: "workout_frequency",
    label: "Frequency",
    description: "Workout consistency",
    color: "teal",
  },
  {
    type: "custom",
    label: "Custom",
    description: "Create your own goal",
    color: "indigo",
  },
];

export const DIRECTION_OPTIONS = [
  { value: "increase", label: "Increase" },
  { value: "decrease", label: "Decrease" },
  { value: "maintain", label: "Maintain" },
] as const;

export const WEIGHT_UNIT_OPTIONS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
] as const;

export const LENGTH_UNIT_OPTIONS = [
  { value: "cm", label: "Centimeters (cm)" },
  { value: "in", label: "Inches (in)" },
] as const;

export const MEASUREMENT_TYPE_OPTIONS = [
  { value: "chest", label: "Chest" },
  { value: "waist", label: "Waist" },
  { value: "hips", label: "Hips" },
  { value: "left_arm", label: "Left Arm" },
  { value: "right_arm", label: "Right Arm" },
  { value: "left_thigh", label: "Left Thigh" },
  { value: "right_thigh", label: "Right Thigh" },
  { value: "left_calf", label: "Left Calf" },
  { value: "right_calf", label: "Right Calf" },
  { value: "neck", label: "Neck" },
  { value: "shoulders", label: "Shoulders" },
  { value: "body_fat_percentage", label: "Body Fat %" },
] as const;

export type Direction = (typeof DIRECTION_OPTIONS)[number]["value"];
export type WeightUnit = (typeof WEIGHT_UNIT_OPTIONS)[number]["value"];
export type LengthUnit = (typeof LENGTH_UNIT_OPTIONS)[number]["value"];
export type MeasurementType = (typeof MEASUREMENT_TYPE_OPTIONS)[number]["value"];
