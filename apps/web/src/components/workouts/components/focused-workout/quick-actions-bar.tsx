/**
 * QuickActionsBar - Fixed bottom navigation for workout quick actions
 * Provides easy access to add exercises and finish workout
 */

import { Box, Button, Group } from "@mantine/core";
import { IconCheck, IconPlus } from "@tabler/icons-react";

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
        <Button
          variant="subtle"
          leftSection={<IconPlus size={18} />}
          onClick={onAddExercise}
          aria-label="Add exercise to workout"
        >
          + Exercise
        </Button>

        <Button
          color={canFinish ? "green" : "gray"}
          disabled={!canFinish}
          leftSection={<IconCheck size={18} />}
          onClick={onFinishWorkout}
          className={styles.finishButton}
          aria-label="Finish workout"
        >
          Finish
        </Button>
      </Group>
    </Box>
  );
}
