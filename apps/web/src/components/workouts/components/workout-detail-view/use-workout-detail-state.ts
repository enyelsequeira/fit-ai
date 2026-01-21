/**
 * useWorkoutDetailState - Hook for managing workout detail view state
 * Extracts all state management and handlers from WorkoutDetailView
 */

import { useState, useEffect, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";

import { useWorkoutById } from "../../queries/use-queries.ts";
import { useUpdateWorkout, useCompleteSet } from "../../hooks/use-mutations.ts";
import { useWorkoutSession } from "../../hooks/use-workout-session.ts";
import { useRestTimer } from "../workout-timer";

export function useWorkoutDetailState(workoutId: number) {
  // Data fetching
  const { data: workout, isLoading, isError, error } = useWorkoutById(workoutId);

  // Mutations
  const updateWorkoutMutation = useUpdateWorkout();
  const completeSetMutation = useCompleteSet(workoutId);

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  // Modal states using useDisclosure
  const [addExerciseOpened, addExerciseHandlers] = useDisclosure(false);
  const [completeWorkoutOpened, completeWorkoutHandlers] = useDisclosure(false);

  // Timer overlay state using useDisclosure
  const [timerOverlayOpen, timerOverlayHandlers] = useDisclosure(false);

  // Initialize rest timer hook
  const restTimer = useRestTimer({
    onComplete: timerOverlayHandlers.close,
  });

  // Handle set completion callback
  const handleSetComplete = useCallback(
    (setId: number) => {
      completeSetMutation.mutate({ workoutId, setId });
    },
    [completeSetMutation, workoutId],
  );

  // Initialize workout session hook
  // Cast workout to expected type - API returns Date objects but hook expects string dates
  // This is safe because the hook only uses date values for display/comparison
  const workoutSession = useWorkoutSession({
    workout: workout as Parameters<typeof useWorkoutSession>[0]["workout"],
    restTimer,
    onSetComplete: handleSetComplete,
  });

  // Update edited name when workout loads
  useEffect(() => {
    if (workout?.name) {
      setEditedName(workout.name);
    }
  }, [workout?.name]);

  // Show timer overlay when rest timer starts
  useEffect(() => {
    if (restTimer.isRunning) {
      timerOverlayHandlers.open();
    }
  }, [restTimer.isRunning, timerOverlayHandlers]);

  // Name editing handlers
  const startEditingName = useCallback(() => {
    setIsEditingName(true);
  }, []);

  const handleSaveName = useCallback(() => {
    if (!editedName.trim() || editedName === workout?.name) {
      setIsEditingName(false);
      setEditedName(workout?.name ?? "");
      return;
    }

    updateWorkoutMutation.mutate(
      { workoutId, name: editedName.trim() },
      {
        onSuccess: () => {
          setIsEditingName(false);
        },
      },
    );
  }, [editedName, workout?.name, workoutId, updateWorkoutMutation]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingName(false);
    setEditedName(workout?.name ?? "");
  }, [workout?.name]);

  return {
    // Data fetching
    workout,
    isLoading,
    isError,
    error,

    // Name editing
    nameEditing: {
      isEditing: isEditingName,
      value: editedName,
      setValue: setEditedName,
      startEditing: startEditingName,
      save: handleSaveName,
      cancel: handleCancelEdit,
      isSaving: updateWorkoutMutation.isPending,
    },

    // Modals
    modals: {
      addExercise: {
        opened: addExerciseOpened,
        open: addExerciseHandlers.open,
        close: addExerciseHandlers.close,
      },
      completeWorkout: {
        opened: completeWorkoutOpened,
        open: completeWorkoutHandlers.open,
        close: completeWorkoutHandlers.close,
      },
    },

    // Timer overlay
    timerOverlay: {
      isOpen: timerOverlayOpen,
      open: timerOverlayHandlers.open,
      close: timerOverlayHandlers.close,
    },

    // Rest timer hook result
    restTimer,

    // Workout session
    workoutSession,

    // Mutations
    completeSetMutation,
  };
}

export type UseWorkoutDetailStateReturn = ReturnType<typeof useWorkoutDetailState>;
