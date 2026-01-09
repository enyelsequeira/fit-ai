import { IconChartBar } from "@tabler/icons-react";

import { Box, Flex, SimpleGrid, Stack, Text } from "@mantine/core";

import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PeriodData {
  workouts: number;
  volume: number;
  prs: number;
  avgDuration: number;
}

interface ComparisonData {
  period1: PeriodData;
  period2: PeriodData;
}

interface PeriodComparisonProps {
  data: ComparisonData | null;
  period1Start: string;
  period1End: string;
  period2Start: string;
  period2End: string;
  onPeriod1StartChange: (value: string) => void;
  onPeriod1EndChange: (value: string) => void;
  onPeriod2StartChange: (value: string) => void;
  onPeriod2EndChange: (value: string) => void;
}

export function PeriodComparison({
  data,
  period1Start,
  period1End,
  period2Start,
  period2End,
  onPeriod1StartChange,
  onPeriod1EndChange,
  onPeriod2StartChange,
  onPeriod2EndChange,
}: PeriodComparisonProps) {
  const metrics = data
    ? [
        { label: "Workouts", p1: data.period1.workouts, p2: data.period2.workouts },
        { label: "Total Volume (kg)", p1: data.period1.volume, p2: data.period2.volume },
        { label: "PRs Achieved", p1: data.period1.prs, p2: data.period2.prs },
        {
          label: "Avg Duration (min)",
          p1: data.period1.avgDuration,
          p2: data.period2.avgDuration,
        },
      ]
    : [];

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Box
          p="sm"
          style={{
            border: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <Stack gap="xs">
            <Label c="dimmed" fz="xs">
              Period 1
            </Label>
            <Flex gap="xs" align="center">
              <Input
                type="date"
                value={period1Start}
                onChange={(e) => onPeriod1StartChange(e.target.value)}
                style={{ flex: 1 }}
              />
              <Text fz="xs" c="dimmed">
                to
              </Text>
              <Input
                type="date"
                value={period1End}
                onChange={(e) => onPeriod1EndChange(e.target.value)}
                style={{ flex: 1 }}
              />
            </Flex>
          </Stack>
        </Box>
        <Box
          p="sm"
          style={{
            border: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <Stack gap="xs">
            <Label c="dimmed" fz="xs">
              Period 2
            </Label>
            <Flex gap="xs" align="center">
              <Input
                type="date"
                value={period2Start}
                onChange={(e) => onPeriod2StartChange(e.target.value)}
                style={{ flex: 1 }}
              />
              <Text fz="xs" c="dimmed">
                to
              </Text>
              <Input
                type="date"
                value={period2End}
                onChange={(e) => onPeriod2EndChange(e.target.value)}
                style={{ flex: 1 }}
              />
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>

      {data ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
          {metrics.map((metric) => {
            const change = metric.p1 > 0 ? ((metric.p2 - metric.p1) / metric.p1) * 100 : 0;
            const isPositive = change > 0;

            return (
              <Box
                key={metric.label}
                p="sm"
                ta="center"
                style={{
                  border: "1px solid var(--mantine-color-default-border)",
                }}
              >
                <Text fz="xs" c="dimmed">
                  {metric.label}
                </Text>
                <Flex align="center" justify="center" gap="md" mt="xs">
                  <Box>
                    <Text fz="lg" fw={700}>
                      {typeof metric.p1 === "number" ? metric.p1.toLocaleString() : metric.p1}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Period 1
                    </Text>
                  </Box>
                  <Text fz="sm" fw={500} c={isPositive ? "green" : change < 0 ? "red" : "dimmed"}>
                    {isPositive ? "+" : ""}
                    {change.toFixed(0)}%
                  </Text>
                  <Box>
                    <Text fz="lg" fw={700}>
                      {typeof metric.p2 === "number" ? metric.p2.toLocaleString() : metric.p2}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Period 2
                    </Text>
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      ) : (
        <EmptyState
          icon={IconChartBar}
          title="No comparison data"
          description="Need at least 2 weeks of data for comparison"
        />
      )}
    </Stack>
  );
}
