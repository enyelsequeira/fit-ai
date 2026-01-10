import { IconBarbell, IconClipboardCheck, IconTrophy } from "@tabler/icons-react";

import { Group } from "@mantine/core";

import { FitAiButton } from "@/components/ui/button";

import styles from "./quick-actions.module.css";

interface QuickActionsProps {
  onStartWorkout?: () => void;
  onLogCheckIn?: () => void;
  onViewPRs?: () => void;
}

export function QuickActions({ onStartWorkout, onLogCheckIn, onViewPRs }: QuickActionsProps) {
  return (
    <Group gap="xs" wrap="wrap">
      <FitAiButton
        leftSection={<IconBarbell size={16} />}
        onClick={onStartWorkout}
        className={styles.quickActionBtn}
      >
        Start Workout
      </FitAiButton>
      <FitAiButton
        variant="outline"
        leftSection={<IconClipboardCheck size={16} />}
        onClick={onLogCheckIn}
        className={styles.quickActionBtn}
      >
        Log Check-in
      </FitAiButton>
      <FitAiButton
        variant="outline"
        leftSection={<IconTrophy size={16} />}
        onClick={onViewPRs}
        className={styles.quickActionBtn}
      >
        View PRs
      </FitAiButton>
    </Group>
  );
}
