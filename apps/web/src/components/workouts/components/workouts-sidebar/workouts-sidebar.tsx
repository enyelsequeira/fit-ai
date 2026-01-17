/**
 * WorkoutsSidebar - Time-based filter navigation for workouts
 * Shows time period filters (Today, This Week, Last 30 Days, All) with counts
 */

import { Tooltip } from "@mantine/core";
import {
  IconBarbell,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarWeek,
  IconHistory,
} from "@tabler/icons-react";
import type { TimePeriodFilter } from "../../types";
import { useWorkoutsList } from "../../queries/use-queries.ts";
import { getDateRangeForFilter } from "../../utils";
import styles from "./workouts-sidebar.module.css";

interface WorkoutsSidebarProps {
  selectedPeriod: TimePeriodFilter;
  onSelectPeriod: (period: TimePeriodFilter) => void;
}

const TIME_PERIODS: Array<{
  id: TimePeriodFilter;
  label: string;
  subtext: string;
  icon: typeof IconCalendar;
}> = [
  {
    id: "today",
    label: "Today",
    subtext: "Today's workouts",
    icon: IconCalendar,
  },
  {
    id: "week",
    label: "This Week",
    subtext: "Current week",
    icon: IconCalendarWeek,
  },
  {
    id: "month",
    label: "Last 30 Days",
    subtext: "Recent activity",
    icon: IconCalendarEvent,
  },
  {
    id: "all",
    label: "All Workouts",
    subtext: "Complete history",
    icon: IconHistory,
  },
];

export function WorkoutsSidebar({ selectedPeriod, onSelectPeriod }: WorkoutsSidebarProps) {
  // Fetch all workouts to calculate counts per period
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
      if (endDate && workoutDate > endDate) return false;
      return true;
    }).length;
  };

  if (isLoading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>Time Period</h3>
        </div>
        <div className={styles.navSection}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
              <div className={`${styles.skeleton} ${styles.skeletonText}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Time Period</h3>
      </div>

      {/* Navigation */}
      <div className={styles.navSection}>
        {/* All Workouts Item (Primary) */}
        <div
          className={styles.allWorkoutsItem}
          data-active={selectedPeriod === "all"}
          onClick={() => onSelectPeriod("all")}
          onKeyDown={(e) => e.key === "Enter" && onSelectPeriod("all")}
          role="button"
          tabIndex={0}
        >
          <div className={styles.allWorkoutsIcon}>
            <IconBarbell size={18} />
          </div>
          <div className={styles.allWorkoutsContent}>
            <p className={styles.allWorkoutsLabel}>All Workouts</p>
            <p className={styles.allWorkoutsSubtext}>View complete history</p>
          </div>
          <span className={styles.allWorkoutsCount}>{totalWorkouts}</span>
        </div>

        {/* Divider */}
        <div className={styles.divider} />
        <span className={styles.sectionLabel}>Quick Filters</span>

        {/* Time period items */}
        {TIME_PERIODS.filter((p) => p.id !== "all").map((period) => {
          const PeriodIcon = period.icon;
          const count = getWorkoutCount(period.id);

          return (
            <Tooltip key={period.id} label={period.subtext} position="right" withArrow>
              <div
                className={styles.periodItem}
                data-active={selectedPeriod === period.id}
                onClick={() => onSelectPeriod(period.id)}
                onKeyDown={(e) => e.key === "Enter" && onSelectPeriod(period.id)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.periodIcon}>
                  <PeriodIcon size={16} />
                </div>
                <div className={styles.periodContent}>
                  <p className={styles.periodName}>{period.label}</p>
                </div>
                <span className={styles.periodCount}>{count}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalWorkouts}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{completedWorkouts}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{inProgressWorkouts}</span>
          <span className={styles.statLabel}>In Progress</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{getWorkoutCount("week")}</span>
          <span className={styles.statLabel}>This Week</span>
        </div>
      </div>
    </div>
  );
}
