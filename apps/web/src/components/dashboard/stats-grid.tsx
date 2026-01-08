import type { ReactNode } from "react";

import { Activity, ArrowDownIcon, ArrowUpIcon, Flame, Scale, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
}

function StatCard({ title, value, description, icon, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            {trend.value > 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-green-500" />
            ) : trend.value < 0 ? (
              <ArrowDownIcon className="h-3 w-3 text-red-500" />
            ) : null}
            <span
              className={cn(trend.value > 0 && "text-green-500", trend.value < 0 && "text-red-500")}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}
            </span>
            <span>{trend.label}</span>
          </p>
        )}
        {description && !trend && <p className="text-muted-foreground text-xs">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  workoutsThisWeek: number;
  workoutsLastWeek?: number;
  currentStreak: number;
  longestStreak?: number;
  totalVolumeThisWeek: number;
  volumeLastWeek?: number;
  prsThisMonth: number;
  isLoading?: boolean;
}

export function StatsGrid({
  workoutsThisWeek,
  workoutsLastWeek,
  currentStreak,
  longestStreak,
  totalVolumeThisWeek,
  volumeLastWeek,
  prsThisMonth,
  isLoading,
}: StatsGridProps) {
  const workoutTrend =
    workoutsLastWeek !== undefined
      ? {
          value: workoutsThisWeek - workoutsLastWeek,
          label: "from last week",
        }
      : undefined;

  const volumeTrend =
    volumeLastWeek !== undefined && volumeLastWeek > 0
      ? {
          value: Math.round(((totalVolumeThisWeek - volumeLastWeek) / volumeLastWeek) * 100),
          label: "% from last week",
        }
      : undefined;

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k kg`;
    }
    return `${volume} kg`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Workouts This Week"
        value={workoutsThisWeek}
        icon={<Activity className="h-4 w-4" />}
        trend={workoutTrend}
        isLoading={isLoading}
      />
      <StatCard
        title="Current Streak"
        value={`${currentStreak} days`}
        icon={<Flame className="h-4 w-4" />}
        description={longestStreak ? `Longest: ${longestStreak} days` : undefined}
        isLoading={isLoading}
      />
      <StatCard
        title="Volume This Week"
        value={formatVolume(totalVolumeThisWeek)}
        icon={<Scale className="h-4 w-4" />}
        trend={volumeTrend}
        isLoading={isLoading}
      />
      <StatCard
        title="PRs This Month"
        value={prsThisMonth}
        icon={<Trophy className="h-4 w-4" />}
        description="Personal records achieved"
        isLoading={isLoading}
      />
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCard key={i} title="" value="" icon={null} isLoading={true} />
      ))}
    </div>
  );
}
