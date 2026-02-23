import type { PersonalRecordItem, RecordTypeFilter, RecordsByExerciseGroup } from "../types";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  recordByIdOptions,
  recordsByExerciseOptions,
  recordsListOptions,
  recordsSummaryOptions,
  recentRecordsOptions,
} from "./query-options";

export function useRecordsList(params?: {
  exerciseId?: number;
  recordType?: Exclude<RecordTypeFilter, "all">;
  limit?: number;
  offset?: number;
}) {
  return useQuery(recordsListOptions(params));
}

export function useRecentRecords(params?: { days?: number; limit?: number }) {
  return useQuery(recentRecordsOptions(params));
}

export function useRecordsSummary() {
  return useQuery(recordsSummaryOptions());
}

export function useRecordById(id: number | null) {
  return useQuery({
    ...recordByIdOptions({ id: id ?? 0 }),
    enabled: id !== null,
  });
}

export function useRecordsByExercise(exerciseId: number) {
  return useQuery(recordsByExerciseOptions({ exerciseId }));
}

export function useRecordsStats() {
  const summaryQuery = useRecordsSummary();
  const recentQuery = useRecentRecords();

  return useMemo(() => {
    const summary = summaryQuery.data;
    const recentRecords = recentQuery.data ?? [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prsThisMonth = recentRecords.filter(
      (record) => new Date(record.achievedAt) >= startOfMonth,
    ).length;

    return {
      totalRecords: summary?.totalRecords ?? 0,
      exercisesWithRecords: summary?.exercisesWithRecords ?? 0,
      countByType: summary?.countByType ?? {},
      prsThisMonth,
      isLoading: summaryQuery.isLoading || recentQuery.isLoading,
    };
  }, [summaryQuery.data, summaryQuery.isLoading, recentQuery.data, recentQuery.isLoading]);
}

export function useRecordsByExerciseGrouped(
  records: PersonalRecordItem[],
): RecordsByExerciseGroup[] {
  return useMemo(() => {
    const grouped = new Map<number, RecordsByExerciseGroup>();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const record of records) {
      if (!record.exercise) continue;

      const exerciseId = record.exercise.id;
      const existing = grouped.get(exerciseId);
      const isRecent = new Date(record.achievedAt) > sevenDaysAgo;

      if (existing) {
        existing.records.push(record);
        if (isRecent) existing.hasRecentPR = true;
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
  }, [records]);
}
