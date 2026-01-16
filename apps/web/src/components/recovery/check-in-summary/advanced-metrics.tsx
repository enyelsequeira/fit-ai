/**
 * AdvancedMetrics - Displays resting heart rate and HRV score
 */

import { Group, Stack, Text } from "@mantine/core";

interface AdvancedMetricsProps {
  restingHeartRate: number | null;
  hrvScore: number | null;
}

function AdvancedMetrics({ restingHeartRate, hrvScore }: AdvancedMetricsProps) {
  if (!restingHeartRate && !hrvScore) return null;

  return (
    <Group gap="lg" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
      {restingHeartRate && (
        <Stack gap={2}>
          <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
            {restingHeartRate} BPM
          </Text>
          <Text fz="xs" c="dimmed">
            Resting HR
          </Text>
        </Stack>
      )}
      {hrvScore && (
        <Stack gap={2}>
          <Text fz="sm" fw={500} ff="var(--mantine-font-family-monospace)">
            {hrvScore}
          </Text>
          <Text fz="xs" c="dimmed">
            HRV
          </Text>
        </Stack>
      )}
    </Group>
  );
}

export { AdvancedMetrics };
export type { AdvancedMetricsProps };
