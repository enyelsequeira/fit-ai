/**
 * FocusedWorkoutView - Gym Mode container for focused workout sessions
 * Features: Modal rest timer, collapsible exercise queue, dot indicators
 */

import { useMemo, useCallback, useState } from "react";
import { Box, Button, Stack, Text } from "@mantine/core";
import { IconBarbell } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";

import { WorkoutLoadingState } from "../workout-detail-view/workout-loading-state";
import { WorkoutErrorState } from "../workout-detail-view/workout-error-state";
import { AddExerciseModal } from "../add-exercise-modal/add-exercise-modal";
import { CompleteWorkoutModal } from "../complete-workout-modal/complete-workout-modal";
import { FocusedWorkoutHeader } from "./focused-workout-header";
import { ExercisePager } from "./exercise-pager";
import { ExerciseQueue } from "./exercise-queue";
import type { ExerciseQueueItem } from "./exercise-queue";
import { QuickActionsBar } from "./quick-actions-bar";
import { RestTimerModal } from "./rest-timer-modal";
import { useFocusedWorkout } from "./use-focused-workout";

import styles from "./focused-workout-view.module.css";

interface FocusedWorkoutViewProps {
  workoutId: number;
}

export function FocusedWorkoutView({ workoutId }: FocusedWorkoutViewProps) {
  const navigate = useNavigate();
  const state = useFocusedWorkout(workoutId);
  const [queueExpanded, setQueueExpanded] = useState(false);

  // Calculate which exercises are fully completed
  const completedExerciseIndexes = useMemo(() => {
    if (!state.workout?.workoutExercises) return [];

    return state.workout.workoutExercises
      .map((exercise, index) => {
        const sets = exercise.sets ?? [];
        if (sets.length === 0) return -1;
        const allCompleted = sets.every((set) => set.completedAt !== null);
        return allCompleted ? index : -1;
      })
      .filter((index) => index !== -1);
  }, [state.workout?.workoutExercises]);

  // Map exercises to queue format
  const exerciseQueueItems: ExerciseQueueItem[] = useMemo(() => {
    if (!state.workout?.workoutExercises) return [];

    return state.workout.workoutExercises.map((exercise, index) => {
      const sets = exercise.sets ?? [];
      const completedSets = sets.filter((set) => set.completedAt !== null).length;
      const isCompleted = sets.length > 0 && sets.every((set) => set.completedAt !== null);
      const isCurrent = index === state.pagerIndex;

      return {
        id: exercise.id,
        name: exercise.exercise?.name ?? "Unknown Exercise",
        completedSets,
        totalSets: sets.length,
        status: isCompleted ? "completed" : isCurrent ? "current" : "pending",
      };
    });
  }, [state.workout?.workoutExercises, state.pagerIndex]);

  // Handle back navigation
  const handleBackClick = useCallback(() => {
    navigate({ to: "/dashboard/workouts" });
  }, [navigate]);

  // Handle set completion - update with values then complete
  const handleSetComplete = useCallback(
    (exerciseId: number, setId: number, weight: number, reps: number, rpe?: number) => {
      // The exerciseId is workoutExerciseId from the pager, not needed for completion
      void exerciseId;
      state.onSetComplete(setId, weight, reps, rpe);
    },
    [state],
  );

  // Handle exercise selection from queue
  const handleSelectExercise = useCallback(
    (index: number) => {
      state.onPagerChange(index);
      setQueueExpanded(false);
    },
    [state],
  );

  // Loading state
  if (state.isLoading) {
    return <WorkoutLoadingState />;
  }

  // Error state
  if (state.isError || !state.workout) {
    return <WorkoutErrorState errorMessage={state.error?.message} />;
  }

  const { workoutExercises } = state.workout;
  const hasExercises = workoutExercises && workoutExercises.length > 0;

  return (
    <Box className={styles.container}>
      {/* Gym Mode Header with dots */}
      <FocusedWorkoutHeader
        workoutName={state.workout.name ?? "Untitled"}
        elapsedTime={state.workoutSession.stats.elapsedTime}
        currentExerciseIndex={state.pagerIndex}
        totalExercises={workoutExercises?.length ?? 0}
        completedExerciseIndexes={completedExerciseIndexes}
        onBackClick={handleBackClick}
      />

      {/* Main Content */}
      <Box className={styles.content}>
        {hasExercises ? (
          <>
            {/* Exercise Pager (swipeable) */}
            <ExercisePager
              exercises={workoutExercises}
              currentIndex={state.pagerIndex}
              onIndexChange={state.onPagerChange}
              onSetComplete={handleSetComplete}
              onAddSet={state.onAddSet}
              isLoading={state.isCompletingSet}
            />

            {/* Collapsible Exercise Queue */}
            <ExerciseQueue
              exercises={exerciseQueueItems}
              currentIndex={state.pagerIndex}
              isExpanded={queueExpanded}
              onToggle={() => setQueueExpanded(!queueExpanded)}
              onSelectExercise={handleSelectExercise}
            />
          </>
        ) : (
          <Box className={styles.emptyState}>
            <Stack align="center" gap="md">
              <IconBarbell size={64} style={{ opacity: 0.3 }} />
              <Text c="dimmed" ta="center">
                No exercises yet
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Add exercises to start your workout
              </Text>
              <Button variant="light" onClick={state.modals.addExercise.open}>
                Add Exercise
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Fixed Bottom Action Bar */}
      <Box className={styles.bottomBar}>
        <QuickActionsBar
          onAddExercise={state.modals.addExercise.open}
          onFinishWorkout={state.modals.completeWorkout.open}
          canFinish={state.workoutSession.stats.completedSets > 0 && state.workout.completedAt === null}
        />
      </Box>

      {/* Modal Rest Timer (replaces inline timer) */}
      <RestTimerModal
        timer={state.restTimer}
        nextSetInfo={
          state.workoutSession.nextSetInfo
            ? {
                exerciseName: state.workoutSession.nextSetInfo.exerciseName,
                setNumber: state.workoutSession.nextSetInfo.setNumber,
                targetWeight: state.workoutSession.nextSetInfo.targetWeight ?? undefined,
                targetReps: state.workoutSession.nextSetInfo.targetReps ?? undefined,
              }
            : undefined
        }
        onDismiss={state.onDismissRestTimer}
      />

      {/* Modals */}
      <AddExerciseModal
        opened={state.modals.addExercise.opened}
        onClose={state.modals.addExercise.close}
        workoutId={workoutId}
        existingExerciseIds={workoutExercises?.map((we) => we.exerciseId) ?? []}
      />

      <CompleteWorkoutModal
        opened={state.modals.completeWorkout.opened}
        onClose={state.modals.completeWorkout.close}
        workoutId={workoutId}
        isAlreadyCompleted={state.workout.completedAt !== null}
        onSuccess={handleBackClick}
      />
    </Box>
  );
}
