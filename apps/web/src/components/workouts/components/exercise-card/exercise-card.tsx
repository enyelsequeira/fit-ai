/**
 * ExerciseCard - Enhanced card component for displaying exercise details in a workout
 * Features: collapsible body, visual states, quick actions, and previous workout hints
 */

import { useState, useCallback } from "react";
import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Collapse,
  ActionIcon,
  Tooltip,
  Box,
  Menu,
} from "@mantine/core";
import { IconChevronDown, IconPlus, IconTrash, IconNote, IconHistory } from "@tabler/icons-react";
import { ExerciseProgressIndicator } from "../workout-progress";
import styles from "./exercise-card.module.css";

interface PreviousBest {
  weight: number;
  reps: number;
}

interface ExerciseCardProps {
  exerciseName: string;
  muscleGroup?: string;
  completedSets: number;
  totalSets: number;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  notes?: string;
  previousBest?: PreviousBest;
  onAddSet?: () => void;
  onRemoveExercise?: () => void;
  children: React.ReactNode;
}

/**
 * Maps muscle group names to badge colors
 */
function getMuscleGroupColor(muscleGroup: string): string {
  const colorMap: Record<string, string> = {
    chest: "red",
    back: "blue",
    shoulders: "violet",
    biceps: "grape",
    triceps: "indigo",
    legs: "green",
    quadriceps: "green",
    hamstrings: "teal",
    glutes: "cyan",
    calves: "lime",
    core: "orange",
    abs: "orange",
    forearms: "pink",
    cardio: "yellow",
  };

  const normalizedGroup = muscleGroup.toLowerCase();
  return colorMap[normalizedGroup] ?? "gray";
}

/**
 * Determines if the exercise is completed based on sets
 */
function isExerciseComplete(completed: number, total: number): boolean {
  return total > 0 && completed >= total;
}

export function ExerciseCard({
  exerciseName,
  muscleGroup,
  completedSets,
  totalSets,
  isActive = false,
  isExpanded: controlledExpanded,
  onToggleExpand,
  notes,
  previousBest,
  onAddSet,
  onRemoveExercise,
  children,
}: ExerciseCardProps) {
  // Internal expanded state (used when uncontrolled)
  const [internalExpanded, setInternalExpanded] = useState(true);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  // Notes section expanded state
  const [notesExpanded, setNotesExpanded] = useState(false);

  const isComplete = isExerciseComplete(completedSets, totalSets);

  const handleToggleExpand = useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [onToggleExpand]);

  const handleToggleNotes = useCallback(() => {
    setNotesExpanded((prev) => !prev);
  }, []);

  const handleRemoveExercise = useCallback(() => {
    if (onRemoveExercise) {
      const confirmed = window.confirm(
        `Are you sure you want to remove "${exerciseName}" from this workout?`,
      );
      if (confirmed) {
        onRemoveExercise();
      }
    }
  }, [onRemoveExercise, exerciseName]);

  return (
    <Card
      className={styles.card}
      data-active={isActive}
      data-complete={isComplete}
      padding="md"
      radius="md"
      withBorder
    >
      {/* Header Section */}
      <Group
        justify="space-between"
        align="center"
        wrap="nowrap"
        className={styles.header}
        onClick={handleToggleExpand}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${exerciseName}, ${completedSets} of ${totalSets} sets completed. Click to ${isExpanded ? "collapse" : "expand"}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleExpand();
          }
        }}
      >
        {/* Left side: Name, muscle group, and progress */}
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap">
              <Text fw={600} size="md" className={styles.exerciseName} truncate>
                {exerciseName}
              </Text>
              {muscleGroup && (
                <Badge
                  size="xs"
                  variant="light"
                  color={getMuscleGroupColor(muscleGroup)}
                  className={styles.muscleGroupBadge}
                >
                  {muscleGroup}
                </Badge>
              )}
            </Group>

            {/* Previous best hint */}
            {previousBest && (
              <Group gap={4} className={styles.previousBest}>
                <IconHistory size={12} />
                <Text size="xs" c="dimmed">
                  Last: {previousBest.weight} kg x {previousBest.reps} reps
                </Text>
              </Group>
            )}
          </Stack>
        </Group>

        {/* Right side: Progress indicator and actions */}
        <Group gap="xs" wrap="nowrap">
          <ExerciseProgressIndicator completedSets={completedSets} totalSets={totalSets} />

          {/* Quick actions */}
          <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
            {onAddSet && (
              <Tooltip label="Add set" position="top" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="sm"
                  onClick={onAddSet}
                  aria-label="Add set"
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {onRemoveExercise && (
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Exercise options">
                    <IconTrash size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={handleRemoveExercise}
                  >
                    Remove Exercise
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>

          {/* Chevron indicator */}
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            className={styles.chevron}
            data-expanded={isExpanded}
            aria-hidden="true"
          >
            <IconChevronDown size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Collapsible Body */}
      <Collapse in={isExpanded}>
        <Box className={styles.body}>
          {/* Sets content (passed as children) */}
          <Box className={styles.setsContainer}>{children}</Box>

          {/* Notes section (only if notes exist) */}
          {notes && (
            <Box className={styles.notesSection}>
              <Group
                gap="xs"
                className={styles.notesHeader}
                onClick={handleToggleNotes}
                role="button"
                tabIndex={0}
                aria-expanded={notesExpanded}
                aria-label={`Exercise notes. Click to ${notesExpanded ? "collapse" : "expand"}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleNotes();
                  }
                }}
              >
                <IconNote size={14} />
                <Text size="xs" fw={500}>
                  Notes
                </Text>
                <ActionIcon
                  variant="transparent"
                  color="gray"
                  size="xs"
                  className={styles.notesChevron}
                  data-expanded={notesExpanded}
                  aria-hidden="true"
                >
                  <IconChevronDown size={12} />
                </ActionIcon>
              </Group>

              <Collapse in={notesExpanded}>
                <Text size="sm" c="dimmed" className={styles.notesContent}>
                  {notes}
                </Text>
              </Collapse>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}
