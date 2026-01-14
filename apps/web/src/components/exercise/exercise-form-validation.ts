import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";

export type ExerciseType = "strength" | "cardio" | "flexibility";

export interface ExerciseFormValues {
  name: string;
  description: string;
  category: ExerciseCategory;
  exerciseType: ExerciseType;
  muscleGroups: string[];
  equipment: NonNullable<EquipmentType> | null;
}

export const defaultFormValues: ExerciseFormValues = {
  name: "",
  description: "",
  category: "other",
  exerciseType: "strength",
  muscleGroups: [],
  equipment: null,
};

export interface NameCheckResult {
  available: boolean;
  message?: string;
}

export function validateExerciseForm(
  values: ExerciseFormValues,
  nameCheckResult?: NameCheckResult,
): Partial<Record<keyof ExerciseFormValues, string>> {
  const errors: Partial<Record<keyof ExerciseFormValues, string>> = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  } else if (nameCheckResult && !nameCheckResult.available && nameCheckResult.message) {
    errors.name = nameCheckResult.message;
  }

  if (values.exerciseType === "strength" && values.muscleGroups.length === 0) {
    errors.muscleGroups = "At least one muscle group is required for strength exercises";
  }

  return errors;
}

export function createFormPayload(values: ExerciseFormValues) {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    category: values.category,
    exerciseType: values.exerciseType,
    muscleGroups: values.muscleGroups,
    equipment: values.equipment || undefined,
  };
}

export const exerciseTypeOptions: { value: ExerciseType; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "flexibility", label: "Flexibility" },
];
