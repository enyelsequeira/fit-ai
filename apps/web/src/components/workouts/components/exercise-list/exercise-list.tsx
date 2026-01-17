/**
 * ExerciseList - Displays exercises in a workout with their sets
 * Supports inline set editing and management
 */

import { useState, useCallback } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Stack,
  Text,
  Collapse,
  Paper,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { WorkoutExercise } from "../../types.ts";
import {
  useRemoveExerciseFromWorkout,
  useAddSet,
} from "../../hooks/use-mutations.ts";
import { SetRow } from "../set-row/set-row.tsx";
import styles from "./exercise-list.module.css";

interface ExerciseListProps {
  workoutId: number;
  exercises: WorkoutExercise[];
  isWorkoutCompleted: boolean;
}

export function ExerciseList({ workoutId, exercises, isWorkoutCompleted }: ExerciseListProps) {
  // Track which exercises are expanded
  const [expandedExercises, setExpandedExercises] = useState<string[]>(
    exercises.map((_, index) => String(index))
  );

  const toggleExercise = useCallback((value: string) => {
    setExpandedExercises((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  }, []);

  return (
    <Stack gap="sm">
      {exercises.map((workoutExercise, index) => (
        <ExerciseItem
          key={workoutExercise.id}
          workoutId={workoutId}
          workoutExercise={workoutExercise}
          index={index}
          isExpanded={expandedExercises.includes(String(index))}
          onToggle={() => toggleExercise(String(index))}
          isWorkoutCompleted={isWorkoutCompleted}
        />
      ))}
    </Stack>
  );
}

interface ExerciseItemProps {
  workoutId: number;
  workoutExercise: WorkoutExercise;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isWorkoutCompleted: boolean;
}

function ExerciseItem({
  workoutId,
  workoutExercise,
  index,
  isExpanded,
  onToggle,
  isWorkoutCompleted,
}: ExerciseItemProps) {
  const removeExerciseMutation = useRemoveExerciseFromWorkout(workoutId);
  const addSetMutation = useAddSet(workoutId);

  const exercise = workoutExercise.exercise;
  const sets = workoutExercise.sets ?? [];
  const completedSetsCount = sets.filter((s) => s.completedAt !== null).length;
  const totalSetsCount = sets.length;

  const handleRemoveExercise = useCallback(() => {
    if (window.confirm("Are you sure you want to remove this exercise and all its sets?")) {
      removeExerciseMutation.mutate({
        workoutId,
        workoutExerciseId: workoutExercise.id,
      });
    }
  }, [removeExerciseMutation, workoutId, workoutExercise.id]);

  const handleAddSet = useCallback(() => {
    addSetMutation.mutate({
      workoutId,
      workoutExerciseId: workoutExercise.id,
      setNumber: sets.length + 1,
      // Required nullable fields
      reps: null,
      weight: null,
      weightUnit: "kg",
      durationSeconds: null,
      distance: null,
      distanceUnit: "km",
      holdTimeSeconds: null,
      setType: "normal",
      rpe: null,
      rir: null,
      targetReps: null,
      targetWeight: null,
      restTimeSeconds: null,
      notes: null,
    });
  }, [addSetMutation, workoutId, workoutExercise.id, sets]);

  return (
    <Paper withBorder radius="md" className={styles.exerciseCard}>
      {/* Exercise Header */}
      <Box
        className={styles.exerciseHeader}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Box className={styles.orderNumber}>
              <Text size="sm" fw={600} c="dimmed">
                {index + 1}
              </Text>
            </Box>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} lineClamp={1}>
                {exercise?.name ?? "Unknown Exercise"}
              </Text>
              <Group gap="xs" mt={4}>
                {exercise?.category && (
                  <Badge size="xs" variant="light" color="blue">
                    {exercise.category}
                  </Badge>
                )}
                {exercise?.equipment && (
                  <Badge size="xs" variant="outline" color="gray">
                    {exercise.equipment}
                  </Badge>
                )}
              </Group>
            </Box>
          </Group>

          <Group gap="sm" wrap="nowrap">
            {/* Sets Progress */}
            <Badge
              size="md"
              variant={completedSetsCount === totalSetsCount && totalSetsCount > 0 ? "filled" : "light"}
              color={completedSetsCount === totalSetsCount && totalSetsCount > 0 ? "green" : "gray"}
            >
              {completedSetsCount}/{totalSetsCount} sets
            </Badge>

            {/* Actions Menu */}
            {!isWorkoutCompleted && (
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Exercise options"
                  >
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExercise();
                    }}
                  >
                    Remove Exercise
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}

            {/* Expand/Collapse Icon */}
            <ActionIcon variant="subtle" color="gray">
              {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Exercise Notes */}
      {workoutExercise.notes && isExpanded && (
        <Box className={styles.exerciseNotes}>
          <Text size="sm" c="dimmed" fs="italic">
            {workoutExercise.notes}
          </Text>
        </Box>
      )}

      {/* Sets Section */}
      <Collapse in={isExpanded}>
        <Box className={styles.setsContainer}>
          {/* Sets Header */}
          <Group gap="xs" mb="sm" className={styles.setsHeader}>
            <Text size="xs" fw={600} c="dimmed" w={40} ta="center">
              SET
            </Text>
            <Text size="xs" fw={600} c="dimmed" w={60} ta="center">
              PREV
            </Text>
            <Text size="xs" fw={600} c="dimmed" w={70} ta="center">
              WEIGHT
            </Text>
            <Text size="xs" fw={600} c="dimmed" w={60} ta="center">
              REPS
            </Text>
            <Text size="xs" fw={600} c="dimmed" w={50} ta="center">
              RPE
            </Text>
            {!isWorkoutCompleted && (
              <Text size="xs" fw={600} c="dimmed" w={80} ta="center">
                ACTION
              </Text>
            )}
          </Group>

          {/* Sets List */}
          {sets.length > 0 ? (
            <Stack gap="xs">
              {sets.map((set, setIndex) => (
                <SetRow
                  key={set.id}
                  workoutId={workoutId}
                  set={set}
                  setIndex={setIndex}
                  previousSet={setIndex > 0 ? sets[setIndex - 1] : undefined}
                  isWorkoutCompleted={isWorkoutCompleted}
                />
              ))}
            </Stack>
          ) : (
            <Box py="md">
              <Text size="sm" c="dimmed" ta="center">
                No sets recorded yet.
              </Text>
            </Box>
          )}

          {/* Add Set Button */}
          {!isWorkoutCompleted && (
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={14} />}
              onClick={handleAddSet}
              loading={addSetMutation.isPending}
              fullWidth
              mt="sm"
            >
              Add Set
            </Button>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
