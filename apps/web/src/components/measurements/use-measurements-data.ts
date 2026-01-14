/**
 * Custom hook for managing body measurements data and state
 */

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type {
  TimePeriod,
  MeasurementsSummaryData,
  TrendChartDataPoint,
  MeasurementHistoryRow,
} from "./types";

/**
 * Calculate date range based on period
 */
function getDateRange(period: TimePeriod): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (period) {
    case "week": {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case "month": {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case "quarter": {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case "year": {
      const startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case "all":
    default:
      return {
        startDate: new Date(2020, 0, 1),
        endDate,
      };
  }
}

/**
 * Format a date for chart display
 */
function formatDateForChart(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Safely convert a value to a Date object
 */
function toSafeDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function useMeasurementsData() {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<TimePeriod>("month");

  const { startDate, endDate } = getDateRange(period);

  // Fetch the latest measurement
  const latestQuery = useQuery(orpc.bodyMeasurement.getLatest.queryOptions({}));

  // Fetch measurements list for history
  const listQuery = useQuery(
    orpc.bodyMeasurement.list.queryOptions({
      startDate,
      endDate,
      limit: 100,
      offset: 0,
    }),
  );

  // Fetch trends data
  const trendsQuery = useQuery(
    orpc.bodyMeasurement.getTrends.queryOptions({
      period,
      startDate,
      endDate,
    }),
  );

  // Create mutation
  const createMutation = useMutation(
    orpc.bodyMeasurement.create.mutationOptions({
      onSuccess: () => {
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ["bodyMeasurement"] });
      },
    }),
  );

  // Update mutation
  const updateMutation = useMutation(
    orpc.bodyMeasurement.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["bodyMeasurement"] });
      },
    }),
  );

  // Delete mutation
  const deleteMutation = useMutation(
    orpc.bodyMeasurement.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["bodyMeasurement"] });
      },
    }),
  );

  // Calculate summary data
  const summary: MeasurementsSummaryData = useMemo(() => {
    const latest = latestQuery.data;
    const trends = trendsQuery.data;

    return {
      currentWeight: latest?.weight ?? null,
      weightUnit: latest?.weightUnit ?? "kg",
      currentBodyFat: latest?.bodyFatPercentage ?? null,
      weightChange: trends?.weightChange ?? null,
      bodyFatChange: trends?.bodyFatChange ?? null,
      measurementCount: trends?.measurementCount ?? 0,
      lastMeasuredAt: latest?.measuredAt ? toSafeDate(latest.measuredAt) : null,
      isLoading: latestQuery.isLoading || trendsQuery.isLoading,
    };
  }, [latestQuery.data, latestQuery.isLoading, trendsQuery.data, trendsQuery.isLoading]);

  // Transform trends data for charts
  const chartData: TrendChartDataPoint[] = useMemo(() => {
    const dataPoints = trendsQuery.data?.dataPoints ?? [];

    return dataPoints.map((point) => ({
      date: formatDateForChart(new Date(point.date)),
      weight: point.weight,
      bodyFatPercentage: point.bodyFatPercentage,
    }));
  }, [trendsQuery.data?.dataPoints]);

  // Transform measurements for history table
  const historyData: MeasurementHistoryRow[] = useMemo(() => {
    const measurements = listQuery.data?.measurements ?? [];

    return measurements.map((m) => ({
      id: m.id,
      date: new Date(m.measuredAt),
      weight: m.weight,
      weightUnit: m.weightUnit,
      bodyFatPercentage: m.bodyFatPercentage,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips,
      leftArm: m.leftArm,
      rightArm: m.rightArm,
      leftThigh: m.leftThigh,
      rightThigh: m.rightThigh,
      notes: m.notes,
    }));
  }, [listQuery.data?.measurements]);

  return {
    // Data
    summary,
    chartData,
    historyData,
    latestMeasurement: latestQuery.data,

    // Period state
    period,
    setPeriod,

    // Loading states
    isLoading: listQuery.isLoading || trendsQuery.isLoading,
    isLoadingLatest: latestQuery.isLoading,
    isError: listQuery.isError || trendsQuery.isError,

    // Refetch functions
    refetch: () => {
      latestQuery.refetch();
      listQuery.refetch();
      trendsQuery.refetch();
    },

    // Mutations
    createMeasurement: createMutation.mutateAsync,
    updateMeasurement: updateMutation.mutateAsync,
    deleteMeasurement: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
