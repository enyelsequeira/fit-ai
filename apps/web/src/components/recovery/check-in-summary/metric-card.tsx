/**
 * MetricCard - Reusable metric display with icon and color coding
 */

import { Box, Stack, Text } from "@mantine/core";
import { getValueColor } from "./utils";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  max: number;
  unit?: string;
  inverse?: boolean;
}

function MetricCard({ icon, label, value, max, unit, inverse = false }: MetricCardProps) {
  const hasValue = value !== null;
  const color = hasValue ? getValueColor(value, max, inverse) : "dimmed";

  return (
    <Stack
      align="center"
      gap={4}
      p="xs"
      bd="1px solid var(--mantine-color-default-border)"
      style={{ borderRadius: "var(--mantine-radius-sm)" }}
    >
      <Box c={color}>{icon}</Box>
      <Text fz="lg" fw={700} c={color} ff="var(--mantine-font-family-monospace)">
        {hasValue ? (
          <>
            {value}
            {unit && (
              <Text component="span" fz="xs" fw={400}>
                {unit}
              </Text>
            )}
          </>
        ) : (
          "-"
        )}
      </Text>
      <Text fz={10} c="dimmed">
        {label}
      </Text>
    </Stack>
  );
}

export { MetricCard };
export type { MetricCardProps };
