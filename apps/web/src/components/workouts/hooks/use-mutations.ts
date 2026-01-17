/**
 * Mutation hooks for workout operations
 * Handles create, update, delete, and completion mutations with cache invalidation
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

// ============================================================================
// Template-based Workout Mutations
// ============================================================================

/**
 * Hook for starting a workout from a template
 * Uses the existing template.startWorkout API endpoint
 */
export function useStartWorkoutFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.startWorkout.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.workout.list.key() });
      },
    }),
  );
}

// ============================================================================
// Workout Session Mutations
// ============================================================================

/**
 * Hook for creating a new workout
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.workout.list.key() });
      },
    }),
  );
}

/**
 * Hook for updating an existing workout
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.update.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: orpc.workout.list.key() });
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId: variables.workoutId } }),
        });
      },
    }),
  );
}

/**
 * Hook for deleting a workout
 */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.workout.list.key() });
      },
    }),
  );
}

/**
 * Hook for completing a workout
 */
export function useCompleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.complete.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: orpc.workout.list.key() });
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId: variables.workoutId } }),
        });
      },
    }),
  );
}

// ============================================================================
// Workout Exercise Mutations
// ============================================================================

/**
 * Hook for adding an exercise to a workout
 */
export function useAddExerciseToWorkout(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.addExercise.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.workout.list.key() });
      },
    }),
  );
}

/**
 * Hook for updating an exercise in a workout
 */
export function useUpdateWorkoutExercise(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.updateExercise.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
      },
    }),
  );
}

/**
 * Hook for removing an exercise from a workout
 */
export function useRemoveExerciseFromWorkout(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.removeExercise.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.workout.list.key() });
      },
    }),
  );
}

/**
 * Hook for reordering exercises in a workout
 */
export function useReorderWorkoutExercises(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.reorderExercises.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
      },
    }),
  );
}

// ============================================================================
// Set Mutations
// ============================================================================

/**
 * Hook for adding a set to an exercise
 */
export function useAddSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.addSet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
      },
    }),
  );
}

/**
 * Hook for updating a set
 */
export function useUpdateSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.updateSet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
      },
    }),
  );
}

/**
 * Hook for deleting a set
 */
export function useDeleteSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.deleteSet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
      },
    }),
  );
}

/**
 * Hook for completing a set
 */
export function useCompleteSet(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.workout.completeSet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workout.getById.key({ input: { workoutId } }),
        });
      },
    }),
  );
}
