/**
 * MuscleVolumeChart - Displays volume distribution by muscle group
 */

import { IconActivity } from "@tabler/icons-react";
import { Box, Group, Stack, Text } from "@mantine/core";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import type { MuscleVolumeData } from "./use-analytics-data";

import styles from "./analytics-view.module.css";

interface MuscleVolumeChartProps {
  data: MuscleVolumeData[];
  isLoading?: boolean;
  chartType?: "pie" | "radar";
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

export function MuscleVolumeChart({ data, isLoading, chartType = "pie" }: MuscleVolumeChartProps) {
  const hasData = data.length > 0;

  if (isLoading) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconActivity size={20} />
              Volume by Muscle Group
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Distribution of training volume</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Box
            className={styles.chartContainer}
            data-chart-type={chartType}
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
              <IconActivity size={20} />
              Volume by Muscle Group
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Distribution of training volume</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState
            icon={<IconActivity size={48} stroke={1.5} />}
            title="No muscle data"
            message="Complete workouts to see muscle volume distribution"
          />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  const totalVolume = data.reduce((sum, d) => sum + d.value, 0);

  // For radar chart, normalize the data
  const radarData = data.map((item) => ({
    ...item,
    fullMark: Math.max(...data.map((d) => d.value)),
  }));

  return (
    <FitAiCard
      className={styles.chartCard}
      data-chart-type={chartType}
      data-has-data={String(hasData)}
    >
      <FitAiCardHeader>
        <FitAiCardTitle>
          <Group gap="xs">
            <IconActivity size={20} />
            Volume by Muscle Group
          </Group>
        </FitAiCardTitle>
        <FitAiCardDescription>Total: {formatVolume(totalVolume)} kg</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Group className={styles.muscleChart} gap="md" align="center" wrap="wrap">
          <Box
            w={200}
            h={200}
            style={{ flexShrink: 0 }}
            data-chart-type={chartType}
            data-has-data={String(hasData)}
            data-loading="false"
          >
            {chartType === "radar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                  <PolarGrid stroke="var(--mantine-color-default-border)" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--mantine-color-dimmed)" }}
                  />
                  <PolarRadiusAxis tick={{ fontSize: 8 }} />
                  <Radar
                    name="Volume"
                    dataKey="value"
                    stroke="var(--mantine-color-blue-6)"
                    fill="var(--mantine-color-blue-6)"
                    fillOpacity={0.3}
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
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>

          {/* Legend */}
          <Stack gap="xs" flex={1} maw={300}>
            {data.slice(0, 8).map((item) => {
              const percentage = totalVolume > 0 ? (item.value / totalVolume) * 100 : 0;
              return (
                <Group key={item.name} justify="space-between" gap="xs" wrap="nowrap">
                  <Group align="center" gap="xs" wrap="nowrap">
                    <Box
                      w={8}
                      h={8}
                      style={{
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    />
                    <Text size="xs">{item.name}</Text>
                  </Group>
                  <Group gap="xs" align="center" wrap="nowrap">
                    <Text size="xs" fw={500}>
                      {formatVolume(item.value)} kg
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({percentage.toFixed(1)}%)
                    </Text>
                  </Group>
                </Group>
              );
            })}
            {data.length > 8 && (
              <Text size="xs" c="dimmed" mt="xs">
                +{data.length - 8} more muscle groups
              </Text>
            )}
          </Stack>
        </Group>
      </FitAiCardContent>
    </FitAiCard>
  );
}
