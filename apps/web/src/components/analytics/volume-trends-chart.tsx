/**
 * VolumeTrendsChart - Displays training volume trends over time
 * Uses Mantine BarChart for rendering.
 */

import { IconChartBar } from "@tabler/icons-react";
import { Box, Group, Stack, Text, Tooltip as MantineTooltip } from "@mantine/core";
import { BarChart } from "@mantine/charts";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import { formatVolume } from "@/components/ui/utils";
import type { VolumeDataPoint } from "./use-analytics-data";

import styles from "./analytics-view.module.css";

interface VolumeTrendsChartProps {
  data: VolumeDataPoint[];
  isLoading?: boolean;
}

function formatWeekLabel(periodStart: string): string {
  if (!periodStart) return "";
  const date = new Date(periodStart);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function VolumeTrendsChart({ data, isLoading }: VolumeTrendsChartProps) {
  const hasData = data.length > 0;

  if (isLoading) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconChartBar size={20} />
              Volume Trends
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Weekly training volume (kg)</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Box className={styles.chartContainer} data-loading="true" data-has-data="false">
            <Skeleton w="100%" h="100%" />
          </Box>
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  if (!hasData) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconChartBar size={20} />
              Volume Trends
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Weekly training volume (kg)</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState
            icon={<IconChartBar size={48} stroke={1.5} />}
            title="No volume data"
            message="Complete workouts to see your volume trends"
          />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    label: point.periodStart ? formatWeekLabel(point.periodStart) : point.week,
  }));

  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = data.length > 0 ? totalVolume / data.length : 0;
  const lastWeekVolume = data[data.length - 1]?.volume ?? 0;

  const previousWeekVolume = data.length >= 2 ? (data[data.length - 2]?.volume ?? 0) : 0;
  const trend =
    previousWeekVolume > 0 ? ((lastWeekVolume - previousWeekVolume) / previousWeekVolume) * 100 : 0;

  return (
    <FitAiCard className={styles.chartCard} data-chart-type="bar" data-has-data={hasData}>
      <FitAiCardHeader>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <Box>
            <FitAiCardTitle>
              <Group gap="xs">
                <IconChartBar size={20} />
                Volume Trends
              </Group>
            </FitAiCardTitle>
            <FitAiCardDescription>Weekly training volume (kg)</FitAiCardDescription>
          </Box>
          {data.length >= 2 && (
            <MantineTooltip label="Compared to previous week">
              <Text size="sm" fw={500} c={trend >= 0 ? "teal" : "red"}>
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)}%
              </Text>
            </MantineTooltip>
          )}
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        <BarChart
          h={300}
          data={chartData}
          dataKey="label"
          series={[{ name: "volume", color: "blue.6" }]}
          tickLine="y"
          gridAxis="xy"
          withTooltip
          withLegend={false}
          valueFormatter={(value) => formatVolume(value)}
        />

        {/* Stats summary */}
        <Group justify="space-between" mt="md" pt="md" className={styles.statsSummary}>
          <Stack gap={0}>
            <Text size="sm" c="dimmed">
              Avg Volume
            </Text>
            <Text fw={500}>{formatVolume(Math.round(avgVolume))}</Text>
          </Stack>
          <Stack gap={0} ta="right">
            <Text size="sm" c="dimmed">
              This Week
            </Text>
            <Text fw={500}>{formatVolume(lastWeekVolume)}</Text>
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}
