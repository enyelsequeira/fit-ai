import type { PreferencesData } from "./preferences-form.types";

// Default values for form initialization
export const DEFAULT_PREFERENCES: PreferencesData = {
  primaryGoal: undefined,
  secondaryGoal: null,
  experienceLevel: undefined,
  workoutDaysPerWeek: 3,
  preferredWorkoutDuration: 60,
  preferredDays: [],
  availableEquipment: [],
  trainingLocation: undefined,
  preferredExercises: [],
  dislikedExercises: [],
  injuries: "",
  avoidMuscleGroups: [],
  preferredSplit: null,
};

// Merge initial data with defaults
export function getInitialFormData(initialData?: PreferencesData | null): PreferencesData {
  return {
    ...DEFAULT_PREFERENCES,
    ...initialData,
    preferredDays: initialData?.preferredDays ?? [],
    availableEquipment: initialData?.availableEquipment ?? [],
    avoidMuscleGroups: initialData?.avoidMuscleGroups ?? [],
    injuries: initialData?.injuries ?? "",
  };
}

// Validation helpers
export function isFormValid(data: PreferencesData): boolean {
  return Boolean(data.primaryGoal && data.experienceLevel);
}

// Array toggle utility (add if not present, remove if present)
export function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
}
