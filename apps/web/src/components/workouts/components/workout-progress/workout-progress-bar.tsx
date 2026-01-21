/**
 * WorkoutProgressBar - Visual progress bar for overall workout completion
 * Shows completed sets / total sets as percentage with animated fill
 */

import { Group, Progress, Text } from "@mantine/core";
import styles from "./workout-progress-bar.module.css";

interface WorkoutProgressBarProps {
  completedSets: number;
  totalSets: number;
}

export function WorkoutProgressBar({ completedSets, totalSets }: WorkoutProgressBarProps) {
  // Handle edge case where there are no sets
  if (totalSets === 0) {
    return (
      <div className={styles.container}>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Workout Progress
          </Text>
          <Text size="sm" c="dimmed">
            No sets added
          </Text>
        </Group>
        <Progress value={0} size="lg" radius="xl" color="gray" />
      </div>
    );
  }

  const percentage = Math.round((completedSets / totalSets) * 100);
  const isComplete = percentage === 100;

  return (
    <div className={styles.container}>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500}>
          Workout Progress
        </Text>
        <Text size="sm" c={isComplete ? "green" : "dimmed"} fw={isComplete ? 600 : 400}>
          {completedSets}/{totalSets} sets
        </Text>
      </Group>
      <Progress
        value={percentage}
        size="lg"
        radius="xl"
        color={isComplete ? "green" : "blue"}
        animated={!isComplete && percentage > 0}
        classNames={{ root: styles.progressRoot, section: styles.progressSection }}
        aria-label={`Workout progress: ${percentage}% complete`}
      />
      {isComplete && (
        <Text size="xs" c="green" ta="center" mt="xs" fw={500}>
          Workout Complete!
        </Text>
      )}
    </div>
  );
}
