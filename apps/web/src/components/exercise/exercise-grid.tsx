import type { Exercise } from "./exercise-card";

import { cn } from "@/lib/utils";

import { ExerciseCard, ExerciseCardSkeleton } from "./exercise-card";

interface ExerciseGridProps {
  exercises: Exercise[];
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
  className?: string;
}

export function ExerciseGrid({
  exercises,
  onAddToWorkout,
  showAddButton = false,
  className,
}: ExerciseGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onAddToWorkout={onAddToWorkout}
          showAddButton={showAddButton}
        />
      ))}
    </div>
  );
}

interface ExerciseGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ExerciseGridSkeleton({ count = 8, className }: ExerciseGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  );
}
