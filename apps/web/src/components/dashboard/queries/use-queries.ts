import { useQuery } from "@tanstack/react-query";

import {
  activeGoalsListOptions,
  dashboardGoalsSummaryOptions,
  settingsQueryOptions,
} from "./query-options";

export function useSettings() {
  return useQuery(settingsQueryOptions());
}

export function useDashboardGoalsSummary() {
  return useQuery(dashboardGoalsSummaryOptions());
}

export function useDashboardActiveGoals() {
  return useQuery(activeGoalsListOptions());
}
