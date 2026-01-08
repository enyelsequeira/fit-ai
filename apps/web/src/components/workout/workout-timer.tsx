import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface WorkoutTimerProps {
  startedAt: Date;
  className?: string;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function WorkoutTimer({ startedAt, className }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      setElapsed(Math.max(0, diff));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className={cn("flex items-center gap-2 font-mono text-sm tabular-nums", className)}>
      <span className="text-muted-foreground">Duration:</span>
      <span className="font-medium">{formatTime(elapsed)}</span>
    </div>
  );
}

export { WorkoutTimer, formatTime };
