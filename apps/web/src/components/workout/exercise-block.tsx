import { ChevronDown, ChevronUp, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { RestTimer } from "./rest-timer";
import type { SetType } from "./set-row";
import { SetRow } from "./set-row";
import { SimplePreviousPerformance } from "./previous-performance";

interface ExerciseSet {
  id: number | string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  setType: SetType;
  isCompleted: boolean;
  targetWeight?: number | null;
  targetReps?: number | null;
}

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups?: string[];
  equipment?: string | null;
}

interface PreviousPerformance {
  topSet: { weight: number; reps: number } | null;
  sets: Array<{
    setNumber: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
  }>;
}

interface ExerciseBlockProps {
  workoutExerciseId: number;
  exercise: Exercise;
  sets: ExerciseSet[];
  previousPerformance?: PreviousPerformance | null;
  supersetGroupId?: number | null;
  notes?: string | null;
  isExpanded?: boolean;
  showRestTimer?: boolean;
  restTimerSeconds?: number;
  weightUnit?: "kg" | "lb";
  onAddSet: () => void;
  onUpdateSet: (setId: number | string, data: Partial<ExerciseSet>) => void;
  onDeleteSet: (setId: number | string) => void;
  onCompleteSet: (setId: number | string) => void;
  onRemoveExercise: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}

function ExerciseBlock({
  workoutExerciseId: _workoutExerciseId,
  exercise,
  sets,
  previousPerformance,
  supersetGroupId,
  notes,
  isExpanded: defaultExpanded = true,
  showRestTimer = false,
  restTimerSeconds = 90,
  weightUnit = "kg",
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onCompleteSet,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
  className,
}: ExerciseBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeRestTimer, setActiveRestTimer] = useState(false);

  const completedSets = sets.filter((s) => s.isCompleted).length;
  const totalSets = sets.length;

  const handleCompleteSet = (setId: number | string) => {
    onCompleteSet(setId);
    setActiveRestTimer(true);
  };

  return (
    <div
      className={cn(
        "border border-border rounded-none overflow-hidden",
        supersetGroupId && "border-l-4 border-l-primary",
        className,
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 bg-muted/30 px-3 py-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">{exercise.name}</h3>
              {supersetGroupId && (
                <Badge variant="outline" className="text-xs">
                  Superset
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{exercise.category}</span>
              {exercise.equipment && (
                <>
                  <span>•</span>
                  <span>{exercise.equipment}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={completedSets === totalSets ? "success" : "secondary"}
            className="text-xs"
          >
            {completedSets}/{totalSets}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onMoveUp && (
                <DropdownMenuItem onClick={onMoveUp}>
                  <ChevronUp className="size-4 mr-2" />
                  Move Up
                </DropdownMenuItem>
              )}
              {onMoveDown && (
                <DropdownMenuItem onClick={onMoveDown}>
                  <ChevronDown className="size-4 mr-2" />
                  Move Down
                </DropdownMenuItem>
              )}
              {(onMoveUp || onMoveDown) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={onRemoveExercise}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Remove Exercise
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          {/* Previous Performance */}
          {previousPerformance?.topSet && (
            <SimplePreviousPerformance
              lastWeight={previousPerformance.topSet.weight}
              lastReps={previousPerformance.topSet.reps}
              lastRpe={previousPerformance.sets[0]?.rpe}
              className="mb-3"
            />
          )}

          {/* Notes */}
          {notes && (
            <p className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 mb-3 rounded-none">
              {notes}
            </p>
          )}

          {/* Sets Header */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 px-1 pb-2 text-xs text-muted-foreground font-medium">
            <span className="min-w-[60px]">Set</span>
            <span className="text-center min-w-[70px]">Previous</span>
            <span className="text-center">{weightUnit.toUpperCase()}</span>
            <span className="text-center">Reps</span>
            <span className="min-w-[100px]"></span>
          </div>

          {/* Sets */}
          <div className="space-y-0">
            {sets.map((set) => {
              const prevSet = previousPerformance?.sets.find((s) => s.setNumber === set.setNumber);
              return (
                <SetRow
                  key={set.id}
                  setNumber={set.setNumber}
                  weight={set.weight}
                  reps={set.reps}
                  rpe={set.rpe}
                  setType={set.setType}
                  isCompleted={set.isCompleted ?? false}
                  previousWeight={prevSet?.weight ?? set.targetWeight}
                  previousReps={prevSet?.reps ?? set.targetReps}
                  weightUnit={weightUnit}
                  onWeightChange={(value) => onUpdateSet(set.id, { weight: value })}
                  onRepsChange={(value) => onUpdateSet(set.id, { reps: value })}
                  onRpeChange={(value) => onUpdateSet(set.id, { rpe: value })}
                  onSetTypeChange={(value) => onUpdateSet(set.id, { setType: value })}
                  onComplete={() => handleCompleteSet(set.id)}
                  onDelete={() => onDeleteSet(set.id)}
                />
              );
            })}
          </div>

          {/* Add Set Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddSet}
            className="w-full mt-2 text-muted-foreground"
          >
            <Plus className="size-4 mr-1" />
            Add Set
          </Button>

          {/* Rest Timer */}
          {showRestTimer && activeRestTimer && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-center">
              <RestTimer
                defaultSeconds={restTimerSeconds}
                autoStart
                onComplete={() => setActiveRestTimer(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { ExerciseBlock };
export type { ExerciseSet, Exercise, PreviousPerformance };
