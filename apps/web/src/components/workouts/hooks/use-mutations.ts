/**
 * Mutation hooks for workout operations
 * Handles create, update, delete, and completion mutations with cache invalidation
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { workoutKeys, workoutDetailOptions } from "../queries/query-options";

// ============================================================================
// Workout Session Mutations
// ============================================================================

/**
 * Hook for creating a new workout
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.create.call>[0]) =>
      orpc.workout.create.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
}

/**
 * Hook for updating an existing workout
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.update.call>[0]) =>
      orpc.workout.update.call(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(variables.workoutId).queryKey,
      });
    },
  });
}

/**
 * Hook for deleting a workout
 */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.delete.call>[0]) =>
      orpc.workout.delete.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
}

/**
 * Hook for completing a workout
 */
export function useCompleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.complete.call>[0]) =>
      orpc.workout.complete.call(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(variables.workoutId).queryKey,
      });
    },
  });
}

// ============================================================================
// Workout Exercise Mutations
// ============================================================================

/**
 * Hook for adding an exercise to a workout
 */
export function useAddExerciseToWorkout(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.addExercise.call>[0]) =>
      orpc.workout.addExercise.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
}

/**
 * Hook for updating an exercise in a workout
 */
export function useUpdateWorkoutExercise(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.updateExercise.call>[0]) =>
      orpc.workout.updateExercise.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
    },
  });
}

/**
 * Hook for removing an exercise from a workout
 */
export function useRemoveExerciseFromWorkout(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.removeExercise.call>[0]) =>
      orpc.workout.removeExercise.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
}

/**
 * Hook for reordering exercises in a workout
 */
export function useReorderWorkoutExercises(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.reorderExercises.call>[0]) =>
      orpc.workout.reorderExercises.call(input),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
    },
  });
}

// ============================================================================
// Set Mutations
// ============================================================================

/**
 * Hook for adding a set to an exercise
 */
export function useAddSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.addSet.call>[0]) =>
      orpc.workout.addSet.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
    },
  });
}

/**
 * Hook for updating a set
 */
export function useUpdateSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.updateSet.call>[0]) =>
      orpc.workout.updateSet.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
    },
  });
}

/**
 * Hook for deleting a set
 */
export function useDeleteSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.deleteSet.call>[0]) =>
      orpc.workout.deleteSet.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
    },
  });
}

/**
 * Hook for completing a set
 */
export function useCompleteSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.workout.completeSet.call>[0]) =>
      orpc.workout.completeSet.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailOptions(workoutId).queryKey,
      });
    },
  });
}
