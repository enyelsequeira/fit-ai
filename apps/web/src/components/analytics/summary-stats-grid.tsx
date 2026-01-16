/**
 * SummaryStatsGrid - Displays a grid of summary stat cards for weekly analytics
 */

import { IconActivity, IconBarbell, IconFlame, IconWeight } from "@tabler/icons-react";
import { Box } from "@mantine/core";

import { SummaryCard, SummaryCardSkeleton } from "./summary-card";
import { formatVolume } from "./utils";

import styles from "./analytics-view.module.css";

export interface WeeklySummary {
  totalWorkouts: number;
  totalVolume: number;
  totalExercises: number;
  personalRecords: number;
}

interface SummaryStatsGridProps {
  weeklySummary: WeeklySummary;
  isLoading: boolean;
}

export function SummaryStatsGrid({ weeklySummary, isLoading }: SummaryStatsGridProps) {
  if (isLoading) {
    return (
      <Box className={styles.summaryGrid} data-section="summary">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </Box>
    );
  }

  return (
    <Box className={styles.summaryGrid} data-section="summary">
      <SummaryCard
        icon={<IconBarbell size={20} />}
        iconBg="var(--mantine-color-blue-1)"
        iconColor="var(--mantine-color-blue-6)"
        value={weeklySummary.totalWorkouts}
        label="Workouts This Week"
      />
      <SummaryCard
        icon={<IconWeight size={20} />}
        iconBg="var(--mantine-color-teal-1)"
        iconColor="var(--mantine-color-teal-6)"
        value={formatVolume(weeklySummary.totalVolume)}
        label="Total Volume"
      />
      <SummaryCard
        icon={<IconActivity size={20} />}
        iconBg="var(--mantine-color-violet-1)"
        iconColor="var(--mantine-color-violet-6)"
        value={weeklySummary.totalExercises}
        label="Exercises"
      />
      <SummaryCard
        icon={<IconFlame size={20} />}
        iconBg="var(--mantine-color-orange-1)"
        iconColor="var(--mantine-color-orange-6)"
        value={weeklySummary.personalRecords}
        label="Personal Records"
      />
    </Box>
  );
}
