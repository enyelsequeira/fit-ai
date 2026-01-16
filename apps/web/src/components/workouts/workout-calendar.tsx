/**
 * WorkoutCalendar - Interactive calendar showing workout days
 * Highlights dates with workouts and allows filtering by date range
 */

import { useState, useMemo, useCallback } from "react";
import { Box, Stack, Text, Group, UnstyledButton } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import type { DayProps } from "@mantine/dates";
import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import type { CalendarWorkoutDay, DateRange } from "./types";
import styles from "./workout-calendar.module.css";

/**
 * Ensure a value is a valid Date object
 */
function ensureDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  // Handle string dates
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Format date to YYYY-MM-DD string (safe, handles any input)
 */
function formatDateKey(value: unknown): string | null {
  const date = ensureDate(value);
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface DateRangeFilter {
  value: DateRange;
  label: string;
}

const dateRangeFilters: DateRangeFilter[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

interface WorkoutCalendarProps {
  calendarDays: CalendarWorkoutDay[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  isLoading?: boolean;
}

export function WorkoutCalendar({
  calendarDays,
  dateRange,
  onDateRangeChange,
  selectedDate,
  onDateSelect,
  isLoading,
}: WorkoutCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());

  // Create a map of dates that have workouts for quick lookup
  const workoutDatesMap = useMemo(() => {
    const map = new Map<string, CalendarWorkoutDay>();
    for (const day of calendarDays) {
      const dateKey = formatDateKey(day.date);
      if (dateKey) {
        map.set(dateKey, day);
      }
    }
    return map;
  }, [calendarDays]);

  const handleDateClick = useCallback(
    (date: Date) => {
      // Toggle selection if same date is clicked
      const dateKey = formatDateKey(date);
      const selectedKey = formatDateKey(selectedDate);
      if (selectedDate && dateKey && selectedKey && dateKey === selectedKey) {
        onDateSelect(null);
      } else {
        onDateSelect(date);
      }
    },
    [selectedDate, onDateSelect],
  );

  // Custom day renderer to show workout indicators
  const getDayProps = useCallback(
    (date: Date): Partial<DayProps> => {
      const dateKey = formatDateKey(date);
      const workoutDay = dateKey ? workoutDatesMap.get(dateKey) : undefined;
      const selectedKey = formatDateKey(selectedDate);
      const todayKey = formatDateKey(new Date());
      const isSelected = !!(dateKey && selectedKey && dateKey === selectedKey);
      const isToday = !!(dateKey && todayKey && dateKey === todayKey);

      const classNames: string[] = [];
      if (workoutDay) {
        classNames.push(styles.workoutDay ?? "");
        if (workoutDay.isCompleted) {
          classNames.push(styles.workoutDayCompleted ?? "");
        }
      }
      if (isSelected) {
        classNames.push(styles.selectedDate ?? "");
      }
      if (isToday) {
        classNames.push(styles.todayIndicator ?? "");
      }

      return {
        className: classNames.filter(Boolean).join(" "),
        onClick: () => handleDateClick(date),
      };
    },
    [workoutDatesMap, selectedDate, handleDateClick],
  );

  return (
    <FitAiCard className={styles.calendarCard}>
      <FitAiCardHeader>
        <FitAiCardTitle>Workout Calendar</FitAiCardTitle>
        <FitAiCardDescription>
          {selectedDate
            ? `Showing workouts for ${
                ensureDate(selectedDate)?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }) ?? "selected date"
              }`
            : "Click a date to filter workouts"}
        </FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        <Stack gap="md" className={styles.calendarWrapper}>
          {/* Date range filters */}
          <Group gap="xs" className={styles.filterGroup}>
            {dateRangeFilters.map((filter) => (
              <UnstyledButton
                key={filter.value}
                className={styles.filterButton}
                data-active={dateRange === filter.value}
                onClick={() => onDateRangeChange(filter.value)}
              >
                {filter.label}
              </UnstyledButton>
            ))}
          </Group>

          {/* Calendar */}
          <Box className={styles.calendarContainer}>
            <Calendar
              date={month}
              onDateChange={setMonth}
              getDayProps={getDayProps}
              size="md"
              highlightToday
            />
          </Box>

          {/* Legend */}
          <Group className={styles.legendContainer}>
            <Box className={styles.legendItem}>
              <Box className={styles.legendDot} data-type="workout" />
              <Text size="xs" c="dimmed">
                Scheduled
              </Text>
            </Box>
            <Box className={styles.legendItem}>
              <Box className={styles.legendDot} data-type="completed" />
              <Text size="xs" c="dimmed">
                Completed
              </Text>
            </Box>
          </Group>

          {/* Selected date summary */}
          {selectedDate && (
            <UnstyledButton onClick={() => onDateSelect(null)} style={{ textAlign: "center" }}>
              <Text size="xs" c="blue" td="underline">
                Clear date filter
              </Text>
            </UnstyledButton>
          )}
        </Stack>
      </FitAiCardContent>
    </FitAiCard>
  );
}
