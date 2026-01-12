import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

/**
 * Custom hook that consolidates all dashboard data fetching
 * Groups queries by priority for better UX
 */
export function useDashboardData() {
  // Group 1: High priority - Stats and readiness
  const consistencyQuery = useQuery(orpc.analytics.getConsistency.queryOptions());
  const weeklySummaryQuery = useQuery(orpc.analytics.getWeeklySummary.queryOptions());
  const readinessQuery = useQuery(orpc.recovery.getReadiness.queryOptions());

  // Group 2: Activity data
  const workoutHistoryQuery = useQuery(
    orpc.history.getWorkoutHistory.queryOptions({
      input: { limit: 5 },
    }),
  );

  const todayCheckInQuery = useQuery(orpc.recovery.getTodayCheckIn.queryOptions());

  // Group 3: Chart data
  const volumeTrendsQuery = useQuery(
    orpc.analytics.getVolumeTrends.queryOptions({
      input: { period: "week", weeks: 8 },
    }),
  );

  const bodyTrendsQuery = useQuery(
    orpc.bodyMeasurement.getTrends.queryOptions({
      input: { period: "month" },
    }),
  );

  // Group 4: PR data
  const recentPRsQuery = useQuery(
    orpc.personalRecord.getRecent.queryOptions({
      input: { days: 30 },
    }),
  );

  const prSummaryQuery = useQuery(orpc.personalRecord.getSummary.queryOptions());

  // Computed loading states
  const isInitialLoading =
    consistencyQuery.isLoading || weeklySummaryQuery.isLoading || workoutHistoryQuery.isLoading;

  const isFullyLoaded =
    !consistencyQuery.isLoading &&
    !weeklySummaryQuery.isLoading &&
    !workoutHistoryQuery.isLoading &&
    !volumeTrendsQuery.isLoading &&
    !bodyTrendsQuery.isLoading &&
    !recentPRsQuery.isLoading &&
    !readinessQuery.isLoading;

  // Extract and transform data
  const consistency = consistencyQuery.data;
  const weeklySummary = weeklySummaryQuery.data;
  const prSummary = prSummaryQuery.data;

  // Calculate volume trend comparison
  const volumeTrends = volumeTrendsQuery.data?.dataPoints ?? [];
  const thisWeekVolume = volumeTrends[volumeTrends.length - 1]?.totalVolume ?? 0;
  const lastWeekVolume = volumeTrends[volumeTrends.length - 2]?.totalVolume ?? 0;

  // Transform workout history
  const recentWorkouts =
    workoutHistoryQuery.data?.workouts.map((w) => ({
      id: w.id,
      name: w.name,
      date: w.date,
      duration: w.duration,
      exerciseCount: w.exerciseCount,
      setCount: w.setCount,
      totalVolume: w.totalVolume,
    })) ?? [];

  // Transform PR data
  const recentPRs =
    recentPRsQuery.data?.map((pr) => ({
      id: pr.id,
      exerciseName: pr.exercise?.name ?? "Unknown Exercise",
      recordType: pr.recordType,
      value: pr.value,
      displayUnit: pr.displayUnit,
      achievedAt: pr.achievedAt,
    })) ?? [];

  // Body trends
  const bodyTrends = bodyTrendsQuery.data;

  return {
    // Loading states
    isInitialLoading,
    isFullyLoaded,

    // Stats data
    stats: {
      workoutsThisWeek: consistency?.workoutsThisWeek ?? 0,
      workoutsLastWeek: consistency ? Math.round(consistency.avgWorkoutsPerWeek) : undefined,
      currentStreak: consistency?.currentStreak ?? 0,
      longestStreak: consistency?.longestStreak,
      totalVolumeThisWeek: weeklySummary?.totalVolumeKg ?? thisWeekVolume,
      volumeLastWeek: lastWeekVolume > 0 ? lastWeekVolume : undefined,
      prsThisMonth: prSummary?.recentRecords?.length ?? 0,
      isLoading: consistencyQuery.isLoading || weeklySummaryQuery.isLoading,
    },

    // Recovery data
    recovery: {
      readiness: readinessQuery.data ?? null,
      todayCheckIn: todayCheckInQuery.data ?? null,
      isLoading: readinessQuery.isLoading || todayCheckInQuery.isLoading,
    },

    // Activity data
    activity: {
      recentWorkouts,
      isLoading: workoutHistoryQuery.isLoading,
    },

    // Chart data
    charts: {
      volumeTrends,
      volumeIsLoading: volumeTrendsQuery.isLoading,
      bodyTrends: {
        dataPoints: bodyTrends?.dataPoints ?? [],
        weightChange: bodyTrends?.weightChange ?? null,
      },
      bodyIsLoading: bodyTrendsQuery.isLoading,
    },

    // PR data
    prs: {
      recentPRs,
      isLoading: recentPRsQuery.isLoading,
    },

    // Raw query objects for advanced use cases
    queries: {
      consistency: consistencyQuery,
      weeklySummary: weeklySummaryQuery,
      readiness: readinessQuery,
      workoutHistory: workoutHistoryQuery,
      todayCheckIn: todayCheckInQuery,
      volumeTrends: volumeTrendsQuery,
      bodyTrends: bodyTrendsQuery,
      recentPRs: recentPRsQuery,
      prSummary: prSummaryQuery,
    },
  };
}
