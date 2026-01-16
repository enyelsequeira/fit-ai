import type { ExerciseCategory } from "../category-badge";
import type { ExerciseType } from "../exercise-form-validation";

import { Grid, Loader, NativeSelect, TextInput, Textarea } from "@mantine/core";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";

import { categoryConfig } from "../category-badge";
import { exerciseTypeOptions } from "../exercise-form-validation";

interface BasicInfoSectionProps {
  name: string;
  description: string;
  category: ExerciseCategory;
  exerciseType: ExerciseType;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: ExerciseCategory) => void;
  onExerciseTypeChange: (value: ExerciseType) => void;
  nameError?: string;
  isCheckingName?: boolean;
  isNameAvailable?: boolean;
  showNameStatus?: boolean;
}

const categoryOptions = Object.entries(categoryConfig).map(([key, config]) => ({
  value: key,
  label: config.label,
}));

export function BasicInfoSection({
  name,
  description,
  category,
  exerciseType,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onExerciseTypeChange,
  nameError,
  isCheckingName,
  isNameAvailable,
  showNameStatus,
}: BasicInfoSectionProps) {
  const renderNameStatus = () => {
    if (!showNameStatus) return null;

    if (isCheckingName) {
      return <Loader size="xs" />;
    }

    if (isNameAvailable === true) {
      return <IconCircleCheck size={16} style={{ color: "var(--mantine-color-green-6)" }} />;
    }

    if (isNameAvailable === false) {
      return <IconAlertCircle size={16} style={{ color: "var(--mantine-color-red-6)" }} />;
    }

    return null;
  };

  return (
    <>
      <TextInput
        label="Name"
        required
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g., Incline Dumbbell Press"
        error={nameError}
        rightSection={renderNameStatus()}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Describe the exercise, include any tips or instructions..."
        rows={3}
      />

      <Grid>
        <Grid.Col span={6}>
          <NativeSelect
            label="Category"
            required
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as ExerciseCategory)}
            data={categoryOptions}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <NativeSelect
            label="Type"
            required
            value={exerciseType}
            onChange={(e) => onExerciseTypeChange(e.target.value as ExerciseType)}
            data={exerciseTypeOptions}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
