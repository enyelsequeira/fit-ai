import { useMemo } from "react";

import { IconBarbell, IconPlus } from "@tabler/icons-react";

import { FitAiEntityList } from "@/components/ui/fit-ai-entity-list/fit-ai-entity-list";

import { useWorkoutsList } from "../../queries/use-queries";
import type { TimePeriodFilter } from "../../types";
import { getDateRangeForFilter } from "../../utils";
import { WorkoutCard, WorkoutCardSkeleton } from "../workout-card/workout-card";
import { FitAiToolTip } from "@/components/ui/fit-ai-tooltip/fit-ai-tool-tip.tsx";
import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button.tsx";

type WorkoutListProps = {
  /** Time period filter */
  timePeriod: TimePeriodFilter;
  /** Search query to filter workouts client-side */
  searchQuery?: string;
  /** Callback when a workout card is clicked */
  onWorkoutClick: (workoutId: number) => void;
  /** Callback to create a new workout */
  onCreateWorkout: () => void;
};

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
    return workouts.filter((workout) => workout.name?.toLowerCase().includes(query));
  }, [workoutsData?.workouts, searchQuery]);

  // Check if there are any workouts at all
  const hasNoWorkouts = (workoutsData?.workouts ?? []).length === 0;
  const hasResults = filteredWorkouts.length > 0;
  const isSearchEmpty = filteredWorkouts.length === 0 && !!searchQuery?.trim();
  const isEmptyState = filteredWorkouts.length === 0 && !searchQuery?.trim() && !isLoading;

  // Determine empty state title and message based on context
  const emptyTitle =
    hasNoWorkouts && timePeriod === "all"
      ? "Start Your Fitness Journey"
      : `No workouts for ${PERIOD_LABELS[timePeriod]}`;

  const emptyMessage =
    hasNoWorkouts && timePeriod === "all"
      ? "Track your workouts, monitor your progress, and achieve your fitness goals. Start by creating your first workout session."
      : "You haven't logged any workouts for this time period yet. Start a new workout to get going!";

  const emptyButtonText =
    hasNoWorkouts && timePeriod === "all" ? "Start Your First Workout" : "New Workout";

  return (
    <FitAiEntityList>
      <FitAiEntityList.Loading visible={isLoading}>
        {Array.from({ length: 6 }, (_, i) => (
          <WorkoutCardSkeleton key={i} animationDelay={i * 60} />
        ))}
      </FitAiEntityList.Loading>

      <FitAiEntityList.Error visible={isError} onRetry={() => refetch()} />

      <FitAiEntityList.Empty
        visible={isEmptyState}
        icon={<IconBarbell size={40} stroke={1.5} />}
        title={emptyTitle}
        description={emptyMessage}
        action={
          <FitAiToolTip
            toolTipProps={{
              label: "Start a new workout session",
            }}
          >
            <FitAiButton
              variant={"outline"}
              size={hasNoWorkouts && timePeriod === "all" ? "lg" : "md"}
              leftSection={<IconPlus size={hasNoWorkouts && timePeriod === "all" ? 18 : 16} />}
              onClick={onCreateWorkout}
            >
              {emptyButtonText}
            </FitAiButton>
          </FitAiToolTip>
        }
      />

      <FitAiEntityList.SearchEmpty visible={isSearchEmpty} searchQuery={searchQuery ?? ""} />

      <FitAiEntityList.Summary visible={hasResults && !!searchQuery?.trim()}>
        Showing {filteredWorkouts.length} {filteredWorkouts.length === 1 ? "workout" : "workouts"}
      </FitAiEntityList.Summary>

      <FitAiEntityList.Grid>
        {filteredWorkouts.map((workout, index) => (
          <WorkoutCard
            key={workout.id}
            workoutId={workout.id}
            onClick={onWorkoutClick}
            animationDelay={index * 50}
          />
        ))}
      </FitAiEntityList.Grid>
    </FitAiEntityList>
  );
}
