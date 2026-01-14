/**
 * GoalTimelineSection - Dates display (started, target, completed)
 */

import { Box, Group, Text } from "@mantine/core";
import { IconCalendar, IconCheck, IconClock, IconNote } from "@tabler/icons-react";
import { formatDate, formatRelativeTime } from "./goal-detail-utils";
import type { GoalWithProgress } from "./types";

interface GoalTimelineSectionProps {
  goal: GoalWithProgress;
}

interface TimelineItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function TimelineItem({ label, value, icon }: TimelineItemProps) {
  return (
    <Box>
      <Text size="xs" c="dimmed" mb={2}>
        {label}
      </Text>
      <Group gap={4}>
        {icon}
        <Text size="sm">{value}</Text>
      </Group>
    </Box>
  );
}

export function GoalTimelineSection({ goal }: GoalTimelineSectionProps) {
  return (
    <Box>
      <Text fw={500} mb="sm">
        Timeline
      </Text>
      <Group gap="xl">
        <TimelineItem
          label="Started"
          value={formatDate(goal.startDate)}
          icon={<IconCalendar size={14} style={{ color: "var(--mantine-color-dimmed)" }} />}
        />
        <TimelineItem
          label="Target Date"
          value={formatDate(goal.targetDate)}
          icon={<IconClock size={14} style={{ color: "var(--mantine-color-dimmed)" }} />}
        />
        {goal.completedAt && (
          <TimelineItem
            label="Completed"
            value={formatDate(goal.completedAt)}
            icon={<IconCheck size={14} style={{ color: "var(--mantine-color-green-6)" }} />}
          />
        )}
        <TimelineItem
          label="Last Updated"
          value={formatRelativeTime(goal.lastProgressUpdate)}
          icon={<IconNote size={14} style={{ color: "var(--mantine-color-dimmed)" }} />}
        />
      </Group>
    </Box>
  );
}
