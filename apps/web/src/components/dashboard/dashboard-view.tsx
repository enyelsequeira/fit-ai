import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

import { Box, SimpleGrid, Stack } from "@mantine/core";

import { useDashboardData } from "./shared/use-dashboard-data";
import { AIInsights } from "./widgets/ai-insights/ai-insights";
import { GoalsProgress } from "./widgets/goals-progress/goals-progress";
import { MuscleBalance } from "./widgets/muscle-balance/muscle-balance";
import { RecentPRs } from "./widgets/recent-prs/recent-prs";
import { RecentWorkouts } from "./widgets/recent-workouts/recent-workouts";
import { RecoveryStatus } from "./widgets/recovery-status/recovery-status";
import { StatsOverview } from "./widgets/stats-overview/stats-overview";
import { VolumeChart } from "./widgets/volume-chart/volume-chart";
import { WeightChart } from "./widgets/weight-chart/weight-chart";
import { WorkoutFrequency } from "./widgets/workout-frequency/workout-frequency";

import styles from "./dashboard.module.css";

export function DashboardView() {
  // Get session from route context
  const context = useRouteContext({ from: "/dashboard/" });
  const session = context?.session;

  // Fetch all dashboard data using the consolidated hook
  const dashboardData = useDashboardData();

  // State for muscle balance period
  const [muscleBalancePeriod, setMuscleBalancePeriod] = useState<"week" | "month">("week");

  return (
    <Box p={{ base: "sm", md: "md" }} className={styles.dashboardContainer}>
      <Stack gap="md">
        {/* Stats Grid */}
        <Box className={styles.statsSection}>
          <StatsOverview
            workoutsThisWeek={dashboardData.stats.workoutsThisWeek}
            workoutsLastWeek={dashboardData.stats.workoutsLastWeek}
            currentStreak={dashboardData.stats.currentStreak}
            longestStreak={dashboardData.stats.longestStreak}
            totalVolumeThisWeek={dashboardData.stats.totalVolumeThisWeek}
            volumeLastWeek={dashboardData.stats.volumeLastWeek}
            prsThisMonth={dashboardData.stats.prsThisMonth}
            isLoading={dashboardData.stats.isLoading}
          />
        </Box>

        {/* Main Content Grid - Row 1 */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          {/* Recent Workouts */}
          <RecentWorkouts
            workouts={dashboardData.activity.recentWorkouts}
            isLoading={dashboardData.activity.isLoading}
          />

          {/* Goals Progress */}
          <GoalsProgress
            goals={[]}
            isLoading={false}
            onGoalClick={(goalId) => {
              window.location.href = `/goals/${goalId}`;
            }}
            onCreateGoal={() => {
              window.location.href = "/goals/new";
            }}
          />
        </SimpleGrid>

        {/* Main Content Grid - Row 2 */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          {/* Recovery Status */}
          <RecoveryStatus
            readiness={dashboardData.recovery.readiness}
            todayCheckIn={dashboardData.recovery.todayCheckIn}
            isLoading={dashboardData.recovery.isLoading}
          />

          {/* Workout Frequency Heatmap */}
          <WorkoutFrequency
            days={[]}
            currentStreak={dashboardData.stats.currentStreak}
            totalWorkouts={dashboardData.stats.workoutsThisWeek + (dashboardData.stats.workoutsLastWeek ?? 0) * 3}
            avgPerWeek={dashboardData.stats.workoutsThisWeek}
            isLoading={dashboardData.stats.isLoading}
          />
        </SimpleGrid>

        {/* Charts Grid */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          {/* Volume Trends Chart */}
          <VolumeChart
            dataPoints={dashboardData.charts.volumeTrends}
            isLoading={dashboardData.charts.volumeIsLoading}
          />

          {/* Muscle Balance Donut Chart */}
          <MuscleBalance
            data={[]}
            period={muscleBalancePeriod}
            onPeriodChange={setMuscleBalancePeriod}
            isLoading={false}
          />
        </SimpleGrid>

        {/* Second Charts Row */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          {/* Weight Trend Chart */}
          <WeightChart
            dataPoints={dashboardData.charts.bodyTrends.dataPoints}
            weightChange={dashboardData.charts.bodyTrends.weightChange}
            isLoading={dashboardData.charts.bodyIsLoading}
          />

          {/* AI Insights */}
          <AIInsights
            insights={[]}
            isLoading={false}
            onRegenerate={() => {
              // TODO: Call AI insights API
            }}
          />
        </SimpleGrid>

        {/* Recent PRs - Full width */}
        <RecentPRs records={dashboardData.prs.recentPRs} isLoading={dashboardData.prs.isLoading} />
      </Stack>
    </Box>
  );
}
