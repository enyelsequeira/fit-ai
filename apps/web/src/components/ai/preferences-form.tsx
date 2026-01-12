import { useState } from "react";

import { FitAiButton } from "@/components/ui/button";
import { Card, FitAiCardContent, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { FitAiCheckbox } from "@/components/ui/fitAiCheckbox.tsx";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Types
type TrainingGoal = "strength" | "hypertrophy" | "endurance" | "weight_loss" | "general_fitness";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type TrainingLocation = "gym" | "home" | "outdoor";
type WorkoutSplit = "push_pull_legs" | "upper_lower" | "full_body" | "bro_split";
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface PreferencesData {
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

interface PreferencesFormProps {
  initialData?: PreferencesData | null;
  onSubmit: (data: PreferencesData) => void;
  isLoading?: boolean;
}

const TRAINING_GOALS: { value: TrainingGoal; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Muscle Growth (Hypertrophy)" },
  { value: "endurance", label: "Endurance" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "general_fitness", label: "General Fitness" },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "advanced", label: "Advanced (3+ years)" },
];

const TRAINING_LOCATIONS: { value: TrainingLocation; label: string }[] = [
  { value: "gym", label: "Gym" },
  { value: "home", label: "Home" },
  { value: "outdoor", label: "Outdoor" },
];

const WORKOUT_SPLITS: { value: WorkoutSplit; label: string }[] = [
  { value: "push_pull_legs", label: "Push/Pull/Legs" },
  { value: "upper_lower", label: "Upper/Lower" },
  { value: "full_body", label: "Full Body" },
  { value: "bro_split", label: "Bro Split" },
];

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const EQUIPMENT_OPTIONS = [
  "barbell",
  "dumbbell",
  "cables",
  "machines",
  "kettlebells",
  "bands",
  "pull-up bar",
  "bench",
  "squat rack",
];

const MUSCLE_GROUPS = [
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
];

const DURATION_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
];

function PreferencesForm({ initialData, onSubmit, isLoading = false }: PreferencesFormProps) {
  const [formData, setFormData] = useState<PreferencesData>({
    primaryGoal: initialData?.primaryGoal,
    secondaryGoal: initialData?.secondaryGoal,
    experienceLevel: initialData?.experienceLevel,
    workoutDaysPerWeek: initialData?.workoutDaysPerWeek ?? 3,
    preferredWorkoutDuration: initialData?.preferredWorkoutDuration ?? 60,
    preferredDays: initialData?.preferredDays ?? [],
    availableEquipment: initialData?.availableEquipment ?? [],
    trainingLocation: initialData?.trainingLocation,
    injuries: initialData?.injuries ?? "",
    avoidMuscleGroups: initialData?.avoidMuscleGroups ?? [],
    preferredSplit: initialData?.preferredSplit,
  });

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getGoalLabel = (value: TrainingGoal | undefined) => {
    return TRAINING_GOALS.find((g) => g.value === value)?.label ?? "Select your primary goal";
  };

  const getSecondaryGoalLabel = (value: TrainingGoal | null | undefined) => {
    if (!value) return "Select a secondary goal";
    return TRAINING_GOALS.find((g) => g.value === value)?.label ?? "Select a secondary goal";
  };

  const getExperienceLabel = (value: ExperienceLevel | undefined) => {
    return (
      EXPERIENCE_LEVELS.find((l) => l.value === value)?.label ?? "Select your experience level"
    );
  };

  const getDurationLabel = (value: number | undefined) => {
    return DURATION_OPTIONS.find((d) => d.value === String(value))?.label ?? "Select duration";
  };

  const getLocationLabel = (value: TrainingLocation | undefined) => {
    return TRAINING_LOCATIONS.find((l) => l.value === value)?.label ?? "Select location";
  };

  const getSplitLabel = (value: WorkoutSplit | null | undefined) => {
    if (!value) return "No preference";
    return WORKOUT_SPLITS.find((s) => s.value === value)?.label ?? "No preference";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goals Section */}
      <Card>
        <FitAiCardHeader>
          <FitAiCardTitle className="text-sm">Training Goals</FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Goal *</Label>
            <Select
              value={formData.primaryGoal}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, primaryGoal: value as TrainingGoal }))
              }
            >
              <SelectTrigger>
                <SelectValue>{getGoalLabel(formData.primaryGoal)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TRAINING_GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Secondary Goal (optional)</Label>
            <Select
              value={formData.secondaryGoal ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  secondaryGoal: value ? (value as TrainingGoal) : null,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue>{getSecondaryGoalLabel(formData.secondaryGoal)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TRAINING_GOALS.filter((g) => g.value !== formData.primaryGoal).map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Experience Level *</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, experienceLevel: value as ExperienceLevel }))
              }
            >
              <SelectTrigger>
                <SelectValue>{getExperienceLabel(formData.experienceLevel)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FitAiCardContent>
      </Card>

      {/* Schedule Section */}
      <Card>
        <FitAiCardHeader>
          <FitAiCardTitle className="text-sm">Schedule</FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Workout Days Per Week</Label>
              <span className="text-sm font-medium tabular-nums">
                {formData.workoutDaysPerWeek} days
              </span>
            </div>
            <Slider
              value={[formData.workoutDaysPerWeek ?? 3]}
              onValueChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setFormData((prev) => ({ ...prev, workoutDaysPerWeek: newValue }));
              }}
              min={1}
              max={7}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Workout Duration</Label>
            <Select
              value={String(formData.preferredWorkoutDuration ?? 60)}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  preferredWorkoutDuration: parseInt(value ?? "60", 10),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue>{getDurationLabel(formData.preferredWorkoutDuration)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDays: toggleArrayItem(prev.preferredDays ?? [], day.value),
                    }))
                  }
                  className={cn(
                    "rounded-none border px-3 py-1.5 text-xs transition-colors",
                    formData.preferredDays?.includes(day.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-muted",
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </FitAiCardContent>
      </Card>

      {/* Equipment Section */}
      <Card>
        <FitAiCardHeader>
          <FitAiCardTitle className="text-sm">Equipment & Location</FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Training Location</Label>
            <Select
              value={formData.trainingLocation}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, trainingLocation: value as TrainingLocation }))
              }
            >
              <SelectTrigger>
                <SelectValue>{getLocationLabel(formData.trainingLocation)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TRAINING_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Available Equipment</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <label
                  key={equipment}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-none border p-2 text-xs capitalize transition-colors",
                    formData.availableEquipment?.includes(equipment)
                      ? "border-primary bg-primary/10"
                      : "border-input hover:bg-muted",
                  )}
                >
                  <FitAiCheckbox
                    checked={formData.availableEquipment?.includes(equipment)}
                    onCheckedChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        availableEquipment: toggleArrayItem(
                          prev.availableEquipment ?? [],
                          equipment,
                        ),
                      }))
                    }
                  />
                  {equipment}
                </label>
              ))}
            </div>
          </div>
        </FitAiCardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <FitAiCardHeader>
          <FitAiCardTitle className="text-sm">Workout Preferences</FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred Split</Label>
            <Select
              value={formData.preferredSplit ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  preferredSplit: value ? (value as WorkoutSplit) : null,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue>{getSplitLabel(formData.preferredSplit)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {WORKOUT_SPLITS.map((split) => (
                  <SelectItem key={split.value} value={split.value}>
                    {split.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FitAiCardContent>
      </Card>

      {/* Limitations Section */}
      <Card>
        <FitAiCardHeader>
          <FitAiCardTitle className="text-sm">Limitations & Injuries</FitAiCardTitle>
        </FitAiCardHeader>
        <FitAiCardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Injuries or Limitations</Label>
            <Textarea
              placeholder="Describe any injuries or physical limitations..."
              value={formData.injuries ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, injuries: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Muscle Groups to Avoid</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      avoidMuscleGroups: toggleArrayItem(prev.avoidMuscleGroups ?? [], muscle),
                    }))
                  }
                  className={cn(
                    "rounded-none border p-2 text-xs capitalize transition-colors",
                    formData.avoidMuscleGroups?.includes(muscle)
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "border-input hover:bg-muted",
                  )}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>
        </FitAiCardContent>
      </Card>

      <FitAiButton type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Preferences"}
      </FitAiButton>
    </form>
  );
}

export { PreferencesForm };
export type { PreferencesData };
