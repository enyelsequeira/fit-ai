import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ActivityIcon, CalendarPlusIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { FactorsBreakdown, ReadinessScore } from "@/components/ai/readiness-score";
import { MuscleRecoveryMap } from "@/components/recovery/muscle-recovery-map";
import { RecoveryTrends } from "@/components/recovery/recovery-trends";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/functions/get-user";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/recovery/")({
  component: RecoveryStatusPage,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});

function RecoveryStatusPage() {
  // Fetch readiness score
  const readiness = useQuery(orpc.recovery.getReadiness.queryOptions());

  // Fetch muscle recovery status
  const recoveryStatus = useQuery(orpc.recovery.getRecoveryStatus.queryOptions());

  // Fetch check-in trends
  const trends = useQuery(orpc.recovery.getTrends.queryOptions({ input: { period: "month" } }));

  // Fetch check-in history
  const checkInHistory = useQuery(
    orpc.recovery.getCheckInHistory.queryOptions({ input: { limit: 7 } }),
  );

  // Refresh recovery mutation
  const refreshRecovery = useMutation(
    orpc.recovery.refreshRecovery.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["recovery"] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to refresh recovery data");
      },
    }),
  );

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ActivityIcon className="size-5" />
            Recovery Status
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your recovery and training readiness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshRecovery.mutate({})}
            disabled={refreshRecovery.isPending}
            className="gap-1.5"
          >
            <RefreshCwIcon
              className={`size-3.5 ${refreshRecovery.isPending ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Link to="/recovery/check-in">
            <Button size="sm" className="gap-1.5">
              <CalendarPlusIcon className="size-3.5" />
              Log Check-in
            </Button>
          </Link>
        </div>
      </div>

      {/* Readiness Score Hero */}
      <Card>
        <CardContent className="py-8">
          {readiness.isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="size-32 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
          ) : readiness.data ? (
            <div className="flex flex-col items-center gap-6">
              <ReadinessScore
                score={readiness.data.score}
                size="lg"
                recommendation={
                  readiness.data.recommendation === "ready to train hard"
                    ? "Ready for hard training!"
                    : readiness.data.recommendation === "light training recommended"
                      ? "Light training recommended"
                      : "Rest day suggested"
                }
              />
              <FactorsBreakdown factors={readiness.data.factors} className="w-full max-w-md" />
              {!readiness.data.todayCheckIn && (
                <p className="text-muted-foreground text-xs">
                  Log today's check-in for more accurate readiness
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              icon={ActivityIcon}
              title="No readiness data"
              description="Log a daily check-in to see your training readiness"
              action={
                <Link to="/recovery/check-in">
                  <Button size="sm">Log Check-in</Button>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Muscle Recovery Status */}
      {recoveryStatus.isLoading ? (
        <Skeleton className="h-96" />
      ) : recoveryStatus.data ? (
        <MuscleRecoveryMap muscleGroups={recoveryStatus.data.muscleGroups} />
      ) : null}

      {/* Check-in Trends */}
      {trends.isLoading ? (
        <Skeleton className="h-64" />
      ) : trends.data && trends.data.dataPoints > 0 ? (
        <RecoveryTrends trends={trends.data} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No trends data"
              description="Log more check-ins to see your trends over time"
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Recent Check-ins</CardTitle>
            {checkInHistory.data && checkInHistory.data.total > 7 && (
              <span className="text-xs text-muted-foreground">
                Showing 7 of {checkInHistory.data.total}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {checkInHistory.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : checkInHistory.data && checkInHistory.data.checkIns.length > 0 ? (
            <div className="space-y-2">
              {checkInHistory.data.checkIns.map((checkIn) => (
                <Link
                  key={checkIn.id}
                  to="/recovery/check-in"
                  search={{ date: checkIn.date }}
                  className="flex items-center justify-between p-3 rounded-none border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {new Date(checkIn.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {checkIn.mood && (
                      <span className="text-xs capitalize text-muted-foreground">
                        {checkIn.mood}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {checkIn.sleepHours !== null && <span>{checkIn.sleepHours}h sleep</span>}
                    {checkIn.energyLevel !== null && <span>Energy: {checkIn.energyLevel}/10</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No check-ins yet"
              description="Log your first daily check-in"
              action={
                <Link to="/recovery/check-in">
                  <Button size="sm">Log Check-in</Button>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
