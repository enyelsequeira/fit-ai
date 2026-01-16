/**
 * ChartTooltip - Custom tooltip component for weight trend charts
 */

import { Box, Group, Stack, Text } from "@mantine/core";
import styles from "./weight-trend-chart.module.css";

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  color: string;
  name: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

/**
 * Get the unit suffix based on the data key
 */
function getUnitSuffix(dataKey: string): string {
  return dataKey === "bodyFatPercentage" ? "%" : " kg";
}

/**
 * Custom tooltip for displaying weight and body fat values
 */
export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload) return null;

  return (
    <Stack gap={4} className={styles.tooltip}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {payload.map((entry, index) => {
        if (entry.value === null) return null;
        return (
          <Group key={index} gap="xs">
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: "50%",
                backgroundColor: entry.color,
                flexShrink: 0,
              }}
            />
            <Text size="xs">
              {entry.name}: {entry.value.toFixed(1)}
              {getUnitSuffix(entry.dataKey)}
            </Text>
          </Group>
        );
      })}
    </Stack>
  );
}
