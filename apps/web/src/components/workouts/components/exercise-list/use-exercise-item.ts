/**
 * Hook for exercise item mutations
 * Extracts mutation logic from ExerciseItem component
 */

import { useAddSet, useRemoveExerciseFromWorkout } from "../../hooks/use-mutations";

interface UseExerciseItemParams {
  workoutId: number;
  workoutExerciseId: number;
  setsCount: number;
}

export function useExerciseItem({
  workoutId,
  workoutExerciseId,
  setsCount,
}: UseExerciseItemParams) {
  const removeExerciseMutation = useRemoveExerciseFromWorkout(workoutId);
  const addSetMutation = useAddSet(workoutId);

  const handleRemoveExercise = () => {
    if (window.confirm("Are you sure you want to remove this exercise?")) {
      removeExerciseMutation.mutate({ workoutId, workoutExerciseId });
    }
  };

  const handleAddSet = () => {
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
  };

  return {
    handleRemoveExercise,
    handleAddSet,
    isAddingSet: addSetMutation.isPending,
    isRemoving: removeExerciseMutation.isPending,
  };
}
