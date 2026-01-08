import { Calendar, Clock, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Workout {
  id: number;
  name: string | null;
  date: Date;
  duration: number | null;
  exerciseCount: number;
  setCount: number;
  totalVolume: number;
}

interface RecentWorkoutsProps {
  workouts: Workout[];
  isLoading?: boolean;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function WorkoutItem({ workout }: { workout: Workout }) {
  return (
    <div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{workout.name ?? "Workout"}</p>
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(workout.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(workout.duration)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right text-sm">
        <p className="text-muted-foreground">{workout.exerciseCount} exercises</p>
        <p className="text-muted-foreground text-xs">{workout.setCount} sets</p>
      </div>
    </div>
  );
}

function WorkoutItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div>
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="mb-1 h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function RecentWorkouts({ workouts, isLoading }: RecentWorkoutsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
        <CardDescription>Your last 5 completed workouts</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <WorkoutItemSkeleton key={i} />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="py-8 text-center">
            <Dumbbell className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground mb-4">
              No workouts yet. Start your fitness journey!
            </p>
            <Button>Start Your First Workout</Button>
          </div>
        ) : (
          <div className="space-y-1">
            {workouts.map((workout) => (
              <WorkoutItem key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentWorkoutsSkeleton() {
  return <RecentWorkouts workouts={[]} isLoading={true} />;
}
