import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  templateKeys,
  templateFoldersOptions,
  templateDetailOptions,
  settingsKeys,
} from "../queries/query-options";

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

/**
 * Hook for creating a new folder
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof orpc.template.folder.create.call>[0]) => {
      return orpc.template.folder.create.call(input);
    },
    onMutate: () => {
      // toast.show({
      //   id: "creating-folder",
      //   message: "Creating folder...",
      //   type: "loading",
      // });
    },
    onSuccess: () => {
      // toast.update({
      //   id: "creating-folder",
      //   message: "Folder created successfully",
      //   type: "success",
      // });
      queryClient.invalidateQueries({
        queryKey: templateFoldersOptions().queryKey,
      });
    },
    onError: () => {
      // toast.update({
      //   id: "creating-folder",
      //   message: error.message || "Failed to create folder",
      //   type: "error",
      // });
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
 * Hook for adding an exercise to a template day
 * @param templateId - The template ID
 * @param dayId - The day ID (required for multi-day templates)
 */
export function useAddExercise(templateId: number, dayId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Parameters<typeof orpc.template.addExercise.call>[0], "dayId">) =>
      orpc.template.addExercise.call({ ...input, dayId }),
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
 * @param templateId - The template ID
 * @param dayId - The day ID (required for multi-day templates)
 */
export function useUpdateExercise(templateId: number, dayId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Parameters<typeof orpc.template.updateExercise.call>[0], "dayId">) =>
      orpc.template.updateExercise.call({ ...input, dayId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(templateId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook for removing an exercise from a template
 * @param templateId - The template ID
 * @param dayId - The day ID (required for multi-day templates)
 */
export function useRemoveExercise(templateId: number, dayId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Parameters<typeof orpc.template.removeExercise.call>[0], "dayId">) =>
      orpc.template.removeExercise.call({ ...input, dayId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(templateId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook for reordering exercises in a template day
 * @param templateId - The template ID
 * @param dayId - The day ID (required for multi-day templates)
 */
export function useReorderExercises(templateId: number, dayId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Parameters<typeof orpc.template.reorderExercises.call>[0], "dayId">) =>
      orpc.template.reorderExercises.call({ ...input, dayId }),
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

// ============================================================================
// Template Day Mutations
// ============================================================================

// Type aliases for day mutation inputs
type CreateDayInput = Parameters<typeof orpc.template.day.create.call>[0];
type UpdateDayInput = Parameters<typeof orpc.template.day.update.call>[0];
type DeleteDayInput = Parameters<typeof orpc.template.day.delete.call>[0];
type ReorderDaysInput = Parameters<typeof orpc.template.day.reorder.call>[0];

/**
 * Hook for creating a new day in a template
 */
export function useCreateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDayInput) => orpc.template.day.create.call(input),
    onSuccess: (_, variables: CreateDayInput) => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(variables.templateId as number).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook for updating a day in a template
 */
export function useUpdateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDayInput) => orpc.template.day.update.call(input),
    onSuccess: (_, variables: UpdateDayInput) => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(variables.templateId as number).queryKey,
      });
    },
  });
}

/**
 * Hook for deleting a day from a template
 */
export function useDeleteDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteDayInput) => orpc.template.day.delete.call(input),
    onSuccess: (_, variables: DeleteDayInput) => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(variables.templateId as number).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook for reordering days in a template
 */
export function useReorderDays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReorderDaysInput) => orpc.template.day.reorder.call(input),
    onMutate: async (variables: ReorderDaysInput) => {
      await queryClient.cancelQueries({
        queryKey: templateDetailOptions(variables.templateId as number).queryKey,
      });
    },
    onSettled: (_, __, variables: ReorderDaysInput) => {
      queryClient.invalidateQueries({
        queryKey: templateDetailOptions(variables.templateId as number).queryKey,
      });
    },
  });
}

// ============================================================================
// Active Template Mutations
// ============================================================================

/**
 * Hook for setting a template as active
 */
export function useSetActiveTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { templateId: number }) => orpc.settings.setActiveTemplate.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.activeTemplate(),
      });
    },
  });
}

/**
 * Hook for clearing the active template
 */
export function useClearActiveTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => orpc.settings.clearActiveTemplate.call(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.activeTemplate(),
      });
    },
  });
}
