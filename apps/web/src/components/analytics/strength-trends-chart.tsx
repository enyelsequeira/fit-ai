/**
 * StrengthTrendsChart - Displays strength progress for selected exercises
 * Uses Mantine LineChart for rendering.
 */

import { IconTrendingUp } from "@tabler/icons-react";
import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { LineChart } from "@mantine/charts";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import type { StrengthDataPoint } from "./use-analytics-data";

import styles from "./analytics-view.module.css";

interface Exercise {
  id: number;
  name: string;
}

interface StrengthTrendsChartProps {
  data: StrengthDataPoint[];
  exercises: Exercise[];
  selectedExerciseId: number | null;
  onExerciseSelect: (id: number) => void;
  isLoading?: boolean;
}

export function StrengthTrendsChart({
  data,
  exercises,
  selectedExerciseId,
  onExerciseSelect,
  isLoading,
}: StrengthTrendsChartProps) {
  const hasData = data.length > 0;
  const hasExerciseSelected = selectedExerciseId !== null;

  const improvement = (() => {
    if (data.length < 2) return null;
    const firstOneRM = data[0]?.oneRM ?? 0;
    const lastOneRM = data[data.length - 1]?.oneRM ?? 0;
    if (firstOneRM === 0) return null;
    return ((lastOneRM - firstOneRM) / firstOneRM) * 100;
  })();

  return (
    <FitAiCard
      className={`${styles.chartCard} ${styles.fullWidthChart}`}
      data-chart-type="line"
      data-has-data={String(hasData)}
      data-has-selection={String(hasExerciseSelected)}
    >
      <FitAiCardHeader>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <Box>
            <FitAiCardTitle>
              <Group gap="xs">
                <IconTrendingUp size={20} />
                Strength Progress
              </Group>
            </FitAiCardTitle>
            <FitAiCardDescription>Estimated 1RM and max weight over time</FitAiCardDescription>
          </Box>
          {improvement !== null && (
            <Text size="sm" fw={500} c={improvement >= 0 ? "teal" : "red"}>
              {improvement >= 0 ? "+" : ""}
              {improvement.toFixed(1)}% improvement
            </Text>
          )}
        </Group>
      </FitAiCardHeader>
      <FitAiCardContent>
        {/* Exercise selector */}
        <Stack gap="xs" mb="md">
          <Text size="sm" fw={500}>
            Select Exercise
          </Text>
          <Group gap="xs" wrap="wrap">
            {exercises.length === 0 ? (
              <Text size="xs" c="dimmed">
                No exercises with recorded data
              </Text>
            ) : (
              exercises.slice(0, 10).map((exercise) => (
                <Button
                  key={exercise.id}
                  size="xs"
                  variant={selectedExerciseId === exercise.id ? "filled" : "light"}
                  onClick={() => onExerciseSelect(exercise.id)}
                  data-selected={selectedExerciseId === exercise.id}
                >
                  {exercise.name}
                </Button>
              ))
            )}
            {exercises.length > 10 && (
              <Text size="xs" c="dimmed" style={{ alignSelf: "center" }}>
                +{exercises.length - 10} more
              </Text>
            )}
          </Group>
        </Stack>

        {/* Chart */}
        {isLoading ? (
          <Box className={styles.chartContainer} data-loading="true" data-has-data="false">
            <Skeleton w="100%" h="100%" />
          </Box>
        ) : !hasExerciseSelected ? (
          <EmptyState
            icon={<IconTrendingUp size={48} stroke={1.5} />}
            title="No exercise selected"
            message="Select an exercise to view strength progression"
          />
        ) : !hasData ? (
          <EmptyState
            icon={<IconTrendingUp size={48} stroke={1.5} />}
            title="No data available"
            message="Complete more workouts with this exercise to track progress"
          />
        ) : (
          <LineChart
            h={300}
            data={data}
            dataKey="date"
            series={[
              { name: "oneRM", color: "blue.6", label: "Est. 1RM" },
              { name: "maxWeight", color: "gray.5", label: "Max Weight" },
            ]}
            curveType="monotone"
            withLegend
            withDots
            withTooltip
            gridAxis="xy"
            valueFormatter={(value) => `${value.toFixed(1)} kg`}
          />
        )}

        {/* Stats summary */}
        {hasData && hasExerciseSelected && data.length >= 2 && (
          <Group justify="space-between" mt="md" pt="md" className={styles.statsSummary}>
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Starting 1RM
              </Text>
              <Text fw={500}>{(data[0]?.oneRM ?? 0).toFixed(1)} kg</Text>
            </Stack>
            <Stack gap={0} ta="center">
              <Text size="sm" c="dimmed">
                Best 1RM
              </Text>
              <Text fw={500}>{Math.max(...data.map((d) => d.oneRM)).toFixed(1)} kg</Text>
            </Stack>
            <Stack gap={0} ta="right">
              <Text size="sm" c="dimmed">
                Current 1RM
              </Text>
              <Text fw={500}>{(data[data.length - 1]?.oneRM ?? 0).toFixed(1)} kg</Text>
            </Stack>
          </Group>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}
