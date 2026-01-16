/**
 * Types for CreateGoalModal component
 */

export interface WeightGoalData {
  title: string;
  description?: string;
  startWeight: number;
  targetWeight: number;
  weightUnit: "kg" | "lb";
  direction: "increase" | "decrease" | "maintain";
  targetDate?: Date;
}

export interface StrengthGoalData {
  title: string;
  description?: string;
  exerciseId: number;
  startLiftWeight?: number;
  targetLiftWeight?: number;
  startReps?: number;
  targetReps?: number;
  weightUnit: "kg" | "lb";
  direction: "increase" | "decrease" | "maintain";
  targetDate?: Date;
}

export interface BodyMeasurementGoalData {
  title: string;
  description?: string;
  measurementType: string;
  startMeasurement: number;
  targetMeasurement: number;
  lengthUnit: "cm" | "in";
  direction: "increase" | "decrease" | "maintain";
  targetDate?: Date;
}

export interface WorkoutFrequencyGoalData {
  title: string;
  description?: string;
  targetWorkoutsPerWeek: number;
  targetDate?: Date;
}

export interface CustomGoalData {
  title: string;
  description?: string;
  customMetricName: string;
  customMetricUnit?: string;
  startCustomValue: number;
  targetCustomValue: number;
  direction: "increase" | "decrease" | "maintain";
  targetDate?: Date;
}

export interface CreateGoalModalProps {
  opened: boolean;
  onClose: () => void;
  onCreateWeightGoal: (data: WeightGoalData) => void;
  onCreateStrengthGoal: (data: StrengthGoalData) => void;
  onCreateBodyMeasurementGoal: (data: BodyMeasurementGoalData) => void;
  onCreateWorkoutFrequencyGoal: (data: WorkoutFrequencyGoalData) => void;
  onCreateCustomGoal: (data: CustomGoalData) => void;
  isLoading?: boolean;
}
