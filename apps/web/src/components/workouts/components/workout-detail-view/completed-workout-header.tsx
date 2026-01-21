import { Badge, Box, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { IconBarbell, IconCalendar, IconCheck } from "@tabler/icons-react";

import { formatDuration, formatRelativeDate, formatTime } from "../../utils";
import styles from "./workout-detail-view.module.css";

export interface WorkoutSummary {
  name: string | null;
  notes: string | null;
  startedAt: string | Date;
  completedAt: string | Date;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
}

interface CompletedWorkoutHeaderProps {
  summary: WorkoutSummary;
}

export function CompletedWorkoutHeader({ summary }: CompletedWorkoutHeaderProps) {
  const { name, notes, startedAt, completedAt, exerciseCount, completedSets, totalSets } = summary;

  const completedDuration = Math.floor(
    (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000,
  );

  return (
    <Paper withBorder p="lg" radius="md" className={styles.headerPaper}>
      <Stack gap="md">
        {/* Title Row */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Box flex={1} miw={200}>
            <Text size="xl" fw={700}>
              {name ?? "Untitled Workout"}
            </Text>
          </Box>
          <Badge size="lg" color="green" variant="light" leftSection={<IconCheck size={14} />}>
            Completed
          </Badge>
        </Group>

        {/* Metadata Row */}
        <Group gap="lg" wrap="wrap">
          <Group gap={6}>
            <IconCalendar size={16} style={{ opacity: 0.6 }} />
            <Text size="sm" c="dimmed">
              {formatRelativeDate(startedAt)} at {formatTime(startedAt)}
            </Text>
          </Group>
          {completedDuration > 0 && (
            <Group gap={6}>
              <Text size="sm" c="dimmed">
                {formatDuration(completedDuration)}
              </Text>
            </Group>
          )}
        </Group>

        {/* Notes */}
        {notes && (
          <Box className={styles.notesBox}>
            <Text size="sm" c="dimmed">
              {notes}
            </Text>
          </Box>
        )}

        {/* Stats Row */}
        <Divider />
        <Group gap="xl">
          <Box className={styles.statItem}>
            <Group gap="xs">
              <IconBarbell size={20} className={styles.statIcon} />
              <Box>
                <Text size="lg" fw={600}>
                  {exerciseCount}
                </Text>
                <Text size="xs" c="dimmed">
                  {exerciseCount === 1 ? "Exercise" : "Exercises"}
                </Text>
              </Box>
            </Group>
          </Box>
          <Box className={styles.statItem}>
            <Group gap="xs">
              <IconCheck size={20} className={styles.statIcon} />
              <Box>
                <Text size="lg" fw={600}>
                  {completedSets}/{totalSets}
                </Text>
                <Text size="xs" c="dimmed">
                  Sets Completed
                </Text>
              </Box>
            </Group>
          </Box>
        </Group>
      </Stack>
    </Paper>
  );
}
