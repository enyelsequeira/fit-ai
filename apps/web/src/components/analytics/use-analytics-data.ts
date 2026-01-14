/**
 * Custom hook for managing analytics data and state
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export type DateRangePeriod = "week" | "month" | "3months" | "year";
export type AnalyticsTab = "volume" | "strength" | "consistency";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

function getDateRangeFromPeriod(period: DateRangePeriod): DateRange {
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
    case "3months": {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case "year":
    default: {
      const startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
  }
}

function getWeeksFromPeriod(period: DateRangePeriod): number {
  switch (period) {
    case "week":
      return 1;
    case "month":
      return 4;
    case "3months":
      return 12;
    case "year":
      return 52;
    default:
      return 12;
  }
}

export interface VolumeDataPoint {
  week: string;
  volume: number;
  periodStart: string;
}

export interface MuscleVolumeData {
  name: string;
  value: number;
  color: string;
}

export interface StrengthDataPoint {
  date: string;
  oneRM: number;
  maxWeight: number;
}

export interface ConsistencyData {
  currentStreak: number;
  longestStreak: number;
  avgWorkoutsPerWeek: number;
  completionRate: number;
  totalWorkouts: number;
}

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#ef4444",
  back: "#f97316",
  shoulders: "#eab308",
  arms: "#22c55e",
  biceps: "#22c55e",
  triceps: "#16a34a",
  legs: "#06b6d4",
  quadriceps: "#06b6d4",
  hamstrings: "#0891b2",
  glutes: "#0e7490",
  core: "#8b5cf6",
  abs: "#8b5cf6",
  compound: "#ec4899",
  cardio: "#64748b",
  other: "#94a3b8",
};

export function useAnalyticsData() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("volume");
  const [period, setPeriod] = useState<DateRangePeriod>("3months");
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const { startDate, endDate } = useMemo(() => {
    if (customDateRange[0] && customDateRange[1]) {
      return { startDate: customDateRange[0], endDate: customDateRange[1] };
    }
    return getDateRangeFromPeriod(period);
  }, [period, customDateRange]);

  const weeks = getWeeksFromPeriod(period);

  // Weekly summary query
  const weeklySummaryQuery = useQuery(orpc.analytics.getWeeklySummary.queryOptions());

  // Volume trends query
  const volumeTrendsQuery = useQuery(
    orpc.analytics.getVolumeTrends.queryOptions({
      input: { period: "week", weeks },
    }),
  );

  // Volume by muscle query
  const volumeByMuscleQuery = useQuery(
    orpc.analytics.getVolumeByMuscle.queryOptions({
      input: { period: "week" },
    }),
  );

  // Strength trends query (enabled when exercise is selected)
  const strengthTrendsQuery = useQuery({
    ...orpc.analytics.getStrengthTrends.queryOptions({
      input: { exerciseId: selectedExerciseId ?? 0, limit: 20 },
    }),
    enabled: selectedExerciseId !== null,
  });

  // Consistency query
  const consistencyQuery = useQuery(orpc.analytics.getConsistency.queryOptions({ input: {} }));

  // Get exercises for strength trends selector
  const personalRecordsQuery = useQuery(
    orpc.personalRecord.list.queryOptions({ input: { limit: 200 } }),
  );

  // Process volume data
  const volumeData: VolumeDataPoint[] = useMemo(() => {
    const data = volumeTrendsQuery.data;
    if (!data) return [];

    const dataPoints = Array.isArray(data)
      ? data
      : ((data as { dataPoints?: Array<{ totalVolume?: number; periodStart?: string }> })
          .dataPoints ?? []);

    return dataPoints.map((v, index) => ({
      week: `W${index + 1}`,
      volume: v.totalVolume ?? 0,
      periodStart: v.periodStart ?? "",
    }));
  }, [volumeTrendsQuery.data]);

  // Process muscle volume data
  const muscleVolumeData: MuscleVolumeData[] = useMemo(() => {
    const data = volumeByMuscleQuery.data;
    if (!data) return [];

    const muscleObject = typeof data === "object" ? data : {};
    return Object.entries(muscleObject)
      .filter(([_, value]) => typeof value === "number" && (value as number) > 0)
      .map(([muscle, volume]) => ({
        name: muscle.charAt(0).toUpperCase() + muscle.slice(1),
        value: volume as number,
        color: MUSCLE_COLORS[muscle.toLowerCase()] ?? MUSCLE_COLORS.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [volumeByMuscleQuery.data]);

  // Process strength data
  const strengthData: StrengthDataPoint[] = useMemo(() => {
    const data = strengthTrendsQuery.data;
    if (!data) return [];

    const dataPoints =
      (data as { dataPoints?: Array<{ date: string; estimated1RM?: number; maxWeight?: number }> })
        ?.dataPoints ?? [];

    return dataPoints.map((d) => ({
      date: formatDate(d.date),
      oneRM: d.estimated1RM ?? 0,
      maxWeight: d.maxWeight ?? 0,
    }));
  }, [strengthTrendsQuery.data]);

  // Process consistency data
  const consistencyData: ConsistencyData = useMemo(() => {
    const data = consistencyQuery.data as
      | {
          currentStreak?: number;
          longestStreak?: number;
          avgWorkoutsPerWeek?: number;
          completionRate?: number;
          totalWorkouts?: number;
        }
      | undefined;

    return {
      currentStreak: data?.currentStreak ?? 0,
      longestStreak: data?.longestStreak ?? 0,
      avgWorkoutsPerWeek: data?.avgWorkoutsPerWeek ?? 0,
      completionRate: data?.completionRate ?? 0,
      totalWorkouts: data?.totalWorkouts ?? 0,
    };
  }, [consistencyQuery.data]);

  // Get unique exercises from personal records for the selector
  const exercises = useMemo(() => {
    const data = personalRecordsQuery.data;
    const records =
      (data as { records?: Array<{ exerciseId: number; exerciseName?: string }> })?.records ?? [];

    const uniqueExercises = new Map<number, { id: number; name: string }>();
    for (const record of records) {
      if (!uniqueExercises.has(record.exerciseId)) {
        uniqueExercises.set(record.exerciseId, {
          id: record.exerciseId,
          name: record.exerciseName ?? `Exercise ${record.exerciseId}`,
        });
      }
    }
    return Array.from(uniqueExercises.values());
  }, [personalRecordsQuery.data]);

  // Weekly summary data
  const weeklySummary = useMemo(() => {
    const data = weeklySummaryQuery.data as
      | {
          totalWorkouts?: number;
          totalVolumeKg?: number;
          totalExercises?: number;
          personalRecords?: number;
        }
      | undefined;

    return {
      totalWorkouts: data?.totalWorkouts ?? 0,
      totalVolume: data?.totalVolumeKg ?? 0,
      totalExercises: data?.totalExercises ?? 0,
      personalRecords: data?.personalRecords ?? 0,
    };
  }, [weeklySummaryQuery.data]);

  const isLoading =
    weeklySummaryQuery.isLoading ||
    volumeTrendsQuery.isLoading ||
    volumeByMuscleQuery.isLoading ||
    consistencyQuery.isLoading;

  const isError =
    weeklySummaryQuery.isError ||
    volumeTrendsQuery.isError ||
    volumeByMuscleQuery.isError ||
    consistencyQuery.isError;

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Period state
    period,
    setPeriod,
    startDate,
    endDate,
    customDateRange,
    setCustomDateRange,

    // Exercise selection for strength
    selectedExerciseId,
    setSelectedExerciseId,
    exercises,

    // Data
    weeklySummary,
    volumeData,
    muscleVolumeData,
    strengthData,
    consistencyData,

    // Loading states
    isLoading,
    isError,
    isStrengthLoading: strengthTrendsQuery.isLoading,

    // Refetch
    refetch: () => {
      weeklySummaryQuery.refetch();
      volumeTrendsQuery.refetch();
      volumeByMuscleQuery.refetch();
      consistencyQuery.refetch();
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export { MUSCLE_COLORS };
