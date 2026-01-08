import type { Exercise } from "./exercise-card";

import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CategoryBadge } from "./category-badge";
import { EquipmentIcon } from "./equipment-icon";
import { ExerciseImageThumbnail } from "./exercise-image";
import { ExerciseLevelBadge } from "./exercise-level-badge";
import { MuscleGroupTags } from "./muscle-group-selector";

interface ExerciseListProps {
  exercises: Exercise[];
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
  className?: string;
}

export function ExerciseList({
  exercises,
  onAddToWorkout,
  showAddButton = false,
  className,
}: ExerciseListProps) {
  return (
    <div className={cn("divide-border divide-y", className)}>
      {exercises.map((exercise) => (
        <ExerciseListItem
          key={exercise.id}
          exercise={exercise}
          onAddToWorkout={onAddToWorkout}
          showAddButton={showAddButton}
        />
      ))}
    </div>
  );
}

interface ExerciseListItemProps {
  exercise: Exercise;
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
}

function ExerciseListItem({
  exercise,
  onAddToWorkout,
  showAddButton = false,
}: ExerciseListItemProps) {
  return (
    <div className="group hover:bg-muted/50 flex items-center gap-4 p-4 transition-colors">
      <ExerciseImageThumbnail src={exercise.primaryImage} alt={exercise.name} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            to="/exercises/$exerciseId"
            params={{ exerciseId: String(exercise.id) }}
            className="text-sm font-medium hover:underline truncate"
          >
            {exercise.name}
          </Link>
          {exercise.level && <ExerciseLevelBadge level={exercise.level} size="sm" />}
          {!exercise.isDefault && (
            <span className="bg-primary/10 text-primary shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded">
              Custom
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <CategoryBadge category={exercise.category} size="sm" showIcon={false} />
          {exercise.equipment && (
            <EquipmentIcon equipment={exercise.equipment} showLabel size="sm" />
          )}
        </div>

        {exercise.muscleGroups.length > 0 && (
          <div className="mt-2">
            <MuscleGroupTags muscles={exercise.muscleGroups} maxVisible={3} size="sm" />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showAddButton && onAddToWorkout && (
          <Button
            variant="outline"
            size="icon-sm"
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onAddToWorkout(exercise.id)}
          >
            <Plus className="size-4" />
          </Button>
        )}
        <Link
          to="/exercises/$exerciseId"
          params={{ exerciseId: String(exercise.id) }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="size-5" />
        </Link>
      </div>
    </div>
  );
}

interface ExerciseListSkeletonProps {
  count?: number;
  className?: string;
}

export function ExerciseListSkeleton({ count = 5, className }: ExerciseListSkeletonProps) {
  return (
    <div className={cn("divide-border divide-y", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="bg-muted size-12 shrink-0 animate-pulse rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="bg-muted h-5 w-16 animate-pulse rounded" />
              <div className="bg-muted h-5 w-20 animate-pulse rounded" />
            </div>
          </div>
          <div className="bg-muted size-5 shrink-0 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
