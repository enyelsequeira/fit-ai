import { IconBarbell, IconFlame, IconMedal, IconTrophy } from "@tabler/icons-react";

import { FitAiStatsRow } from "@/components/ui/fit-ai-stats-row/fit-ai-stats-row";

interface RecordsSummaryProps {
  stats: {
    totalRecords: number;
    exercisesWithRecords: number;
    prsThisMonth: number;
    countByType: Record<string, number>;
    isLoading: boolean;
  };
}

export function RecordsSummary({ stats }: RecordsSummaryProps) {
  if (stats.isLoading) {
    return (
      <FitAiStatsRow columns={4}>
        <FitAiStatsRow.Skeleton visible count={4} />
      </FitAiStatsRow>
    );
  }

  const strengthPRs =
    (stats.countByType["one_rep_max"] ?? 0) + (stats.countByType["max_weight"] ?? 0);

  return (
    <FitAiStatsRow columns={4}>
      <FitAiStatsRow.Stat color="yellow">
        <FitAiStatsRow.StatIcon>
          <IconTrophy size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.totalRecords}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Total PRs</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="blue">
        <FitAiStatsRow.StatIcon>
          <IconBarbell size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.exercisesWithRecords}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Exercises</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="orange">
        <FitAiStatsRow.StatIcon>
          <IconFlame size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.prsThisMonth}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>This Month</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="cyan">
        <FitAiStatsRow.StatIcon>
          <IconMedal size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{strengthPRs}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Strength PRs</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>
    </FitAiStatsRow>
  );
}
