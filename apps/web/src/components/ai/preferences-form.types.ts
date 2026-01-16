// Training preference types
export type TrainingGoal =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "weight_loss"
  | "general_fitness";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type TrainingLocation = "gym" | "home" | "outdoor";

export type WorkoutSplit = "push_pull_legs" | "upper_lower" | "full_body" | "bro_split";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// Form data interface
export interface PreferencesData {
  primaryGoal?: TrainingGoal;
  secondaryGoal?: TrainingGoal | null;
  experienceLevel?: ExperienceLevel;
  workoutDaysPerWeek?: number;
  preferredWorkoutDuration?: number;
  preferredDays?: DayOfWeek[];
  availableEquipment?: string[];
  trainingLocation?: TrainingLocation;
  preferredExercises?: number[];
  dislikedExercises?: number[];
  injuries?: string | null;
  avoidMuscleGroups?: string[];
  preferredSplit?: WorkoutSplit | null;
}

// Form props
export interface PreferencesFormProps {
  initialData?: PreferencesData | null;
  onSubmit: (data: PreferencesData) => void;
  isLoading?: boolean;
}

// Option types
export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

// Constants
export const TRAINING_GOALS: SelectOption<TrainingGoal>[] = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Muscle Growth (Hypertrophy)" },
  { value: "endurance", label: "Endurance" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "general_fitness", label: "General Fitness" },
];

export const EXPERIENCE_LEVELS: SelectOption<ExperienceLevel>[] = [
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "advanced", label: "Advanced (3+ years)" },
];

export const TRAINING_LOCATIONS: SelectOption<TrainingLocation>[] = [
  { value: "gym", label: "Gym" },
  { value: "home", label: "Home" },
  { value: "outdoor", label: "Outdoor" },
];

export const WORKOUT_SPLITS: SelectOption<WorkoutSplit>[] = [
  { value: "push_pull_legs", label: "Push/Pull/Legs" },
  { value: "upper_lower", label: "Upper/Lower" },
  { value: "full_body", label: "Full Body" },
  { value: "bro_split", label: "Bro Split" },
];

export const DAYS_OF_WEEK: SelectOption<DayOfWeek>[] = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export const EQUIPMENT_OPTIONS = [
  "barbell",
  "dumbbell",
  "cables",
  "machines",
  "kettlebells",
  "bands",
  "pull-up bar",
  "bench",
  "squat rack",
] as const;

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
] as const;

export const DURATION_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
];

// Helper to get option label
export function getOptionLabel<T extends string>(
  options: SelectOption<T>[],
  value: T | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  return options.find((opt) => opt.value === value)?.label ?? fallback;
}
