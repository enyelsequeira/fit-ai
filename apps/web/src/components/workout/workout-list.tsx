import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { client, orpc } from "@/utils/orpc";

import { WorkoutCard } from "./workout-card";

interface WorkoutListProps {
  status?: "all" | "in-progress" | "completed";
}

function WorkoutList({ status = "all" }: WorkoutListProps) {
  const queryClient = useQueryClient();

  const workouts = useInfiniteQuery({
    queryKey: ["workouts", status],
    queryFn: async ({ pageParam }) => {
      const completed = status === "all" ? undefined : status === "completed" ? true : false;

      const result = await client.workout.list({
        limit: 20,
        offset: pageParam,
        completed,
      });

      return result;
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });

  const deleteMutation = useMutation({
    ...orpc.workout.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete workout", {
        description: error.message,
      });
    },
  });

  const handleDelete = useCallback(
    (workoutId: number) => {
      if (window.confirm("Are you sure you want to delete this workout?")) {
        deleteMutation.mutate({ workoutId });
      }
    },
    [deleteMutation],
  );

  if (workouts.isLoading) {
    return <WorkoutListSkeleton />;
  }

  if (workouts.isError) {
    return (
      <EmptyState
        title="Failed to load workouts"
        description={workouts.error.message}
        action={
          <Button variant="outline" onClick={() => workouts.refetch()}>
            Try Again
          </Button>
        }
      />
    );
  }

  const allWorkouts = workouts.data?.pages.flatMap((page) => page.workouts) ?? [];

  if (allWorkouts.length === 0) {
    return (
      <EmptyState
        title={
          status === "in-progress"
            ? "No workouts in progress"
            : status === "completed"
              ? "No completed workouts"
              : "No workouts yet"
        }
        description={
          status === "in-progress"
            ? "Start a new workout to see it here"
            : status === "completed"
              ? "Complete a workout to see it here"
              : "Start your first workout to track your progress"
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            id={workout.id}
            name={workout.name}
            startedAt={workout.startedAt}
            completedAt={workout.completedAt}
            rating={workout.rating}
            onDelete={() => handleDelete(workout.id)}
          />
        ))}
      </div>

      {workouts.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => workouts.fetchNextPage()}
            disabled={workouts.isFetchingNextPage}
          >
            {workouts.isFetchingNextPage ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function WorkoutListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-border rounded-none p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { WorkoutList, WorkoutListSkeleton };
