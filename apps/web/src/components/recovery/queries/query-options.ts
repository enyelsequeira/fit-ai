import type { TrendPeriod } from "../types";

import { orpc } from "@/utils/orpc";

export function todayCheckInOptions() {
  return orpc.recovery.getTodayCheckIn.queryOptions();
}

export function readinessOptions() {
  return orpc.recovery.getReadiness.queryOptions();
}

export function recoveryStatusOptions() {
  return orpc.recovery.getRecoveryStatus.queryOptions();
}

export function trendsOptions(params: { period: TrendPeriod; startDate: string; endDate: string }) {
  return orpc.recovery.getTrends.queryOptions({
    input: {
      period: params.period,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
}

export function checkInHistoryOptions(params: { limit: number; offset: number }) {
  return orpc.recovery.getCheckInHistory.queryOptions({
    input: {
      limit: params.limit,
      offset: params.offset,
    },
  });
}
