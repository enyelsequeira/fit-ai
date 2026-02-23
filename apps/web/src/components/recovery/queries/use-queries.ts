import type { TrendPeriod } from "../types";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  checkInHistoryOptions,
  readinessOptions,
  recoveryStatusOptions,
  todayCheckInOptions,
  trendsOptions,
} from "./query-options";

function formatDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDateRangeForPeriod(period: TrendPeriod): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = formatDateString(now);
  const startDateObj = new Date(now);

  switch (period) {
    case "week":
      startDateObj.setDate(now.getDate() - 7);
      break;
    case "month":
      startDateObj.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      startDateObj.setMonth(now.getMonth() - 3);
      break;
    case "year":
      startDateObj.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { startDate: formatDateString(startDateObj), endDate };
}

export function useTodayCheckIn() {
  return useQuery(todayCheckInOptions());
}

export function useReadiness() {
  return useQuery(readinessOptions());
}

export function useRecoveryStatus() {
  return useQuery(recoveryStatusOptions());
}

export function useTrends(period: TrendPeriod) {
  const { startDate, endDate } = getDateRangeForPeriod(period);
  return useQuery(trendsOptions({ period, startDate, endDate }));
}

export function useCheckInHistory(params?: { limit?: number; offset?: number }) {
  return useQuery(
    checkInHistoryOptions({ limit: params?.limit ?? 10, offset: params?.offset ?? 0 }),
  );
}

export function useRecoveryStats() {
  const readinessQuery = useReadiness();
  const todayCheckInQuery = useTodayCheckIn();

  return useMemo(
    () => ({
      readinessScore: readinessQuery.data?.score ?? 0,
      hasCheckIn: !!todayCheckInQuery.data,
      isLoading: readinessQuery.isLoading || todayCheckInQuery.isLoading,
    }),
    [
      readinessQuery.data,
      readinessQuery.isLoading,
      todayCheckInQuery.data,
      todayCheckInQuery.isLoading,
    ],
  );
}
