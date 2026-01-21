/**
 * WorkoutDetailView - Full page component for viewing and editing a workout
 * Shows workout header, exercises with sets, and completion controls
 * Integrates rest timer, workout session tracking, and exercise navigation
 */

import type { RefObject } from "react";

import { useCallback, useRef } from "react";
import { Box, Button, Container, Paper, Stack } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { countSets } from "../../utils.ts";
import { ExerciseList } from "../exercise-list/exercise-list.tsx";
import { AddExerciseModal } from "../add-exercise-modal/add-exercise-modal.tsx";
import { CompleteWorkoutModal } from "../complete-workout-modal/complete-workout-modal.tsx";
import { RestTimerOverlay } from "../workout-timer/rest-timer-overlay.tsx";
import { WorkoutHeader } from "../workout-header/workout-header.tsx";
import { NextUpPrompt } from "../workout-guidance/next-up-prompt.tsx";
import { ExerciseNavigation } from "../exercise-navigation/exercise-navigation.tsx";
import { WorkoutLoadingState } from "./workout-loading-state.tsx";
import { WorkoutErrorState } from "./workout-error-state.tsx";
import { CompletedWorkoutHeader } from "./completed-workout-header.tsx";
import { InlineNameEditor } from "./inline-name-editor.tsx";
import { ExercisesSectionHeader } from "./exercises-section-header.tsx";
import { EmptyExercisesState } from "./empty-exercises-state.tsx";
import { CompleteWorkoutPrompt } from "./complete-workout-prompt.tsx";
import { useWorkoutDetailState } from "./use-workout-detail-state.ts";

interface WorkoutDetailViewProps {
  workoutId: number;
}

/** Ref interface for ExerciseList scroll functionality */
interface ExerciseListRef {
  scrollToExercise: (index: number) => void;
}

export function WorkoutDetailView({ workoutId }: WorkoutDetailViewProps) {
  const state = useWorkoutDetailState(workoutId);
  const exerciseListRef = useRef<ExerciseListRef | null>(null);

  // Handle exercise navigation click - scroll to exercise
  const handleExerciseNavClick = useCallback(
    (index: number) => {
      state.workoutSession.goToExercise(index);
      exerciseListRef.current?.scrollToExercise(index);
    },
    [state.workoutSession],
  );

  // Handle mark complete from NextUpPrompt
  const handleMarkComplete = useCallback(() => {
    if (state.workoutSession.nextSetInfo) {
      state.workoutSession.handleSetComplete(state.workoutSession.nextSetInfo.setId);
    }
  }, [state.workoutSession]);

  // Loading state
  if (state.isLoading) {
    return <WorkoutLoadingState />;
  }

  // Error state
  if (state.isError || !state.workout) {
    return <WorkoutErrorState errorMessage={state.error?.message} />;
  }

  const { name, notes, startedAt, completedAt, workoutExercises } = state.workout;
  const isCompleted = completedAt !== null;
  const exerciseCount = workoutExercises?.length ?? 0;
  const { total: totalSets, completed: completedSets } = countSets(workoutExercises);

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        {/* Back Navigation */}
        <Box>
          <Button
            component={Link}
            to="/dashboard/workouts"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            size="sm"
          >
            Back to Workouts
          </Button>
        </Box>

        {/* Workout Header - Different for in-progress vs completed */}
        {!isCompleted ? (
          <>
            {state.nameEditing.isEditing ? (
              <InlineNameEditor
                value={state.nameEditing.value}
                onChange={state.nameEditing.setValue}
                onSave={state.nameEditing.save}
                onCancel={state.nameEditing.cancel}
                isSaving={state.nameEditing.isSaving}
              />
            ) : (
              <WorkoutHeader
                workoutName={name ?? "Untitled Workout"}
                elapsedTime={state.workoutSession.stats.elapsedTime}
                restTimerActive={state.restTimer.isRunning}
                restTimeRemaining={state.restTimer.timeRemaining}
                completedSets={state.workoutSession.stats.completedSets}
                totalSets={state.workoutSession.stats.totalSets}
                onNameClick={state.nameEditing.startEditing}
              />
            )}

            {/* Next Up Prompt - Shows what set to do next */}
            <NextUpPrompt
              exerciseName={state.workoutSession.nextSetInfo?.exerciseName}
              setNumber={state.workoutSession.nextSetInfo?.setNumber}
              totalSets={state.workoutSession.nextSetInfo?.totalSets}
              targetWeight={state.workoutSession.nextSetInfo?.targetWeight ?? undefined}
              targetReps={state.workoutSession.nextSetInfo?.targetReps ?? undefined}
              isWorkoutComplete={state.workoutSession.isWorkoutComplete}
              onMarkComplete={handleMarkComplete}
              loading={state.completeSetMutation.isPending}
            />

            {/* Exercise Navigation - Quick jump between exercises */}
            {exerciseCount > 0 && (
              <ExerciseNavigation
                exercises={state.workoutSession.exercisesForNav}
                currentExerciseIndex={state.workoutSession.currentExerciseIndex}
                onExerciseClick={handleExerciseNavClick}
              />
            )}
          </>
        ) : (
          <CompletedWorkoutHeader
            summary={{
              name,
              notes,
              startedAt,
              completedAt,
              exerciseCount,
              completedSets,
              totalSets,
            }}
          />
        )}

        {/* Exercises Section */}
        <Paper withBorder p="lg" radius="md">
          <Stack gap="md">
            <ExercisesSectionHeader
              isCompleted={isCompleted}
              onAddExercise={state.modals.addExercise.open}
            />

            {workoutExercises && workoutExercises.length > 0 ? (
              <ExerciseList
                workoutId={workoutId}
                exercises={workoutExercises}
                isWorkoutCompleted={isCompleted}
                currentExerciseIndex={state.workoutSession.currentExerciseIndex}
                currentSetIndex={state.workoutSession.currentSetIndex}
                onSetCompleteWithTimer={state.workoutSession.handleSetComplete}
                scrollRef={exerciseListRef as RefObject<ExerciseListRef | null>}
              />
            ) : (
              <EmptyExercisesState
                isCompleted={isCompleted}
                onAddExercise={state.modals.addExercise.open}
              />
            )}
          </Stack>
        </Paper>

        {/* Complete Workout Prompt (for in-progress workouts) */}
        {!isCompleted && <CompleteWorkoutPrompt onComplete={state.modals.completeWorkout.open} />}
      </Stack>

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
      />

      {/* Rest Timer Overlay */}
      <RestTimerOverlay
        isOpen={state.timerOverlay.isOpen && state.restTimer.isRunning}
        onClose={state.timerOverlay.close}
        timer={state.restTimer}
        nextSetInfo={
          state.workoutSession.nextSetInfo
            ? {
                exerciseName: state.workoutSession.nextSetInfo.exerciseName,
                setNumber: state.workoutSession.nextSetInfo.setNumber,
                totalSets: state.workoutSession.nextSetInfo.totalSets,
                targetWeight: state.workoutSession.nextSetInfo.targetWeight ?? undefined,
                targetReps: state.workoutSession.nextSetInfo.targetReps ?? undefined,
              }
            : undefined
        }
      />
    </Container>
  );
}
