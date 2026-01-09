import type { useQuery } from "@tanstack/react-query";

import { Group, Text } from "@mantine/core";
import { IconTrendingUp } from "@tabler/icons-react";

interface PreviousPerformanceProps {
  lastPerformance: ReturnType<
    typeof useQuery<{
      exerciseId: number;
      exerciseName: string;
      lastWorkoutDate: Date;
      sets: Array<{
        setNumber: number;
        weight: number | null;
        weightUnit: string | null;
        reps: number | null;
        rpe: number | null;
        setType: string | null;
      }>;
      totalVolume: number;
      topSet: { weight: number; reps: number } | null;
    } | null>
  >;
  bestPerformance?: ReturnType<
    typeof useQuery<{
      exerciseId: number;
      exerciseName: string;
      maxWeight: { value: number; reps: number; date: Date } | null;
      maxReps: { value: number; weight: number; date: Date } | null;
      maxVolume: { value: number; date: Date } | null;
      estimated1RM: { value: number; date: Date } | null;
    }>
  >;
  className?: string;
}

function PreviousPerformance({ lastPerformance, bestPerformance }: PreviousPerformanceProps) {
  const last = lastPerformance.data;
  const best = bestPerformance?.data;

  if (lastPerformance.isLoading) {
    return (
      <Text fz="xs" c="dimmed" style={{ animation: "pulse 2s infinite" }}>
        Loading previous performance...
      </Text>
    );
  }

  if (!last?.topSet) {
    return null;
  }

  return (
    <Group gap="md" wrap="wrap">
      <Group gap={6}>
        <Text fz="xs" c="dimmed">
          Last:
        </Text>
        <Text fz="xs" fw={500}>
          {last.topSet.weight}kg x {last.topSet.reps}
        </Text>
        {last.sets.find((s) => s.setNumber === 1)?.rpe && (
          <Text fz="xs" c="dimmed">
            (RPE {last.sets.find((s) => s.setNumber === 1)?.rpe})
          </Text>
        )}
      </Group>

      {best?.maxWeight && (
        <Group gap={6}>
          <IconTrendingUp
            style={{ width: 12, height: 12, color: "var(--mantine-color-green-5)" }}
          />
          <Text fz="xs" c="dimmed">
            Best:
          </Text>
          <Text fz="xs" fw={500}>
            {best.maxWeight.value}kg x {best.maxWeight.reps}
          </Text>
        </Group>
      )}
    </Group>
  );
}

interface SimplePreviousPerformanceProps {
  lastWeight?: number | null;
  lastReps?: number | null;
  lastRpe?: number | null;
  bestWeight?: number | null;
  bestReps?: number | null;
  className?: string;
}

function SimplePreviousPerformance({
  lastWeight,
  lastReps,
  lastRpe,
  bestWeight,
  bestReps,
}: SimplePreviousPerformanceProps) {
  if (!lastWeight && !lastReps) {
    return null;
  }

  return (
    <Group gap="md" wrap="wrap">
      {lastWeight && lastReps && (
        <Group gap={6}>
          <Text fz="xs" c="dimmed">
            Last:
          </Text>
          <Text fz="xs" fw={500}>
            {lastWeight}kg x {lastReps}
          </Text>
          {lastRpe && (
            <Text fz="xs" c="dimmed">
              (RPE {lastRpe})
            </Text>
          )}
        </Group>
      )}

      {bestWeight && bestReps && (
        <Group gap={6}>
          <IconTrendingUp
            style={{ width: 12, height: 12, color: "var(--mantine-color-green-5)" }}
          />
          <Text fz="xs" c="dimmed">
            Best:
          </Text>
          <Text fz="xs" fw={500}>
            {bestWeight}kg x {bestReps}
          </Text>
        </Group>
      )}
    </Group>
  );
}

export { PreviousPerformance, SimplePreviousPerformance };
