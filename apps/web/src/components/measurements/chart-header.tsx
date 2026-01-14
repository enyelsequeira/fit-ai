/**
 * ChartHeader - Header component with title and controls for the weight trend chart
 */

import { Box, Group, SegmentedControl } from "@mantine/core";
import { IconChartLine, IconChartArea } from "@tabler/icons-react";
import { FitAiCardDescription, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import type { TimePeriod } from "./types";
import type { ChartType } from "./weight-trend-chart-utils";
import { periodOptions } from "./weight-trend-chart-utils";
import styles from "./weight-trend-chart.module.css";

const chartTypeOptions = [
  { label: <IconChartLine size={16} />, value: "line" },
  { label: <IconChartArea size={16} />, value: "area" },
];

interface ChartHeaderProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function ChartHeader({
  chartType,
  onChartTypeChange,
  period,
  onPeriodChange,
}: ChartHeaderProps) {
  return (
    <FitAiCardHeader>
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Box>
          <FitAiCardTitle>Weight Trends</FitAiCardTitle>
          <FitAiCardDescription>Track your weight and body fat over time</FitAiCardDescription>
        </Box>
        <Group gap="sm" className={styles.controlsGroup} data-responsive="auto">
          <SegmentedControl
            size="xs"
            value={chartType}
            onChange={(value) => onChartTypeChange(value as ChartType)}
            data={chartTypeOptions}
            className={styles.chartTypeControl}
            aria-label="Chart type"
          />
          <SegmentedControl
            size="xs"
            value={period}
            onChange={(value) => onPeriodChange(value as TimePeriod)}
            data={periodOptions}
            className={styles.periodControl}
            aria-label="Time period"
          />
        </Group>
      </Group>
    </FitAiCardHeader>
  );
}
