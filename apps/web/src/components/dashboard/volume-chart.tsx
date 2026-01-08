import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataPoint {
  periodStart: string;
  totalVolume: number;
}

interface VolumeChartProps {
  dataPoints: DataPoint[];
  isLoading?: boolean;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return String(volume);
}

function formatWeekLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function VolumeChart({ dataPoints, isLoading }: VolumeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Volume Trends
          </CardTitle>
          <CardDescription>Weekly training volume (kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end justify-between gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 40}px` }} />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Volume Trends
          </CardTitle>
          <CardDescription>Weekly training volume (kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground text-sm">Complete workouts to see volume trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxVolume = Math.max(...dataPoints.map((d) => d.totalVolume), 1);
  const minBarHeight = 8;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Volume Trends
        </CardTitle>
        <CardDescription>Weekly training volume (kg)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end justify-between gap-2">
          {dataPoints.map((point, index) => {
            const heightPercent =
              point.totalVolume > 0
                ? Math.max((point.totalVolume / maxVolume) * 100, minBarHeight)
                : minBarHeight;
            const isLast = index === dataPoints.length - 1;

            return (
              <div
                key={point.periodStart}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative flex h-40 w-full items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t transition-all",
                      isLast ? "bg-primary" : "bg-primary/40",
                      "group-hover:bg-primary/80",
                    )}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="bg-background text-foreground absolute -top-6 hidden rounded px-1.5 py-0.5 text-xs shadow group-hover:block">
                    {formatVolume(point.totalVolume)} kg
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatWeekLabel(point.periodStart)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Stats summary */}
        {dataPoints.length >= 2 && (
          <div className="mt-4 flex justify-between border-t pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Avg Volume</p>
              <p className="font-medium">
                {formatVolume(
                  Math.round(
                    dataPoints.reduce((sum, d) => sum + d.totalVolume, 0) / dataPoints.length,
                  ),
                )}{" "}
                kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">This Week</p>
              <p className="font-medium">
                {formatVolume(dataPoints[dataPoints.length - 1]?.totalVolume ?? 0)} kg
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VolumeChartSkeleton() {
  return <VolumeChart dataPoints={[]} isLoading={true} />;
}
