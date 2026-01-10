import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconBarbell,
  IconLoader2,
  IconMinus,
  IconDotsVertical,
  IconPlus,
  IconTarget,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/sonner";

import { Badge } from "@/components/ui/badge";
import { FitAiButton } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AddExerciseModal } from "@/components/workout/add-exercise-modal";
import type { Exercise, ExerciseSet } from "@/components/workout/exercise-block";
import type { SetType } from "@/components/workout/set-row";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/workouts/$workoutId")({
  component: WorkoutDetailRoute,
});

// Format duration in HH:MM:SS or MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Format date nicely
function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (inputDate.getTime() === today.getTime()) {
    return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (inputDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Elapsed timer hook
function useElapsedTime(startedAt: Date) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      setElapsed(Math.max(0, diff));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return elapsed;
}

// Category to muscle group mapping for display
const CATEGORY_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Legs",
  core: "Core",
  cardio: "Cardio",
  other: "Other",
};

function WorkoutDetailRoute() {
  const { workoutId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());

  const workoutIdNum = Number.parseInt(workoutId, 10);

  const workout = useQuery(
    orpc.workout.getById.queryOptions({ input: { workoutId: workoutIdNum } }),
  );

  // Mutations
  const updateWorkoutMutation = useMutation({
    ...orpc.workout.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
      setIsEditingName(false);
    },
  });

  // Ref to store exercise info for optimistic update
  const pendingExerciseRef = useRef<{
    id: number;
    name: string;
    category: string;
    exerciseType: string;
    equipment: string | null;
  } | null>(null);

  const addExerciseMutation = useMutation({
    ...orpc.workout.addExercise.mutationOptions(),
    onMutate: async (newExerciseInput) => {
      await queryClient.cancelQueries({ queryKey: ["workout", "getById"] });

      const previousWorkout = queryClient.getQueryData<typeof workout.data>([
        "workout",
        "getById",
        { input: { workoutId: workoutIdNum } },
      ]);

      if (previousWorkout) {
        const optimisticWorkoutExercise = {
          id: `temp-${Date.now()}` as unknown as number,
          workoutId: workoutIdNum,
          exerciseId: newExerciseInput.exerciseId,
          order: (previousWorkout.workoutExercises?.length ?? 0) + 1,
          notes: newExerciseInput.notes ?? null,
          supersetGroupId: newExerciseInput.supersetGroupId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          exercise: pendingExerciseRef.current ?? {
            id: newExerciseInput.exerciseId,
            name: "Loading...",
            category: "other",
            exerciseType: "strength",
            equipment: null,
          },
          sets: [],
          _isPending: true,
        };

        queryClient.setQueryData<typeof workout.data>(
          ["workout", "getById", { input: { workoutId: workoutIdNum } }],
          {
            ...previousWorkout,
            workoutExercises: [
              ...(previousWorkout.workoutExercises ?? []),
              optimisticWorkoutExercise,
            ],
          },
        );
      }

      return { previousWorkout };
    },
    onError: (error, _newExercise, context) => {
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          ["workout", "getById", { input: { workoutId: workoutIdNum } }],
          context.previousWorkout,
        );
      }
      toast.error("Failed to add exercise", { description: error.message });
    },
    onSuccess: () => {
      toast.success("Exercise added");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
      pendingExerciseRef.current = null;
    },
  });

  const removeExerciseMutation = useMutation({
    ...orpc.workout.removeExercise.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
      toast.success("Exercise removed");
    },
    onError: (error) => {
      toast.error("Failed to remove exercise", { description: error.message });
    },
  });

  const addSetMutation = useMutation({
    ...orpc.workout.addSet.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
    },
    onError: (error) => {
      toast.error("Failed to add set", { description: error.message });
    },
  });

  const updateSetMutation = useMutation({
    ...orpc.workout.updateSet.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
    },
  });

  const deleteSetMutation = useMutation({
    ...orpc.workout.deleteSet.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
    },
    onError: (error) => {
      toast.error("Failed to delete set", { description: error.message });
    },
  });

  const completeSetMutation = useMutation({
    ...orpc.workout.completeSet.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
    },
  });

  const deleteWorkoutMutation = useMutation({
    ...orpc.workout.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout cancelled");
      navigate({ to: "/workouts" });
    },
    onError: (error) => {
      toast.error("Failed to delete workout", { description: error.message });
    },
  });

  // Handlers
  const handleSelectExercise = useCallback(
    (exercise: Exercise) => {
      pendingExerciseRef.current = {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: "strength",
        equipment: exercise.equipment ?? null,
      };

      addExerciseMutation.mutate({
        workoutId: workoutIdNum,
        exerciseId: exercise.id,
      });
    },
    [addExerciseMutation, workoutIdNum],
  );

  const handleRemoveExercise = useCallback(
    (workoutExerciseId: number) => {
      removeExerciseMutation.mutate({
        workoutId: workoutIdNum,
        workoutExerciseId,
      });
    },
    [removeExerciseMutation, workoutIdNum],
  );

  const handleAddSet = useCallback(
    (workoutExerciseId: number) => {
      addSetMutation.mutate({
        workoutId: workoutIdNum,
        workoutExerciseId,
      });
    },
    [addSetMutation, workoutIdNum],
  );

  const handleUpdateSet = useCallback(
    (setId: number | string, data: Partial<ExerciseSet>) => {
      if (typeof setId === "string" && setId.startsWith("temp-")) return;

      const updateData: Parameters<typeof updateSetMutation.mutate>[0] = {
        workoutId: workoutIdNum,
        setId: setId as number,
      };

      if (data.weight !== undefined) updateData.weight = data.weight ?? undefined;
      if (data.reps !== undefined) updateData.reps = data.reps ?? undefined;
      if (data.rpe !== undefined) updateData.rpe = data.rpe ?? undefined;
      if (data.setType !== undefined) updateData.setType = data.setType;

      updateSetMutation.mutate(updateData);
    },
    [updateSetMutation, workoutIdNum],
  );

  const handleDeleteSet = useCallback(
    (setId: number | string) => {
      if (typeof setId === "string" && setId.startsWith("temp-")) return;
      deleteSetMutation.mutate({
        workoutId: workoutIdNum,
        setId: setId as number,
      });
    },
    [deleteSetMutation, workoutIdNum],
  );

  const handleCompleteSet = useCallback(
    (setId: number | string) => {
      if (typeof setId === "string" && setId.startsWith("temp-")) return;
      completeSetMutation.mutate({
        workoutId: workoutIdNum,
        setId: setId as number,
      });
    },
    [completeSetMutation, workoutIdNum],
  );

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateWorkoutMutation.mutate({
        workoutId: workoutIdNum,
        name: editedName.trim(),
      });
    }
    setIsEditingName(false);
  };

  const handleCancelWorkout = () => {
    deleteWorkoutMutation.mutate({ workoutId: workoutIdNum });
  };

  const toggleExerciseExpanded = (exerciseId: number) => {
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  // Loading state
  if (workout.isLoading) {
    return <WorkoutDetailSkeleton />;
  }

  // Error state
  if (workout.isError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <EmptyState
          icon={IconAlertTriangle}
          title="Failed to load workout"
          description={workout.error.message}
          action={
            <FitAiButton variant="outline" onClick={() => workout.refetch()}>
              Try Again
            </FitAiButton>
          }
        />
      </div>
    );
  }

  const workoutData = workout.data;
  if (!workoutData) {
    return (
      <div className="container mx-auto py-6 px-4">
        <EmptyState
          icon={IconAlertTriangle}
          title="Workout not found"
          description="This workout doesn't exist or has been deleted"
          action={
            <FitAiButton component={Link} to="/workouts">
              Back to Workouts
            </FitAiButton>
          }
        />
      </div>
    );
  }

  const isCompleted = !!workoutData.completedAt;
  const exerciseIds = workoutData.workoutExercises?.map((e) => e.exerciseId) ?? [];

  // Calculate overall progress
  const allSets = workoutData.workoutExercises?.flatMap((we) => we.sets ?? []) ?? [];
  const totalSets = allSets.length;
  const completedSets = allSets.filter((s) => s.isCompleted).length;
  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          {/* Top row - Back button, title, and actions */}
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FitAiButton component={Link} to="/workouts" variant="ghost" size="icon-sm">
                <IconArrowLeft className="size-4" />
              </FitAiButton>

              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-8 flex-1 max-w-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                  />
                  <FitAiButton size="icon-sm" onClick={handleSaveName}>
                    <IconCheck className="size-4" />
                  </FitAiButton>
                  <FitAiButton size="icon-sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                    <IconX className="size-4" />
                  </FitAiButton>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isCompleted) {
                      setEditedName(workoutData.name || "");
                      setIsEditingName(true);
                    }
                  }}
                  className={cn(
                    "text-base font-semibold truncate text-left",
                    !isCompleted && "hover:text-primary transition-colors",
                  )}
                  disabled={isCompleted}
                >
                  {workoutData.name || `Workout #${workoutData.id}`}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isCompleted && (
                <>
                  <FitAiButton
                    component={Link}
                    to="/workouts/$workoutId/complete"
                    params={{ workoutId }}
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <IconCheck className="size-4 mr-1" />
                    Finish
                  </FitAiButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <FitAiButton variant="ghost" size="icon-sm">
                        <IconDotsVertical className="size-4" />
                      </FitAiButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsCancelDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <IconTrash className="size-4 mr-2" />
                        Cancel Workout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {/* Workout meta info row */}
          <div className="flex items-center gap-4 pb-3 text-sm text-muted-foreground overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <IconCalendar className="size-3.5" />
              <span>{formatDate(workoutData.startedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <IconClock className="size-3.5" />
              <LiveTimer startedAt={workoutData.startedAt} />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <IconBarbell className="size-3.5" />
              <span>{workoutData.workoutExercises?.length ?? 0} exercises</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <IconTarget className="size-3.5" />
              <span>
                {completedSets}/{totalSets} sets
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {totalSets > 0 && (
            <div className="pb-3">
              <Progress value={progressPercentage} max={100} className="h-1.5" />
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto py-4 px-4 pb-28 md:pb-8">
        {workoutData.workoutExercises && workoutData.workoutExercises.length > 0 ? (
          <div className="space-y-4">
            {workoutData.workoutExercises.map((workoutExercise, index) => {
              const isPending =
                "_isPending" in workoutExercise &&
                (workoutExercise as { _isPending?: boolean })._isPending;
              const exerciseIdStr = String(workoutExercise.id);
              const isTempId = exerciseIdStr.startsWith("temp-");

              const exerciseSets =
                workoutExercise.sets?.map((set) => ({
                  id: set.id,
                  setNumber: set.setNumber,
                  weight: set.weight,
                  reps: set.reps,
                  rpe: set.rpe,
                  setType: (set.setType as SetType) ?? "normal",
                  isCompleted: set.isCompleted ?? false,
                  targetWeight: set.targetWeight,
                  targetReps: set.targetReps,
                })) ?? [];

              const exerciseCompletedSets = exerciseSets.filter((s) => s.isCompleted).length;
              const exerciseTotalSets = exerciseSets.length;
              const isExpanded =
                expandedExercises.size === 0
                  ? true
                  : expandedExercises.has(workoutExercise.id as number);

              return (
                <div
                  key={workoutExercise.id}
                  className={cn(isPending || isTempId ? "relative" : undefined)}
                >
                  {(isPending || isTempId) && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center pointer-events-none rounded-none">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <IconLoader2 className="size-4 animate-spin" />
                        <span>Adding exercise...</span>
                      </div>
                    </div>
                  )}
                  <ExerciseCard
                    exerciseNumber={index + 1}
                    name={workoutExercise.exercise?.name ?? "Unknown Exercise"}
                    category={workoutExercise.exercise?.category ?? "other"}
                    equipment={workoutExercise.exercise?.equipment}
                    sets={exerciseSets}
                    completedSets={exerciseCompletedSets}
                    totalSets={exerciseTotalSets}
                    isExpanded={isExpanded}
                    isCompleted={isCompleted}
                    isPending={isPending || isTempId}
                    onToggleExpanded={() => toggleExerciseExpanded(workoutExercise.id as number)}
                    onAddSet={() => !isTempId && handleAddSet(workoutExercise.id as number)}
                    onUpdateSet={handleUpdateSet}
                    onDeleteSet={handleDeleteSet}
                    onCompleteSet={handleCompleteSet}
                    onRemoveExercise={() =>
                      !isTempId && handleRemoveExercise(workoutExercise.id as number)
                    }
                  />
                </div>
              );
            })}

            {/* Add exercise button for desktop */}
            {!isCompleted && (
              <FitAiButton
                variant="outline"
                className="w-full h-12 border-dashed hidden md:flex"
                onClick={() => setIsAddExerciseOpen(true)}
              >
                <IconPlus className="size-4 mr-2" />
                Add Exercise
              </FitAiButton>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <IconBarbell className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No exercises yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first exercise to start tracking
            </p>
            <FitAiButton onClick={() => setIsAddExerciseOpen(true)}>
              <IconPlus className="size-4 mr-1" />
              Add Exercise
            </FitAiButton>
          </div>
        )}
      </main>

      {/* Fixed Bottom Bar (mobile) */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 md:hidden safe-area-inset-bottom">
          <div className="flex items-center gap-3">
            <FitAiButton variant="outline" className="flex-1" onClick={() => setIsAddExerciseOpen(true)}>
              <IconPlus className="size-4 mr-1" />
              Add Exercise
            </FitAiButton>
            <FitAiButton
              component={Link}
              to="/workouts/$workoutId/complete"
              params={{ workoutId }}
              className="flex-1"
            >
              <IconCheck className="size-4 mr-1" />
              Finish Workout
            </FitAiButton>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      <AddExerciseModal
        open={isAddExerciseOpen}
        onOpenChange={setIsAddExerciseOpen}
        onSelectExercise={handleSelectExercise}
        selectedExerciseIds={exerciseIds}
      />

      {/* Cancel Workout Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Workout?</DialogTitle>
            <DialogDescription>
              This will delete the workout and all recorded sets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <FitAiButton variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Workout
            </FitAiButton>
            <FitAiButton
              variant="destructive"
              onClick={handleCancelWorkout}
              disabled={deleteWorkoutMutation.isPending}
            >
              {deleteWorkoutMutation.isPending ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Workout"
              )}
            </FitAiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Live timer component
function LiveTimer({ startedAt }: { startedAt: Date }) {
  const elapsed = useElapsedTime(startedAt);
  return <span className="font-mono tabular-nums">{formatDuration(elapsed)}</span>;
}

// Exercise Card Component
interface ExerciseCardProps {
  exerciseNumber: number;
  name: string;
  category: string;
  equipment?: string | null;
  sets: Array<{
    id: number | string;
    setNumber: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    setType: SetType;
    isCompleted: boolean;
    targetWeight?: number | null;
    targetReps?: number | null;
  }>;
  completedSets: number;
  totalSets: number;
  isExpanded: boolean;
  isCompleted: boolean;
  isPending?: boolean;
  onToggleExpanded: () => void;
  onAddSet: () => void;
  onUpdateSet: (setId: number | string, data: Partial<ExerciseSet>) => void;
  onDeleteSet: (setId: number | string) => void;
  onCompleteSet: (setId: number | string) => void;
  onRemoveExercise: () => void;
}

function ExerciseCard({
  exerciseNumber,
  name,
  category,
  equipment,
  sets,
  completedSets,
  totalSets,
  isExpanded,
  isCompleted,
  isPending,
  onToggleExpanded,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onCompleteSet,
  onRemoveExercise,
}: ExerciseCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const allSetsCompleted = totalSets > 0 && completedSets === totalSets;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        allSetsCompleted && "ring-1 ring-emerald-500/30",
        isPending && "opacity-60",
      )}
    >
      {/* Card Header - Always visible */}
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex items-start gap-3 text-left flex-1 min-w-0"
          >
            {/* Exercise number indicator */}
            <div
              className={cn(
                "size-8 shrink-0 flex items-center justify-center text-xs font-semibold",
                allSetsCompleted
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary/10 text-primary",
              )}
            >
              {allSetsCompleted ? <IconCheck className="size-4" /> : exerciseNumber}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm leading-tight truncate">{name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {CATEGORY_LABELS[category] ?? category}
                </Badge>
                {equipment && (
                  <span className="text-[10px] text-muted-foreground">{equipment}</span>
                )}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {/* Progress indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-medium tabular-nums",
                  allSetsCompleted
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              >
                {completedSets}/{totalSets}
              </span>
              {totalSets > 0 && (
                <div className="w-12">
                  <Progress
                    value={completedSets}
                    max={totalSets}
                    className={cn("h-1", allSetsCompleted && "[&>div]:bg-emerald-500")}
                  />
                </div>
              )}
            </div>

            {/* Expand/Collapse button */}
            <FitAiButton variant="ghost" size="icon-sm" onClick={onToggleExpanded}>
              {isExpanded ? (
                <IconChevronUp className="size-4" />
              ) : (
                <IconChevronDown className="size-4" />
              )}
            </FitAiButton>

            {/* More options */}
            {!isCompleted && !isPending && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <FitAiButton variant="ghost" size="icon-sm">
                    <IconDotsVertical className="size-4" />
                  </FitAiButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onAddSet}>
                    <IconPlus className="size-4 mr-2" />
                    Add Set
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirmDelete(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash className="size-4 mr-2" />
                    Remove Exercise
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expandable content */}
      {isExpanded && (
        <>
          <CardContent className="pt-4">
            {sets.length > 0 ? (
              <div className="space-y-1">
                {/* Sets header */}
                <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 px-2 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Set</span>
                  <span className="text-center">Weight</span>
                  <span className="text-center">Reps</span>
                  <span className="text-center">Done</span>
                </div>

                {/* Sets list */}
                {sets.map((set) => (
                  <SetRowInline
                    key={set.id}
                    setNumber={set.setNumber}
                    weight={set.weight}
                    reps={set.reps}
                    setType={set.setType}
                    isCompleted={set.isCompleted}
                    isWorkoutCompleted={isCompleted}
                    onWeightChange={(value) => onUpdateSet(set.id, { weight: value })}
                    onRepsChange={(value) => onUpdateSet(set.id, { reps: value })}
                    onComplete={() => onCompleteSet(set.id)}
                    onDelete={() => onDeleteSet(set.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No sets yet. Add your first set to start tracking.
              </div>
            )}
          </CardContent>

          {/* Add set footer */}
          {!isCompleted && !isPending && (
            <CardFooter className="pt-0">
              <FitAiButton
                variant="ghost"
                size="sm"
                onClick={onAddSet}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <IconPlus className="size-4 mr-1" />
                Add Set
              </FitAiButton>
            </CardFooter>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Exercise?</DialogTitle>
            <DialogDescription>
              This will remove {name} and all its sets from this workout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <FitAiButton variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </FitAiButton>
            <FitAiButton
              variant="destructive"
              onClick={() => {
                onRemoveExercise();
                setConfirmDelete(false);
              }}
            >
              Remove
            </FitAiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Inline Set Row Component
interface SetRowInlineProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  setType: SetType;
  isCompleted: boolean;
  isWorkoutCompleted: boolean;
  onWeightChange: (value: number | null) => void;
  onRepsChange: (value: number | null) => void;
  onComplete: () => void;
  onDelete: () => void;
}

const SET_TYPE_COLORS: Record<SetType, string> = {
  normal: "",
  warmup: "text-amber-500",
  failure: "text-red-500",
  drop: "text-blue-500",
};

function SetRowInline({
  setNumber,
  weight,
  reps,
  setType,
  isCompleted,
  isWorkoutCompleted,
  onWeightChange,
  onRepsChange,
  onComplete,
  onDelete,
}: SetRowInlineProps) {
  const handleWeightIncrement = (increment: number) => {
    const newWeight = (weight ?? 0) + increment;
    onWeightChange(Math.max(0, newWeight));
  };

  const handleRepsIncrement = (increment: number) => {
    const newReps = (reps ?? 0) + increment;
    onRepsChange(Math.max(0, newReps));
  };

  const isDisabled = isWorkoutCompleted || isCompleted;

  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center py-2 px-2 group",
        "border-b border-border/50 last:border-b-0",
        isCompleted && "bg-emerald-500/5",
      )}
    >
      {/* Set number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            SET_TYPE_COLORS[setType],
            isCompleted && "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {setNumber}
        </span>
        {!isWorkoutCompleted && (
          <FitAiButton
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive size-5"
          >
            <IconTrash className="size-3" />
          </FitAiButton>
        )}
      </div>

      {/* Weight input */}
      <div className="flex items-center gap-0.5">
        <FitAiButton
          variant="ghost"
          size="icon-xs"
          onClick={() => handleWeightIncrement(-2.5)}
          disabled={isDisabled}
          className="size-6"
        >
          <IconMinus className="size-3" />
        </FitAiButton>
        <Input
          type="number"
          inputMode="decimal"
          value={weight ?? ""}
          onChange={(e) => onWeightChange(e.target.value ? Number(e.target.value) : null)}
          disabled={isDisabled}
          className={cn(
            "h-8 text-center text-xs px-1 flex-1 min-w-0",
            isCompleted && "bg-emerald-500/10 border-emerald-500/20",
          )}
          placeholder="kg"
        />
        <FitAiButton
          variant="ghost"
          size="icon-xs"
          onClick={() => handleWeightIncrement(2.5)}
          disabled={isDisabled}
          className="size-6"
        >
          <IconPlus className="size-3" />
        </FitAiButton>
      </div>

      {/* Reps input */}
      <div className="flex items-center gap-0.5">
        <FitAiButton
          variant="ghost"
          size="icon-xs"
          onClick={() => handleRepsIncrement(-1)}
          disabled={isDisabled}
          className="size-6"
        >
          <IconMinus className="size-3" />
        </FitAiButton>
        <Input
          type="number"
          inputMode="numeric"
          value={reps ?? ""}
          onChange={(e) => onRepsChange(e.target.value ? Number(e.target.value) : null)}
          disabled={isDisabled}
          className={cn(
            "h-8 text-center text-xs px-1 flex-1 min-w-0",
            isCompleted && "bg-emerald-500/10 border-emerald-500/20",
          )}
          placeholder="reps"
        />
        <FitAiButton
          variant="ghost"
          size="icon-xs"
          onClick={() => handleRepsIncrement(1)}
          disabled={isDisabled}
          className="size-6"
        >
          <IconPlus className="size-3" />
        </FitAiButton>
      </div>

      {/* Complete button */}
      <div className="flex justify-center">
        <FitAiButton
          variant={isCompleted ? "default" : "outline"}
          size="icon-sm"
          onClick={onComplete}
          disabled={isWorkoutCompleted || (!weight && !reps)}
          className={cn(
            "size-8 transition-all",
            isCompleted && "bg-emerald-500 hover:bg-emerald-600 border-emerald-500",
          )}
        >
          <IconCheck className={cn("size-4", isCompleted && "text-white")} />
        </FitAiButton>
      </div>
    </div>
  );
}

function WorkoutDetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header skeleton */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-7" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="size-7" />
            </div>
          </div>
          <div className="flex items-center gap-4 pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-1.5 w-full mb-3" />
        </div>
      </header>

      {/* Content skeleton */}
      <main className="flex-1 container mx-auto py-4 px-4">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Skeleton className="size-8" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
