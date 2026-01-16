/**
 * GoalCardProgress - Progress bar section with values display
 */

import { Box, Group, Progress, Text } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import type { GoalWithExercise } from "./types";
import { formatTargetValue, getProgressColor } from "./utils";

interface GoalCardProgressProps {
  goal: GoalWithExercise;
  progress: number;
}

export function GoalCardProgress({ goal, progress }: GoalCardProgressProps) {
  const DirectionIcon = goal.direction === "decrease" ? IconTrendingDown : IconTrendingUp;

  return (
    <Box mt="sm">
      <Group justify="space-between" align="center" mb={4}>
        <Text fz="xs" c="dimmed">
          <DirectionIcon size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
          {formatTargetValue(goal)}
        </Text>
        <Text fz="xs" fw={600}>
          {Math.round(progress)}%
        </Text>
      </Group>
      <Progress
        value={progress}
        size="sm"
        radius="xl"
        color={getProgressColor(progress, goal.status)}
      />
    </Box>
  );
}
