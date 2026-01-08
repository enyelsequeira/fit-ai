import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Clock, Dumbbell, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkoutMood } from "@/components/workout/complete-workout-form";
import { CompleteWorkoutForm } from "@/components/workout/complete-workout-form";
import { formatDuration, formatVolume } from "@/components/workout/workout-card";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/workouts/$workoutId/complete")({
  component: CompleteWorkoutRoute,
});

function CompleteWorkoutRoute() {
  const { workoutId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const workoutIdNum = Number.parseInt(workoutId, 10);

  const workout = useQuery(
    orpc.workout.getById.queryOptions({ input: { workoutId: workoutIdNum } }),
  );

  const completeWorkoutMutation = useMutation({
    ...orpc.workout.complete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workout", "getById"] });
      toast.success("Workout completed! Great job!");
      navigate({ to: "/workouts" });
    },
    onError: (error) => {
      toast.error("Failed to complete workout", { description: error.message });
    },
  });

  const handleComplete = (data: { rating: number; mood: WorkoutMood; notes: string }) => {
    completeWorkoutMutation.mutate({
      workoutId: workoutIdNum,
      rating: data.rating,
      mood: data.mood,
      notes: data.notes || undefined,
    });
  };

  if (workout.isLoading) {
    return <CompleteWorkoutSkeleton />;
  }

  if (workout.isError) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-xl">
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load workout"
          description={workout.error.message}
          action={
            <Button variant="outline" onClick={() => workout.refetch()}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  const workoutData = workout.data;
  if (!workoutData) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-xl">
        <EmptyState
          icon={AlertTriangle}
          title="Workout not found"
          action={
            <Link to="/workouts" className={cn(buttonVariants({ variant: "default" }))}>
              Back to Workouts
            </Link>
          }
        />
      </div>
    );
  }

  // If already completed, redirect
  if (workoutData.completedAt) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-xl">
        <EmptyState
          icon={Trophy}
          title="Workout already completed"
          description="This workout has already been marked as complete"
          action={
            <Link to="/workouts" className={cn(buttonVariants({ variant: "default" }))}>
              View All Workouts
            </Link>
          }
        />
      </div>
    );
  }

  // Calculate stats
  const exercises = workoutData.workoutExercises ?? [];
  const totalSets = exercises.reduce((acc, e) => acc + (e.sets?.length ?? 0), 0);
  const completedSets = exercises.reduce(
    (acc, e) => acc + (e.sets?.filter((s) => s.isCompleted).length ?? 0),
    0,
  );
  const totalVolume = exercises.reduce(
    (acc, e) =>
      acc +
      (e.sets?.reduce((setAcc, s) => {
        if (s.setType === "warmup" || !s.isCompleted) return setAcc;
        return setAcc + (s.weight ?? 0) * (s.reps ?? 0);
      }, 0) ?? 0),
    0,
  );
  const duration = Math.round((new Date().getTime() - workoutData.startedAt.getTime()) / 60000);

  return (
    <div className="container mx-auto py-6 px-4 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/workouts/$workoutId"
          params={{ workoutId }}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Complete Workout</h1>
          <p className="text-sm text-muted-foreground">
            {workoutData.name || `Workout #${workoutData.id}`}
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Workout Summary</CardTitle>
          <CardDescription>Great work! Here's what you accomplished</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <StatItem icon={Clock} label="Duration" value={formatDuration(duration)} />
            <StatItem icon={Dumbbell} label="Exercises" value={exercises.length.toString()} />
            <StatItem label="Sets Completed" value={`${completedSets}/${totalSets}`} />
            <StatItem icon={Trophy} label="Total Volume" value={formatVolume(totalVolume)} />
          </div>

          {/* PRs would go here */}
          {/* <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-green-500 mb-2">New Personal Records!</p>
            <div className="space-y-1">
              <p className="text-xs">Bench Press: 85kg x 8 (prev: 82.5kg x 8)</p>
            </div>
          </div> */}
        </CardContent>
      </Card>

      {/* Complete Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Rate Your Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <CompleteWorkoutForm
            onSubmit={handleComplete}
            isSubmitting={completeWorkoutMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface StatItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="flex size-8 items-center justify-center bg-muted rounded-none">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function CompleteWorkoutSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="size-8" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-48 w-full mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
