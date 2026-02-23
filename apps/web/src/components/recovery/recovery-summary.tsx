import { IconActivity, IconClipboardCheck, IconFlame, IconHeartbeat } from "@tabler/icons-react";

import { FitAiStatsRow } from "@/components/ui/fit-ai-stats-row/fit-ai-stats-row";

interface RecoverySummaryProps {
  stats: {
    readinessScore: number;
    hasCheckIn: boolean;
    isLoading: boolean;
  };
}

export function RecoverySummary({ stats }: RecoverySummaryProps) {
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
          <IconHeartbeat size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.readinessScore}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Readiness Score</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color={stats.hasCheckIn ? "green" : "gray"}>
        <FitAiStatsRow.StatIcon>
          <IconClipboardCheck size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>{stats.hasCheckIn ? "Logged" : "Pending"}</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Today&apos;s Status</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="orange">
        <FitAiStatsRow.StatIcon>
          <IconFlame size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>&mdash;</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Check-in Streak</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>

      <FitAiStatsRow.Stat color="blue">
        <FitAiStatsRow.StatIcon>
          <IconActivity size={20} />
        </FitAiStatsRow.StatIcon>
        <FitAiStatsRow.StatValue>&mdash;</FitAiStatsRow.StatValue>
        <FitAiStatsRow.StatLabel>Recovery</FitAiStatsRow.StatLabel>
      </FitAiStatsRow.Stat>
    </FitAiStatsRow>
  );
}
