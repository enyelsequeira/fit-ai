import { useQuery } from "@tanstack/react-query";
import {
  IconActivity,
  IconChartBar,
  IconCalendar,
  IconFlame,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#ef4444",
  back: "#f97316",
  shoulders: "#eab308",
  arms: "#22c55e",
  legs: "#06b6d4",
  core: "#8b5cf6",
  compound: "#ec4899",
  cardio: "#64748b",
  other: "#94a3b8",
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ExerciseOption {
  id: number;
  name: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateYMD(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function VolumeAnalysis() {
  const volumeTrends = useQuery(
    orpc.analytics.getVolumeTrends.queryOptions({ input: { period: "week", weeks: 12 } }),
  );
  const volumeByMuscle = useQuery(
    orpc.analytics.getVolumeByMuscle.queryOptions({ input: { period: "week" } }),
  );
  const volumeData = useMemo(() => {
    const data = volumeTrends.data;
    if (!data) return [];
    // Handle both array and object with dataPoints
    const dataPoints = Array.isArray(data) ? data : (data.dataPoints ?? []);
    return dataPoints.map((v: { totalVolume?: number; periodStart?: string }, index: number) => ({
      week: `W${index + 1}`,
      volume: v.totalVolume ?? 0,
    }));
  }, [volumeTrends.data]);

  const muscleData = useMemo(() => {
    const data = volumeByMuscle.data;
    if (!data) return [];
    // Handle both direct object and nested structure
    const muscleObject = typeof data === "object" ? data : {};
    return Object.entries(muscleObject)
      .filter(([_, value]) => typeof value === "number")
      .map(([muscle, volume]) => ({
        name: muscle.charAt(0).toUpperCase() + muscle.slice(1),
        value: volume as number,
        color: MUSCLE_COLORS[muscle] ?? MUSCLE_COLORS.other,
      }));
  }, [volumeByMuscle.data]);

  const volumeChange = 0; // Simplified - would need historical data

  if (volumeTrends.isLoading || volumeByMuscle.isLoading) {
    return <AnalyticsSectionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Volume Analysis</h3>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Volume Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconChartBar className="size-4" />
              Total Volume (Last 12 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volumeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0",
                        fontSize: "12px",
                      }}
                      formatter={(value) => {
                        if (typeof value === "number") {
                          return [`${value.toLocaleString()}kg`, "Volume"];
                        }
                        return [String(value), "Volume"];
                      }}
                    />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={IconChartBar}
                title="No volume data"
                description="Complete workouts to track volume"
              />
            )}
          </CardContent>
        </Card>

        {/* Volume By Muscle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <IconActivity className="size-4" />
                Volume by Muscle Group
              </span>
              <Badge variant={volumeChange >= 0 ? "success" : "destructive"}>
                {volumeChange >= 0 ? "+" : ""}
                {volumeChange.toFixed(1)}% vs last week
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {muscleData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={muscleData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {muscleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0",
                          fontSize: "12px",
                        }}
                        formatter={(value) => {
                          if (typeof value === "number") {
                            return [`${value.toLocaleString()}kg`, "Volume"];
                          }
                          return [String(value), "Volume"];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1">
                  {muscleData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <span className="font-medium">{item.value.toLocaleString()}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={IconActivity}
                title="No muscle data"
                description="Complete workouts to see muscle breakdown"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StrengthProgress() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  // Get list of exercises with PRs
  const allRecords = useQuery(orpc.personalRecord.list.queryOptions({ input: { limit: 200 } }));

  const exercises = useMemo(() => {
    const data = allRecords.data;
    const records =
      (data as { records?: Array<{ exerciseId: number; exerciseName?: string }> })?.records ?? [];
    const uniqueExercises = new Map<number, ExerciseOption>();
    for (const record of records) {
      if (!uniqueExercises.has(record.exerciseId)) {
        uniqueExercises.set(record.exerciseId, {
          id: record.exerciseId,
          name: record.exerciseName ?? `Exercise ${record.exerciseId}`,
        });
      }
    }
    return Array.from(uniqueExercises.values());
  }, [allRecords.data]);

  const strengthTrends = useQuery({
    ...orpc.analytics.getStrengthTrends.queryOptions({
      input: { exerciseId: selectedExerciseId ?? 0, limit: 20 },
    }),
    enabled: selectedExerciseId !== null,
  });

  const chartData = useMemo(() => {
    const data = strengthTrends.data;
    if (!data) return [];
    const dataPoints =
      (data as { dataPoints?: Array<{ date: string; estimated1RM?: number; maxWeight?: number }> })
        ?.dataPoints ?? [];
    return dataPoints.map((d) => ({
      date: formatDate(d.date),
      oneRM: d.estimated1RM ?? 0,
      maxWeight: d.maxWeight ?? 0,
    }));
  }, [strengthTrends.data]);

  if (allRecords.isLoading) {
    return <AnalyticsSectionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Strength Progress</h3>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconTrendingUp className="size-4" />
            Exercise Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Label>Select Exercise</Label>
            <div className="flex flex-wrap gap-1">
              {exercises.slice(0, 10).map((exercise) => (
                <Button
                  key={exercise.id}
                  variant={selectedExerciseId === exercise.id ? "default" : "outline"}
                  size="xs"
                  onClick={() => setSelectedExerciseId(exercise.id)}
                >
                  {exercise.name}
                </Button>
              ))}
            </div>
          </div>

          {selectedExerciseId && chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="oneRM"
                    name="Est. 1RM"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name="Max Weight"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : selectedExerciseId ? (
            <EmptyState
              icon={IconTrendingUp}
              title="No data for this exercise"
              description="Complete more workouts with this exercise"
            />
          ) : (
            <EmptyState
              icon={IconTrendingUp}
              title="Select an exercise"
              description="Choose an exercise above to view progression"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingFrequency() {
  const frequency = useQuery(orpc.analytics.getFrequency.queryOptions({ input: {} }));
  const consistency = useQuery(orpc.analytics.getConsistency.queryOptions({ input: {} }));

  // Generate calendar heatmap data for last 12 weeks
  const heatmapData = useMemo(() => {
    const weeks: { date: Date; hasWorkout: boolean }[][] = [];
    const today = new Date();

    for (let weekOffset = 11; weekOffset >= 0; weekOffset--) {
      const week: { date: Date; hasWorkout: boolean }[] = [];
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekOffset * 7);

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() - weekStart.getDay() + dayOffset);
        week.push({
          date,
          hasWorkout: false, // Would need actual workout dates
        });
      }
      weeks.push(week);
    }

    return weeks;
  }, []);

  const weeklyData = useMemo(() => {
    const data = frequency.data as { byDayOfWeek?: Record<string, number> } | undefined;
    const counts = data?.byDayOfWeek ?? {};
    return DAYS_OF_WEEK.map((day, index) => ({
      day,
      count: counts[day.toLowerCase()] ?? counts[index.toString()] ?? 0,
    }));
  }, [frequency.data]);

  const mostActiveDay = useMemo(() => {
    if (weeklyData.length === 0) return null;
    const max = Math.max(...weeklyData.map((d) => d.count));
    const active = weeklyData.find((d) => d.count === max);
    return active && active.count > 0 ? active.day : null;
  }, [weeklyData]);

  if (frequency.isLoading || consistency.isLoading) {
    return <AnalyticsSectionSkeleton />;
  }

  const consistencyData = consistency.data as
    | {
        currentStreak?: number;
        longestStreak?: number;
        avgWorkoutsPerWeek?: number;
      }
    | undefined;
  const currentStreak = consistencyData?.currentStreak ?? 0;
  const longestStreak = consistencyData?.longestStreak ?? 0;
  const avgWorkoutsPerWeek = consistencyData?.avgWorkoutsPerWeek ?? 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Training Frequency</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                <IconFlame className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-xs text-muted-foreground">Current Streak (days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 text-amber-500 flex size-10 items-center justify-center rounded-full">
                <IconTrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{longestStreak}</p>
                <p className="text-xs text-muted-foreground">Longest Streak (days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 text-emerald-500 flex size-10 items-center justify-center rounded-full">
                <IconCalendar className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgWorkoutsPerWeek.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Workouts/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Activity (Last 12 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex h-4 items-center">
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={cn(
                          "size-4 rounded-sm",
                          day.hasWorkout ? "bg-primary" : "bg-muted",
                          day.date > new Date() && "opacity-30",
                        )}
                        title={`${day.date.toLocaleDateString()}${day.hasWorkout ? " - Workout" : ""}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="size-3 rounded-sm bg-muted" />
                <div className="size-3 rounded-sm bg-primary/30" />
                <div className="size-3 rounded-sm bg-primary/60" />
                <div className="size-3 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Workouts by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Workouts by Day of Week</span>
              {mostActiveDay && <Badge variant="secondary">Most Active: {mostActiveDay}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0",
                      fontSize: "12px",
                    }}
                    formatter={(value) => {
                      if (typeof value === "number") {
                        return [`${value} workouts`, "Count"];
                      }
                      return [String(value), "Count"];
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PeriodComparison() {
  const today = new Date();
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const [period1Start, setPeriod1Start] = useState(formatDateYMD(eightWeeksAgo));
  const [period1End, setPeriod1End] = useState(formatDateYMD(fourWeeksAgo));
  const [period2Start, setPeriod2Start] = useState(formatDateYMD(fourWeeksAgo));
  const [period2End, setPeriod2End] = useState(formatDateYMD(today));

  const comparison = useQuery(
    orpc.analytics.getComparison.queryOptions({
      input: {
        period1Start,
        period1End,
        period2Start,
        period2End,
      },
    }),
  );

  if (comparison.isLoading) {
    return <AnalyticsSectionSkeleton />;
  }

  const data = comparison.data as
    | {
        period1?: {
          summary?: {
            totalWorkouts?: number;
            totalVolumeKg?: number;
            personalRecords?: number;
            avgDurationMinutes?: number;
          };
        };
        period2?: {
          summary?: {
            totalWorkouts?: number;
            totalVolumeKg?: number;
            personalRecords?: number;
            avgDurationMinutes?: number;
          };
        };
      }
    | undefined;
  const period1Summary = data?.period1?.summary;
  const period2Summary = data?.period2?.summary;

  const hasData = period1Summary && period2Summary;
  const metrics = hasData
    ? [
        {
          label: "Workouts",
          p1: period1Summary.totalWorkouts ?? 0,
          p2: period2Summary.totalWorkouts ?? 0,
        },
        {
          label: "Total Volume (kg)",
          p1: period1Summary.totalVolumeKg ?? 0,
          p2: period2Summary.totalVolumeKg ?? 0,
        },
        {
          label: "PRs Achieved",
          p1: period1Summary.personalRecords ?? 0,
          p2: period2Summary.personalRecords ?? 0,
        },
        {
          label: "Avg Duration (min)",
          p1: period1Summary.avgDurationMinutes ?? 0,
          p2: period2Summary.avgDurationMinutes ?? 0,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Period Comparison</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Compare Two Time Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-none border border-border/50 p-3">
              <Label className="text-xs text-muted-foreground">Period 1</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={period1Start}
                  onChange={(e) => setPeriod1Start(e.target.value)}
                  className="flex-1"
                />
                <span className="flex items-center text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={period1End}
                  onChange={(e) => setPeriod1End(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2 rounded-none border border-border/50 p-3">
              <Label className="text-xs text-muted-foreground">Period 2</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={period2Start}
                  onChange={(e) => setPeriod2Start(e.target.value)}
                  className="flex-1"
                />
                <span className="flex items-center text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={period2End}
                  onChange={(e) => setPeriod2End(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {metrics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => {
                const change = metric.p1 > 0 ? ((metric.p2 - metric.p1) / metric.p1) * 100 : 0;
                const isPositive = change > 0;

                return (
                  <div
                    key={metric.label}
                    className="rounded-none border border-border/50 p-3 text-center"
                  >
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <div className="mt-2 flex items-center justify-center gap-4">
                      <div>
                        <p className="text-lg font-bold">
                          {typeof metric.p1 === "number" ? metric.p1.toLocaleString() : metric.p1}
                        </p>
                        <p className="text-xs text-muted-foreground">Period 1</p>
                      </div>
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isPositive
                            ? "text-emerald-500"
                            : change < 0
                              ? "text-red-500"
                              : "text-muted-foreground",
                        )}
                      >
                        {isPositive ? "+" : ""}
                        {change.toFixed(0)}%
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {typeof metric.p2 === "number" ? metric.p2.toLocaleString() : metric.p2}
                        </p>
                        <p className="text-xs text-muted-foreground">Period 2</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={IconChartBar}
              title="No comparison data"
              description="Need at least 2 weeks of data for comparison"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalyticsTab() {
  const weeklySummary = useQuery(orpc.analytics.getWeeklySummary.queryOptions());

  if (weeklySummary.isLoading) {
    return (
      <div className="space-y-8">
        <AnalyticsSectionSkeleton />
        <AnalyticsSectionSkeleton />
      </div>
    );
  }

  const hasData = ((weeklySummary.data as { totalWorkouts?: number })?.totalWorkouts ?? 0) > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={IconChartBar}
            title="Not enough data"
            description="Need at least 2 weeks of workout data for analytics"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <VolumeAnalysis />
      <StrengthProgress />
      <TrainingFrequency />
      <PeriodComparison />
    </div>
  );
}

function AnalyticsSectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
