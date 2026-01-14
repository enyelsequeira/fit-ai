/**
 * GoalActions - Action buttons (Log Progress, Pause, Resume, Complete, Abandon)
 */

import { Divider, Group } from "@mantine/core";
import { IconCheck, IconPlayerPause, IconPlayerPlay, IconX } from "@tabler/icons-react";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

interface GoalActionsProps {
  status: string;
  onLogProgress?: () => void;
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onAbandon?: () => void;
  onClose: () => void;
}

interface QuickActionsProps {
  status: string;
  onLogProgress?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export function GoalQuickActions({ status, onLogProgress, onPause, onResume }: QuickActionsProps) {
  const isActive = status === "active";
  const isPaused = status === "paused";

  return (
    <Group gap="xs">
      {isActive && (
        <>
          <FitAiButton size="xs" variant="light" onClick={onLogProgress}>
            Log Progress
          </FitAiButton>
          <FitAiButton
            size="xs"
            variant="subtle"
            leftSection={<IconPlayerPause size={14} />}
            onClick={onPause}
          >
            Pause
          </FitAiButton>
        </>
      )}
      {isPaused && (
        <FitAiButton
          size="xs"
          variant="light"
          leftSection={<IconPlayerPlay size={14} />}
          onClick={onResume}
        >
          Resume
        </FitAiButton>
      )}
    </Group>
  );
}

export function GoalFooterActions({ status, onComplete, onAbandon, onClose }: GoalActionsProps) {
  const isActive = status === "active";

  return (
    <>
      <Divider />
      <Group justify="space-between">
        <Group gap="xs">
          {isActive && (
            <>
              <FitAiButton
                size="sm"
                variant="light"
                color="blue"
                leftSection={<IconCheck size={14} />}
                onClick={onComplete}
              >
                Mark Complete
              </FitAiButton>
              <FitAiButton
                size="sm"
                variant="subtle"
                color="orange"
                leftSection={<IconX size={14} />}
                onClick={onAbandon}
              >
                Abandon
              </FitAiButton>
            </>
          )}
        </Group>
        <FitAiButton variant="subtle" onClick={onClose}>
          Close
        </FitAiButton>
      </Group>
    </>
  );
}
