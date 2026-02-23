import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { GoalsFilter } from "../types";

import {
  goalByIdOptions,
  goalProgressHistoryOptions,
  goalsListOptions,
  goalsSummaryOptions,
} from "./query-options";

export function useGoalsList(filters?: GoalsFilter) {
  return useQuery(goalsListOptions(filters));
}

export function useGoalsSummary() {
  return useQuery(goalsSummaryOptions());
}

export function useGoalById(id: number | null) {
  return useQuery(goalByIdOptions(id));
}

export function useGoalProgressHistory(goalId: number | null) {
  return useQuery(goalProgressHistoryOptions(goalId));
}

export function useGoalsStats() {
  const summaryQuery = useGoalsSummary();
  return useMemo(
    () => ({
      totalGoals: summaryQuery.data?.totalGoals ?? 0,
      activeGoals: summaryQuery.data?.activeGoals ?? 0,
      completedGoals: summaryQuery.data?.completedGoals ?? 0,
      averageProgress: summaryQuery.data?.averageProgress ?? 0,
      nearDeadlineCount: summaryQuery.data?.nearDeadlineGoals?.length ?? 0,
      isLoading: summaryQuery.isLoading,
    }),
    [summaryQuery.data, summaryQuery.isLoading],
  );
}

const STATUS_TABS = [
  { value: "all" as const, label: "All Goals" },
  { value: "active" as const, label: "Active" },
  { value: "paused" as const, label: "Paused" },
  { value: "completed" as const, label: "Completed" },
  { value: "abandoned" as const, label: "Abandoned" },
];

export function useStatusTabs() {
  const summaryQuery = useGoalsSummary();
  return useMemo(() => {
    const summary = summaryQuery.data;
    if (!summary) return STATUS_TABS;
    return STATUS_TABS.map((tab) => {
      let count: number | undefined;
      switch (tab.value) {
        case "all":
          count = summary.totalGoals;
          break;
        case "active":
          count = summary.activeGoals;
          break;
        case "paused":
          count = summary.pausedGoals;
          break;
        case "completed":
          count = summary.completedGoals;
          break;
        case "abandoned":
          count = summary.abandonedGoals;
          break;
      }
      return { ...tab, count };
    });
  }, [summaryQuery.data]);
}
