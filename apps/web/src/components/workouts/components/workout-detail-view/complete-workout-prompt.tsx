import { Box, Button, Group, Paper, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import styles from "./workout-detail-view.module.css";

interface CompleteWorkoutPromptProps {
  onComplete: () => void;
}

export function CompleteWorkoutPrompt({ onComplete }: CompleteWorkoutPromptProps) {
  return (
    <Paper withBorder p="lg" radius="md" className={styles.completeSection}>
      <Group justify="space-between" align="center" wrap="wrap">
        <Box>
          <Text fw={600}>Ready to finish?</Text>
          <Text size="sm" c="dimmed">
            Complete your workout and rate how it went.
          </Text>
        </Box>
        <Button color="green" leftSection={<IconCheck size={16} />} onClick={onComplete}>
          Complete Workout
        </Button>
      </Group>
    </Paper>
  );
}
