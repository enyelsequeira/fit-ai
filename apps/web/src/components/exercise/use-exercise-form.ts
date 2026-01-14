import type { ExerciseFormValues } from "./exercise-form-validation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { toast } from "@/components/ui/sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { orpc } from "@/utils/orpc";

import {
  createFormPayload,
  defaultFormValues,
  validateExerciseForm,
} from "./exercise-form-validation";

interface UseExerciseFormOptions {
  exerciseId?: number;
  initialData?: Partial<ExerciseFormValues>;
  onSuccess?: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function useExerciseForm({
  exerciseId,
  initialData,
  onSuccess,
  onClose,
  isOpen,
}: UseExerciseFormOptions) {
  const [formData, setFormData] = useState<ExerciseFormValues>({
    ...defaultFormValues,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormValues, string>>>({});

  const queryClient = useQueryClient();
  const isEditing = exerciseId !== undefined;
  const debouncedName = useDebounce(formData.name.trim(), 400);

  const nameCheck = useQuery(
    orpc.exercise.checkNameAvailability.queryOptions({
      input: {
        name: debouncedName,
        excludeId: exerciseId,
      },
      enabled: debouncedName.length > 0 && isOpen,
      staleTime: 10000,
    }),
  );

  const handleMutationError = (error: Error) => {
    if (error.message?.includes("already exists") || error.message?.includes("already have")) {
      setErrors((prev) => ({ ...prev, name: error.message }));
    } else {
      toast.error(error.message || `Failed to ${isEditing ? "update" : "create"} exercise`);
    }
  };

  const handleMutationSuccess = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["exercise"] });
    onClose();
    if (!isEditing) {
      setFormData(defaultFormValues);
    }
    onSuccess?.();
  };

  const createMutation = useMutation(
    orpc.exercise.create.mutationOptions({
      onSuccess: () => handleMutationSuccess("Exercise created successfully"),
      onError: handleMutationError,
    }),
  );

  const updateMutation = useMutation(
    orpc.exercise.update.mutationOptions({
      onSuccess: () => handleMutationSuccess("Exercise updated successfully"),
      onError: handleMutationError,
    }),
  );

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const updateField = <K extends keyof ExerciseFormValues>(
    field: K,
    value: ExerciseFormValues[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateExerciseForm(formData, nameCheck.data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = createFormPayload(formData);

    if (isEditing && exerciseId) {
      updateMutation.mutate({ id: exerciseId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    isEditing,
    nameCheck,
    debouncedName,
    updateField,
    handleSubmit,
  };
}
