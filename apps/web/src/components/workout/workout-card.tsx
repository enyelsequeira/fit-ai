import { Calendar, Clock, Dumbbell, MoreVertical, Play, Trash2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exerciseCount?: number;
  duration?: number | null;
  totalVolume?: number;
  rating?: number | null;
  onDelete?: () => void;
  onContinue?: () => void;
  className?: string;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume} kg`;
}

function WorkoutCard({
  id,
  name,
  startedAt,
  completedAt,
  exerciseCount = 0,
  duration,
  totalVolume = 0,
  rating,
  onDelete,
  onContinue,
  className,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const isInProgress = !completedAt;
  const workoutUrl = `/workouts/${id}`;

  const handleNavigate = () => {
    navigate({ to: workoutUrl });
  };

  return (
    <Card className={cn("relative group", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="min-w-0 flex-1">
          <Link to={workoutUrl} className="hover:underline">
            <h3 className="font-medium text-sm truncate">{name || `Workout #${id}`}</h3>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Calendar className="size-3" />
            <span>{formatDate(startedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Badge variant={isInProgress ? "warning" : "success"}>
            {isInProgress ? "In Progress" : "Completed"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleNavigate}>View Details</DropdownMenuItem>
              {isInProgress && onContinue && (
                <DropdownMenuItem onClick={onContinue}>
                  <Play className="size-4 mr-2" />
                  Continue Workout
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Dumbbell className="size-3" />
            <span>{exerciseCount} exercises</span>
          </div>

          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}

          {totalVolume > 0 && (
            <div className="flex items-center gap-1">
              <span>{formatVolume(totalVolume)}</span>
            </div>
          )}

          {rating && (
            <div className="flex items-center gap-1">
              <span>{"★".repeat(rating)}</span>
            </div>
          )}
        </div>

        {isInProgress && (
          <Button variant="default" size="sm" className="w-full mt-3" onClick={handleNavigate}>
            <Play className="size-4 mr-1" />
            Continue Workout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export { WorkoutCard, formatDate, formatDuration, formatVolume };
