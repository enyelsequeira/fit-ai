import { useState } from "react";
import {
  IconClock,
  IconBarbell,
  IconPlayerPlay,
  IconRefresh,
  IconDeviceFloppy,
  IconRepeat,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { FitAiButton } from "@/components/ui/button";
import { Card, FitAiCardContent, FitAiCardFooter, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GeneratedExercise {
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  alternatives?: number[];
}

interface GeneratedWorkoutContent {
  name: string;
  estimatedDuration: number;
  exercises: GeneratedExercise[];
  warmup?: string;
  cooldown?: string;
}

interface GeneratedWorkoutResultProps {
  workout: GeneratedWorkoutContent;
  onStart?: () => void;
  onRegenerate?: () => void;
  onSaveAsTemplate?: () => void;
  onSwapExercise?: (exerciseId: number) => void;
  isRegenerating?: boolean;
  className?: string;
}

function GeneratedWorkoutResult({
  workout,
  onStart,
  onRegenerate,
  onSaveAsTemplate,
  onSwapExercise,
  isRegenerating = false,
  className,
}: GeneratedWorkoutResultProps) {
  const [expandedSection, setExpandedSection] = useState<"warmup" | "cooldown" | null>(null);

  const formatRestTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className={cn(className)}>
      <FitAiCardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <FitAiCardTitle>{workout.name}</FitAiCardTitle>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <IconClock className="size-4" />
                <span>{workout.estimatedDuration} min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconBarbell className="size-4" />
                <span>{workout.exercises.length} exercises</span>
              </div>
            </div>
          </div>
          {onRegenerate && (
            <FitAiButton
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="shrink-0 gap-1.5"
            >
              <IconRefresh className={cn("size-3.5", isRegenerating && "animate-spin")} />
              Regenerate
            </FitAiButton>
          )}
        </div>
      </FitAiCardHeader>

      <FitAiCardContent className="space-y-6">
        {/* Warmup */}
        {workout.warmup && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === "warmup" ? null : "warmup")}
              className="flex w-full items-center justify-between text-sm font-medium hover:text-primary transition-colors"
            >
              <span>Warmup</span>
              <Badge variant="secondary" className="text-[10px]">
                {expandedSection === "warmup" ? "Hide" : "Show"}
              </Badge>
            </button>
            {expandedSection === "warmup" && (
              <p className="text-muted-foreground text-xs bg-muted/50 p-3 rounded-none">
                {workout.warmup}
              </p>
            )}
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Exercises</h4>
          <div className="space-y-2">
            {workout.exercises.map((exercise, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-none border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{exercise.exerciseName}</p>
                    <p className="text-muted-foreground text-xs">
                      {exercise.sets} sets x {exercise.reps} reps | Rest:{" "}
                      {formatRestTime(exercise.restSeconds)}
                    </p>
                    {exercise.notes && (
                      <p className="text-muted-foreground text-xs mt-1 italic">{exercise.notes}</p>
                    )}
                  </div>
                </div>
                {exercise.alternatives && exercise.alternatives.length > 0 && onSwapExercise && (
                  <FitAiButton
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onSwapExercise(exercise.exerciseId)}
                    title="Swap exercise"
                  >
                    <IconRepeat className="size-3.5" />
                  </FitAiButton>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cooldown */}
        {workout.cooldown && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === "cooldown" ? null : "cooldown")}
              className="flex w-full items-center justify-between text-sm font-medium hover:text-primary transition-colors"
            >
              <span>Cooldown</span>
              <Badge variant="secondary" className="text-[10px]">
                {expandedSection === "cooldown" ? "Hide" : "Show"}
              </Badge>
            </button>
            {expandedSection === "cooldown" && (
              <p className="text-muted-foreground text-xs bg-muted/50 p-3 rounded-none">
                {workout.cooldown}
              </p>
            )}
          </div>
        )}
      </FitAiCardContent>

      <FitAiCardFooter className="flex gap-2">
        {onSaveAsTemplate && (
          <FitAiButton variant="outline" onClick={onSaveAsTemplate} className="gap-1.5">
            <IconDeviceFloppy className="size-3.5" />
            Save as Template
          </FitAiButton>
        )}
        {onStart && (
          <FitAiButton onClick={onStart} className="flex-1 gap-1.5">
            <IconPlayerPlay className="size-3.5" />
            Start This Workout
          </FitAiButton>
        )}
      </FitAiCardFooter>
    </Card>
  );
}

export { GeneratedWorkoutResult };
export type { GeneratedWorkoutContent, GeneratedExercise };
