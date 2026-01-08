import { Scale, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: Date;
  weight: number | null;
}

interface WeightChartProps {
  dataPoints: DataPoint[];
  weightChange: number | null;
  isLoading?: boolean;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function WeightChart({ dataPoints, weightChange, isLoading }: WeightChartProps) {
  // Filter to only points with weight data
  const validPoints = dataPoints.filter(
    (d): d is { date: Date; weight: number } => d.weight !== null,
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weight Trend
          </CardTitle>
          <CardDescription>Body weight over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center">
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weight Trend
          </CardTitle>
          <CardDescription>Body weight over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Log body measurements to see weight trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weights = validPoints.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;
  const padding = range * 0.1;

  // Calculate points for SVG path
  const chartWidth = 300;
  const chartHeight = 160;
  const points = validPoints.map((point, index) => {
    const x = (index / (validPoints.length - 1 || 1)) * chartWidth;
    const y =
      chartHeight - ((point.weight - minWeight + padding) / (range + 2 * padding)) * chartHeight;
    return { x, y, ...point };
  });

  // Create SVG path
  const pathData =
    points.length > 0
      ? points.reduce((path, point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
        }, "")
      : "";

  // Create area path (for gradient fill)
  const areaPath =
    points.length > 0 ? `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z` : "";

  const latestWeight = validPoints[validPoints.length - 1]?.weight;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Weight Trend
        </CardTitle>
        <CardDescription>Body weight over time</CardDescription>
      </CardHeader>
      <CardContent>
        {/* SVG Chart */}
        <div className="relative h-48">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path d={areaPath} fill="url(#weightGradient)" />
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="hsl(var(--background))"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            ))}
          </svg>
          {/* Y-axis labels */}
          <div className="text-muted-foreground absolute left-0 top-0 flex h-full flex-col justify-between text-xs">
            <span>{(maxWeight + padding).toFixed(1)}</span>
            <span>{(minWeight - padding).toFixed(1)}</span>
          </div>
        </div>

        {/* X-axis labels */}
        {validPoints.length > 1 && (
          <div className="text-muted-foreground mt-2 flex justify-between text-xs">
            <span>{formatDate(validPoints[0]!.date)}</span>
            <span>{formatDate(validPoints[validPoints.length - 1]!.date)}</span>
          </div>
        )}

        {/* Stats summary */}
        <div className="mt-4 flex justify-between border-t pt-4 text-sm">
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="font-medium">{latestWeight?.toFixed(1)} kg</p>
          </div>
          {weightChange !== null && (
            <div className="text-right">
              <p className="text-muted-foreground">Change</p>
              <p
                className={cn(
                  "flex items-center gap-1 font-medium",
                  weightChange > 0 && "text-orange-500",
                  weightChange < 0 && "text-green-500",
                )}
              >
                {weightChange > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : weightChange < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                {weightChange > 0 ? "+" : ""}
                {weightChange.toFixed(1)} kg
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function WeightChartSkeleton() {
  return <WeightChart dataPoints={[]} weightChange={null} isLoading={true} />;
}
