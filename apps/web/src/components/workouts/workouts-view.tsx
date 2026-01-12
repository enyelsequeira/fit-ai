/**
 * WorkoutsView - Main workouts page component
 * Split layout with calendar on left, workout list on right
 * Responsive: stacks vertically on mobile
 */

import { useCallback } from "react";
import { Box, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { WorkoutStats } from "./workout-stats";
import { WorkoutCalendar } from "./workout-calendar";
import { WorkoutList } from "./workout-list";
import { WorkoutActions } from "./workout-actions";
import { useWorkoutsData } from "./use-workouts-data";
import styles from "./workouts-view.module.css";

export function WorkoutsView() {
  const navigate = useNavigate();
  const {
    workouts,
    stats,
    calendarDays,
    dateRange,
    setDateRange,
    selectedDate,
    setSelectedDate,
    isLoading,
    isError,
    refetch,
  } = useWorkoutsData();

  // Navigation handlers
  const handleStartWorkout = useCallback(() => {
    // Navigate to new workout page
    navigate({ to: "/dashboard/workouts/new" as string });
  }, [navigate]);

  const handleUseTemplate = useCallback(() => {
    // Navigate to templates page
    navigate({ to: "/dashboard/templates" as string });
  }, [navigate]);

  const handleQuickLog = useCallback(() => {
    // Navigate to quick log page
    navigate({ to: "/dashboard/workouts/log" as string });
  }, [navigate]);

  const handleWorkoutClick = useCallback(
    (workoutId: number) => {
      navigate({ to: `/dashboard/workouts/${workoutId}` as string });
    },
    [navigate]
  );

  return (
    <Box p={{ base: "sm", md: "md" }} className={styles.workoutsContainer}>
      <Stack gap="md">
        {/* Page header */}
        <Box className={styles.pageHeader}>
          <Title order={2} className={styles.pageTitle}>
            Workouts
          </Title>
          <Text size="sm" className={styles.pageDescription}>
            Track your training sessions and monitor your progress
          </Text>
        </Box>

        {/* Stats overview */}
        <WorkoutStats stats={stats} />

        {/* Action buttons */}
        <WorkoutActions
          onStartWorkout={handleStartWorkout}
          onUseTemplate={handleUseTemplate}
          onQuickLog={handleQuickLog}
        />

        {/* Main content: Calendar + List */}
        <Box className={styles.mainContent}>
          {/* Left column: Calendar */}
          <Box className={styles.leftColumn}>
            <WorkoutCalendar
              calendarDays={calendarDays}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              isLoading={isLoading}
            />
          </Box>

          {/* Right column: Workout list */}
          <Box className={styles.rightColumn}>
            <WorkoutList
              workouts={workouts}
              selectedDate={selectedDate}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              onWorkoutClick={handleWorkoutClick}
              onStartWorkout={handleStartWorkout}
              onUseTemplate={handleUseTemplate}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
