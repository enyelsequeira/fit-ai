/**
 * SummaryStatsGrid - Displays a grid of summary stat cards for analytics overview
 */

import {
  IconBarbell,
  IconFlame,
  IconHeart,
  IconTarget,
  IconTrophy,
  IconWeight,
} from "@tabler/icons-react";
import { Box } from "@mantine/core";

import { SummaryCard, SummaryCardSkeleton } from "./summary-card";
import { formatVolume } from "@/components/ui/utils";

import styles from "./analytics-view.module.css";

export interface SummaryStats {
  workoutsThisWeek: number;
  totalVolume: number;
  activeGoals: number;
  currentStreak: number;
  prsAchieved: number;
  recoveryScore: number | null;
}

interface SummaryStatsGridProps {
  stats: SummaryStats;
  isLoading: boolean;
}

export function SummaryStatsGrid({ stats, isLoading }: SummaryStatsGridProps) {
  if (isLoading) {
    return (
      <Box className={styles.summaryGrid} data-section="summary">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
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
        value={stats.workoutsThisWeek}
        label="Workouts This Week"
      />
      <SummaryCard
        icon={<IconWeight size={20} />}
        iconBg="var(--mantine-color-teal-1)"
        iconColor="var(--mantine-color-teal-6)"
        value={formatVolume(stats.totalVolume)}
        label="Total Volume"
      />
      <SummaryCard
        icon={<IconTarget size={20} />}
        iconBg="var(--mantine-color-violet-1)"
        iconColor="var(--mantine-color-violet-6)"
        value={stats.activeGoals}
        label="Active Goals"
      />
      <SummaryCard
        icon={<IconFlame size={20} />}
        iconBg="var(--mantine-color-orange-1)"
        iconColor="var(--mantine-color-orange-6)"
        value={stats.currentStreak}
        label="Current Streak"
      />
      <SummaryCard
        icon={<IconTrophy size={20} />}
        iconBg="var(--mantine-color-pink-1)"
        iconColor="var(--mantine-color-pink-6)"
        value={stats.prsAchieved}
        label="PRs Achieved"
      />
      <SummaryCard
        icon={<IconHeart size={20} />}
        iconBg="var(--mantine-color-green-1)"
        iconColor="var(--mantine-color-green-6)"
        value={stats.recoveryScore !== null ? `${stats.recoveryScore}/10` : "—"}
        label="Recovery Score"
      />
    </Box>
  );
}
