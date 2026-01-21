/**
 * useFocusedWorkout - Composing hook for focused workout mode
 * Combines useWorkoutDetailState with pager navigation and rest timer overlay state
 */

import { useState, useEffect, useCallback } from "react";

import { useWorkoutDetailState } from "../workout-detail-view/use-workout-detail-state";
import { useAddSet, useUpdateSet } from "../../hooks/use-mutations";

export function useFocusedWorkout(workoutId: number) {
  const detailState = useWorkoutDetailState(workoutId);
  const addSetMutation = useAddSet(workoutId);
  const updateSetMutation = useUpdateSet(workoutId);

  // Focused mode specific state
  const [pagerIndex, setPagerIndex] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Sync pagerIndex with workoutSession.currentExerciseIndex
  useEffect(() => {
    setPagerIndex(detailState.workoutSession.currentExerciseIndex);
  }, [detailState.workoutSession.currentExerciseIndex]);

  // Auto-dismiss rest timer when completed
  useEffect(() => {
    if (detailState.restTimer.status === "completed") {
      setShowRestTimer(false);
    }
  }, [detailState.restTimer.status]);

  // Handle pager navigation
  const handlePagerChange = useCallback(
    (index: number) => {
      setPagerIndex(index);
      detailState.workoutSession.goToExercise(index);
    },
    [detailState.workoutSession],
  );

  // Handle set completion with rest timer display
  // First updates the set with weight/reps, then marks it as complete
  const handleSetComplete = useCallback(
    async (setId: number, weight: number, reps: number, rpe?: number) => {
      // First update the set with weight/reps values
      await updateSetMutation.mutateAsync({
        workoutId,
        setId,
        weight,
        reps,
        ...(rpe !== undefined && rpe !== null ? { rpe } : {}),
      });

      // Then mark the set as complete
      detailState.completeSetMutation.mutate(
        { workoutId, setId },
        {
          onSuccess: () => {
            setShowRestTimer(true);
            detailState.restTimer.startTimer(
              detailState.restTimer.settings.defaultRestTime,
              setId,
            );
          },
        },
      );
    },
    [detailState.completeSetMutation, detailState.restTimer, updateSetMutation, workoutId],
  );

  // Dismiss rest timer overlay
  const handleDismissRestTimer = useCallback(() => {
    setShowRestTimer(false);
    detailState.restTimer.resetTimer();
  }, [detailState.restTimer]);

  // Add a new set to an exercise
  const handleAddSet = useCallback(
    (workoutExerciseId: number, setsCount: number = 0) => {
      addSetMutation.mutate({
        workoutId,
        workoutExerciseId,
        setNumber: setsCount + 1,
        reps: null,
        weight: null,
        durationSeconds: null,
        distance: null,
        holdTimeSeconds: null,
        rpe: null,
        rir: null,
        targetReps: null,
        targetWeight: null,
        restTimeSeconds: null,
        notes: null,
        isCompleted: false,
        setType: "normal",
        weightUnit: "kg",
        distanceUnit: "km",
      });
    },
    [addSetMutation, workoutId],
  );

  return {
    // From useWorkoutDetailState
    workout: detailState.workout,
    isLoading: detailState.isLoading,
    isError: detailState.isError,
    error: detailState.error,
    modals: detailState.modals,
    nameEditing: detailState.nameEditing,
    restTimer: detailState.restTimer,
    workoutSession: detailState.workoutSession,

    // Focused mode specific
    pagerIndex,
    onPagerChange: handlePagerChange,
    showRestTimer,
    onDismissRestTimer: handleDismissRestTimer,
    onSetComplete: handleSetComplete,
    onAddSet: handleAddSet,

    // Mutations
    isCompletingSet: detailState.completeSetMutation.isPending,
  };
}
