import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

/**
 * Hook for creating a new template
 * Uses orpc.*.mutationOptions() with orpc.*.key() for cache invalidation
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.template.folder.list.key() });
      },
    }),
  );
}

/**
 * Hook for updating an existing template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.update.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
        queryClient.invalidateQueries({
          queryKey: orpc.template.getById.key({ input: { id: variables.id as number } }),
        });
      },
    }),
  );
}

/**
 * Hook for deleting a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.template.folder.list.key() });
      },
    }),
  );
}

/**
 * Hook for duplicating a template
 */
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.duplicate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.template.folder.list.key() });
      },
    }),
  );
}

/**
 * Hook for starting a workout from a template
 */
export function useStartWorkout() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.startWorkout.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.workout.key() });
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
      },
    }),
  );
}

/**
 * Hook for creating a new folder
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.folder.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.template.folder.list.key() });
      },
    }),
  );
}

/**
 * Hook for updating a folder
 */
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.folder.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.template.folder.list.key() });
      },
    }),
  );
}

/**
 * Hook for deleting a folder
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.folder.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.template.folder.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
      },
    }),
  );
}

/**
 * Hook for reordering folders
 */
export function useReorderFolders() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.folder.reorder.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: orpc.template.folder.list.key() });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: orpc.template.folder.list.key() });
      },
    }),
  );
}

// ============================================================================
// Template Exercise Mutations
// ============================================================================

/**
 * Hook for adding an exercise to a template
 */
export function useAddExercise(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.addExercise.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.template.getById.key({ input: { id: templateId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
      },
    }),
  );
}

/**
 * Hook for updating an exercise in a template
 */
export function useUpdateExercise(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.updateExercise.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.template.getById.key({ input: { id: templateId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
      },
    }),
  );
}

/**
 * Hook for removing an exercise from a template
 */
export function useRemoveExercise(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.removeExercise.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.template.getById.key({ input: { id: templateId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
      },
    }),
  );
}

/**
 * Hook for reordering exercises in a template
 */
export function useReorderExercises(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.template.reorderExercises.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({
          queryKey: orpc.template.getById.key({ input: { id: templateId } }),
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.template.getById.key({ input: { id: templateId } }),
        });
      },
    }),
  );
}
