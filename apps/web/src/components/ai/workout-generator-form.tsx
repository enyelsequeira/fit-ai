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
import { cn } from "@/lib/utils";

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "core",
];

const DURATION_OPTIONS = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
];

const WORKOUT_TYPES = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "upper", label: "Upper Body" },
  { value: "lower", label: "Lower Body" },
  { value: "full_body", label: "Full Body" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
];

interface WorkoutGeneratorFormProps {
  onGenerate: (options: GeneratorOptions) => void;
  isLoading?: boolean;
  hasPreferences?: boolean;
}

type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full_body"
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "core";

interface GeneratorOptions {
  targetMuscleGroups?: string[];
  duration?: number;
  difficulty?: "easy" | "moderate" | "hard";
  workoutType?: WorkoutType;
  usePreferences: boolean;
}

function WorkoutGeneratorForm({
  onGenerate,
  isLoading = false,
  hasPreferences = true,
}: WorkoutGeneratorFormProps) {
  const [usePreferences, setUsePreferences] = useState(true);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [workoutType, setWorkoutType] = useState<string>("");

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle],
    );
  };

  const handleGenerate = () => {
    const options: GeneratorOptions = {
      usePreferences,
    };

    if (selectedMuscles.length > 0) {
      options.targetMuscleGroups = selectedMuscles;
    }
    if (duration) {
      options.duration = parseInt(duration, 10);
    }
    if (difficulty) {
      options.difficulty = difficulty as "easy" | "moderate" | "hard";
    }
    if (workoutType) {
      options.workoutType = workoutType as WorkoutType;
    }

    onGenerate(options);
  };

  const getWorkoutTypeLabel = () => {
    return (
      WORKOUT_TYPES.find((t) => t.value === workoutType)?.label ?? "Auto-select based on history"
    );
  };

  const getDurationLabel = () => {
    return DURATION_OPTIONS.find((d) => d.value === duration)?.label ?? "From preferences";
  };

  const getDifficultyLabel = () => {
    return DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label ?? "Moderate";
  };

  return (
    <Card>
      <FitAiCardHeader>
        <FitAiCardTitle className="text-sm">Generation Options</FitAiCardTitle>
      </FitAiCardHeader>
      <FitAiCardContent className="space-y-6">
        {hasPreferences && (
          <label className="flex items-center gap-2 cursor-pointer">
            <FitAiCheckbox
              checked={usePreferences}
              onCheckedChange={(checked) => setUsePreferences(checked === true)}
            />
            <span className="text-sm">Use my saved preferences</span>
          </label>
        )}

        <div className="space-y-2">
          <Label>Workout Type (optional)</Label>
          <Select value={workoutType} onValueChange={(v) => setWorkoutType(v ?? "")}>
            <SelectTrigger>
              <SelectValue>{getWorkoutTypeLabel()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WORKOUT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Muscle Groups (optional)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MUSCLE_GROUPS.map((muscle) => (
              <button
                key={muscle}
                type="button"
                onClick={() => toggleMuscle(muscle)}
                className={cn(
                  "rounded-none border p-2 text-xs capitalize transition-colors",
                  selectedMuscles.includes(muscle)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-muted",
                )}
              >
                {muscle.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={(v) => setDuration(v ?? "")}>
              <SelectTrigger>
                <SelectValue>{getDurationLabel()}</SelectValue>
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
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "")}>
              <SelectTrigger>
                <SelectValue>{getDifficultyLabel()}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <FitAiButton onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? "Generating..." : "Generate Workout"}
        </FitAiButton>
      </FitAiCardContent>
    </Card>
  );
}

export { WorkoutGeneratorForm };
export type { GeneratorOptions };
