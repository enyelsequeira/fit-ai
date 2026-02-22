import { Box, Group, Progress, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconClock } from "@tabler/icons-react";

import { FitAiActionIcon } from "@/components/ui/fit-ai-button/fit-ai-action-icon";

import styles from "./focused-workout-header.module.css";

type FocusedWorkoutHeaderProps = {
  workoutName: string;
  elapsedTime: number;
  totalSets: number;
  completedSets: number;
  onBackClick: () => void;
};

function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function FocusedWorkoutHeader({
  workoutName,
  elapsedTime,
  totalSets,
  completedSets,
  onBackClick,
}: FocusedWorkoutHeaderProps) {
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <Stack gap={0} className={styles.header}>
      {/* Top row: back button, workout name, timer */}
      <Group justify="space-between" align="center" px="md" pt="sm" pb={4}>
        <FitAiActionIcon variant="ghost" onClick={onBackClick} aria-label="Go back">
          <IconChevronLeft size={22} />
        </FitAiActionIcon>

        <Text fw={800} size="md" className={styles.workoutName}>
          {workoutName}
        </Text>

        <Group gap={6} className={styles.timerGroup} wrap="nowrap">
          <IconClock size={14} className={styles.timerIcon} aria-hidden="true" />
          <Text fw={700} size="md" className={styles.timerText}>
            {formatElapsedTime(elapsedTime)}
          </Text>
        </Group>
      </Group>

      {/* Bottom row: set count + percentage + progress bar */}
      <Box px="md" pb="sm">
        <Group gap="sm" align="center" mb={6}>
          <Text fw={700} size="sm" className={styles.setsCount}>
            {completedSets}
            <Text component="span" c="dimmed" fw={500} size="sm">
              {" "}
              / {totalSets} sets
            </Text>
          </Text>

          <Box flex={1} />

          <Text fw={700} size="xs" className={styles.percentText}>
            {progressPercent}%
          </Text>
        </Group>

        <Progress
          value={progressPercent}
          color="teal"
          size="md"
          radius="xl"
          className={styles.progressBar}
          aria-label={`Workout progress: ${progressPercent}%`}
        />
      </Box>
    </Stack>
  );
}
