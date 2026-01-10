import { IconTrendingUp } from "@tabler/icons-react";

import { Box, Flex, Group, Text, Tooltip } from "@mantine/core";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./volume-chart.module.css";

interface DataPoint {
  periodStart: string;
  totalVolume: number;
}

interface VolumeChartProps {
  dataPoints: DataPoint[];
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

function formatWeekLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function VolumeChart({ dataPoints, isLoading }: VolumeChartProps) {
  if (isLoading) {
    return (
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>
            <Group gap="xs">
              <IconTrendingUp size={20} />
              Volume Trends
            </Group>
          </CardTitle>
          <CardDescription>Weekly training volume (kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex h={192} align="flex-end" justify="space-between" gap="xs">
            {Array.from({ length: 8 }).map((_, i) => (
              <Flex key={i} direction="column" align="center" gap="xs" style={{ flex: 1 }}>
                <Skeleton w="100%" style={{ height: `${Math.random() * 100 + 40}px` }} />
                <Skeleton h={12} w={32} />
              </Flex>
            ))}
          </Flex>
        </CardContent>
      </Card>
    );
  }

  if (dataPoints.length === 0) {
    return (
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>
            <Group gap="xs">
              <IconTrendingUp size={20} />
              Volume Trends
            </Group>
          </CardTitle>
          <CardDescription>Weekly training volume (kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex h={192} align="center" justify="center">
            <Text size="sm" c="dimmed">
              Complete workouts to see volume trends
            </Text>
          </Flex>
        </CardContent>
      </Card>
    );
  }

  const maxVolume = Math.max(...dataPoints.map((d) => d.totalVolume), 1);
  const minBarHeight = 8;

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>
          <Group gap="xs">
            <IconTrendingUp size={20} />
            Volume Trends
          </Group>
        </CardTitle>
        <CardDescription>Weekly training volume (kg)</CardDescription>
      </CardHeader>
      <CardContent>
        <Flex h={192} align="flex-end" justify="space-between" gap="xs">
          {dataPoints.map((point, index) => {
            const heightPercent =
              point.totalVolume > 0
                ? Math.max((point.totalVolume / maxVolume) * 100, minBarHeight)
                : minBarHeight;
            const isLast = index === dataPoints.length - 1;

            return (
              <Flex
                key={point.periodStart}
                direction="column"
                align="center"
                gap="xs"
                style={{ flex: 1 }}
              >
                <Box
                  h={160}
                  w="100%"
                  pos="relative"
                  style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                >
                  <Tooltip label={`${formatVolume(point.totalVolume)} kg`} position="top">
                    <Box
                      w="100%"
                      maw={32}
                      className={`${styles.chartBar} ${isLast ? styles.chartBarCurrent : styles.chartBarPrevious}`}
                      style={{
                        height: `${heightPercent}%`,
                        animationDelay: `${index * 50}ms`,
                      }}
                    />
                  </Tooltip>
                </Box>
                <Text size="xs" c="dimmed">
                  {formatWeekLabel(point.periodStart)}
                </Text>
              </Flex>
            );
          })}
        </Flex>
        {/* Stats summary */}
        {dataPoints.length >= 2 && (
          <Flex
            justify="space-between"
            mt="md"
            pt="md"
            style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
          >
            <Box>
              <Text size="sm" c="dimmed">
                Avg Volume
              </Text>
              <Text fw={500}>
                {formatVolume(
                  Math.round(
                    dataPoints.reduce((sum, d) => sum + d.totalVolume, 0) / dataPoints.length,
                  ),
                )}{" "}
                kg
              </Text>
            </Box>
            <Box ta="right">
              <Text size="sm" c="dimmed">
                This Week
              </Text>
              <Text fw={500}>
                {formatVolume(dataPoints[dataPoints.length - 1]?.totalVolume ?? 0)} kg
              </Text>
            </Box>
          </Flex>
        )}
      </CardContent>
    </Card>
  );
}

export function VolumeChartSkeleton() {
  return <VolumeChart dataPoints={[]} isLoading={true} />;
}
