import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

interface ExerciseStatsProps {
  exerciseId: number;
}

export function ExerciseStats({ exerciseId }: ExerciseStatsProps) {
  const lastPerformance = useQuery(
    orpc.history.getLastPerformance.queryOptions({ input: { exerciseId } }),
  );

  const bestPerformance = useQuery(
    orpc.history.getBestPerformance.queryOptions({ input: { exerciseId } }),
  );

  const personalRecords = useQuery(
    orpc.personalRecord.getByExercise.queryOptions({ input: { exerciseId } }),
  );

  const isLoading =
    lastPerformance.isLoading || bestPerformance.isLoading || personalRecords.isLoading;

  if (isLoading) {
    return <ExerciseStatsSkeleton />;
  }

  const hasData = lastPerformance.data || bestPerformance.data || personalRecords.data?.length;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            You haven&apos;t performed this exercise yet.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Add this exercise to a workout to start tracking your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lastPerformance.data && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="text-muted-foreground size-4" />
              Last Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">
                {new Date(lastPerformance.data.lastWorkoutDate).toLocaleDateString()}
              </p>
              {lastPerformance.data.topSet && (
                <>
                  <p className="text-sm font-medium">{lastPerformance.data.topSet.weight} kg</p>
                  <p className="text-muted-foreground text-xs">
                    {lastPerformance.data.topSet.reps} reps
                  </p>
                </>
              )}
              <p className="text-muted-foreground text-xs">
                Total volume: {lastPerformance.data.totalVolume}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {bestPerformance.data && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="size-4 text-yellow-500" />
              Best Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bestPerformance.data.maxWeight && (
                <div>
                  <p className="text-muted-foreground text-xs">Max Weight</p>
                  <p className="text-sm font-medium">
                    {bestPerformance.data.maxWeight.value} kg x{" "}
                    {bestPerformance.data.maxWeight.reps} reps
                  </p>
                </div>
              )}
              {bestPerformance.data.estimated1RM && (
                <div>
                  <p className="text-muted-foreground text-xs">Estimated 1RM</p>
                  <p className="text-sm font-medium">
                    {bestPerformance.data.estimated1RM.value.toFixed(1)} kg
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {personalRecords.data && personalRecords.data.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="size-4 text-amber-500" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {personalRecords.data.slice(0, 3).map((pr) => (
                <div key={pr.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">
                    {pr.recordType.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium">{pr.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExerciseStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
