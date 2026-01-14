import type { ExerciseCategory } from "./category-badge";
import type { EquipmentType } from "./equipment-icon";
import type { ExerciseFormValues, ExerciseType } from "./exercise-form-validation";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

import { BasicInfoSection, EquipmentSection, MuscleGroupSection } from "./form-sections";
import { useExerciseForm } from "./use-exercise-form";

export type { ExerciseType } from "./exercise-form-validation";
export type { ExerciseFormValues as ExerciseFormData };

interface ExerciseFormContentProps {
  formData: ExerciseFormValues;
  errors: Partial<Record<keyof ExerciseFormValues, string>>;
  isLoading: boolean;
  isEditing: boolean;
  debouncedName: string;
  nameCheck: ReturnType<typeof useQuery<{ available: boolean; message?: string }>>;
  updateField: <K extends keyof ExerciseFormValues>(field: K, value: ExerciseFormValues[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function ExerciseFormContent({
  formData,
  errors,
  isLoading,
  isEditing,
  debouncedName,
  nameCheck,
  updateField,
  onSubmit,
  onClose,
}: ExerciseFormContentProps) {
  return (
    <form onSubmit={onSubmit}>
      <Stack gap="md">
        <BasicInfoSection
          name={formData.name}
          description={formData.description}
          category={formData.category}
          exerciseType={formData.exerciseType}
          onNameChange={(value) => updateField("name", value)}
          onDescriptionChange={(value) => updateField("description", value)}
          onCategoryChange={(value) => updateField("category", value as ExerciseCategory)}
          onExerciseTypeChange={(value) => updateField("exerciseType", value as ExerciseType)}
          nameError={errors.name}
          isCheckingName={nameCheck.isFetching}
          isNameAvailable={nameCheck.data?.available}
          showNameStatus={debouncedName.length > 0}
        />

        <EquipmentSection
          equipment={formData.equipment}
          onChange={(value) => updateField("equipment", value as NonNullable<EquipmentType> | null)}
        />

        <MuscleGroupSection
          muscleGroups={formData.muscleGroups}
          exerciseType={formData.exerciseType}
          onChange={(value) => updateField("muscleGroups", value)}
          error={errors.muscleGroups}
        />

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="outline" disabled={isLoading} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? "Update" : "Create"} Exercise
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

interface ExerciseFormDialogProps {
  initialData?: Partial<ExerciseFormValues>;
  exerciseId?: number;
  onSuccess?: () => void;
}

export function ExerciseFormDialog({
  initialData,
  exerciseId,
  onSuccess,
}: ExerciseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = exerciseId !== undefined;

  const form = useExerciseForm({
    exerciseId,
    initialData,
    onSuccess,
    onClose: () => setOpen(false),
    isOpen: open,
  });

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
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        <Text fz="sm" c="dimmed" mb="md">
          {isEditing
            ? "Update the exercise details below."
            : "Add a new custom exercise to your library."}
        </Text>

        <ExerciseFormContent
          formData={form.formData}
          errors={form.errors}
          isLoading={form.isLoading}
          isEditing={form.isEditing}
          debouncedName={form.debouncedName}
          nameCheck={form.nameCheck}
          updateField={form.updateField}
          onSubmit={form.handleSubmit}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

interface ExerciseEditButtonProps {
  exerciseId: number;
  initialData: Partial<ExerciseFormValues>;
  onSuccess?: () => void;
}

export function ExerciseEditButton({
  exerciseId,
  initialData,
  onSuccess,
}: ExerciseEditButtonProps) {
  const [open, setOpen] = useState(false);

  const form = useExerciseForm({
    exerciseId,
    initialData,
    onSuccess,
    onClose: () => setOpen(false),
    isOpen: open,
  });

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
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        <Text fz="sm" c="dimmed" mb="md">
          Update the exercise details below.
        </Text>

        <ExerciseFormContent
          formData={form.formData}
          errors={form.errors}
          isLoading={form.isLoading}
          isEditing={form.isEditing}
          debouncedName={form.debouncedName}
          nameCheck={form.nameCheck}
          updateField={form.updateField}
          onSubmit={form.handleSubmit}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
