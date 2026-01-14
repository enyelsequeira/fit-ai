/**
 * GoalHistoryTimeline - Progress history timeline
 */

import { Box, Text, Timeline } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import { formatRelativeTime } from "./goal-detail-utils";
import type { GoalProgressOutput } from "./types";

interface GoalHistoryTimelineProps {
  progressHistory: GoalProgressOutput[];
  unit: string;
}

export function GoalHistoryTimeline({ progressHistory, unit }: GoalHistoryTimelineProps) {
  if (!progressHistory.length) return null;

  const sortedHistory = progressHistory
    .slice()
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, 5);

  return (
    <Box>
      <Text fw={500} mb="sm">
        Recent Updates
      </Text>
      <Timeline active={progressHistory.length - 1} bulletSize={24} lineWidth={2}>
        {sortedHistory.map((entry) => (
          <Timeline.Item
            key={entry.id}
            bullet={<IconChartLine size={12} />}
            title={`${entry.value} ${unit}`}
          >
            <Text c="dimmed" size="xs">
              {formatRelativeTime(entry.recordedAt)} - {Math.round(entry.progressPercentage)}%
              complete
            </Text>
            {entry.note && (
              <Text size="xs" mt={4}>
                {entry.note}
              </Text>
            )}
          </Timeline.Item>
        ))}
      </Timeline>
    </Box>
  );
}
