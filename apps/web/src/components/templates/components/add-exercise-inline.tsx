import type { ComboboxItem, SelectProps } from "@mantine/core";

import { useMemo } from "react";
import {
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Group,
  Box,
  Text,
  SimpleGrid,
  Collapse,
  Select,
  Loader,
  Paper,
  Badge,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconPlus,
  IconBarbell,
  IconX,
  IconSearch,
  IconCheck,
  IconRepeat,
  IconWeight,
  IconClock,
} from "@tabler/icons-react";

import { ExerciseImageThumbnail } from "@/components/exercise";
import { useExerciseSearch } from "../queries/use-queries";
import { useAddExercise } from "../hooks/use-mutations";
import styles from "./add-exercise-inline.module.css";

interface AddExerciseInlineProps {
  templateId: number;
  excludeExerciseIds: number[];
}

interface Exercise {
  id: number;
  name: string;
  category: string;
  exerciseType: string;
  muscleGroups: string[];
  primaryImage?: string | null;
  level?: string | null;
}

interface ExerciseSelectOption {
  value: string;
  label: string;
  category: string;
  primaryMuscle: string;
  primaryImage: string | null;
  level: string | null;
}

interface FormValues {
  exerciseId: string | null;
  targetSets: number | string;
  targetReps: string;
  targetWeight: number | string;
  restSeconds: number | string;
  notes: string;
}

export function AddExerciseInline({ templateId, excludeExerciseIds }: AddExerciseInlineProps) {
  const addExerciseMutation = useAddExercise(templateId);

  // Form controls everything including selected exercise
  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      exerciseId: null,
      targetSets: 3,
      targetReps: "10",
      targetWeight: "",
      restSeconds: 90,
      notes: "",
    },
  });

  const exerciseId = form.getValues().exerciseId;

  // Fetch exercises using the shared hook (handles debouncing internally)
  const { data: exercisesData, isLoading: isSearching } = useExerciseSearch({
    search: "",
    limit: 50,
  });

  // Map exercises to Select data format, filtering out excluded IDs
  const selectOptions: ExerciseSelectOption[] = useMemo(() => {
    const exercises = exercisesData?.exercises ?? [];
    const excludedSet = new Set(excludeExerciseIds);

    return exercises
      .filter((exercise) => !excludedSet.has(exercise.id))
      .map((exercise) => ({
        value: String(exercise.id),
        label: exercise.name,
        category: exercise.category,
        primaryMuscle: exercise.muscleGroups[0] ?? exercise.exerciseType,
        primaryImage: exercise.primaryImage ?? null,
        level: exercise.level ?? null,
      }));
  }, [exercisesData?.exercises, excludeExerciseIds]);

  // Map for quick lookup of exercise by ID
  const exerciseMap = useMemo(() => {
    const exercises = exercisesData?.exercises ?? [];
    const map = new Map<number, Exercise>();
    for (const exercise of exercises) {
      map.set(exercise.id, exercise);
    }
    return map;
  }, [exercisesData?.exercises]);

  // Map for quick lookup of options by value (for renderOption)
  const optionsMap = useMemo(() => {
    const map = new Map<string, ExerciseSelectOption>();
    for (const option of selectOptions) {
      map.set(option.value, option);
    }
    return map;
  }, [selectOptions]);

  // Get selected exercise data from the map
  const selectedExercise = exerciseId ? exerciseMap.get(Number(exerciseId)) : null;

  const handleSubmit = form.onSubmit((values) => {
    if (!values.exerciseId) return;

    addExerciseMutation.mutate(
      {
        id: templateId,
        exerciseId: Number(values.exerciseId),
        targetSets: typeof values.targetSets === "number" ? values.targetSets : 3,
        targetReps: values.targetReps.trim() || null,
        targetWeight: typeof values.targetWeight === "number" ? values.targetWeight : null,
        restSeconds: typeof values.restSeconds === "number" ? values.restSeconds : 90,
        notes: values.notes.trim() || null,
      },
      {
        onSuccess: () => form.reset(),
      },
    );
  });

  const handleReset = () => form.reset();

  // Render option with exercise image
  const renderOption: SelectProps["renderOption"] = ({ option }: { option: ComboboxItem }) => {
    const exerciseOption = optionsMap.get(option.value);

    return (
      <Group gap="sm" wrap="nowrap" py={4}>
        <Box className={styles.optionImageWrapper}>
          <ExerciseImageThumbnail
            src={exerciseOption?.primaryImage}
            alt={option.label ?? "Exercise"}
          />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>
            {option.label}
          </Text>
          <Group gap={6} mt={2}>
            <Text size="xs" c="dimmed" tt="capitalize">
              {exerciseOption?.category ?? "Exercise"}
            </Text>
            {exerciseOption?.primaryMuscle &&
              exerciseOption.primaryMuscle !== exerciseOption.category && (
                <>
                  <Text size="xs" c="dimmed">
                    /
                  </Text>
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {exerciseOption.primaryMuscle}
                  </Text>
                </>
              )}
            {exerciseOption?.level && (
              <Badge size="xs" variant="light" color="gray" tt="capitalize">
                {exerciseOption.level}
              </Badge>
            )}
          </Group>
        </Box>
      </Group>
    );
  };

  return (
    <Paper className={styles.container} p="md" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Header */}
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="blue" radius="sm">
              <IconPlus size={14} />
            </ThemeIcon>
            <Text size="sm" fw={500} c="dimmed">
              Add Exercise
            </Text>
          </Group>

          {/* Exercise Selection */}
          <Select
            placeholder="Search exercises by name..."
            searchable
            clearable
            data={selectOptions}
            key={form.key("exerciseId")}
            {...form.getInputProps("exerciseId")}
            renderOption={renderOption}
            leftSection={<IconSearch size={16} />}
            rightSection={isSearching ? <Loader size={16} /> : undefined}
            maxDropdownHeight={320}
            size="sm"
          />

          {/* Configuration Fields - shown when exercise is selected */}
          <Collapse in={!!selectedExercise} transitionDuration={200}>
            <Stack gap="md">
              {/* Selected exercise display */}
              {selectedExercise && (
                <Paper className={styles.selectedExercise} p="sm" radius="sm" withBorder>
                  <Group gap="sm" wrap="nowrap">
                    <Box className={styles.selectedImageWrapper}>
                      <ExerciseImageThumbnail
                        src={selectedExercise.primaryImage}
                        alt={selectedExercise.name}
                      />
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs" mb={4}>
                        <ThemeIcon size="xs" variant="filled" color="teal" radius="xl">
                          <IconCheck size={10} />
                        </ThemeIcon>
                        <Text size="xs" c="teal" fw={500}>
                          Selected
                        </Text>
                      </Group>
                      <Text size="sm" fw={600} truncate>
                        {selectedExercise.name}
                      </Text>
                      <Text size="xs" c="dimmed" truncate tt="capitalize">
                        {selectedExercise.category}
                        {selectedExercise.muscleGroups[0]
                          ? ` / ${selectedExercise.muscleGroups[0]}`
                          : ""}
                      </Text>
                    </Box>
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      color="gray"
                      onClick={handleReset}
                      aria-label="Clear selection"
                    >
                      <IconX size={14} />
                    </Button>
                  </Group>
                </Paper>
              )}

              <Divider
                label={
                  <Text size="xs" c="dimmed">
                    Configure Defaults
                  </Text>
                }
                labelPosition="center"
              />

              {/* Configuration inputs with icons */}
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                <NumberInput
                  label={
                    <Group gap={4}>
                      <IconRepeat size={12} />
                      <Text size="xs">Sets</Text>
                    </Group>
                  }
                  size="sm"
                  key={form.key("targetSets")}
                  {...form.getInputProps("targetSets")}
                  min={1}
                  max={20}
                />
                <TextInput
                  label={
                    <Group gap={4}>
                      <IconBarbell size={12} />
                      <Text size="xs">Reps</Text>
                    </Group>
                  }
                  size="sm"
                  placeholder="e.g., 8-12"
                  key={form.key("targetReps")}
                  {...form.getInputProps("targetReps")}
                />
                <NumberInput
                  label={
                    <Group gap={4}>
                      <IconWeight size={12} />
                      <Text size="xs">Weight (kg)</Text>
                    </Group>
                  }
                  size="sm"
                  placeholder="Optional"
                  key={form.key("targetWeight")}
                  {...form.getInputProps("targetWeight")}
                  min={0}
                />
                <NumberInput
                  label={
                    <Group gap={4}>
                      <IconClock size={12} />
                      <Text size="xs">Rest (sec)</Text>
                    </Group>
                  }
                  size="sm"
                  key={form.key("restSeconds")}
                  {...form.getInputProps("restSeconds")}
                  min={0}
                  max={600}
                />
              </SimpleGrid>

              {/* Notes field */}
              <Textarea
                label={<Text size="xs">Notes (optional)</Text>}
                size="sm"
                placeholder="Form cues, variations, tempo..."
                key={form.key("notes")}
                {...form.getInputProps("notes")}
                minRows={2}
                maxRows={3}
                autosize
              />

              {/* Action buttons */}
              <Group justify="flex-end" gap="sm">
                <Button variant="subtle" size="sm" color="gray" onClick={handleReset}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  loading={addExerciseMutation.isPending}
                  disabled={!selectedExercise}
                >
                  Add to Template
                </Button>
              </Group>
            </Stack>
          </Collapse>
        </Stack>
      </form>
    </Paper>
  );
}
