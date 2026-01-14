/**
 * Custom hook for managing recovery data and state
 */

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc, queryClient } from "@/utils/orpc";

export type TrendPeriod = "week" | "month" | "quarter" | "year";

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Get date range for a given period
 */
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

export interface CheckInData {
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
  sorenessLevel?: number;
  soreAreas?: string[];
  restingHeartRate?: number;
  hrvScore?: number;
  motivationLevel?: number;
  mood?: "great" | "good" | "neutral" | "low" | "bad";
  nutritionQuality?: number;
  hydrationLevel?: number;
  notes?: string;
}

export function useRecoveryData() {
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("month");
  const [historyLimit] = useState(10);
  const [historyOffset, setHistoryOffset] = useState(0);

  // Get today's check-in
  const todayCheckInQuery = useQuery(orpc.recovery.getTodayCheckIn.queryOptions({}));

  // Get readiness score
  const readinessQuery = useQuery(orpc.recovery.getReadiness.queryOptions({}));

  // Get muscle recovery status
  const recoveryStatusQuery = useQuery(orpc.recovery.getRecoveryStatus.queryOptions({}));

  // Get trends for selected period
  const { startDate, endDate } = getDateRangeForPeriod(trendPeriod);
  const trendsQuery = useQuery(
    orpc.recovery.getTrends.queryOptions({
      period: trendPeriod,
      startDate,
      endDate,
    }),
  );

  // Get check-in history
  const historyQuery = useQuery(
    orpc.recovery.getCheckInHistory.queryOptions({
      limit: historyLimit,
      offset: historyOffset,
    }),
  );

  // Create/update check-in mutation
  const createCheckInMutation = useMutation(
    orpc.recovery.createCheckIn.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recovery"] });
      },
    }),
  );

  // Refresh recovery mutation
  const refreshRecoveryMutation = useMutation(
    orpc.recovery.refreshRecovery.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recovery"] });
      },
    }),
  );

  // Submit check-in handler
  const submitCheckIn = async (data: CheckInData) => {
    await createCheckInMutation.mutateAsync(data);
  };

  // Refresh recovery handler
  const refreshRecovery = async () => {
    await refreshRecoveryMutation.mutateAsync({});
  };

  // Load more history
  const loadMoreHistory = () => {
    setHistoryOffset((prev) => prev + historyLimit);
  };

  // Check if any query is loading
  const isLoading =
    todayCheckInQuery.isLoading ||
    readinessQuery.isLoading ||
    recoveryStatusQuery.isLoading ||
    trendsQuery.isLoading ||
    historyQuery.isLoading;

  // Check if any query has error
  const isError =
    todayCheckInQuery.isError ||
    readinessQuery.isError ||
    recoveryStatusQuery.isError ||
    trendsQuery.isError ||
    historyQuery.isError;

  // Refetch all data
  const refetch = () => {
    todayCheckInQuery.refetch();
    readinessQuery.refetch();
    recoveryStatusQuery.refetch();
    trendsQuery.refetch();
    historyQuery.refetch();
  };

  return {
    // Today's check-in
    todayCheckIn: todayCheckInQuery.data ?? null,
    hasTodayCheckIn: !!todayCheckInQuery.data,
    isTodayCheckInLoading: todayCheckInQuery.isLoading,

    // Readiness
    readiness: readinessQuery.data ?? null,
    isReadinessLoading: readinessQuery.isLoading,

    // Recovery status
    recoveryStatus: recoveryStatusQuery.data ?? null,
    isRecoveryStatusLoading: recoveryStatusQuery.isLoading,

    // Trends
    trends: trendsQuery.data ?? null,
    trendPeriod,
    setTrendPeriod,
    isTrendsLoading: trendsQuery.isLoading,

    // History
    checkInHistory: historyQuery.data?.checkIns ?? [],
    historyTotal: historyQuery.data?.total ?? 0,
    historyOffset,
    loadMoreHistory,
    hasMoreHistory: (historyQuery.data?.total ?? 0) > historyOffset + historyLimit,
    isHistoryLoading: historyQuery.isLoading,

    // Mutations
    submitCheckIn,
    isSubmitting: createCheckInMutation.isPending,
    refreshRecovery,
    isRefreshing: refreshRecoveryMutation.isPending,

    // General state
    isLoading,
    isError,
    refetch,
  };
}
