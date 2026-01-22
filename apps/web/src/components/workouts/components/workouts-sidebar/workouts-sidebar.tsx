import {
  IconBarbell,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarWeek,
} from "@tabler/icons-react";

import { FitAiSidebar } from "@/components/ui/fit-ai-sidebar/fit-ai-sidebar";

import { useWorkoutsList } from "../../queries/use-queries";
import type { TimePeriodFilter } from "../../types";
import { getDateRangeForFilter } from "../../utils";

type WorkoutsSidebarProps = {
  selectedPeriod: TimePeriodFilter;
  onSelectPeriod: (period: TimePeriodFilter) => void;
};

const TIME_PERIODS: Array<{
  id: TimePeriodFilter;
  label: string;
  icon: typeof IconCalendar;
}> = [
  { id: "today", label: "Today", icon: IconCalendar },
  { id: "week", label: "This Week", icon: IconCalendarWeek },
  { id: "month", label: "Last 30 Days", icon: IconCalendarEvent },
];

export function WorkoutsSidebar({ selectedPeriod, onSelectPeriod }: WorkoutsSidebarProps) {
  const { data: allWorkoutsData, isLoading } = useWorkoutsList();
  const allWorkouts = allWorkoutsData?.workouts ?? [];

  // Calculate stats
  const totalWorkouts = allWorkouts.length;
  const completedWorkouts = allWorkouts.filter((w) => w.completedAt !== null).length;
  const inProgressWorkouts = allWorkouts.filter((w) => w.completedAt === null).length;

  // Calculate workout count for a given period
  const getWorkoutCount = (period: TimePeriodFilter): number => {
    const { startDate, endDate } = getDateRangeForFilter(period);

    if (!startDate && !endDate) {
      return allWorkouts.length;
    }

    return allWorkouts.filter((workout) => {
      const workoutDate = new Date(workout.startedAt);
      if (startDate && workoutDate < startDate) return false;
      return !(endDate && workoutDate > endDate);
    }).length;
  };

  // Stats for footer
  const stats = [
    { label: "Total", value: totalWorkouts },
    { label: "Completed", value: completedWorkouts },
    { label: "In Progress", value: inProgressWorkouts },
    { label: "This Week", value: getWorkoutCount("week") },
  ];

  return (
    <FitAiSidebar
      selectedId={selectedPeriod === "all" ? null : selectedPeriod}
      onSelect={(id) => onSelectPeriod(id === null ? "all" : (id as TimePeriodFilter))}
      isLoading={isLoading}
    >
      <FitAiSidebar.Header title="Time Period" />

      <FitAiSidebar.Navigation>
        <FitAiSidebar.AllItems
          label="All Workouts"
          subtext="View complete history"
          count={totalWorkouts}
          icon={<IconBarbell size={18} />}
        />

        <FitAiSidebar.Section label="Quick Filters">
          {TIME_PERIODS.map((period) => {
            const PeriodIcon = period.icon;
            return (
              <FitAiSidebar.Item
                key={period.id}
                id={period.id}
                label={period.label}
                count={getWorkoutCount(period.id)}
                icon={<PeriodIcon size={16} />}
              />
            );
          })}
        </FitAiSidebar.Section>
      </FitAiSidebar.Navigation>

      <FitAiSidebar.Stats stats={stats} />
    </FitAiSidebar>
  );
}
