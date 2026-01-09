import { IconScale, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Box, Flex, Group, Text } from "@mantine/core";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <Card>
        <CardHeader>
          <CardTitle>
            <Group gap="xs">
              <IconScale size={20} />
              Weight Trend
            </Group>
          </CardTitle>
          <CardDescription>Body weight over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex h={192} align="center" justify="center">
            <Skeleton h={160} w="100%" />
          </Flex>
        </CardContent>
      </Card>
    );
  }

  if (validPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Group gap="xs">
              <IconScale size={20} />
              Weight Trend
            </Group>
          </CardTitle>
          <CardDescription>Body weight over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex h={192} align="center" justify="center">
            <Text size="sm" c="dimmed">
              Log body measurements to see weight trends
            </Text>
          </Flex>
        </CardContent>
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
    <Card>
      <CardHeader>
        <CardTitle>
          <Group gap="xs">
            <IconScale size={20} />
            Weight Trend
          </Group>
        </CardTitle>
        <CardDescription>Body weight over time</CardDescription>
      </CardHeader>
      <CardContent>
        {/* SVG Chart */}
        <Box pos="relative" h={192}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: "100%", height: "100%" }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--mantine-primary-color-filled)"
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor="var(--mantine-primary-color-filled)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path d={areaPath} fill="url(#weightGradient)" />
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="var(--mantine-primary-color-filled)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="var(--mantine-color-body)"
                stroke="var(--mantine-primary-color-filled)"
                strokeWidth="2"
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
                style={{
                  color:
                    weightChange > 0
                      ? "rgb(249, 115, 22)"
                      : weightChange < 0
                        ? "rgb(34, 197, 94)"
                        : undefined,
                }}
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
      </CardContent>
    </Card>
  );
}

export function WeightChartSkeleton() {
  return <WeightChart dataPoints={[]} weightChange={null} isLoading={true} />;
}
