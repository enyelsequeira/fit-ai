/**
 * Tab content components for Analytics view
 * Contains VolumeTabContent, StrengthTabContent, and ConsistencyTabContent
 */

import type { useAnalyticsData } from "./use-analytics-data";

import { Box, Stack } from "@mantine/core";

import { VolumeTrendsChart } from "./volume-trends-chart";
import { MuscleVolumeChart } from "./muscle-volume-chart";
import { StrengthTrendsChart } from "./strength-trends-chart";
import { ConsistencyMetrics } from "./consistency-metrics";

import styles from "./analytics-view.module.css";

// Type aliases for cleaner prop definitions
type VolumeData = ReturnType<typeof useAnalyticsData>["volumeData"];
type MuscleVolumeData = ReturnType<typeof useAnalyticsData>["muscleVolumeData"];
type StrengthData = ReturnType<typeof useAnalyticsData>["strengthData"];
type Exercises = ReturnType<typeof useAnalyticsData>["exercises"];
type ConsistencyData = ReturnType<typeof useAnalyticsData>["consistencyData"];

interface VolumeTabContentProps {
  volumeData: VolumeData;
  muscleVolumeData: MuscleVolumeData;
  isLoading: boolean;
}

export function VolumeTabContent({
  volumeData,
  muscleVolumeData,
  isLoading,
}: VolumeTabContentProps) {
  const hasVolumeData = volumeData.length > 0;
  const hasMuscleData = muscleVolumeData.length > 0;

  return (
    <Stack gap="md" data-tab-content="volume">
      <Box className={styles.chartsGrid} data-has-data={String(hasVolumeData || hasMuscleData)}>
        <Box className={styles.chartWrapper} data-chart-type="bar">
          <VolumeTrendsChart data={volumeData} isLoading={isLoading} />
        </Box>
        <Box className={styles.chartWrapper} data-chart-type="pie">
          <MuscleVolumeChart data={muscleVolumeData} isLoading={isLoading} chartType="pie" />
        </Box>
      </Box>

      {hasMuscleData && (
        <Box className={styles.fullWidthChart} data-chart-type="radar">
          <MuscleVolumeChart data={muscleVolumeData} isLoading={isLoading} chartType="radar" />
        </Box>
      )}
    </Stack>
  );
}

interface StrengthTabContentProps {
  strengthData: StrengthData;
  exercises: Exercises;
  selectedExerciseId: number | null;
  onExerciseSelect: (id: number) => void;
  isLoading: boolean;
}

export function StrengthTabContent({
  strengthData,
  exercises,
  selectedExerciseId,
  onExerciseSelect,
  isLoading,
}: StrengthTabContentProps) {
  const hasData = strengthData.length > 0;

  return (
    <Stack gap="md" data-tab-content="strength" data-has-data={String(hasData)}>
      <Box className={styles.chartWrapper} data-chart-type="line">
        <StrengthTrendsChart
          data={strengthData}
          exercises={exercises}
          selectedExerciseId={selectedExerciseId}
          onExerciseSelect={onExerciseSelect}
          isLoading={isLoading}
        />
      </Box>
    </Stack>
  );
}

interface ConsistencyTabContentProps {
  consistencyData: ConsistencyData;
  isLoading: boolean;
}

export function ConsistencyTabContent({ consistencyData, isLoading }: ConsistencyTabContentProps) {
  return (
    <Stack gap="md" data-tab-content="consistency">
      <ConsistencyMetrics data={consistencyData} isLoading={isLoading} />
    </Stack>
  );
}
