/**
 * GoalDetailModal - Full goal details with progress chart
 */

import { Badge, Box, Center, Group, Modal, Stack, Text } from "@mantine/core";
import { getGoalTypeIcon, getGoalValues, getStatusColor } from "./goal-detail-utils";
import { GoalFooterActions, GoalQuickActions } from "./goal-actions";
import { GoalHistoryTimeline } from "./goal-history-timeline";
import { GoalProgressSection } from "./goal-progress-section";
import { GoalTimelineSection } from "./goal-timeline-section";
import type { GoalType, GoalWithProgress } from "./types";
import styles from "./goals-view.module.css";

interface GoalDetailModalProps {
  opened: boolean;
  onClose: () => void;
  goal: GoalWithProgress | null;
  isLoading?: boolean;
  onLogProgress?: () => void;
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onAbandon?: () => void;
}

export function GoalDetailModal({
  opened,
  onClose,
  goal,
  isLoading: _isLoading,
  onLogProgress,
  onComplete,
  onPause,
  onResume,
  onAbandon,
}: GoalDetailModalProps) {
  if (!goal) return null;

  const goalType = goal.goalType as GoalType;
  const GoalIcon = getGoalTypeIcon(goalType);
  const values = getGoalValues(goal);

  return (
    <Modal opened={opened} onClose={onClose} title={goal.title} size="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <Group gap="sm">
            <Center w={48} h={48} className={styles.goalIcon} data-type={goalType}>
              <GoalIcon size={24} />
            </Center>
            <Box>
              <Badge color={getStatusColor(goal.status)} size="sm">
                {goal.status}
              </Badge>
              {goal.exercise && (
                <Text size="sm" c="dimmed" mt={4}>
                  {goal.exercise.name}
                </Text>
              )}
            </Box>
          </Group>

          <GoalQuickActions
            status={goal.status}
            onLogProgress={onLogProgress}
            onPause={onPause}
            onResume={onResume}
          />
        </Group>

        {goal.description && (
          <Text size="sm" c="dimmed">
            {goal.description}
          </Text>
        )}

        <GoalProgressSection goal={goal} values={values} />

        <GoalTimelineSection goal={goal} />

        {goal.progressHistory && goal.progressHistory.length > 0 && (
          <GoalHistoryTimeline progressHistory={goal.progressHistory} unit={values.unit} />
        )}

        <GoalFooterActions
          status={goal.status}
          onComplete={onComplete}
          onAbandon={onAbandon}
          onClose={onClose}
        />
      </Stack>
    </Modal>
  );
}
