/**
 * Custom hook for managing personal records data and state
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import { orpc } from "@/utils/orpc";

/**
 * Record types that can be filtered
 */
export type RecordTypeFilter =
  | "all"
  | "one_rep_max"
  | "max_weight"
  | "max_reps"
  | "max_volume"
  | "best_time"
  | "longest_duration"
  | "longest_distance";

/**
 * Record type labels for display
 */
export const RECORD_TYPE_LABELS: Record<RecordTypeFilter, string> = {
  all: "All Types",
  one_rep_max: "Est. 1RM",
  max_weight: "Max Weight",
  max_reps: "Max Reps",
  max_volume: "Max Volume",
  best_time: "Best Time",
  longest_duration: "Duration",
  longest_distance: "Distance",
};

/**
 * Record type colors for badges
 */
export const RECORD_TYPE_COLORS: Record<string, string> = {
  one_rep_max: "violet",
  max_weight: "blue",
  max_reps: "green",
  max_volume: "orange",
  best_time: "red",
  longest_duration: "cyan",
  longest_distance: "pink",
};

/**
 * Format a record value based on its type
 */
export function formatRecordValue(
  value: number,
  recordType: string,
  displayUnit: string | null,
): string {
  if (recordType === "max_reps") {
    return `${value} reps`;
  }

  if (recordType === "best_time" || recordType === "longest_duration") {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  if (recordType === "longest_distance") {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} km`;
    }
    return `${value} m`;
  }

  // Weight-based records
  const unit = displayUnit ?? "kg";
  return `${value.toFixed(1)} ${unit}`;
}

/**
 * Format a date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Check if a date is within the last N days
 */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < days;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return new Date().toDateString() === date.toDateString();
}

interface UseRecordsDataOptions {
  initialRecordType?: RecordTypeFilter;
  recentDays?: number;
  searchDebounceMs?: number;
}

export function useRecordsData(options: UseRecordsDataOptions = {}) {
  const { initialRecordType = "all", recentDays = 30, searchDebounceMs = 300 } = options;

  // Filter state
  const [recordTypeFilter, setRecordTypeFilter] = useState<RecordTypeFilter>(initialRecordType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  // Debounced search query for better performance
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, searchDebounceMs);

  // Fetch summary statistics
  const summaryQuery = useQuery(orpc.personalRecord.getSummary.queryOptions());

  // Fetch recent personal records
  const recentQuery = useQuery(
    orpc.personalRecord.getRecent.queryOptions({
      days: recentDays,
      limit: 20,
    }),
  );

  // Fetch all personal records with pagination
  const listQuery = useQuery(
    orpc.personalRecord.list.queryOptions({
      recordType: recordTypeFilter === "all" ? undefined : recordTypeFilter,
      limit: 100,
      offset: 0,
    }),
  );

  // Fetch selected record details
  const selectedRecordQuery = useQuery({
    ...orpc.personalRecord.getById.queryOptions({
      id: selectedRecordId ?? 0,
    }),
    enabled: selectedRecordId !== null,
  });

  // Filtered records based on debounced search query
  const filteredRecords = useMemo(() => {
    const records = listQuery.data?.records ?? [];

    if (!debouncedSearchQuery.trim()) {
      return records;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return records.filter((record) => {
      const exerciseName = record.exercise?.name?.toLowerCase() ?? "";
      return exerciseName.includes(query);
    });
  }, [listQuery.data?.records, debouncedSearchQuery]);

  // Group records by exercise for all-time bests grid
  const recordsByExercise = useMemo(() => {
    const records = listQuery.data?.records ?? [];
    const grouped = new Map<
      number,
      {
        exerciseId: number;
        exerciseName: string;
        exerciseCategory: string;
        records: typeof records;
        hasRecentPR: boolean;
      }
    >();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const record of records) {
      if (!record.exercise) continue;

      const exerciseId = record.exercise.id;
      const existing = grouped.get(exerciseId);
      const isRecent = new Date(record.achievedAt) > sevenDaysAgo;

      if (existing) {
        existing.records.push(record);
        if (isRecent) {
          existing.hasRecentPR = true;
        }
      } else {
        grouped.set(exerciseId, {
          exerciseId,
          exerciseName: record.exercise.name,
          exerciseCategory: record.exercise.category,
          records: [record],
          hasRecentPR: isRecent,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName),
    );
  }, [listQuery.data?.records]);

  // Summary statistics
  const stats = useMemo(() => {
    const summary = summaryQuery.data;
    const recentRecords = recentQuery.data ?? [];

    // Count PRs this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prsThisMonth = recentRecords.filter((record) => {
      const achievedAt = new Date(record.achievedAt);
      return achievedAt >= startOfMonth;
    }).length;

    return {
      totalRecords: summary?.totalRecords ?? 0,
      exercisesWithRecords: summary?.exercisesWithRecords ?? 0,
      countByType: summary?.countByType ?? {},
      prsThisMonth,
      isLoading: summaryQuery.isLoading,
    };
  }, [summaryQuery.data, summaryQuery.isLoading, recentQuery.data]);

  // Check if there are active filters
  const hasActiveFilters = searchQuery.trim() !== "" || recordTypeFilter !== "all";

  return {
    // Data
    records: filteredRecords,
    allRecords: listQuery.data?.records ?? [],
    recentRecords: recentQuery.data ?? [],
    recordsByExercise,
    selectedRecord: selectedRecordQuery.data,
    stats,

    // Filters
    recordTypeFilter,
    setRecordTypeFilter,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    hasActiveFilters,

    // Selected record
    selectedRecordId,
    setSelectedRecordId,

    // Loading states
    isLoading: listQuery.isLoading || summaryQuery.isLoading || recentQuery.isLoading,
    isError: listQuery.isError || summaryQuery.isError || recentQuery.isError,
    isLoadingSelectedRecord: selectedRecordQuery.isLoading,

    // Actions
    refetch: () => {
      listQuery.refetch();
      summaryQuery.refetch();
      recentQuery.refetch();
    },
  };
}
