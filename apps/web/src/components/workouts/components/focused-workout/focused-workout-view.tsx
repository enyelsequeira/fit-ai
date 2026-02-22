/**
 * FocusedWorkoutView - Gym Mode orchestrator
 * Uses ExerciseTabStrip for navigation instead of carousel/queue.
 */

import type { ExerciseTabItem } from "./exercise-tab-strip";
import type { ExerciseCardData } from "./focused-exercise-card.types";
import type { WorkoutExercise } from "../../types";

import { useMemo, useCallback } from "react";
import { Box, Button, Divider, Group, ScrollArea, Stack, Text } from "@mantine/core";
import {
  IconBarbell,
  IconChevronLeft,
  IconChevronRight,
  IconFlag,
  IconPlus,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import { WorkoutLoadingState } from "../workout-detail-view/workout-loading-state";
import { WorkoutErrorState } from "../workout-detail-view/workout-error-state";
import { AddExerciseModal } from "../add-exercise-modal/add-exercise-modal";
import { CompleteWorkoutModal } from "../complete-workout-modal/complete-workout-modal";
import { FocusedWorkoutHeader } from "./focused-workout-header";
import { ExerciseTabStrip } from "./exercise-tab-strip";
import { FocusedExerciseCard } from "./focused-exercise-card";
import { RestTimerModal } from "./rest-timer-modal";
import { useFocusedWorkout } from "./use-focused-workout";

import styles from "./focused-workout-view.module.css";

function transformExerciseToCardData(exercise: WorkoutExercise): ExerciseCardData {
  const sets = exercise.sets ?? [];
  const completedSets = sets.filter((s) => s.completedAt !== null);
  const incompleteSets = sets.filter((s) => s.completedAt === null);
  const currentSet = incompleteSets[0] ?? null;
  const previousCompleted = completedSets[completedSets.length - 1];

  return {
    exerciseName: exercise.exercise?.name ?? "Unknown",
    exerciseCategory: exercise.exercise?.category ?? undefined,
    exerciseEquipment: exercise.exercise?.equipment ?? undefined,
    currentSetIndex: completedSets.length,
    totalSets: sets.length,
    completedSets,
    currentSet,
    previousSet: previousCompleted
      ? { weight: previousCompleted.weight, reps: previousCompleted.reps }
      : undefined,
    lastPerformanceSets: exercise.lastPerformance ?? [],
  };
}

type FocusedWorkoutViewProps = {
  workoutId: number;
};

export function FocusedWorkoutView({ workoutId }: FocusedWorkoutViewProps) {
  const navigate = useNavigate();
  const state = useFocusedWorkout(workoutId);

  const handleBackClick = useCallback(() => {
    navigate({ to: "/dashboard/workouts" });
  }, [navigate]);

  const handleSetComplete = useCallback(
    (exerciseId: number, setId: number, weight: number, reps: number, rpe?: number) => {
      void exerciseId;
      state.onSetComplete(setId, weight, reps, rpe);
    },
    [state],
  );

  const exerciseTabItems = useMemo(() => {
    if (!state.workout?.workoutExercises) return [];
    return state.workout.workoutExercises.map((ex, index) => {
      const sets = ex.sets ?? [];
      const completedCount = sets.filter((s) => s.completedAt !== null).length;
      const isCompleted = sets.length > 0 && sets.every((s) => s.completedAt !== null);
      return {
        id: ex.id,
        name: ex.exercise?.name ?? "Unknown",
        completedSets: completedCount,
        totalSets: sets.length,
        status: isCompleted ? "completed" : index === state.pagerIndex ? "current" : "pending",
      } satisfies ExerciseTabItem;
    });
  }, [state.workout?.workoutExercises, state.pagerIndex]);

  const totalSets = useMemo(
    () =>
      state.workout?.workoutExercises?.reduce((acc, ex) => acc + (ex.sets?.length ?? 0), 0) ?? 0,
    [state.workout?.workoutExercises],
  );

  if (state.isLoading) {
    return <WorkoutLoadingState />;
  }

  if (state.isError || !state.workout) {
    return <WorkoutErrorState errorMessage={state.error?.message} />;
  }

  const { workoutExercises } = state.workout;
  const hasExercises = workoutExercises && workoutExercises.length > 0;
  const currentExercise = workoutExercises?.[state.pagerIndex] ?? null;
  const isFirstExercise = state.pagerIndex === 0;
  const isLastExercise = state.pagerIndex === (workoutExercises?.length ?? 1) - 1;
  const cardData = currentExercise ? transformExerciseToCardData(currentExercise) : null;
  const currentSetId = cardData?.currentSet?.id ?? 0;
  const canFinish =
    state.workoutSession.stats.completedSets > 0 && state.workout.completedAt === null;

  return (
    <Stack gap={0} w="100%" className={styles.container}>
      <FocusedWorkoutHeader
        workoutName={state.workout.name ?? "Untitled"}
        elapsedTime={state.workoutSession.stats.elapsedTime}
        totalSets={totalSets}
        completedSets={state.workoutSession.stats.completedSets}
        onBackClick={handleBackClick}
      />

      {hasExercises && (
        <ExerciseTabStrip
          exercises={exerciseTabItems}
          currentIndex={state.pagerIndex}
          onSelectExercise={state.onPagerChange}
        />
      )}

      <ScrollArea flex={1} type="auto" className={styles.scrollArea}>
        {/* w="100%" fixes ScrollArea's internal table-cell rendering */}
        <Stack p="md" gap="md" w="100%">
          {hasExercises && cardData && currentExercise ? (
            <>
              <FocusedExerciseCard
                data={cardData}
                actions={{
                  onSetComplete: (weight: number, reps: number, rpe?: number) =>
                    handleSetComplete(currentExercise.id, currentSetId, weight, reps, rpe),
                  onAddSet: () => state.onAddSet(currentExercise.id, cardData.totalSets),
                }}
                isLoading={state.isCompletingSet}
              />

              {/* Exercise navigation */}
              <Group justify="space-between" align="center">
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<IconChevronLeft size={16} />}
                  disabled={isFirstExercise}
                  onClick={() => state.onPagerChange(state.pagerIndex - 1)}
                >
                  Prev
                </Button>
                <Text size="xs" c="dimmed">
                  {state.pagerIndex + 1} / {workoutExercises.length}
                </Text>
                <Button
                  variant="subtle"
                  color="gray"
                  rightSection={<IconChevronRight size={16} />}
                  disabled={isLastExercise}
                  onClick={() => state.onPagerChange(state.pagerIndex + 1)}
                >
                  Next
                </Button>
              </Group>

              {/* Workout actions — inline, no fixed overlay */}
              <Divider />
              <Group justify="space-between">
                <Button
                  variant="subtle"
                  color="gray"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={state.modals.addExercise.open}
                >
                  Add Exercise
                </Button>
                <Button
                  variant="filled"
                  color="teal"
                  size="sm"
                  leftSection={<IconFlag size={14} />}
                  disabled={!canFinish}
                  onClick={state.modals.completeWorkout.open}
                >
                  Finish Workout
                </Button>
              </Group>
            </>
          ) : (
            <Box className={styles.emptyState}>
              <Stack align="center" gap="md">
                <IconBarbell size={64} style={{ opacity: 0.3 }} aria-hidden="true" />
                <FitAiText.Muted ta="center">No exercises yet</FitAiText.Muted>
                <FitAiText.Caption ta="center">
                  Add exercises to start your workout
                </FitAiText.Caption>
                <FitAiButton variant="secondary" onClick={state.modals.addExercise.open}>
                  Add Exercise
                </FitAiButton>
              </Stack>
            </Box>
          )}
        </Stack>
      </ScrollArea>

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
    </Stack>
  );
}
