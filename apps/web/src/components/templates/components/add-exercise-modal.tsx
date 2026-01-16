/**
 * AddExerciseModal - Modal for adding an exercise to a template
 * Includes exercise search, target sets/reps/weight configuration
 */

import { useState, useCallback } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Group,
  Box,
  Center,
  Flex,
  Text,
  SimpleGrid,
  UnstyledButton,
  Skeleton,
  ScrollArea,
} from "@mantine/core";
import { IconSearch, IconBarbell, IconCheck } from "@tabler/icons-react";
import { useExerciseSearch } from "../queries/use-queries";
import styles from "./add-exercise-modal.module.css";

interface AddExerciseModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: {
    exerciseId: number;
    targetSets?: number;
    targetReps?: string;
    targetWeight?: number;
    restSeconds?: number;
    notes?: string;
  }) => Promise<unknown>;
  isLoading?: boolean;
}

interface Exercise {
  id: number;
  name: string;
  category: string;
  exerciseType: string;
  muscleGroups: string[];
}

export function AddExerciseModal({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
}: AddExerciseModalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Selected exercise state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Target configuration state
  const [targetSets, setTargetSets] = useState<number | string>(3);
  const [targetReps, setTargetReps] = useState("10");
  const [targetWeight, setTargetWeight] = useState<number | string>("");
  const [restSeconds, setRestSeconds] = useState<number | string>(90);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exercises using the shared hook (handles debouncing internally)
  const { data: exercisesData, isLoading: isSearching } = useExerciseSearch({
    search: searchQuery,
    limit: 20,
  });

  const exercises = exercisesData?.exercises ?? [];

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
  }, []);

  const handleSubmit = async () => {
    if (!selectedExercise) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        exerciseId: selectedExercise.id,
        targetSets: typeof targetSets === "number" ? targetSets : undefined,
        targetReps: targetReps.trim() || undefined,
        targetWeight: typeof targetWeight === "number" ? targetWeight : undefined,
        restSeconds: typeof restSeconds === "number" ? restSeconds : undefined,
        notes: notes.trim() || undefined,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedExercise(null);
    setTargetSets(3);
    setTargetReps("10");
    setTargetWeight("");
    setRestSeconds(90);
    setNotes("");
    onClose();
  };

  const handleBack = () => {
    setSelectedExercise(null);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconBarbell size={20} />
          {selectedExercise ? "Configure Exercise" : "Add Exercise"}
        </Group>
      }
      size="lg"
    >
      {!selectedExercise ? (
        // Exercise search view
        <Stack gap="md">
          <TextInput
            placeholder="Search exercises..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            data-autofocus
          />

          <ScrollArea h={400}>
            {isSearching ? (
              <Stack gap="xs">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} height={60} radius="sm" />
                ))}
              </Stack>
            ) : exercises.length === 0 ? (
              <Center h={200}>
                <Text c="dimmed" ta="center">
                  {searchQuery
                    ? "No exercises found matching your search"
                    : "Start typing to search exercises"}
                </Text>
              </Center>
            ) : (
              <Stack gap="xs">
                {exercises.map((exercise) => (
                  <UnstyledButton
                    key={exercise.id}
                    className={styles.exerciseItem}
                    onClick={() => handleSelectExercise(exercise)}
                  >
                    <Center w={36} h={36} className={styles.exerciseIcon}>
                      <IconBarbell size={18} />
                    </Center>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={500}>{exercise.name}</Text>
                      <Text size="xs" c="dimmed">
                        {exercise.category} - {exercise.muscleGroups[0] ?? exercise.exerciseType}
                      </Text>
                    </Box>
                  </UnstyledButton>
                ))}
              </Stack>
            )}
          </ScrollArea>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
          </Group>
        </Stack>
      ) : (
        // Configure exercise view
        <Stack gap="md">
          <Flex gap="sm" align="center" p="sm" className={styles.selectedExercise}>
            <Center w={36} h={36} className={styles.selectedIcon}>
              <IconCheck size={18} />
            </Center>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fw={500}>{selectedExercise.name}</Text>
              <Text size="xs" c="dimmed">
                {selectedExercise.category} -{" "}
                {selectedExercise.muscleGroups[0] ?? selectedExercise.exerciseType}
              </Text>
            </Box>
          </Flex>

          <SimpleGrid cols={2}>
            <NumberInput
              label="Target Sets"
              value={targetSets}
              onChange={setTargetSets}
              min={1}
              max={20}
            />
            <TextInput
              label="Target Reps"
              placeholder="e.g., 8-12"
              value={targetReps}
              onChange={(e) => setTargetReps(e.currentTarget.value)}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <NumberInput
              label="Target Weight (optional)"
              placeholder="Leave empty for bodyweight"
              value={targetWeight}
              onChange={setTargetWeight}
              min={0}
              suffix=" kg"
            />
            <NumberInput
              label="Rest Time"
              value={restSeconds}
              onChange={setRestSeconds}
              min={0}
              max={600}
              suffix=" sec"
            />
          </SimpleGrid>

          <Textarea
            label="Notes (optional)"
            placeholder="Form cues, variations, etc."
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            minRows={2}
          />

          <Group justify="space-between" mt="md">
            <Button variant="subtle" onClick={handleBack}>
              Back
            </Button>
            <Group gap="sm">
              <Button variant="subtle" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={isSubmitting || isLoading}>
                Add Exercise
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
