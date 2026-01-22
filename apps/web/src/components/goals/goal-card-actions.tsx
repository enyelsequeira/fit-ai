/**
 * GoalCardActions - Action buttons and menu dropdown
 */

import type { MouseEvent } from "react";

import { Group, Menu, Text } from "@mantine/core";
import {
  IconCalendar,
  IconCheck,
  IconDotsVertical,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import type { GoalWithExercise } from "./types";
import { formatDeadline } from "./utils";

interface GoalCardActionsProps {
  goal: GoalWithExercise;
  onLogProgress?: (goal: GoalWithExercise) => void;
  onComplete?: (goal: GoalWithExercise) => void;
  onPause?: (goal: GoalWithExercise) => void;
  onResume?: (goal: GoalWithExercise) => void;
  onAbandon?: (goal: GoalWithExercise) => void;
  onDelete?: (goal: GoalWithExercise) => void;
}

export function GoalCardActions({
  goal,
  onLogProgress,
  onComplete,
  onPause,
  onResume,
  onAbandon,
  onDelete,
}: GoalCardActionsProps) {
  const isActive = goal.status === "active";
  const isPaused = goal.status === "paused";

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  const handleAction = (callback?: (goal: GoalWithExercise) => void) => (e: MouseEvent) => {
    e.stopPropagation();
    callback?.(goal);
  };

  return (
    <Group
      justify="space-between"
      align="center"
      mt="sm"
      pt="sm"
      style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
    >
      <Text fz="xs" c="dimmed">
        <IconCalendar size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
        {formatDeadline(goal.targetDate)}
      </Text>

      <Group gap={8}>
        {isActive && (
          <FitAiButton size="xs" variant="secondary" onClick={handleAction(onLogProgress)}>
            Log Progress
          </FitAiButton>
        )}

        <GoalActionsMenu
          goal={goal}
          isActive={isActive}
          isPaused={isPaused}
          onComplete={onComplete}
          onPause={onPause}
          onResume={onResume}
          onAbandon={onAbandon}
          onDelete={onDelete}
          stopPropagation={stopPropagation}
          handleAction={handleAction}
        />
      </Group>
    </Group>
  );
}

interface GoalActionsMenuProps {
  goal: GoalWithExercise;
  isActive: boolean;
  isPaused: boolean;
  onComplete?: (goal: GoalWithExercise) => void;
  onPause?: (goal: GoalWithExercise) => void;
  onResume?: (goal: GoalWithExercise) => void;
  onAbandon?: (goal: GoalWithExercise) => void;
  onDelete?: (goal: GoalWithExercise) => void;
  stopPropagation: (e: MouseEvent) => void;
  handleAction: (callback?: (goal: GoalWithExercise) => void) => (e: MouseEvent) => void;
}

function GoalActionsMenu({
  isActive,
  isPaused,
  onComplete,
  onPause,
  onResume,
  onAbandon,
  onDelete,
  stopPropagation,
  handleAction,
}: GoalActionsMenuProps) {
  return (
    <Menu position="bottom-end" withArrow shadow="md">
      <Menu.Target>
        <FitAiButton size="xs" variant="ghost" px={6} onClick={stopPropagation}>
          <IconDotsVertical size={16} />
        </FitAiButton>
      </Menu.Target>

      <Menu.Dropdown>
        {isActive && (
          <>
            <Menu.Item leftSection={<IconCheck size={14} />} onClick={handleAction(onComplete)}>
              Mark Complete
            </Menu.Item>
            <Menu.Item leftSection={<IconPlayerPause size={14} />} onClick={handleAction(onPause)}>
              Pause Goal
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconX size={14} />}
              color="orange"
              onClick={handleAction(onAbandon)}
            >
              Abandon Goal
            </Menu.Item>
          </>
        )}

        {isPaused && (
          <Menu.Item leftSection={<IconPlayerPlay size={14} />} onClick={handleAction(onResume)}>
            Resume Goal
          </Menu.Item>
        )}

        <Menu.Divider />
        <Menu.Item
          leftSection={<IconTrash size={14} />}
          color="red"
          onClick={handleAction(onDelete)}
        >
          Delete Goal
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
