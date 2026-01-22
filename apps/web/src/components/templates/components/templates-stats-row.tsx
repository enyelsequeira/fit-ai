/**
 * TemplatesStatsRow - Displays template statistics using FitAiStatsRow
 * Uses compound component pattern for flexible composition
 */

import { IconFolder, IconSparkles, IconTemplate, IconTrendingUp } from "@tabler/icons-react";

import { FitAiStatsRow } from "@/components/ui/fit-ai-stats-row/fit-ai-stats-row";

type TemplatesStats = {
  totalTemplates: number;
  totalFolders: number;
  publicTemplates: number;
  totalUsage: number;
  isLoading: boolean;
};

type TemplatesStatsRowProps = {
  stats: TemplatesStats;
  isLoading: boolean;
};

export function TemplatesStatsRow({ stats, isLoading }: TemplatesStatsRowProps) {
  if (isLoading) {
    return (
      <FitAiStatsRow columns={4}>
        <FitAiStatsRow.Skeleton visible />
      </FitAiStatsRow>
    );
  }

  return (
    <FitAiStatsRow columns={4}>
      <FitAiStatsRow.Stat color="blue">
        <FitAiStatsRow.StatIcon>
          <IconTemplate size={18} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.totalTemplates}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Templates</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="gray">
        <FitAiStatsRow.StatIcon>
          <IconFolder size={18} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.totalFolders}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Folders</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="teal">
        <FitAiStatsRow.StatIcon>
          <IconTrendingUp size={18} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.totalUsage}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Total Uses</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="orange">
        <FitAiStatsRow.StatIcon>
          <IconSparkles size={18} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.publicTemplates}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Public</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>
    </FitAiStatsRow>
  );
}
