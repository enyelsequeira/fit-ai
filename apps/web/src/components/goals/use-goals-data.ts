/**
 * Custom hook for managing goals data and state
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc, queryClient } from "@/utils/orpc";
import type { GoalStatus, GoalType, GoalsFilter, GoalsStats, StatusTab } from "./types";

/**
 * Status tabs configuration
 */
const STATUS_TABS: StatusTab[] = [
  { value: "all", label: "All Goals" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "abandoned", label: "Abandoned" },
];

export function useGoalsData() {
  const [filters, setFilters] = useState<GoalsFilter>({});
  const [activeTab, setActiveTab] = useState<GoalStatus | "all">("all");

  // Build query filters based on active tab and user filters
  const queryFilters = useMemo(() => {
    const result: GoalsFilter = { ...filters };
    if (activeTab !== "all") {
      result.status = activeTab;
    }
    return result;
  }, [filters, activeTab]);

  // Fetch goals list
  const goalsQuery = useQuery(
    orpc.goals.list.queryOptions({
      input: {
        goalType: queryFilters.goalType,
        status: queryFilters.status,
        exerciseId: queryFilters.exerciseId,
        limit: 100,
        offset: 0,
      },
    }),
  );

  // Fetch goals summary
  const summaryQuery = useQuery(orpc.goals.getSummary.queryOptions());

  // Calculate stats from summary data
  const stats: GoalsStats = useMemo(() => {
    const summary = summaryQuery.data;
    return {
      totalGoals: summary?.totalGoals ?? 0,
      activeGoals: summary?.activeGoals ?? 0,
      completedGoals: summary?.completedGoals ?? 0,
      averageProgress: summary?.averageProgress ?? 0,
      nearDeadlineCount: summary?.nearDeadlineGoals?.length ?? 0,
      isLoading: summaryQuery.isLoading,
    };
  }, [summaryQuery.data, summaryQuery.isLoading]);

  // Status tabs with counts
  const statusTabs: StatusTab[] = useMemo(() => {
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

  // Invalidate queries helper
  const invalidateGoals = () => {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
  };

  // Mutations for goal actions
  const completeMutation = useMutation(
    orpc.goals.complete.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const pauseMutation = useMutation(
    orpc.goals.pause.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const resumeMutation = useMutation(
    orpc.goals.resume.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const abandonMutation = useMutation(
    orpc.goals.abandon.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const deleteMutation = useMutation(
    orpc.goals.delete.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const updateProgressMutation = useMutation(
    orpc.goals.updateProgress.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  // Create goal mutations
  const createWeightGoalMutation = useMutation(
    orpc.goals.createWeightGoal.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const createStrengthGoalMutation = useMutation(
    orpc.goals.createStrengthGoal.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const createBodyMeasurementGoalMutation = useMutation(
    orpc.goals.createBodyMeasurementGoal.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const createWorkoutFrequencyGoalMutation = useMutation(
    orpc.goals.createWorkoutFrequencyGoal.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  const createCustomGoalMutation = useMutation(
    orpc.goals.createCustomGoal.mutationOptions({
      onSuccess: invalidateGoals,
    }),
  );

  // Filter handlers
  const setGoalTypeFilter = (goalType?: GoalType) => {
    setFilters((prev) => ({ ...prev, goalType }));
  };

  const clearFilters = () => {
    setFilters({});
    setActiveTab("all");
  };

  return {
    // Data
    goals: goalsQuery.data ?? [],
    summary: summaryQuery.data,
    stats,
    statusTabs,

    // State
    filters,
    activeTab,
    setActiveTab,
    setGoalTypeFilter,
    clearFilters,

    // Loading states
    isLoading: goalsQuery.isLoading,
    isError: goalsQuery.isError,
    error: goalsQuery.error,
    refetch: goalsQuery.refetch,

    // Action mutations
    completeMutation,
    pauseMutation,
    resumeMutation,
    abandonMutation,
    deleteMutation,
    updateProgressMutation,

    // Create mutations
    createWeightGoalMutation,
    createStrengthGoalMutation,
    createBodyMeasurementGoalMutation,
    createWorkoutFrequencyGoalMutation,
    createCustomGoalMutation,
  };
}

/**
 * Hook for fetching a single goal with progress history
 */
export function useGoalDetail(goalId: number | null) {
  const goalQuery = useQuery({
    ...orpc.goals.getById.queryOptions({ input: { id: goalId ?? 0 } }),
    enabled: goalId !== null && goalId > 0,
  });

  return {
    goal: goalQuery.data,
    isLoading: goalQuery.isLoading,
    isError: goalQuery.isError,
    error: goalQuery.error,
    refetch: goalQuery.refetch,
  };
}
