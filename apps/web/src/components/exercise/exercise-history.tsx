import { useQuery } from "@tanstack/react-query";
import { Calendar, Dumbbell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

interface ExerciseHistoryProps {
  exerciseId: number;
  limit?: number;
}

export function ExerciseHistory({ exerciseId, limit = 10 }: ExerciseHistoryProps) {
  const progression = useQuery(
    orpc.history.getProgression.queryOptions({
      input: { exerciseId, limit },
    }),
  );

  if (progression.isLoading) {
    return <ExerciseHistorySkeleton />;
  }

  const dataPoints = progression.data?.dataPoints;

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Dumbbell className="text-muted-foreground mx-auto size-8" />
          <p className="text-muted-foreground mt-2 text-sm">No history yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Complete workouts with this exercise to see your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="text-muted-foreground size-4" />
          Exercise History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-border divide-y">
          {dataPoints.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  {entry.topSetWeight} kg x {entry.topSetReps}
                </p>
                <p className="text-muted-foreground text-xs">Volume: {entry.totalVolume}</p>
                {entry.estimated1RM > 0 && (
                  <p className="text-muted-foreground text-xs">
                    Est. 1RM: {entry.estimated1RM.toFixed(1)} kg
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ExerciseHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="divide-border divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="ml-auto h-4 w-20" />
                <Skeleton className="ml-auto h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
