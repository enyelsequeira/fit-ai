import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Calendar } from "lucide-react";

import {
  QuickActions,
  RecentPRs,
  RecentWorkouts,
  RecoveryStatus,
  StatsGrid,
  VolumeChart,
  WeightChart,
} from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/functions/get-user";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getReadinessColor(score: number): string {
  if (score >= 70) return "text-green-500 bg-green-500/10";
  if (score >= 40) return "text-yellow-500 bg-yellow-500/10";
  return "text-red-500 bg-red-500/10";
}

function DashboardHeader({
  userName,
  readinessScore,
  isLoading,
}: {
  userName: string;
  readinessScore?: number;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {formatDate()}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-16 w-32" />
        ) : readinessScore !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2",
              getReadinessColor(readinessScore),
            )}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">{readinessScore}</p>
              <p className="text-xs opacity-80">Readiness</p>
            </div>
          </div>
        ) : null}
        <QuickActions />
      </div>
    </div>
  );
}

function DashboardRoute() {
  const { session } = Route.useRouteContext();

  // Fetch all dashboard data
  const consistencyQuery = useQuery(orpc.analytics.getConsistency.queryOptions());
  const weeklySummaryQuery = useQuery(orpc.analytics.getWeeklySummary.queryOptions());
  const volumeTrendsQuery = useQuery(
    orpc.analytics.getVolumeTrends.queryOptions({
      input: { period: "week", weeks: 8 },
    }),
  );
  const workoutHistoryQuery = useQuery(
    orpc.history.getWorkoutHistory.queryOptions({
      input: { limit: 5 },
    }),
  );
  const recentPRsQuery = useQuery(
    orpc.personalRecord.getRecent.queryOptions({
      input: { days: 30 },
    }),
  );
  const prSummaryQuery = useQuery(orpc.personalRecord.getSummary.queryOptions());
  const readinessQuery = useQuery(orpc.recovery.getReadiness.queryOptions());
  const todayCheckInQuery = useQuery(orpc.recovery.getTodayCheckIn.queryOptions());
  const bodyTrendsQuery = useQuery(
    orpc.bodyMeasurement.getTrends.queryOptions({
      input: { period: "month" },
    }),
  );

  const isLoading =
    consistencyQuery.isLoading || weeklySummaryQuery.isLoading || workoutHistoryQuery.isLoading;

  // Extract data for stats grid
  const consistency = consistencyQuery.data;
  const weeklySummary = weeklySummaryQuery.data;
  const prSummary = prSummaryQuery.data;

  // Calculate volume trend comparison (last week vs this week)
  const volumeTrends = volumeTrendsQuery.data?.dataPoints ?? [];
  const thisWeekVolume = volumeTrends[volumeTrends.length - 1]?.totalVolume ?? 0;
  const lastWeekVolume = volumeTrends[volumeTrends.length - 2]?.totalVolume ?? 0;

  // Transform workout history data
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

  // Transform body measurement trends
  const bodyTrends = bodyTrendsQuery.data;

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header with greeting and readiness */}
      <DashboardHeader
        userName={session?.user.name ?? "Athlete"}
        readinessScore={readinessQuery.data?.score}
        isLoading={readinessQuery.isLoading}
      />

      {/* Stats Grid */}
      <StatsGrid
        workoutsThisWeek={consistency?.workoutsThisWeek ?? 0}
        workoutsLastWeek={consistency ? Math.round(consistency.avgWorkoutsPerWeek) : undefined}
        currentStreak={consistency?.currentStreak ?? 0}
        longestStreak={consistency?.longestStreak}
        totalVolumeThisWeek={weeklySummary?.totalVolumeKg ?? thisWeekVolume}
        volumeLastWeek={lastWeekVolume > 0 ? lastWeekVolume : undefined}
        prsThisMonth={prSummary?.recentRecords?.length ?? 0}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Workouts */}
        <RecentWorkouts workouts={recentWorkouts} isLoading={workoutHistoryQuery.isLoading} />

        {/* Recovery Status */}
        <RecoveryStatus
          readiness={readinessQuery.data ?? null}
          todayCheckIn={todayCheckInQuery.data ?? null}
          isLoading={readinessQuery.isLoading || todayCheckInQuery.isLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Volume Trends Chart */}
        <VolumeChart dataPoints={volumeTrends} isLoading={volumeTrendsQuery.isLoading} />

        {/* Weight Trend Chart */}
        <WeightChart
          dataPoints={bodyTrends?.dataPoints ?? []}
          weightChange={bodyTrends?.weightChange ?? null}
          isLoading={bodyTrendsQuery.isLoading}
        />
      </div>

      {/* Recent PRs */}
      <RecentPRs records={recentPRs} isLoading={recentPRsQuery.isLoading} />
    </div>
  );
}
