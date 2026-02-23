import type { GoalsFilter } from "../types";

import { orpc } from "@/utils/orpc";

export function goalsListOptions(filters?: GoalsFilter) {
  return orpc.goals.list.queryOptions({
    input: {
      goalType: filters?.goalType,
      status: filters?.status,
      exerciseId: filters?.exerciseId,
      limit: 100,
      offset: 0,
    },
  });
}

export function goalsSummaryOptions() {
  return orpc.goals.getSummary.queryOptions();
}

export function goalByIdOptions(id: number | null) {
  return {
    ...orpc.goals.getById.queryOptions({ input: { id: id ?? 0 } }),
    enabled: id !== null && id > 0,
  };
}

export function goalProgressHistoryOptions(goalId: number | null) {
  return {
    ...orpc.goals.getProgressHistory.queryOptions({
      input: { goalId: goalId ?? 0 },
    }),
    enabled: goalId !== null && goalId > 0,
  };
}
