/**
 * Custom hook for managing body measurements data and state
 */

import type {
  MeasurementHistoryRow,
  MeasurementsSummaryData,
  TimePeriod,
  TrendChartDataPoint,
} from "./types";

import { useMemo, useState } from "react";

import {
  useCreateMeasurement,
  useDeleteMeasurement,
  useUpdateMeasurement,
} from "./hooks/use-mutations";
import {
  useMeasurementLatest,
  useMeasurementList,
  useMeasurementTrends,
} from "./queries/use-queries";

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

function formatDateForChart(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function toSafeDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function useMeasurementsData() {
  const [period, setPeriod] = useState<TimePeriod>("month");

  const { startDate, endDate } = getDateRange(period);

  // Queries
  const latestQuery = useMeasurementLatest();
  const listQuery = useMeasurementList({ startDate, endDate, limit: 100, offset: 0 });
  const trendsQuery = useMeasurementTrends({ period, startDate, endDate });

  // Mutations
  const createMutation = useCreateMeasurement();
  const updateMutation = useUpdateMeasurement();
  const deleteMutation = useDeleteMeasurement();

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
      leftCalf: m.leftCalf,
      rightCalf: m.rightCalf,
      neck: m.neck,
      shoulders: m.shoulders,
      notes: m.notes,
    }));
  }, [listQuery.data?.measurements]);

  return {
    summary,
    chartData,
    historyData,
    latestMeasurement: latestQuery.data,
    period,
    setPeriod,
    isLoading: listQuery.isLoading || trendsQuery.isLoading,
    isLoadingLatest: latestQuery.isLoading,
    isError: listQuery.isError || trendsQuery.isError,
    refetch: () => {
      latestQuery.refetch();
      listQuery.refetch();
      trendsQuery.refetch();
    },
    createMeasurement: createMutation.mutateAsync,
    updateMeasurement: updateMutation.mutateAsync,
    deleteMeasurement: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
