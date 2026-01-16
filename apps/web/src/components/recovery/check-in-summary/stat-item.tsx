/**
 * StatItem - Progress bar display for metrics with labels
 */

import { Box, Group, Progress, Text } from "@mantine/core";
import { getValueColor } from "./utils";

interface StatItemProps {
  label: string;
  value: number | null;
  max: number;
  inverse?: boolean;
}

function StatItem({ label, value, max, inverse = false }: StatItemProps) {
  if (value === null) return null;

  const percentage = (value / max) * 100;
  const color = getValueColor(value, max, inverse);

  return (
    <Box>
      <Group justify="space-between" mb={4}>
        <Text fz="xs" c="dimmed">
          {label}
        </Text>
        <Text fz="xs" fw={500} ff="var(--mantine-font-family-monospace)">
          {value}/{max}
        </Text>
      </Group>
      <Progress value={percentage} size="xs" color={color} />
    </Box>
  );
}

export { StatItem };
export type { StatItemProps };
