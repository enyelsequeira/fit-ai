/**
 * GoalCardHeader - Header section with icon, title, and status badge
 */

import { Box, Center, Group, Text } from "@mantine/core";
import { IconCheck, IconPlayerPause, IconTarget, IconX } from "@tabler/icons-react";

import type { GoalType, GoalWithExercise } from "./types";
import { getGoalTypeIcon, getGoalTypeLabel } from "./utils";
import styles from "./goals-view.module.css";

interface GoalCardHeaderProps {
  goal: GoalWithExercise;
  goalType: GoalType;
}

export function GoalCardHeader({ goal, goalType }: GoalCardHeaderProps) {
  const GoalIcon = getGoalTypeIcon(goalType);

  return (
    <Group justify="space-between" align="flex-start" gap="sm" mb="sm">
      <Group align="flex-start" gap="sm" style={{ flex: 1, minWidth: 0 }}>
        <Center className={styles.goalIcon} data-type={goalType}>
          <GoalIcon size={20} />
        </Center>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} fz="sm" truncate>
            {goal.title}
          </Text>
          <Group gap="xs" mt={4}>
            <Text size="xs" c="dimmed">
              {getGoalTypeLabel(goalType)}
            </Text>
            {goal.exercise && (
              <Text size="xs" c="dimmed">
                - {goal.exercise.name}
              </Text>
            )}
          </Group>
        </Box>
      </Group>

      <GoalStatusBadge status={goal.status} />
    </Group>
  );
}

interface GoalStatusBadgeProps {
  status: string;
}

function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  return (
    <Box className={styles.statusBadge} data-status={status}>
      {status === "active" && <IconTarget size={12} />}
      {status === "paused" && <IconPlayerPause size={12} />}
      {status === "completed" && <IconCheck size={12} />}
      {status === "abandoned" && <IconX size={12} />}
      {status}
    </Box>
  );
}
