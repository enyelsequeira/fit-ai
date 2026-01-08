import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "@fit-ai/api/routers/index";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  ActivityIcon,
  BarChart3Icon,
  CameraIcon,
  ScaleIcon,
  TrendingUpIcon,
  TrophyIcon,
  ZapIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getUser } from "@/functions/get-user";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AnalyticsTab } from "@/components/progress/analytics-tab";
import { BodyTab } from "@/components/progress/body-tab";
import { PhotosTab } from "@/components/progress/photos-tab";
import { RecordsTab } from "@/components/progress/records-tab";

export const Route = createFileRoute("/progress/")({
  component: ProgressPage,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

type AnalyticsSummary = RouterClient<AppRouter>["analytics"]["getWeeklySummary"] extends (
  ...args: infer _Args
) => Promise<infer R>
  ? R
  : never;

function formatWeight(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}kg`;
}

function formatChange(value: number | null | undefined, unit = "kg"): string {
  if (value === null || value === undefined) return "";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${unit}`;
}

function OverviewTab() {
  const latestMeasurement = useQuery(orpc.bodyMeasurement.getLatest.queryOptions());
  const measurementTrends = useQuery(
    orpc.bodyMeasurement.getTrends.queryOptions({ input: { period: "quarter" } }),
  );
  const weeklySummary = useQuery(orpc.analytics.getWeeklySummary.queryOptions());
  const prSummary = useQuery(orpc.personalRecord.getSummary.queryOptions());
  const recentPRs = useQuery(orpc.personalRecord.getRecent.queryOptions({ input: { days: 30 } }));
  const volumeTrends = useQuery(
    orpc.analytics.getVolumeTrends.queryOptions({ input: { period: "week", weeks: 8 } }),
  );
  const consistency = useQuery(orpc.analytics.getConsistency.queryOptions());

  const isLoading = latestMeasurement.isLoading || weeklySummary.isLoading || prSummary.isLoading;

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const currentWeight = latestMeasurement.data?.weight;
  const startWeight = measurementTrends.data?.startWeight;
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : null;

  const totalWorkouts = (weeklySummary.data as AnalyticsSummary)?.totalWorkouts ?? 0;
  const totalPRs = prSummary.data?.totalRecords ?? 0;
  const currentStreak = consistency.data?.currentStreak ?? 0;
  const bodyFat = latestMeasurement.data?.bodyFatPercentage;

  const weightData =
    measurementTrends.data?.weights?.map((w) => ({
      date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: w.weight,
    })) ?? [];

  const volumeData =
    volumeTrends.data?.map((v) => ({
      week: `W${v.weekNumber}`,
      volume: v.totalVolume,
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          icon={ScaleIcon}
          label="Current Weight"
          value={formatWeight(currentWeight)}
          change={formatChange(weightChange)}
          changeType={weightChange && weightChange < 0 ? "positive" : "neutral"}
        />
        <MetricCard
          icon={ActivityIcon}
          label="Body Fat"
          value={bodyFat ? `${bodyFat.toFixed(1)}%` : "—"}
          change={null}
        />
        <MetricCard
          icon={BarChart3Icon}
          label="Total Workouts"
          value={totalWorkouts.toString()}
          change={null}
        />
        <MetricCard
          icon={TrophyIcon}
          label="PRs Achieved"
          value={totalPRs.toString()}
          change={null}
        />
        <MetricCard
          icon={ZapIcon}
          label="Current Streak"
          value={`${currentStreak} days`}
          change={null}
        />
      </div>

      {/* Quick Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weight Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-4" />
              Weight Trend (Last 3 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={["dataMin - 2", "dataMax + 2"]}
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
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
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={ScaleIcon}
                title="No weight data"
                description="Track your first measurement to see progress"
              />
            )}
          </CardContent>
        </Card>

        {/* Volume Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="size-4" />
              Volume Trend (Last 8 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volumeData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={BarChart3Icon}
                title="No volume data"
                description="Complete workouts to track your volume"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="size-4" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPRs.data && recentPRs.data.length > 0 ? (
            <div className="space-y-3">
              {recentPRs.data.slice(0, 5).map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
                      <TrophyIcon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{pr.exerciseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pr.achievedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">{formatPRType(pr.recordType)}</Badge>
                    <p className="mt-1 text-sm font-medium">
                      {pr.value}
                      {pr.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrophyIcon}
              title="No PRs yet"
              description="Complete workouts to start setting records"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatPRType(type: string): string {
  const types: Record<string, string> = {
    one_rep_max: "Est. 1RM",
    max_weight: "Max Weight",
    max_reps: "Max Reps",
    max_volume: "Max Volume",
    best_time: "Best Time",
    longest_duration: "Longest Duration",
    longest_distance: "Longest Distance",
  };
  return types[type] ?? type;
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string | null;
  changeType?: "positive" | "negative" | "neutral";
}

function MetricCard({ icon: Icon, label, value, change, changeType = "neutral" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="bg-muted flex size-8 items-center justify-center rounded-full">
            <Icon className="text-muted-foreground size-4" />
          </div>
          {change && (
            <span
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-emerald-500",
                changeType === "negative" && "text-red-500",
                changeType === "neutral" && "text-muted-foreground",
              )}
            >
              {change}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="size-8 rounded-full" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProgressPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Progress & Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your fitness journey</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <TrendingUpIcon className="size-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="body" className="gap-1.5">
            <ScaleIcon className="size-3.5" />
            Body
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-1.5">
            <CameraIcon className="size-3.5" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="records" className="gap-1.5">
            <TrophyIcon className="size-3.5" />
            Records
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3Icon className="size-3.5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="body">
          <BodyTab />
        </TabsContent>

        <TabsContent value="photos">
          <PhotosTab />
        </TabsContent>

        <TabsContent value="records">
          <RecordsTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
