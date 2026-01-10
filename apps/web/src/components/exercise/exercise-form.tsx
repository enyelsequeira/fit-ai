import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";

import {
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  NativeSelect,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconAlertCircle, IconCircleCheck, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";

import { useDebounce } from "@/hooks/use-debounce";
import { orpc } from "@/utils/orpc";

import { categoryConfig } from "./category-badge";
import { equipmentConfig } from "./equipment-icon";
import { MuscleGroupSelector } from "./muscle-group-selector";

export type ExerciseType = "strength" | "cardio" | "flexibility";

export interface ExerciseFormData {
  name: string;
  description: string;
  category: ExerciseCategory;
  exerciseType: ExerciseType;
  muscleGroups: string[];
  equipment: NonNullable<EquipmentType> | null;
}

const defaultFormData: ExerciseFormData = {
  name: "",
  description: "",
  category: "other",
  exerciseType: "strength",
  muscleGroups: [],
  equipment: null,
};

interface ExerciseFormDialogProps {
  initialData?: Partial<ExerciseFormData>;
  exerciseId?: number;
  onSuccess?: () => void;
}

export function ExerciseFormDialog({
  initialData,
  exerciseId,
  onSuccess,
}: ExerciseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});

  const queryClient = useQueryClient();
  const isEditing = exerciseId !== undefined;

  // Debounce the name for real-time duplicate checking
  const debouncedName = useDebounce(formData.name.trim(), 400);

  // Real-time name availability check
  const nameCheck = useQuery(
    orpc.exercise.checkNameAvailability.queryOptions({
      input: {
        name: debouncedName,
        excludeId: exerciseId,
      },
      enabled: debouncedName.length > 0 && open,
      staleTime: 10000, // Cache for 10 seconds
    }),
  );

  // Update name error when availability check returns
  useEffect(() => {
    if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      setErrors((prev) => ({ ...prev, name: nameCheck.data.message }));
    } else if (nameCheck.data?.available && errors.name && !errors.name.includes("required")) {
      // Clear the duplicate error if name is now available
      setErrors((prev) => {
        const { name: _name, ...rest } = prev;
        return rest;
      });
    }
  }, [nameCheck.data, errors.name]);

  const createMutation = useMutation(
    orpc.exercise.create.mutationOptions({
      onSuccess: () => {
        toast.success("Exercise created successfully");
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        setOpen(false);
        setFormData(defaultFormData);
        onSuccess?.();
      },
      onError: (error) => {
        // Check if it's a duplicate name error (CONFLICT)
        if (error.message?.includes("already exists") || error.message?.includes("already have")) {
          setErrors((prev) => ({ ...prev, name: error.message }));
        } else {
          toast.error(error.message || "Failed to create exercise");
        }
      },
    }),
  );

  const updateMutation = useMutation(
    orpc.exercise.update.mutationOptions({
      onSuccess: () => {
        toast.success("Exercise updated successfully");
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        // Check if it's a duplicate name error (CONFLICT)
        if (error.message?.includes("already exists") || error.message?.includes("already have")) {
          setErrors((prev) => ({ ...prev, name: error.message }));
        } else {
          toast.error(error.message || "Failed to update exercise");
        }
      },
    }),
  );

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExerciseFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      newErrors.name = nameCheck.data.message;
    }

    if (formData.exerciseType === "strength" && formData.muscleGroups.length === 0) {
      newErrors.muscleGroups = "At least one muscle group is required for strength exercises";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      exerciseType: formData.exerciseType,
      muscleGroups: formData.muscleGroups,
      equipment: formData.equipment || undefined,
    };

    if (isEditing && exerciseId) {
      updateMutation.mutate({ id: exerciseId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const categories = Object.entries(categoryConfig).map(([key, config]) => ({
    value: key as ExerciseCategory,
    label: config.label,
  }));

  const exerciseTypes: { value: ExerciseType; label: string }[] = [
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility" },
  ];

  const equipmentTypes = Object.entries(equipmentConfig).map(([key, config]) => ({
    value: key as NonNullable<EquipmentType>,
    label: config.label,
  }));

  return (
    <>
      <Button onClick={() => setOpen(true)} leftSection={<IconPlus size={16} />}>
        {isEditing ? "Edit Exercise" : "Create Exercise"}
      </Button>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={isEditing ? "Edit Exercise" : "Create Custom Exercise"}
        size="md"
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        <Text fz="sm" c="dimmed" mb="md">
          {isEditing
            ? "Update the exercise details below."
            : "Add a new custom exercise to your library."}
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Box>
              <TextInput
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Incline Dumbbell Press"
                error={errors.name}
                rightSection={
                  debouncedName.length > 0 ? (
                    nameCheck.isFetching ? (
                      <Loader size="xs" />
                    ) : nameCheck.data?.available ? (
                      <IconCircleCheck
                        size={16}
                        style={{ color: "var(--mantine-color-green-6)" }}
                      />
                    ) : nameCheck.data && !nameCheck.data.available ? (
                      <IconAlertCircle size={16} style={{ color: "var(--mantine-color-red-6)" }} />
                    ) : null
                  ) : null
                }
              />
            </Box>

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the exercise, include any tips or instructions..."
              rows={3}
            />

            <Grid>
              <Grid.Col span={6}>
                <NativeSelect
                  label="Category"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExerciseCategory })
                  }
                  data={categories.map(({ value, label }) => ({ value, label }))}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <NativeSelect
                  label="Type"
                  required
                  value={formData.exerciseType}
                  onChange={(e) =>
                    setFormData({ ...formData, exerciseType: e.target.value as ExerciseType })
                  }
                  data={exerciseTypes.map(({ value, label }) => ({ value, label }))}
                />
              </Grid.Col>
            </Grid>

            <NativeSelect
              label="Equipment"
              value={formData.equipment || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  equipment: e.target.value ? (e.target.value as NonNullable<EquipmentType>) : null,
                })
              }
              data={[
                { value: "", label: "None / Bodyweight" },
                ...equipmentTypes.map(({ value, label }) => ({ value, label })),
              ]}
            />

            <Box>
              <Text fz="sm" fw={500} mb={4}>
                Muscle Groups{" "}
                {formData.exerciseType === "strength" && (
                  <Text component="span" c="dimmed">
                    *
                  </Text>
                )}
              </Text>
              <MuscleGroupSelector
                value={formData.muscleGroups}
                onChange={(muscleGroups) => setFormData({ ...formData, muscleGroups })}
              />
              {errors.muscleGroups && (
                <Text fz="xs" c="red" mt={4}>
                  {errors.muscleGroups}
                </Text>
              )}
            </Box>

            <Group justify="flex-end" gap="sm" mt="md">
              <Button variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                {isEditing ? "Update" : "Create"} Exercise
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}

interface ExerciseEditButtonProps {
  exerciseId: number;
  initialData: Partial<ExerciseFormData>;
  onSuccess?: () => void;
}

export function ExerciseEditButton({
  exerciseId,
  initialData,
  onSuccess,
}: ExerciseEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});

  const queryClient = useQueryClient();

  // Debounce the name for real-time duplicate checking
  const debouncedName = useDebounce(formData.name.trim(), 400);

  // Real-time name availability check
  const nameCheck = useQuery(
    orpc.exercise.checkNameAvailability.queryOptions({
      input: {
        name: debouncedName,
        excludeId: exerciseId,
      },
      enabled: debouncedName.length > 0 && open,
      staleTime: 10000, // Cache for 10 seconds
    }),
  );

  // Update name error when availability check returns
  useEffect(() => {
    if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      setErrors((prev) => ({ ...prev, name: nameCheck.data.message }));
    } else if (nameCheck.data?.available && errors.name && !errors.name.includes("required")) {
      // Clear the duplicate error if name is now available
      setErrors((prev) => {
        const { name: _name, ...rest } = prev;
        return rest;
      });
    }
  }, [nameCheck.data, errors.name]);

  const updateMutation = useMutation(
    orpc.exercise.update.mutationOptions({
      onSuccess: () => {
        toast.success("Exercise updated successfully");
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        // Check if it's a duplicate name error (CONFLICT)
        if (error.message?.includes("already exists") || error.message?.includes("already have")) {
          setErrors((prev) => ({ ...prev, name: error.message }));
        } else {
          toast.error(error.message || "Failed to update exercise");
        }
      },
    }),
  );

  const isLoading = updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExerciseFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      newErrors.name = nameCheck.data.message;
    }

    if (formData.exerciseType === "strength" && formData.muscleGroups.length === 0) {
      newErrors.muscleGroups = "At least one muscle group is required for strength exercises";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    updateMutation.mutate({
      id: exerciseId,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      exerciseType: formData.exerciseType,
      muscleGroups: formData.muscleGroups,
      equipment: formData.equipment || undefined,
    });
  };

  const categories = Object.entries(categoryConfig).map(([key, config]) => ({
    value: key as ExerciseCategory,
    label: config.label,
  }));

  const exerciseTypes: { value: ExerciseType; label: string }[] = [
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility" },
  ];

  const equipmentTypes = Object.entries(equipmentConfig).map(([key, config]) => ({
    value: key as NonNullable<EquipmentType>,
    label: config.label,
  }));

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Edit Exercise"
        size="md"
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        <Text fz="sm" c="dimmed" mb="md">
          Update the exercise details below.
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Box>
              <TextInput
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Incline Dumbbell Press"
                error={errors.name}
                rightSection={
                  debouncedName.length > 0 ? (
                    nameCheck.isFetching ? (
                      <Loader size="xs" />
                    ) : nameCheck.data?.available ? (
                      <IconCircleCheck
                        size={16}
                        style={{ color: "var(--mantine-color-green-6)" }}
                      />
                    ) : nameCheck.data && !nameCheck.data.available ? (
                      <IconAlertCircle size={16} style={{ color: "var(--mantine-color-red-6)" }} />
                    ) : null
                  ) : null
                }
              />
            </Box>

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the exercise..."
              rows={3}
            />

            <Grid>
              <Grid.Col span={6}>
                <NativeSelect
                  label="Category"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExerciseCategory })
                  }
                  data={categories.map(({ value, label }) => ({ value, label }))}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <NativeSelect
                  label="Type"
                  required
                  value={formData.exerciseType}
                  onChange={(e) =>
                    setFormData({ ...formData, exerciseType: e.target.value as ExerciseType })
                  }
                  data={exerciseTypes.map(({ value, label }) => ({ value, label }))}
                />
              </Grid.Col>
            </Grid>

            <NativeSelect
              label="Equipment"
              value={formData.equipment || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  equipment: e.target.value ? (e.target.value as NonNullable<EquipmentType>) : null,
                })
              }
              data={[
                { value: "", label: "None / Bodyweight" },
                ...equipmentTypes.map(({ value, label }) => ({ value, label })),
              ]}
            />

            <Box>
              <Text fz="sm" fw={500} mb={4}>
                Muscle Groups{" "}
                {formData.exerciseType === "strength" && (
                  <Text component="span" c="dimmed">
                    *
                  </Text>
                )}
              </Text>
              <MuscleGroupSelector
                value={formData.muscleGroups}
                onChange={(muscleGroups) => setFormData({ ...formData, muscleGroups })}
              />
              {errors.muscleGroups && (
                <Text fz="xs" c="red" mt={4}>
                  {errors.muscleGroups}
                </Text>
              )}
            </Box>

            <Group justify="flex-end" gap="sm" mt="md">
              <Button variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Update Exercise
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
