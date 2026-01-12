/**
 * Custom hook for managing workout data and state
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type { DateRange, WorkoutStats, CalendarWorkoutDay } from "./types";

/**
 * Safely convert a value to a Date object
 */
function toSafeDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDateRange(range: DateRange): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (range) {
    case "week": {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case "month": {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case "all":
    default:
      return {
        startDate: new Date(2020, 0, 1),
        endDate,
      };
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculate workout duration in minutes from start and end timestamps
 */
function calculateDurationMinutes(startedAt: Date, completedAt: Date | null): number | null {
  if (!completedAt) return null;
  const diffMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  return Math.round(diffMs / (1000 * 60));
}

export function useWorkoutsData() {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { startDate, endDate } = getDateRange(dateRange);

  // Fetch workouts for the selected date range
  const workoutsQuery = useQuery(
    orpc.workout.list.queryOptions({
      startDate,
      endDate,
      limit: 100,
      offset: 0,
    })
  );

  // Calculate stats from workouts data
  const stats: WorkoutStats = useMemo(() => {
    const workouts = workoutsQuery.data?.workouts ?? [];
    const now = new Date();
    const weekStart = getWeekStart(now);

    const workoutsThisWeek = workouts.filter((w) => {
      const workoutDate = new Date(w.startedAt);
      return workoutDate >= weekStart;
    }).length;

    // Calculate current streak (consecutive days with workouts)
    let currentStreak = 0;
    if (workouts.length > 0) {
      const sortedWorkouts = [...workouts]
        .filter((w) => w.completedAt)
        .sort((a, b) => {
          const dateA = new Date(a.completedAt ?? a.startedAt);
          const dateB = new Date(b.completedAt ?? b.startedAt);
          return dateB.getTime() - dateA.getTime();
        });

      if (sortedWorkouts.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentDate = today;

        for (const workout of sortedWorkouts) {
          const workoutDate = new Date(workout.completedAt ?? workout.startedAt);
          workoutDate.setHours(0, 0, 0, 0);

          const diffDays = Math.floor(
            (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays <= 1) {
            currentStreak++;
            currentDate = workoutDate;
          } else {
            break;
          }
        }
      }
    }

    // Calculate total volume (rough estimate based on workout count)
    const totalVolume = workouts.filter((w) => w.completedAt).length * 1000; // Placeholder

    // Calculate average duration
    const completedWorkouts = workouts.filter((w) => w.completedAt);
    let totalDuration = 0;
    let durationCount = 0;
    for (const w of completedWorkouts) {
      const duration = calculateDurationMinutes(w.startedAt, w.completedAt);
      if (duration !== null && duration > 0) {
        totalDuration += duration;
        durationCount++;
      }
    }
    const averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;

    return {
      totalWorkouts: workouts.length,
      workoutsThisWeek,
      currentStreak,
      totalVolume,
      averageDuration: Math.round(averageDuration),
      isLoading: workoutsQuery.isLoading,
    };
  }, [workoutsQuery.data?.workouts, workoutsQuery.isLoading]);

  // Generate calendar workout days
  const calendarDays: CalendarWorkoutDay[] = useMemo(() => {
    const workouts = workoutsQuery.data?.workouts ?? [];
    const dayMap = new Map<string, CalendarWorkoutDay>();

    for (const workout of workouts) {
      const date = toSafeDate(workout.startedAt);
      if (!date) continue;

      const dateKey = formatDateKey(date);

      const existing = dayMap.get(dateKey);
      if (existing) {
        existing.workoutCount++;
        if (workout.completedAt) {
          existing.isCompleted = true;
        }
      } else {
        dayMap.set(dateKey, {
          date,
          workoutCount: 1,
          isCompleted: !!workout.completedAt,
        });
      }
    }

    return Array.from(dayMap.values());
  }, [workoutsQuery.data?.workouts]);

  // Filter workouts by selected date
  const filteredWorkouts = useMemo(() => {
    const workouts = workoutsQuery.data?.workouts ?? [];

    if (!selectedDate) {
      return workouts;
    }

    const selectedDateStr = formatDateKey(selectedDate);

    return workouts.filter((workout) => {
      const workoutDate = toSafeDate(workout.startedAt);
      if (!workoutDate) return false;
      return formatDateKey(workoutDate) === selectedDateStr;
    });
  }, [workoutsQuery.data?.workouts, selectedDate]);

  return {
    workouts: filteredWorkouts,
    allWorkouts: workoutsQuery.data?.workouts ?? [],
    stats,
    calendarDays,
    dateRange,
    setDateRange,
    selectedDate,
    setSelectedDate,
    isLoading: workoutsQuery.isLoading,
    isError: workoutsQuery.isError,
    error: workoutsQuery.error,
    refetch: workoutsQuery.refetch,
  };
}
