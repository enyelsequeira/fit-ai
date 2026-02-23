import { orpc } from "@/utils/orpc";

export function settingsQueryOptions() {
  return orpc.settings.get.queryOptions();
}

export function dashboardGoalsSummaryOptions() {
  return orpc.goals.getSummary.queryOptions();
}

export function activeGoalsListOptions() {
  return orpc.goals.list.queryOptions({
    input: {
      status: "active",
      limit: 4,
      offset: 0,
    },
  });
}
