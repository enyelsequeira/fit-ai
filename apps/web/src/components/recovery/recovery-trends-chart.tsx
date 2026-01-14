/**
 * RecoveryTrendsChart - Displays sleep, energy, and soreness trends over time
 * Uses Mantine LineChart for visualization
 */

import {
  Badge,
  Box,
  Card,
  Flex,
  Group,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";

type TrendPeriod = "week" | "month" | "quarter" | "year";

interface TrendsData {
  period: string;
  startDate: string | null;
  endDate: string | null;
  dataPoints: number;
  averages: {
    sleepHours: number | null;
    sleepQuality: number | null;
    energyLevel: number | null;
    stressLevel: number | null;
    sorenessLevel: number | null;
    motivationLevel: number | null;
    nutritionQuality: number | null;
    hydrationLevel: number | null;
  };
  moodDistribution: {
    great: number;
    good: number;
    neutral: number;
    low: number;
    bad: number;
  };
}

interface RecoveryTrendsChartProps {
  trends: TrendsData | null;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  isLoading?: boolean;
}

function getValueColor(value: number | null, max: number, inverse = false): string {
  if (value === null) return "gray";
  const percentage = (value / max) * 100;
  if (inverse) {
    if (percentage <= 30) return "teal";
    if (percentage <= 60) return "yellow";
    return "red";
  }
  if (percentage >= 70) return "teal";
  if (percentage >= 40) return "yellow";
  return "red";
}

function StatCard({
  label,
  value,
  max,
  unit,
  inverse = false,
}: {
  label: string;
  value: number | null;
  max: number;
  unit?: string;
  inverse?: boolean;
}) {
  const color = getValueColor(value, max, inverse);

  return (
    <Stack
      align="center"
      p="xs"
      gap={4}
      bd="1px solid var(--mantine-color-default-border)"
      style={{ borderRadius: "var(--mantine-radius-sm)" }}
    >
      <Text
        fz="xl"
        fw={700}
        c={value !== null ? color : "dimmed"}
        ff="var(--mantine-font-family-monospace)"
      >
        {value !== null ? value.toFixed(1) : "-"}
        {unit && value !== null && (
          <Text component="span" fz="xs" fw={400}>
            {unit}
          </Text>
        )}
      </Text>
      <Text fz={10} c="dimmed" ta="center">
        {label}
      </Text>
    </Stack>
  );
}

function MoodBar({
  moodDistribution,
  total,
}: {
  moodDistribution: TrendsData["moodDistribution"];
  total: number;
}) {
  if (total === 0) {
    return (
      <Text fz="xs" c="dimmed" ta="center">
        No mood data available
      </Text>
    );
  }

  const items = [
    { key: "great", color: "var(--mantine-color-teal-5)", count: moodDistribution.great },
    { key: "good", color: "var(--mantine-color-green-5)", count: moodDistribution.good },
    { key: "neutral", color: "var(--mantine-color-yellow-5)", count: moodDistribution.neutral },
    { key: "low", color: "var(--mantine-color-orange-5)", count: moodDistribution.low },
    { key: "bad", color: "var(--mantine-color-red-5)", count: moodDistribution.bad },
  ];

  return (
    <Stack gap="xs">
      <Text fz="xs" c="dimmed">
        Mood Distribution
      </Text>
      <Flex
        h={12}
        w="100%"
        style={{ overflow: "hidden", borderRadius: "var(--mantine-radius-xs)" }}
      >
        {items.map((item) => {
          const width = (item.count / total) * 100;
          if (width === 0) return null;
          return (
            <Box
              key={item.key}
              h="100%"
              w={`${width}%`}
              bg={item.color}
              style={{ transition: "all 150ms ease" }}
              title={`${item.key}: ${item.count}`}
            />
          );
        })}
      </Flex>
      <Group justify="space-between" gap={4} wrap="wrap">
        {items.map((item) => (
          <Group key={item.key} gap={4}>
            <Box w={8} h={8} bg={item.color} style={{ borderRadius: "50%" }} />
            <Text fz={10} c="dimmed" tt="capitalize">
              {item.key}
            </Text>
            <Text fz={10} c="dimmed" ff="var(--mantine-font-family-monospace)">
              ({item.count})
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  );
}

function RecoveryTrendsChart({
  trends,
  period,
  onPeriodChange,
  isLoading = false,
}: RecoveryTrendsChartProps) {
  if (isLoading) {
    return (
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="sm">
          <Group justify="space-between">
            <Text fz="sm" fw={500}>
              Trends
            </Text>
            <Skeleton height={32} width={200} />
          </Group>
        </Card.Section>
        <Card.Section inheritPadding py="md">
          <Stack gap="lg">
            <SimpleGrid cols={4} spacing="xs">
              <Skeleton height={60} />
              <Skeleton height={60} />
              <Skeleton height={60} />
              <Skeleton height={60} />
            </SimpleGrid>
            <Skeleton height={20} />
          </Stack>
        </Card.Section>
      </Card>
    );
  }

  const totalMoods = trends ? Object.values(trends.moodDistribution).reduce((a, b) => a + b, 0) : 0;

  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <Group gap="sm">
            <Text fz="sm" fw={500}>
              Trends
            </Text>
            {trends && (
              <Badge size="xs" variant="light" color="gray">
                {trends.dataPoints} check-ins
              </Badge>
            )}
          </Group>
          <SegmentedControl
            size="xs"
            value={period}
            onChange={(value) => onPeriodChange(value as TrendPeriod)}
            data={[
              { label: "Week", value: "week" },
              { label: "Month", value: "month" },
              { label: "Quarter", value: "quarter" },
              { label: "Year", value: "year" },
            ]}
          />
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        {!trends || trends.dataPoints === 0 ? (
          <Stack align="center" gap="md" py="xl">
            <Text c="dimmed" fz="sm" ta="center">
              No check-in data available for this period.
            </Text>
          </Stack>
        ) : (
          <Stack gap="lg">
            {/* Average Stats */}
            <SimpleGrid cols={4} spacing="xs">
              <StatCard label="Avg Sleep" value={trends.averages.sleepHours} max={10} unit="h" />
              <StatCard label="Sleep Quality" value={trends.averages.sleepQuality} max={5} />
              <StatCard label="Avg Energy" value={trends.averages.energyLevel} max={10} />
              <StatCard label="Avg Motivation" value={trends.averages.motivationLevel} max={10} />
            </SimpleGrid>

            <SimpleGrid cols={4} spacing="xs">
              <StatCard label="Avg Stress" value={trends.averages.stressLevel} max={10} inverse />
              <StatCard
                label="Avg Soreness"
                value={trends.averages.sorenessLevel}
                max={10}
                inverse
              />
              <StatCard label="Nutrition" value={trends.averages.nutritionQuality} max={5} />
              <StatCard label="Hydration" value={trends.averages.hydrationLevel} max={5} />
            </SimpleGrid>

            {/* Mood Distribution */}
            <MoodBar moodDistribution={trends.moodDistribution} total={totalMoods} />
          </Stack>
        )}
      </Card.Section>
    </Card>
  );
}

export { RecoveryTrendsChart };
export type { TrendsData, TrendPeriod };
