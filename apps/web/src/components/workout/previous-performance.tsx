import type { useQuery } from "@tanstack/react-query";

import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface PreviousPerformanceProps {
  lastPerformance: ReturnType<
    typeof useQuery<{
      exerciseId: number;
      exerciseName: string;
      lastWorkoutDate: Date;
      sets: Array<{
        setNumber: number;
        weight: number | null;
        weightUnit: string | null;
        reps: number | null;
        rpe: number | null;
        setType: string | null;
      }>;
      totalVolume: number;
      topSet: { weight: number; reps: number } | null;
    } | null>
  >;
  bestPerformance?: ReturnType<
    typeof useQuery<{
      exerciseId: number;
      exerciseName: string;
      maxWeight: { value: number; reps: number; date: Date } | null;
      maxReps: { value: number; weight: number; date: Date } | null;
      maxVolume: { value: number; date: Date } | null;
      estimated1RM: { value: number; date: Date } | null;
    }>
  >;
  className?: string;
}

function PreviousPerformance({
  lastPerformance,
  bestPerformance,
  className,
}: PreviousPerformanceProps) {
  const last = lastPerformance.data;
  const best = bestPerformance?.data;

  if (lastPerformance.isLoading) {
    return (
      <div className={cn("text-muted-foreground animate-pulse text-xs", className)}>
        Loading previous performance...
      </div>
    );
  }

  if (!last?.topSet) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs", className)}>
      <div className="text-muted-foreground flex items-center gap-1.5">
        <span>Last:</span>
        <span className="text-foreground font-medium">
          {last.topSet.weight}kg x {last.topSet.reps}
        </span>
        {last.sets.find((s) => s.setNumber === 1)?.rpe && (
          <span className="text-muted-foreground">
            (RPE {last.sets.find((s) => s.setNumber === 1)?.rpe})
          </span>
        )}
      </div>

      {best?.maxWeight && (
        <div className="text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="size-3 text-green-500" />
          <span>Best:</span>
          <span className="text-foreground font-medium">
            {best.maxWeight.value}kg x {best.maxWeight.reps}
          </span>
        </div>
      )}
    </div>
  );
}

interface SimplePreviousPerformanceProps {
  lastWeight?: number | null;
  lastReps?: number | null;
  lastRpe?: number | null;
  bestWeight?: number | null;
  bestReps?: number | null;
  className?: string;
}

function SimplePreviousPerformance({
  lastWeight,
  lastReps,
  lastRpe,
  bestWeight,
  bestReps,
  className,
}: SimplePreviousPerformanceProps) {
  if (!lastWeight && !lastReps) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs", className)}>
      {lastWeight && lastReps && (
        <div className="text-muted-foreground flex items-center gap-1.5">
          <span>Last:</span>
          <span className="text-foreground font-medium">
            {lastWeight}kg x {lastReps}
          </span>
          {lastRpe && <span>(RPE {lastRpe})</span>}
        </div>
      )}

      {bestWeight && bestReps && (
        <div className="text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="size-3 text-green-500" />
          <span>Best:</span>
          <span className="text-foreground font-medium">
            {bestWeight}kg x {bestReps}
          </span>
        </div>
      )}
    </div>
  );
}

export { PreviousPerformance, SimplePreviousPerformance };
