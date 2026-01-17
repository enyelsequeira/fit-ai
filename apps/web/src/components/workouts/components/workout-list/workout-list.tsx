/**
 * WorkoutList - Grid of workout cards with filtering and empty states
 * Handles loading, error, and empty states with proper UI feedback
 */

import { useMemo } from "react";
import { Button, Group, Tooltip } from "@mantine/core";
import {
  IconPlus,
  IconBarbell,
  IconSearch,
  IconMoodSad,
  IconRefresh,
} from "@tabler/icons-react";
import { useWorkoutsList } from "../../queries/use-queries.ts";
import { WorkoutCard, WorkoutCardSkeleton } from "../workout-card/workout-card.tsx";
import type { TimePeriodFilter } from "../../types";
import { getDateRangeForFilter } from "../../utils";
import styles from "./workout-list.module.css";

interface WorkoutListProps {
  /** Time period filter */
  timePeriod: TimePeriodFilter;
  /** Search query to filter workouts client-side */
  searchQuery?: string;
  /** Callback when a workout card is clicked */
  onWorkoutClick: (workoutId: number) => void;
  /** Callback to create a new workout */
  onCreateWorkout: () => void;
}

function LoadingState() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 6 }, (_, i) => (
        <WorkoutCardSkeleton key={i} animationDelay={i * 60} />
      ))}
    </div>
  );
}

function SearchEmptyState({
  searchQuery,
  onCreateWorkout,
}: {
  searchQuery: string;
  onCreateWorkout: () => void;
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <IconSearch size={32} stroke={1.5} />
      </div>
      <h3 className={styles.emptyStateTitle}>No workouts found</h3>
      <p className={styles.emptyStateMessage}>
        No workouts match your search for &ldquo;{searchQuery}&rdquo;. Try adjusting your search
        terms or start a new workout.
      </p>
      <Group mt="lg">
        <Tooltip label="Start a new workout session" position="bottom" withArrow>
          <Button variant="light" leftSection={<IconPlus size={16} />} onClick={onCreateWorkout}>
            New Workout
          </Button>
        </Tooltip>
      </Group>
    </div>
  );
}

function NoWorkoutsEmptyState({ onCreateWorkout }: { onCreateWorkout: () => void }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <IconBarbell size={40} stroke={1.5} />
      </div>
      <h3 className={styles.emptyStateTitle}>Start Your Fitness Journey</h3>
      <p className={styles.emptyStateMessage}>
        Track your workouts, monitor your progress, and achieve your fitness goals.
        Start by creating your first workout session.
      </p>

      <Tooltip label="Start your first workout" position="bottom" withArrow>
        <Button size="lg" leftSection={<IconPlus size={18} />} onClick={onCreateWorkout} mt="xl">
          Start Your First Workout
        </Button>
      </Tooltip>
    </div>
  );
}

function PeriodEmptyState({
  periodLabel,
  onCreateWorkout,
}: {
  periodLabel: string;
  onCreateWorkout: () => void;
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <IconBarbell size={40} stroke={1.5} />
      </div>
      <h3 className={styles.emptyStateTitle}>No workouts for {periodLabel}</h3>
      <p className={styles.emptyStateMessage}>
        You haven&apos;t logged any workouts for this time period yet.
        Start a new workout to get going!
      </p>

      <Tooltip label="Start a new workout" position="bottom" withArrow>
        <Button size="md" leftSection={<IconPlus size={16} />} onClick={onCreateWorkout} mt="lg">
          New Workout
        </Button>
      </Tooltip>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.errorState}>
      <div className={styles.errorStateIcon}>
        <IconMoodSad size={32} stroke={1.5} />
      </div>
      <h3 className={styles.errorStateTitle}>Something went wrong</h3>
      <p className={styles.errorStateMessage}>
        We couldn&apos;t load your workouts. This might be a temporary issue. Please try again.
      </p>
      <Tooltip label="Retry loading workouts" position="bottom" withArrow>
        <Button
          variant="light"
          color="red"
          leftSection={<IconRefresh size={16} />}
          onClick={onRetry}
          mt="lg"
        >
          Try Again
        </Button>
      </Tooltip>
    </div>
  );
}

const PERIOD_LABELS: Record<TimePeriodFilter, string> = {
  today: "today",
  week: "this week",
  month: "the last 30 days",
  all: "any time",
};

export function WorkoutList({
  timePeriod,
  searchQuery,
  onWorkoutClick,
  onCreateWorkout,
}: WorkoutListProps) {
  // Get date range for the selected time period
  const dateRange = useMemo(() => getDateRangeForFilter(timePeriod), [timePeriod]);

  // Fetch workouts with date range filter
  const {
    data: workoutsData,
    isLoading,
    isError,
    refetch,
  } = useWorkoutsList({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Filter workouts by search query (client-side filtering)
  const filteredWorkouts = useMemo(() => {
    const workouts = workoutsData?.workouts ?? [];
    if (!searchQuery?.trim()) {
      return workouts;
    }
    const query = searchQuery.toLowerCase();
    return workouts.filter((workout) =>
      workout.name?.toLowerCase().includes(query)
    );
  }, [workoutsData?.workouts, searchQuery]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Check if there are any workouts at all
  const hasNoWorkouts = (workoutsData?.workouts ?? []).length === 0;

  if (hasNoWorkouts && timePeriod === "all") {
    return <NoWorkoutsEmptyState onCreateWorkout={onCreateWorkout} />;
  }

  if (filteredWorkouts.length === 0) {
    if (searchQuery?.trim()) {
      return <SearchEmptyState searchQuery={searchQuery} onCreateWorkout={onCreateWorkout} />;
    }
    return (
      <PeriodEmptyState
        periodLabel={PERIOD_LABELS[timePeriod]}
        onCreateWorkout={onCreateWorkout}
      />
    );
  }

  return (
    <div className={styles.container}>
      {searchQuery?.trim() && (
        <div className={styles.resultsSummary}>
          <span className={styles.resultsCount}>
            Showing <span className={styles.resultsCountNumber}>{filteredWorkouts.length}</span>{" "}
            {filteredWorkouts.length === 1 ? "workout" : "workouts"}
          </span>
        </div>
      )}

      <div className={styles.workoutsGrid}>
        {filteredWorkouts.map((workout, index) => (
          <WorkoutCard
            key={workout.id}
            workoutId={workout.id}
            onClick={onWorkoutClick}
            animationDelay={index * 50}
          />
        ))}
      </div>
    </div>
  );
}
