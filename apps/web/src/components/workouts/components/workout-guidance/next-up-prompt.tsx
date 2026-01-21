/**
 * NextUpPrompt - Prominent guidance component showing the next set to complete
 * Displays exercise info, target values, and a call-to-action to mark the set complete
 */

import { Badge, Button, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBarbell, IconCheck, IconTrophy } from "@tabler/icons-react";

import styles from "./next-up-prompt.module.css";

interface NextUpPromptProps {
  exerciseName?: string;
  setNumber?: number;
  totalSets?: number;
  targetWeight?: number;
  targetReps?: number;
  isWorkoutComplete?: boolean;
  onMarkComplete?: () => void;
  loading?: boolean;
}

/**
 * Celebration state shown when all sets are completed
 */
function WorkoutCompleteState() {
  return (
    <Paper className={styles.container} data-complete>
      <Stack align="center" gap="md" py="md">
        <ThemeIcon
          size={64}
          radius="xl"
          variant="gradient"
          gradient={{ from: "yellow", to: "orange", deg: 45 }}
          className={styles.trophyIcon}
        >
          <IconTrophy size={36} stroke={1.5} />
        </ThemeIcon>

        <Stack align="center" gap={4}>
          <Text size="xl" fw={700} ta="center">
            Great Job!
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            You have completed all sets in this workout
          </Text>
        </Stack>

        <Badge size="lg" variant="light" color="green" radius="md">
          Workout Complete
        </Badge>
      </Stack>
    </Paper>
  );
}

/**
 * Empty state when no next set info is available
 */
function EmptyState() {
  return (
    <Paper className={styles.container} data-empty>
      <Stack align="center" gap="md" py="md">
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <IconBarbell size={24} stroke={1.5} />
        </ThemeIcon>

        <Stack align="center" gap={4}>
          <Text size="md" fw={500} c="dimmed" ta="center">
            No exercises added yet
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Add exercises to get started
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}

/**
 * NextUpPrompt component
 *
 * Shows a prominent card indicating what set to do next, including:
 * - Exercise name
 * - Set number (X of Y)
 * - Target weight and reps
 * - Mark complete button
 *
 * Displays a celebration state when workout is complete.
 */
export function NextUpPrompt({
  exerciseName,
  setNumber,
  totalSets,
  targetWeight,
  targetReps,
  isWorkoutComplete = false,
  onMarkComplete,
  loading = false,
}: NextUpPromptProps) {
  // Show celebration state when workout is complete
  if (isWorkoutComplete) {
    return <WorkoutCompleteState />;
  }

  // Show empty state when no exercise info is provided
  if (!exerciseName || !setNumber || !totalSets) {
    return <EmptyState />;
  }

  const hasTargetValues = targetWeight !== undefined || targetReps !== undefined;

  return (
    <Paper className={styles.container}>
      <Stack gap="md">
        {/* Header with label */}
        <Group justify="space-between" align="center">
          <Badge
            variant="light"
            color="blue"
            size="sm"
            radius="sm"
            leftSection={<IconBarbell size={12} />}
          >
            Next Up
          </Badge>
          <Text size="xs" c="dimmed">
            Set {setNumber} of {totalSets}
          </Text>
        </Group>

        {/* Exercise Name - Prominent display */}
        <Text size="lg" fw={700} className={styles.exerciseName}>
          {exerciseName}
        </Text>

        {/* Target Values */}
        {hasTargetValues && (
          <Group gap="lg" className={styles.targetValues}>
            {targetWeight !== undefined && (
              <Stack gap={2} align="center">
                <Text size="xl" fw={700} ff="var(--mantine-font-family-monospace)">
                  {targetWeight}
                </Text>
                <Text size="xs" c="dimmed" tt="uppercase">
                  kg
                </Text>
              </Stack>
            )}
            {targetWeight !== undefined && targetReps !== undefined && (
              <Text size="xl" c="dimmed" fw={300}>
                x
              </Text>
            )}
            {targetReps !== undefined && (
              <Stack gap={2} align="center">
                <Text size="xl" fw={700} ff="var(--mantine-font-family-monospace)">
                  {targetReps}
                </Text>
                <Text size="xs" c="dimmed" tt="uppercase">
                  reps
                </Text>
              </Stack>
            )}
          </Group>
        )}

        {/* Call to Action Button */}
        <Button
          fullWidth
          size="lg"
          color="green"
          leftSection={<IconCheck size={20} />}
          onClick={onMarkComplete}
          loading={loading}
          disabled={!onMarkComplete || loading}
          className={styles.completeButton}
        >
          Mark Complete
        </Button>
      </Stack>
    </Paper>
  );
}
