import { Badge, Box, Card, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";

interface TrendsData {
  period: string;
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

interface RecoveryTrendsProps {
  trends: TrendsData;
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
  if (value === null) return null;

  const percentage = (value / max) * 100;
  const getColor = () => {
    if (inverse) {
      if (value <= max * 0.3) return "teal";
      if (value <= max * 0.6) return "yellow";
      return "red";
    }
    if (percentage >= 70) return "teal";
    if (percentage >= 40) return "yellow";
    return "red";
  };

  return (
    <Stack
      align="center"
      p="xs"
      gap={4}
      style={{ border: "1px solid var(--mantine-color-default-border)" }}
    >
      <Text fz="xl" fw={700} c={getColor()} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value.toFixed(1)}
        {unit && (
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
  if (total === 0) return null;

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
      <Flex h={12} w="100%" style={{ overflow: "hidden" }}>
        {items.map((item) => {
          const width = (item.count / total) * 100;
          if (width === 0) return null;
          return (
            <Box
              key={item.key}
              h="100%"
              style={{
                width: `${width}%`,
                backgroundColor: item.color,
                transition: "all 150ms ease",
              }}
              title={`${item.key}: ${item.count}`}
            />
          );
        })}
      </Flex>
      <Group justify="space-between" gap={4}>
        {items.map((item) => (
          <Group key={item.key} gap={4}>
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
            <Text fz={10} c="dimmed" tt="capitalize">
              {item.key}
            </Text>
            <Text fz={10} c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
              ({item.count})
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  );
}

function RecoveryTrends({ trends }: RecoveryTrendsProps) {
  const totalMoods = Object.values(trends.moodDistribution).reduce((a, b) => a + b, 0);

  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <Text fz="sm" fw={500}>
            Trends ({trends.period})
          </Text>
          <Text fz="xs" c="dimmed">
            {trends.dataPoints} check-ins
          </Text>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="md">
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
            <StatCard label="Avg Soreness" value={trends.averages.sorenessLevel} max={10} inverse />
            <StatCard label="Nutrition" value={trends.averages.nutritionQuality} max={5} />
            <StatCard label="Hydration" value={trends.averages.hydrationLevel} max={5} />
          </SimpleGrid>

          {/* Mood Distribution */}
          <MoodBar moodDistribution={trends.moodDistribution} total={totalMoods} />
        </Stack>
      </Card.Section>
    </Card>
  );
}

export { RecoveryTrends };
export type { TrendsData };
