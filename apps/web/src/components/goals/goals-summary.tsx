/**
 * GoalsSummary - Summary statistics for goals
 * Uses FitAiStatsRow compound component for consistent styling
 */

import { IconChartLine, IconCheck, IconClock, IconTarget } from "@tabler/icons-react";

import { FitAiStatsRow } from "@/components/ui/fit-ai-stats-row/fit-ai-stats-row";

import type { GoalsStats } from "./types";

interface GoalsSummaryProps {
  stats: GoalsStats;
}

export function GoalsSummary({ stats }: GoalsSummaryProps) {
  if (stats.isLoading) {
    return (
      <FitAiStatsRow columns={4}>
        <FitAiStatsRow.Skeleton visible count={4} />
      </FitAiStatsRow>
    );
  }

  return (
    <FitAiStatsRow columns={4}>
      <FitAiStatsRow.Stat color="teal">
        <FitAiStatsRow.StatIcon>
          <IconTarget size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.activeGoals}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Active Goals</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="blue">
        <FitAiStatsRow.StatIcon>
          <IconCheck size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.completedGoals}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Completed</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="green">
        <FitAiStatsRow.StatIcon>
          <IconChartLine size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{Math.round(stats.averageProgress)}%</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Avg Progress</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="orange">
        <FitAiStatsRow.StatIcon>
          <IconClock size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.nearDeadlineCount}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Near Deadline</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>
    </FitAiStatsRow>
  );
}
