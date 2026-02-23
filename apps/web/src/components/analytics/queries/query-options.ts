import { orpc } from "@/utils/orpc";

export function weeklySummaryOptions() {
  return orpc.analytics.getWeeklySummary.queryOptions();
}

export function volumeTrendsOptions(params?: { period?: "week" | "month"; weeks?: number }) {
  return orpc.analytics.getVolumeTrends.queryOptions({
    input: { period: params?.period ?? "week", weeks: params?.weeks ?? 12 },
  });
}

export function volumeByMuscleOptions(params?: {
  days?: number;
  startDate?: string;
  endDate?: string;
}) {
  return orpc.analytics.getVolumeByMuscle.queryOptions({
    input: {
      days: params?.days ?? 30,
      startDate: params?.startDate,
      endDate: params?.endDate,
    },
  });
}

export function strengthTrendsOptions(params: { exerciseId: number; weeks?: number }) {
  return orpc.analytics.getStrengthTrends.queryOptions({
    input: { exerciseId: params.exerciseId, weeks: params.weeks ?? 12 },
  });
}

export function consistencyOptions() {
  return orpc.analytics.getConsistency.queryOptions();
}

export function goalAnalyticsOptions(params?: { days?: number }) {
  return orpc.analytics.getGoalAnalytics.queryOptions({
    input: { days: params?.days ?? 90 },
  });
}

export function recoveryTrendsOptions(params?: { days?: number }) {
  return orpc.analytics.getRecoveryTrends.queryOptions({
    input: { days: params?.days ?? 30 },
  });
}
