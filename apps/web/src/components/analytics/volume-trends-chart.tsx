/**
 * VolumeTrendsChart - Displays training volume trends over time
 */

import { IconChartBar } from "@tabler/icons-react";
import { Box, Group, Stack, Text, Tooltip as MantineTooltip } from "@mantine/core";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import type { VolumeDataPoint } from "./use-analytics-data";

import styles from "./analytics-view.module.css";

interface VolumeTrendsChartProps {
  data: VolumeDataPoint[];
  isLoading?: boolean;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return String(volume);
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
          <Box
            className={styles.chartContainer}
            data-chart-type="bar"
            data-loading="true"
            data-has-data="false"
          >
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

  // Calculate trend
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
        <Box
          className={styles.chartContainer}
          data-chart-type="bar"
          data-has-data={String(hasData)}
          data-loading="false"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={(value) => `${formatVolume(value)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--mantine-color-body)",
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-sm)",
                  fontSize: "12px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") {
                    return [`${value.toLocaleString()} kg`, "Volume"];
                  }
                  return [String(value), "Volume"];
                }}
              />
              <Bar dataKey="volume" fill="var(--mantine-color-blue-6)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Stats summary */}
        <Group justify="space-between" mt="md" pt="md" className={styles.statsSummary}>
          <Stack gap={0}>
            <Text size="sm" c="dimmed">
              Avg Volume
            </Text>
            <Text fw={500}>{formatVolume(Math.round(avgVolume))} kg</Text>
          </Stack>
          <Stack gap={0} ta="right">
            <Text size="sm" c="dimmed">
              This Week
            </Text>
            <Text fw={500}>{formatVolume(lastWeekVolume)} kg</Text>
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}
