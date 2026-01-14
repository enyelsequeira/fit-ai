import { Box, Flex, Text } from "@mantine/core";

import styles from "./workout-frequency.module.css";

const INTENSITY_LEVELS = [0, 1, 2, 3, 4] as const;

export function FrequencyLegend() {
  return (
    <Flex justify="flex-end" align="center" gap="xs" className={styles.legend}>
      <Text size="xs" c="dimmed">
        Less
      </Text>
      {INTENSITY_LEVELS.map((level) => (
        <Box
          key={level}
          className={`${styles.legendCell} ${styles[`level${level}` as keyof typeof styles]}`}
        />
      ))}
      <Text size="xs" c="dimmed">
        More
      </Text>
    </Flex>
  );
}
