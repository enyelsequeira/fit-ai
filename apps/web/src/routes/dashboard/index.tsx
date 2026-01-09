import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc.ts";
import { Box, Container, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  QuickActions,
  RecentPRs,
  RecentWorkouts,
  RecoveryStatus,
  StatsGrid,
  VolumeChart,
  WeightChart,
} from "@/components/dashboard";
import { IconCalendar } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
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

function getReadinessStyle(score: number): { color: string; background: string } {
  if (score >= 70) return { color: "rgb(34, 197, 94)", background: "rgba(34, 197, 94, 0.1)" };
  if (score >= 40) return { color: "rgb(234, 179, 8)", background: "rgba(234, 179, 8, 0.1)" };
  return { color: "rgb(239, 68, 68)", background: "rgba(239, 68, 68, 0.1)" };
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
    <Flex
      direction={{ base: "column", md: "row" }}
      align={{ md: "center" }}
      justify={{ md: "space-between" }}
      gap="md"
    >
      <Box>
        <Title order={1} fz={{ base: 24, md: 30 }}>
          {getGreeting()}, {userName}!
        </Title>
        <Flex align="center" gap="xs" c="dimmed">
          <IconCalendar size={16} />
          <Text>{formatDate()}</Text>
        </Flex>
      </Box>
      <Flex align="center" gap="md">
        {isLoading ? (
          <Skeleton h={64} w={128} />
        ) : readinessScore !== undefined ? (
          <Flex
            align="center"
            gap="sm"
            px="md"
            py="xs"
            style={{
              borderRadius: 8,
              ...getReadinessStyle(readinessScore),
            }}
          >
            <Box ta="center">
              <Text fz={24} fw={700}>
                {readinessScore}
              </Text>
              <Text size="xs" style={{ opacity: 0.8 }}>
                Readiness
              </Text>
            </Box>
          </Flex>
        ) : null}
        <QuickActions />
      </Flex>
    </Flex>
  );
}

function RouteComponent() {
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
    <Container p={{ base: "md", md: "lg" }}>
      <Stack gap="lg">
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
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          {/* Recent Workouts */}
          <RecentWorkouts workouts={recentWorkouts} isLoading={workoutHistoryQuery.isLoading} />

          {/* Recovery Status */}
          <RecoveryStatus
            readiness={readinessQuery.data ?? null}
            todayCheckIn={todayCheckInQuery.data ?? null}
            isLoading={readinessQuery.isLoading || todayCheckInQuery.isLoading}
          />
        </SimpleGrid>

        {/* Charts Grid */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          {/* Volume Trends Chart */}
          <VolumeChart dataPoints={volumeTrends} isLoading={volumeTrendsQuery.isLoading} />

          {/* Weight Trend Chart */}
          <WeightChart
            dataPoints={bodyTrends?.dataPoints ?? []}
            weightChange={bodyTrends?.weightChange ?? null}
            isLoading={bodyTrendsQuery.isLoading}
          />
        </SimpleGrid>

        {/* Recent PRs */}
        <RecentPRs records={recentPRs} isLoading={recentPRsQuery.isLoading} />
      </Stack>
    </Container>
  );
}
