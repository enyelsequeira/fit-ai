/**
 * Shared types for measurement form components
 */

import type { UseFormReturnType } from "@mantine/form";

export interface MeasurementFormValues {
  measuredAt: Date;
  weight: number | null;
  weightUnit: "kg" | "lb";
  bodyFatPercentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  leftCalf: number | null;
  rightCalf: number | null;
  neck: number | null;
  shoulders: number | null;
  lengthUnit: "cm" | "in";
  notes: string;
}

export type MeasurementForm = UseFormReturnType<MeasurementFormValues>;

export type MeasurementFieldName = keyof MeasurementFormValues;

export const defaultMeasurementValues: MeasurementFormValues = {
  measuredAt: new Date(),
  weight: null,
  weightUnit: "kg",
  bodyFatPercentage: null,
  chest: null,
  waist: null,
  hips: null,
  leftArm: null,
  rightArm: null,
  leftThigh: null,
  rightThigh: null,
  leftCalf: null,
  rightCalf: null,
  neck: null,
  shoulders: null,
  lengthUnit: "cm",
  notes: "",
};
