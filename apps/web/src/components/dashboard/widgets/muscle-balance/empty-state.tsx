import { IconChartDonut } from "@tabler/icons-react";

import { Box, Stack, Text } from "@mantine/core";

import styles from "./muscle-balance.module.css";

export function EmptyState() {
  return (
    <Stack py="md" gap="xs" align="center" ta="center" className={styles.emptyState}>
      <Box className={styles.emptyIcon}>
        <IconChartDonut size={32} />
      </Box>
      <Text size="sm" fw={500}>
        No training data
      </Text>
      <Text size="xs" c="dimmed" maw={200}>
        Complete workouts to see your muscle balance distribution
      </Text>
    </Stack>
  );
}
