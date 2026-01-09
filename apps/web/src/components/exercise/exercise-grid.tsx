import type { Exercise } from "./exercise-card";

import { SimpleGrid } from "@mantine/core";

import { ExerciseCard, ExerciseCardSkeleton } from "./exercise-card";

interface ExerciseGridProps {
  exercises: Exercise[];
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
}

export function ExerciseGrid({
  exercises,
  onAddToWorkout,
  showAddButton = false,
}: ExerciseGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onAddToWorkout={onAddToWorkout}
          showAddButton={showAddButton}
        />
      ))}
    </SimpleGrid>
  );
}

interface ExerciseGridSkeletonProps {
  count?: number;
}

export function ExerciseGridSkeleton({ count = 8 }: ExerciseGridSkeletonProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
      {Array.from({ length: count }).map((_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </SimpleGrid>
  );
}
