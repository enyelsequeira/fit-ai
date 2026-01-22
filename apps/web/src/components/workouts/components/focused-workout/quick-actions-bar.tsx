/**
 * QuickActionsBar - Fixed bottom navigation for workout quick actions
 * Provides easy access to add exercises and finish workout
 */

import { Box, Group } from "@mantine/core";
import { IconCheck, IconPlus } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import styles from "./quick-actions-bar.module.css";

interface QuickActionsBarProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  canFinish: boolean;
}

export function QuickActionsBar({
  onAddExercise,
  onFinishWorkout,
  canFinish,
}: QuickActionsBarProps) {
  return (
    <Box className={styles.container}>
      <Group justify="space-between" h="100%">
        <FitAiButton
          variant="ghost"
          size="lg"
          leftSection={<IconPlus size={18} />}
          onClick={onAddExercise}
          aria-label="Add exercise to workout"
        >
          Add Exercise
        </FitAiButton>

        <FitAiButton
          variant={canFinish ? "success" : "secondary"}
          size="lg"
          disabled={!canFinish}
          leftSection={<IconCheck size={18} />}
          onClick={onFinishWorkout}
          className={styles.finishButton}
          aria-label="Finish workout"
        >
          Finish
        </FitAiButton>
      </Group>
    </Box>
  );
}
