/**
 * ExerciseList - Displays exercises in a workout with their sets
 * Supports inline set editing and management
 */

import type { RefObject } from "react";

import { useState, useCallback, useRef, useEffect, forwardRef } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Stack,
  Text,
  Collapse,
  Paper,
  Badge,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import type { WorkoutExercise } from "../../types.ts";
import { SetRow } from "../set-row/set-row.tsx";
import { ExerciseProgressIndicator } from "../workout-progress/exercise-progress-indicator.tsx";
import { useExerciseItem } from "./use-exercise-item.ts";
import styles from "./exercise-list.module.css";

interface ExerciseListProps {
  workoutId: number;
  exercises: WorkoutExercise[];
  isWorkoutCompleted: boolean;
  /** Index of the currently active exercise */
  currentExerciseIndex?: number;
  /** Index of the current set within the current exercise */
  currentSetIndex?: number;
  /** Callback when a set is completed - for rest timer integration */
  onSetCompleteWithTimer?: (setId: number) => void;
  /** Ref to expose scroll functions to parent */
  scrollRef?: RefObject<{ scrollToExercise: (index: number) => void } | null>;
}

export function ExerciseList({
  workoutId,
  exercises,
  isWorkoutCompleted,
  currentExerciseIndex,
  currentSetIndex,
  onSetCompleteWithTimer,
  scrollRef,
}: ExerciseListProps) {
  // Track which exercises are expanded
  const [expandedExercises, setExpandedExercises] = useState<string[]>(
    exercises.map((_, index) => String(index)),
  );

  // Refs for scrolling to exercises
  const exerciseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const toggleExercise = useCallback((value: string) => {
    setExpandedExercises((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  // Scroll to exercise function
  const scrollToExercise = useCallback((index: number) => {
    const element = exerciseRefs.current.get(index);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Ensure the exercise is expanded
      setExpandedExercises((prev) =>
        prev.includes(String(index)) ? prev : [...prev, String(index)],
      );
    }
  }, []);

  // Expose scroll function to parent via ref
  useEffect(() => {
    if (scrollRef && "current" in scrollRef) {
      (scrollRef as { current: { scrollToExercise: (index: number) => void } | null }).current = {
        scrollToExercise,
      };
    }
  }, [scrollRef, scrollToExercise]);

  return (
    <Stack gap="sm">
      {exercises.map((workoutExercise, index) => (
        <ExerciseItem
          key={workoutExercise.id}
          ref={(el) => {
            if (el) exerciseRefs.current.set(index, el);
            else exerciseRefs.current.delete(index);
          }}
          workoutId={workoutId}
          workoutExercise={workoutExercise}
          index={index}
          isExpanded={expandedExercises.includes(String(index))}
          onToggle={() => toggleExercise(String(index))}
          isWorkoutCompleted={isWorkoutCompleted}
          isActive={currentExerciseIndex === index}
          currentSetIndex={currentExerciseIndex === index ? currentSetIndex : undefined}
          onSetCompleteWithTimer={onSetCompleteWithTimer}
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
  /** Whether this exercise is the currently active one */
  isActive?: boolean;
  /** Current set index within this exercise (if active) */
  currentSetIndex?: number;
  /** Callback when a set is completed */
  onSetCompleteWithTimer?: (setId: number) => void;
}

const ExerciseItem = forwardRef<HTMLDivElement, ExerciseItemProps>(function ExerciseItem(
  {
    workoutId,
    workoutExercise,
    index,
    isExpanded,
    onToggle,
    isWorkoutCompleted,
    isActive = false,
    currentSetIndex,
    onSetCompleteWithTimer,
  },
  ref,
) {
  const exercise = workoutExercise.exercise;
  const sets = workoutExercise.sets ?? [];
  const completedSetsCount = sets.filter((s) => s.completedAt !== null).length;
  const totalSetsCount = sets.length;

  const { handleRemoveExercise, handleAddSet, isAddingSet } = useExerciseItem({
    workoutId,
    workoutExerciseId: workoutExercise.id,
    setsCount: sets.length,
  });

  return (
    <Paper ref={ref} withBorder radius="md" className={styles.exerciseCard} data-active={isActive}>
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
            {/* Sets Progress - Using ExerciseProgressIndicator */}
            <ExerciseProgressIndicator
              completedSets={completedSetsCount}
              totalSets={totalSetsCount}
            />

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
                  isCurrent={currentSetIndex === setIndex}
                  onSetCompleteWithTimer={onSetCompleteWithTimer}
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
              loading={isAddingSet}
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
});
