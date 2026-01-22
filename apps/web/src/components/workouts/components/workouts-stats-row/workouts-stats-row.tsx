import { IconBarbell, IconCalendarWeek, IconCheck, IconPlayerPlay } from "@tabler/icons-react";

import { FitAiStatsRow } from "@/components/ui/fit-ai-stats-row/fit-ai-stats-row";

type WorkoutsStatsRowProps = {
  stats: {
    totalWorkouts: number;
    completedWorkouts: number;
    inProgressWorkouts: number;
    thisWeekCount: number;
    isLoading: boolean;
  };
  isLoading?: boolean;
};

export function WorkoutsStatsRow({ stats, isLoading }: WorkoutsStatsRowProps) {
  const loading = isLoading || stats.isLoading;

  if (loading) {
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
          <IconBarbell size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.totalWorkouts}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Total Workouts</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="green">
        <FitAiStatsRow.StatIcon>
          <IconCheck size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.completedWorkouts}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Completed</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="orange">
        <FitAiStatsRow.StatIcon>
          <IconPlayerPlay size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.inProgressWorkouts}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>In Progress</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="blue">
        <FitAiStatsRow.StatIcon>
          <IconCalendarWeek size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.thisWeekCount}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>This Week</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>
    </FitAiStatsRow>
  );
}
