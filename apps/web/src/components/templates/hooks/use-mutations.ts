/**
 * Template mutation hooks for TanStack Query
 * Uses queryOptions pattern for consistent cache invalidation
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  templateKeys,
  templateFoldersOptions,
  templateDetailOptions,
} from "../queries/query-options";

// ============================================================================
// Template Mutations
// ============================================================================

/**
 * Hook for creating a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.create.call>[0]) =>
      orpc.template.create.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.folders() });
    },
  });
}

type UpdateTemplateInput = Parameters<typeof orpc.template.update.call>[0];

/**
 * Hook for updating an existing template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTemplateInput) => orpc.template.update.call(input),
    onSuccess: (_, variables: UpdateTemplateInput) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(variables.id as number).queryKey,
      });
    },
  });
}

/**
 * Hook for deleting a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.delete.call>[0]) =>
      orpc.template.delete.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.folders() });
    },
  });
}

/**
 * Hook for duplicating a template
 */
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.duplicate.call>[0]) =>
      orpc.template.duplicate.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.folders() });
    },
  });
}

/**
 * Hook for starting a workout from a template
 */
export function useStartWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.startWorkout.call>[0]) =>
      orpc.template.startWorkout.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout"] });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// ============================================================================
// Folder Mutations
// ============================================================================

/**
 * Hook for creating a new folder
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.folder.create.call>[0]) =>
      orpc.template.folder.create.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateFoldersOptions().queryKey,
      });
    },
  });
}

/**
 * Hook for updating a folder
 */
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.folder.update.call>[0]) =>
      orpc.template.folder.update.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateFoldersOptions().queryKey,
      });
    },
  });
}

/**
 * Hook for deleting a folder
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.folder.delete.call>[0]) =>
      orpc.template.folder.delete.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateFoldersOptions().queryKey,
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook for reordering folders
 */
export function useReorderFolders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.folder.reorder.call>[0]) =>
      orpc.template.folder.reorder.call(input),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: templateFoldersOptions().queryKey,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: templateFoldersOptions().queryKey,
      });
    },
  });
}

// ============================================================================
// Template Exercise Mutations
// ============================================================================

/**
 * Hook for adding an exercise to a template
 */
export function useAddExercise(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.addExercise.call>[0]) =>
      orpc.template.addExercise.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(templateId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook for updating an exercise in a template
 */
export function useUpdateExercise(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.updateExercise.call>[0]) =>
      orpc.template.updateExercise.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(templateId).queryKey,
      });
    },
  });
}

/**
 * Hook for removing an exercise from a template
 */
export function useRemoveExercise(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.removeExercise.call>[0]) =>
      orpc.template.removeExercise.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(templateId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook for reordering exercises in a template
 */
export function useReorderExercises(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof orpc.template.reorderExercises.call>[0]) =>
      orpc.template.reorderExercises.call(input),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: templateDetailOptions(templateId).queryKey,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(templateId).queryKey,
      });
    },
  });
}
