import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { settingsKeys } from "../queries/query-options";

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
 * Hook for adding an exercise to a template day
 * Uses custom mutationFn to inject dayId into each call
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
        queryKey: orpc.template.getById.key({ input: { id: templateId } }),
      });
      queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
    },
  });
}

/**
 * Hook for updating an exercise in a template
 * Uses custom mutationFn to inject dayId into each call
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
        queryKey: orpc.template.getById.key({ input: { id: templateId } }),
      });
      queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
    },
  });
}

/**
 * Hook for removing an exercise from a template
 * Uses custom mutationFn to inject dayId into each call
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
        queryKey: orpc.template.getById.key({ input: { id: templateId } }),
      });
      queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
    },
  });
}

/**
 * Hook for reordering exercises in a template day
 * Uses custom mutationFn to inject dayId into each call
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
        queryKey: orpc.template.getById.key({ input: { id: templateId } }),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.template.getById.key({ input: { id: templateId } }),
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
        queryKey: orpc.template.getById.key({ input: { id: variables.templateId as number } }),
      });
      queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
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
        queryKey: orpc.template.getById.key({ input: { id: variables.templateId as number } }),
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
        queryKey: orpc.template.getById.key({ input: { id: variables.templateId as number } }),
      });
      queryClient.invalidateQueries({ queryKey: orpc.template.list.key() });
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
        queryKey: orpc.template.getById.key({ input: { id: variables.templateId as number } }),
      });
    },
    onSettled: (_, __, variables: ReorderDaysInput) => {
      queryClient.invalidateQueries({
        queryKey: orpc.template.getById.key({ input: { id: variables.templateId as number } }),
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
