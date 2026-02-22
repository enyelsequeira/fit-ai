import { Group } from "@mantine/core";
import { IconFlag, IconPlus } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import styles from "./quick-actions-bar.module.css";

type QuickActionsBarProps = {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  canFinish: boolean;
};

export function QuickActionsBar({
  onAddExercise,
  onFinishWorkout,
  canFinish,
}: QuickActionsBarProps) {
  return (
    <Group justify="space-between" align="center" className={styles.bar}>
      <FitAiButton
        variant="ghost"
        leftSection={<IconPlus size={16} />}
        onClick={onAddExercise}
        className={styles.addButton}
      >
        Add Exercise
      </FitAiButton>

      <FitAiButton
        variant="success"
        leftSection={<IconFlag size={16} />}
        onClick={onFinishWorkout}
        disabled={!canFinish}
        className={styles.finishButton}
      >
        Finish Workout
      </FitAiButton>
    </Group>
  );
}
