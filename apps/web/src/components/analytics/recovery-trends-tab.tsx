/**
 * RecoveryTrendsTab - Displays recovery/wellness trends from daily check-in data
 * Shows stat cards for averages, a multi-series line chart, and sleep detail bar chart
 */

import type { RecoveryData } from "./use-analytics-data";

import { IconActivity, IconBolt, IconBrain, IconMoon } from "@tabler/icons-react";
import { Box, Stack } from "@mantine/core";
import { BarChart, LineChart } from "@mantine/charts";

import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";

import { SummaryCard, SummaryCardSkeleton } from "./summary-card";

import styles from "./analytics-view.module.css";

interface RecoveryTrendsTabProps {
  recoveryData: RecoveryData;
  isLoading: boolean;
}

const RECOVERY_LINE_SERIES = [
  { name: "sleepQuality", color: "blue", label: "Sleep Quality" },
  { name: "energyLevel", color: "yellow.6", label: "Energy" },
  { name: "stressLevel", color: "red.6", label: "Stress" },
  { name: "sorenessLevel", color: "orange.6", label: "Soreness" },
] as const;

const SLEEP_BAR_SERIES = [{ name: "sleepHours", color: "indigo.6", label: "Sleep Hours" }];

function formatAverage(value: number | null, suffix: string): string {
  if (value === null) return "\u2014";
  return `${value}${suffix}`;
}

function RecoveryStatCards({
  averages,
  trends,
  isLoading,
}: {
  averages: RecoveryData["averages"];
  trends: RecoveryData["trends"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Box className={styles.summaryGrid} data-section="recovery-summary">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </Box>
    );
  }

  return (
    <Box className={styles.summaryGrid} data-section="recovery-summary">
      <SummaryCard
        icon={<IconMoon size={20} />}
        iconBg="var(--mantine-color-blue-1)"
        iconColor="var(--mantine-color-blue-6)"
        value={formatAverage(averages.sleepHours, "h")}
        label="Avg Sleep"
        trend={trends.sleepTrend}
      />
      <SummaryCard
        icon={<IconBolt size={20} />}
        iconBg="var(--mantine-color-yellow-1)"
        iconColor="var(--mantine-color-yellow-6)"
        value={formatAverage(averages.energyLevel, "/10")}
        label="Avg Energy"
        trend={trends.energyTrend}
      />
      <SummaryCard
        icon={<IconBrain size={20} />}
        iconBg="var(--mantine-color-red-1)"
        iconColor="var(--mantine-color-red-6)"
        value={formatAverage(averages.stressLevel, "/10")}
        label="Avg Stress"
        trend={trends.stressTrend}
      />
      <SummaryCard
        icon={<IconActivity size={20} />}
        iconBg="var(--mantine-color-orange-1)"
        iconColor="var(--mantine-color-orange-6)"
        value={formatAverage(averages.sorenessLevel, "/10")}
        label="Avg Soreness"
        trend={trends.sorenessTrend}
      />
    </Box>
  );
}

function RecoveryLineChart({
  dataPoints,
  isLoading,
}: {
  dataPoints: RecoveryData["dataPoints"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Recovery Trends Over Time</FitAiCardTitle>
          <FitAiCardDescription>Sleep quality, energy, stress, and soreness</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Skeleton w="100%" h={300} />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  if (dataPoints.length === 0) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Recovery Trends Over Time</FitAiCardTitle>
          <FitAiCardDescription>Sleep quality, energy, stress, and soreness</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <EmptyState
            title="No recovery data"
            message="Complete daily check-ins to see your recovery trends over time"
          />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  const chartData = dataPoints.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    sleepQuality: point.sleepQuality,
    energyLevel: point.energyLevel,
    stressLevel: point.stressLevel,
    sorenessLevel: point.sorenessLevel,
  }));

  return (
    <FitAiCard className={styles.chartCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>Recovery Trends Over Time</FitAiCardTitle>
        <FitAiCardDescription>Sleep quality, energy, stress, and soreness</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <LineChart
          h={300}
          data={chartData}
          dataKey="date"
          series={[...RECOVERY_LINE_SERIES]}
          withLegend
          curveType="monotone"
          withTooltip
          gridAxis="xy"
        />
      </FitAiCardContent>
    </FitAiCard>
  );
}

function SleepDetailsChart({
  dataPoints,
  isLoading,
}: {
  dataPoints: RecoveryData["dataPoints"];
  isLoading: boolean;
}) {
  const sleepData = dataPoints.filter((point) => point.sleepHours !== null);

  if (isLoading) {
    return (
      <FitAiCard className={styles.chartCard}>
        <FitAiCardHeader>
          <FitAiCardTitle>Sleep Duration</FitAiCardTitle>
          <FitAiCardDescription>Hours of sleep per night</FitAiCardDescription>
        </FitAiCardHeader>
        <FitAiCardContent>
          <Skeleton w="100%" h={200} />
        </FitAiCardContent>
      </FitAiCard>
    );
  }

  if (sleepData.length === 0) return null;

  const chartData = sleepData.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    sleepHours: point.sleepHours,
  }));

  const totalSleep = sleepData.reduce((sum, p) => sum + (p.sleepHours ?? 0), 0);
  const avgSleep = sleepData.length > 0 ? (totalSleep / sleepData.length).toFixed(1) : "0";

  return (
    <FitAiCard className={styles.chartCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>Sleep Duration</FitAiCardTitle>
        <FitAiCardDescription>Hours of sleep per night (avg: {avgSleep}h)</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <BarChart
          h={200}
          data={chartData}
          dataKey="date"
          series={SLEEP_BAR_SERIES}
          withTooltip
          gridAxis="xy"
        />
      </FitAiCardContent>
    </FitAiCard>
  );
}

export function RecoveryTrendsTab({ recoveryData, isLoading }: RecoveryTrendsTabProps) {
  const { dataPoints, averages, trends } = recoveryData;

  return (
    <Stack gap="md" data-tab-content="recovery">
      <RecoveryStatCards averages={averages} trends={trends} isLoading={isLoading} />
      <RecoveryLineChart dataPoints={dataPoints} isLoading={isLoading} />
      <SleepDetailsChart dataPoints={dataPoints} isLoading={isLoading} />
    </Stack>
  );
}
