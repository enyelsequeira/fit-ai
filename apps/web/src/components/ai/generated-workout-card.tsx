import { IconClock, IconBarbell, IconPlayerPlay, IconStar } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { FitAiButton } from "@/components/ui/button";
import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardFooter,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";

interface GeneratedWorkoutExercise {
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
  exercises: GeneratedWorkoutExercise[];
  warmup?: string;
  cooldown?: string;
}

interface GeneratedWorkout {
  id: number;
  generatedAt: Date;
  targetMuscleGroups: string[] | null;
  workoutType: string | null;
  generatedContent: GeneratedWorkoutContent | null;
  wasUsed: boolean | null;
  userRating: number | null;
  feedback: string | null;
}

interface GeneratedWorkoutCardProps {
  workout: GeneratedWorkout;
  onUse?: () => void;
  onRate?: (rating: number) => void;
  className?: string;
  compact?: boolean;
}

function GeneratedWorkoutCard({
  workout,
  onUse,
  onRate,
  className,
  compact = false,
}: GeneratedWorkoutCardProps) {
  const content = workout.generatedContent;

  if (!content) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <FitAiCard className={cn(className)}>
      <FitAiCardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <FitAiCardTitle className="text-sm">{content.name}</FitAiCardTitle>
            <p className="text-muted-foreground text-xs">{formatDate(workout.generatedAt)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {workout.wasUsed && (
              <Badge variant="success" className="text-[10px]">
                Used
              </Badge>
            )}
            {workout.userRating !== null && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    className={cn(
                      "size-3",
                      i < workout.userRating! ? "fill-amber-400 text-amber-400" : "text-muted",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </FitAiCardHeader>
      <FitAiCardContent className="space-y-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <IconClock className="size-3.5" />
            <span>{content.estimatedDuration} min</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <IconBarbell className="size-3.5" />
            <span>{content.exercises.length} exercises</span>
          </div>
        </div>

        {!compact && (
          <>
            {workout.targetMuscleGroups && workout.targetMuscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {workout.targetMuscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="text-[10px] capitalize">
                    {muscle.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              {content.exercises.slice(0, 4).map((exercise, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="truncate">{exercise.exerciseName}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {exercise.sets} x {exercise.reps}
                  </span>
                </div>
              ))}
              {content.exercises.length > 4 && (
                <p className="text-muted-foreground text-xs">
                  +{content.exercises.length - 4} more exercises
                </p>
              )}
            </div>
          </>
        )}

        {!workout.wasUsed && workout.userRating === null && onRate && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Rate:</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onRate(i + 1)}
                  className="p-0.5 hover:scale-110 transition-transform"
                >
                  <IconStar className="size-4 text-muted hover:fill-amber-400 hover:text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </FitAiCardContent>
      {!workout.wasUsed && onUse && (
        <FitAiCardFooter>
          <FitAiButton size="sm" onClick={onUse} className="w-full gap-1.5">
            <IconPlayerPlay className="size-3.5" />
            Use This Workout
          </FitAiButton>
        </FitAiCardFooter>
      )}
    </FitAiCard>
  );
}

export { GeneratedWorkoutCard };
export type { GeneratedWorkout, GeneratedWorkoutContent, GeneratedWorkoutExercise };
