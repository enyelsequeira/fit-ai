/**
 * GoalProgressSection - Progress bar and values display
 */

import { useMemo } from "react";
import { Box, Group, Progress, Text } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import type { GoalValues } from "./goal-detail-utils";
import { getStatusColor } from "./goal-detail-utils";
import type { GoalWithProgress } from "./types";

interface GoalProgressSectionProps {
  goal: GoalWithProgress;
  values: GoalValues;
}

export function GoalProgressSection({ goal, values }: GoalProgressSectionProps) {
  const DirectionIcon = goal.direction === "decrease" ? IconTrendingDown : IconTrendingUp;

  const chartData = useMemo(() => {
    if (!goal.progressHistory?.length) return [];

    return goal.progressHistory
      .slice()
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .map((entry) => ({
        date: new Date(entry.recordedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: entry.value,
        progress: entry.progressPercentage,
      }));
  }, [goal.progressHistory]);

  return (
    <>
      <Box>
        <Group justify="space-between" mb="sm">
          <Text fw={500}>Progress</Text>
          <Text fw={600} size="lg">
            {Math.round(goal.progressPercentage ?? 0)}%
          </Text>
        </Group>
        <Progress
          value={goal.progressPercentage ?? 0}
          size="lg"
          radius="xl"
          color={getStatusColor(goal.status)}
        />
        <Group justify="space-between" mt="sm">
          <Text size="sm" c="dimmed">
            <DirectionIcon size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Start: {values.start ?? "-"} {values.unit}
          </Text>
          <Text size="sm" c="dimmed">
            Current: {values.current ?? "-"} {values.unit}
          </Text>
          <Text size="sm" c="dimmed">
            Target: {values.target ?? "-"} {values.unit}
          </Text>
        </Group>
      </Box>

      {chartData.length > 1 && (
        <Box>
          <Text fw={500} mb="sm">
            Progress Over Time
          </Text>
          <Box h={200} mt="md">
            <LineChart
              h={200}
              data={chartData}
              dataKey="date"
              series={[{ name: "value", color: "blue.6", label: "Value" }]}
              curveType="monotone"
              withLegend={false}
              withTooltip
              gridAxis="xy"
            />
          </Box>
        </Box>
      )}
    </>
  );
}
