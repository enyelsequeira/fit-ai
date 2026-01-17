/**
 * AddExerciseModal - Modal for adding exercises to a workout
 * Provides search and filtering to find exercises
 */

import { useState, useCallback } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Center,
  Text,
  Loader,
  ScrollArea,
  Paper,
  Badge,
  Box,
  ActionIcon,
  Select,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconX,
  IconBarbell,
  IconCheck,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import { orpc } from "@/utils/orpc.ts";
import { useAddExerciseToWorkout } from "../../hooks/use-mutations.ts";
import styles from "./add-exercise-modal.module.css";

interface AddExerciseModalProps {
  opened: boolean;
  onClose: () => void;
  workoutId: number;
  existingExerciseIds: number[];
}

export function AddExerciseModal({
  opened,
  onClose,
  workoutId,
  existingExerciseIds,
}: AddExerciseModalProps) {
  const addExerciseMutation = useAddExerciseToWorkout(workoutId);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  // Track which exercises have been added in this session
  const [addedExerciseIds, setAddedExerciseIds] = useState<Set<number>>(new Set());

  // Query exercises
  const exercisesQuery = useQuery(
    orpc.exercise.list.queryOptions({
      input: {
        search: debouncedSearch || undefined,
        category: categoryFilter ?? undefined,
        limit: 50,
        offset: 0,
      },
    })
  );

  const exercises = exercisesQuery.data?.exercises ?? [];

  // Category options for filter
  const categoryOptions = [
    { value: "chest", label: "Chest" },
    { value: "back", label: "Back" },
    { value: "shoulders", label: "Shoulders" },
    { value: "arms", label: "Arms" },
    { value: "legs", label: "Legs" },
    { value: "core", label: "Core" },
    { value: "cardio", label: "Cardio" },
    { value: "full_body", label: "Full Body" },
    { value: "other", label: "Other" },
  ];

  // Check if exercise is already in workout
  const isExerciseInWorkout = useCallback(
    (exerciseId: number) => {
      return existingExerciseIds.includes(exerciseId) || addedExerciseIds.has(exerciseId);
    },
    [existingExerciseIds, addedExerciseIds]
  );

  const handleAddExercise = useCallback(
    (exerciseId: number) => {
      const order = existingExerciseIds.length + addedExerciseIds.size + 1;

      addExerciseMutation.mutate(
        {
          workoutId,
          exerciseId,
          order,
          notes: null,
        },
        {
          onSuccess: () => {
            setAddedExerciseIds((prev) => new Set(prev).add(exerciseId));
          },
        }
      );
    },
    [addExerciseMutation, workoutId, existingExerciseIds.length, addedExerciseIds.size]
  );

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter(null);
    setAddedExerciseIds(new Set());
    onClose();
  }, [onClose]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <Center w={24} h={24} className={styles.modalIcon}>
            <IconPlus size={20} />
          </Center>
          <Text fw={600}>Add Exercise</Text>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        {/* Search and Filters */}
        <Group gap="sm">
          <TextInput
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Category"
            data={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            clearable
            w={150}
          />
        </Group>

        {/* Results */}
        <ScrollArea.Autosize mah={400}>
          {exercisesQuery.isLoading ? (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <Loader size="md" />
                <Text size="sm" c="dimmed">
                  Searching exercises...
                </Text>
              </Stack>
            </Center>
          ) : exercises.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <IconBarbell size={48} style={{ opacity: 0.3 }} />
                <Text c="dimmed">
                  {debouncedSearch
                    ? "No exercises found matching your search."
                    : "No exercises available."}
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="xs">
              {exercises.map((exercise) => {
                const alreadyAdded = isExerciseInWorkout(exercise.id);
                const isAdding =
                  addExerciseMutation.isPending &&
                  addExerciseMutation.variables?.exerciseId === exercise.id;

                return (
                  <Paper
                    key={exercise.id}
                    withBorder
                    p="sm"
                    radius="sm"
                    className={styles.exerciseItem}
                    data-disabled={alreadyAdded}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={500} lineClamp={1}>
                          {exercise.name}
                        </Text>
                        <Group gap="xs" mt={4}>
                          <Badge size="xs" variant="light" color="blue">
                            {exercise.category}
                          </Badge>
                          {exercise.equipment && (
                            <Badge size="xs" variant="outline" color="gray">
                              {exercise.equipment}
                            </Badge>
                          )}
                          {exercise.exerciseType && (
                            <Badge size="xs" variant="dot" color="gray">
                              {exercise.exerciseType}
                            </Badge>
                          )}
                        </Group>
                      </Box>

                      {alreadyAdded ? (
                        <Badge
                          size="md"
                          color="green"
                          variant="light"
                          leftSection={<IconCheck size={12} />}
                        >
                          Added
                        </Badge>
                      ) : (
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => handleAddExercise(exercise.id)}
                          loading={isAdding}
                        >
                          Add
                        </Button>
                      )}
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </ScrollArea.Autosize>

        {/* Footer */}
        <Group justify="space-between" pt="md" className={styles.modalFooter}>
          <Text size="sm" c="dimmed">
            {addedExerciseIds.size > 0
              ? `${addedExerciseIds.size} exercise${addedExerciseIds.size !== 1 ? "s" : ""} added`
              : "Select exercises to add"}
          </Text>
          <Button variant="subtle" onClick={handleClose}>
            Done
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
