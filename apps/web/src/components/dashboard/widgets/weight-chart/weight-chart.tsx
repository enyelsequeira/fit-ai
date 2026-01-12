import { IconScale, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Box, Flex, Group, Text } from "@mantine/core";

import { Card, FitAiCardContent, FitAiCardDescription, FitAiCardHeader, FitAiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./weight-chart.module.css";

interface DataPoint {
  date: Date;
  weight: number | null;
}

interface WeightChartProps {
  dataPoints: DataPoint[];
  weightChange: number | null;
  isLoading?: boolean;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function WeightChart({ dataPoints, weightChange, isLoading }: WeightChartProps) {
  // Filter to only points with weight data
  const validPoints = dataPoints.filter(
    (d): d is { date: Date; weight: number } => d.weight !== null,
  );

  if (isLoading) {
    return (
      <Card className={styles.card}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconScale size={20} />
              Weight Trend
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Body weight over time</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Flex h={192} align="center" justify="center">
            <Skeleton h={160} w="100%" />
          </Flex>
        </FitAiCardContent>
      </Card>
    );
  }

  if (validPoints.length === 0) {
    return (
      <Card className={styles.card}>
        <FitAiCardHeader>
          <FitAiCardTitle>
            <Group gap="xs">
              <IconScale size={20} />
              Weight Trend
            </Group>
          </FitAiCardTitle>
          <FitAiCardDescription>Body weight over time</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Flex h={192} align="center" justify="center">
            <Text size="sm" c="dimmed">
              Log body measurements to see weight trends
            </Text>
          </Flex>
        </FitAiCardContent>
      </Card>
    );
  }

  const weights = validPoints.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;
  const padding = range * 0.1;

  // Calculate points for SVG path
  const chartWidth = 300;
  const chartHeight = 160;
  const points = validPoints.map((point, index) => {
    const x = (index / (validPoints.length - 1 || 1)) * chartWidth;
    const y =
      chartHeight - ((point.weight - minWeight + padding) / (range + 2 * padding)) * chartHeight;
    return { x, y, ...point };
  });

  // Create SVG path
  const pathData =
    points.length > 0
      ? points.reduce((path, point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
        }, "")
      : "";

  // Create area path (for gradient fill)
  const areaPath =
    points.length > 0 ? `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z` : "";

  const latestWeight = validPoints[validPoints.length - 1]?.weight;

  return (
    <Card className={styles.card}>
      <FitAiCardHeader>
        <FitAiCardTitle>
          <Group gap="xs">
            <IconScale size={20} />
            Weight Trend
          </Group>
        </FitAiCardTitle>
        <FitAiCardDescription>Body weight over time</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        {/* SVG Chart */}
        <Box pos="relative" h={192} className={styles.chartContainer}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: "100%", height: "100%" }}
            preserveAspectRatio="none"
            className={styles.chart}
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--mantine-color-blue-5)" stopOpacity="0.4" />
                <stop offset="50%" stopColor="var(--mantine-color-blue-6)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--mantine-color-blue-6)" stopOpacity="0" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Area fill */}
            <path d={areaPath} fill="url(#weightGradient)" className={styles.areaPath} />
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="var(--mantine-color-blue-5)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className={styles.linePath}
            />
            {/* Points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="var(--mantine-color-body)"
                stroke="var(--mantine-color-blue-5)"
                strokeWidth="2"
                className={styles.dataPoint}
              />
            ))}
          </svg>
          {/* Y-axis labels */}
          <Flex pos="absolute" left={0} top={0} h="100%" direction="column" justify="space-between">
            <Text size="xs" c="dimmed">
              {(maxWeight + padding).toFixed(1)}
            </Text>
            <Text size="xs" c="dimmed">
              {(minWeight - padding).toFixed(1)}
            </Text>
          </Flex>
        </Box>

        {/* X-axis labels */}
        {validPoints.length > 1 && (
          <Flex justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              {formatDate(validPoints[0]!.date)}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(validPoints[validPoints.length - 1]!.date)}
            </Text>
          </Flex>
        )}

        {/* Stats summary */}
        <Flex
          justify="space-between"
          mt="md"
          pt="md"
          style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
        >
          <Box>
            <Text size="sm" c="dimmed">
              Current
            </Text>
            <Text fw={500}>{latestWeight?.toFixed(1)} kg</Text>
          </Box>
          {weightChange !== null && (
            <Box ta="right">
              <Text size="sm" c="dimmed">
                Change
              </Text>
              <Flex
                align="center"
                gap={4}
                justify="flex-end"
                className={
                  weightChange > 0
                    ? styles.trendUp
                    : weightChange < 0
                      ? styles.trendDown
                      : undefined
                }
              >
                {weightChange > 0 ? (
                  <IconTrendingUp size={16} />
                ) : weightChange < 0 ? (
                  <IconTrendingDown size={16} />
                ) : null}
                <Text fw={500} inherit>
                  {weightChange > 0 ? "+" : ""}
                  {weightChange.toFixed(1)} kg
                </Text>
              </Flex>
            </Box>
          )}
        </Flex>
      </FitAiCardContent>
    </Card>
  );
}

export function WeightChartSkeleton() {
  return <WeightChart dataPoints={[]} weightChange={null} isLoading={true} />;
}
