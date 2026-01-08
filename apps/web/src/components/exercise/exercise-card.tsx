import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";
import type { ExerciseForce, ExerciseLevel, ExerciseMechanic } from "./exercise-level-badge";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { CategoryBadge, categoryConfig } from "./category-badge";
import { EquipmentIcon } from "./equipment-icon";
import { ExerciseImage } from "./exercise-image";
import { ExerciseLevelBadge } from "./exercise-level-badge";
import { MuscleGroupTags } from "./muscle-group-selector";

export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: EquipmentType;
  exerciseType: "strength" | "cardio" | "flexibility";
  isDefault: boolean;
  createdByUserId: string | null;
  // New image & metadata fields
  primaryImage?: string | null;
  images?: string[];
  instructions?: string[];
  level?: ExerciseLevel | null;
  force?: ExerciseForce | null;
  mechanic?: ExerciseMechanic | null;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onAddToWorkout?: (exerciseId: number) => void;
  showAddButton?: boolean;
  className?: string;
}

export function ExerciseCard({
  exercise,
  onAddToWorkout,
  showAddButton = false,
  className,
}: ExerciseCardProps) {
  const config = categoryConfig[exercise.category];

  return (
    <Card
      className={cn("group hover:ring-foreground/20 transition-all duration-200 pt-0", className)}
    >
      {/* Exercise Image */}
      <Link
        to="/exercises/$exerciseId"
        params={{ exerciseId: String(exercise.id) }}
        className="block"
      >
        <ExerciseImage
          src={exercise.primaryImage}
          alt={exercise.name}
          size="md"
          className="w-full"
        />
      </Link>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              to="/exercises/$exerciseId"
              params={{ exerciseId: String(exercise.id) }}
              className="hover:underline"
            >
              <CardTitle className="truncate">{exercise.name}</CardTitle>
            </Link>
          </div>
          <div className={cn("rounded-full p-1.5 shrink-0", config.bgColor)}>
            <config.icon className={cn("size-4", config.color)} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={exercise.category} size="sm" showIcon={false} />
          {exercise.level && <ExerciseLevelBadge level={exercise.level} size="sm" />}
          {exercise.equipment && (
            <EquipmentIcon equipment={exercise.equipment} showLabel size="sm" />
          )}
        </div>

        {exercise.muscleGroups.length > 0 && (
          <MuscleGroupTags muscles={exercise.muscleGroups} maxVisible={2} size="sm" />
        )}

        {exercise.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs">{exercise.description}</p>
        )}

        {showAddButton && onAddToWorkout && (
          <Button
            variant="outline"
            size="sm"
            className="w-full opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              onAddToWorkout(exercise.id);
            }}
          >
            <Plus className="mr-1 size-3" />
            Add to Workout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface ExerciseCardSkeletonProps {
  className?: string;
}

export function ExerciseCardSkeleton({ className }: ExerciseCardSkeletonProps) {
  return (
    <Card className={cn("pt-0", className)}>
      {/* Image skeleton */}
      <div className="bg-muted h-32 w-full animate-pulse" />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="bg-muted h-4 w-32 animate-pulse rounded" />
          <div className="bg-muted size-8 animate-pulse rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="bg-muted h-5 w-16 animate-pulse rounded" />
          <div className="bg-muted h-5 w-20 animate-pulse rounded" />
        </div>
        <div className="flex gap-1">
          <div className="bg-muted h-4 w-16 animate-pulse rounded" />
          <div className="bg-muted h-4 w-20 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-8 w-full animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
