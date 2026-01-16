/**
 * CreateExerciseModal - Modal form for creating custom exercises
 */

import type { ExerciseCategory } from "@/components/exercise/category-badge";
import type { EquipmentType } from "@/components/exercise/equipment-icon";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Group,
  Loader,
  Modal,
  MultiSelect,
  NativeSelect,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useDebouncedValue } from "@mantine/hooks";

import { categoryConfig } from "@/components/exercise/category-badge";
import { equipmentConfig } from "@/components/exercise/equipment-icon";
import { orpc } from "@/utils/orpc";

export type ExerciseType = "strength" | "cardio" | "flexibility";

interface ExerciseFormData {
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

interface CreateExerciseModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateExerciseModal({ opened, onClose, onSuccess }: CreateExerciseModalProps) {
  const [formData, setFormData] = useState<ExerciseFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});

  const queryClient = useQueryClient();

  // Debounce the name for real-time duplicate checking
  const [debouncedName] = useDebouncedValue(formData.name.trim(), 400);

  // Fetch muscle groups for the multi-select
  const muscleGroupsQuery = useQuery(orpc.exercise.getMuscleGroups.queryOptions());

  // Real-time name availability check
  const nameCheck = useQuery({
    ...orpc.exercise.checkNameAvailability.queryOptions({
      input: { name: debouncedName },
    }),
    enabled: debouncedName.length > 0 && opened,
    staleTime: 10000,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [opened]);

  // Update name error when availability check returns
  useEffect(() => {
    if (nameCheck.data && !nameCheck.data.available && nameCheck.data.message) {
      setErrors((prev) => ({ ...prev, name: nameCheck.data.message }));
    } else if (nameCheck.data?.available && errors.name && !errors.name.includes("required")) {
      setErrors((prev) => {
        const { name: _name, ...rest } = prev;
        return rest;
      });
    }
  }, [nameCheck.data, errors.name]);

  const createMutation = useMutation(
    orpc.exercise.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["exercise"] });
        onClose();
        setFormData(defaultFormData);
        onSuccess?.();
      },
      onError: (error) => {
        if (error.message?.includes("already exists") || error.message?.includes("already have")) {
          setErrors((prev) => ({ ...prev, name: error.message }));
        }
      },
    }),
  );

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

    createMutation.mutate({
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

  const muscleGroupOptions =
    muscleGroupsQuery.data?.map((mg) => ({
      value: mg,
      label: mg.charAt(0).toUpperCase() + mg.slice(1),
    })) ?? [];

  return (
    <Modal opened={opened} onClose={onClose} title="Create Custom Exercise" size="md">
      <Text fz="sm" c="dimmed" mb="md">
        Add a new custom exercise to your library.
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Name */}
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
                    <IconCircleCheck size={16} style={{ color: "var(--mantine-color-green-6)" }} />
                  ) : nameCheck.data && !nameCheck.data.available ? (
                    <IconAlertCircle size={16} style={{ color: "var(--mantine-color-red-6)" }} />
                  ) : null
                ) : null
              }
            />
          </Box>

          {/* Description */}
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the exercise, include any tips or instructions..."
            rows={3}
          />

          {/* Category and Type */}
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

          {/* Equipment */}
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

          {/* Muscle Groups */}
          <Box>
            <MultiSelect
              label={
                <Group gap={4}>
                  <Text>Muscle Groups</Text>
                  {formData.exerciseType === "strength" && <Text c="red">*</Text>}
                </Group>
              }
              placeholder="Select muscle groups"
              data={muscleGroupOptions}
              value={formData.muscleGroups}
              onChange={(muscleGroups) => setFormData({ ...formData, muscleGroups })}
              searchable
              clearable
              error={errors.muscleGroups}
            />
          </Box>

          {/* Actions */}
          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="outline" disabled={createMutation.isPending} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Exercise
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
