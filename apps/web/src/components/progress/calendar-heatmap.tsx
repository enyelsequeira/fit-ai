import { useMemo } from "react";

import dayjs from "dayjs";

import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarHeatmapProps {
  workoutDates: string[];
  weeks?: number;
}

export function CalendarHeatmap({ workoutDates, weeks = 12 }: CalendarHeatmapProps) {
  const heatmapData = useMemo(() => {
    const dateSet = new Set(workoutDates.map((d) => dayjs(d).format("YYYY-MM-DD")));

    const weeksData: { date: Date; hasWorkout: boolean }[][] = [];
    const today = new Date();

    for (let weekOffset = weeks - 1; weekOffset >= 0; weekOffset--) {
      const week: { date: Date; hasWorkout: boolean }[] = [];
      const weekStart = dayjs(today).subtract(weekOffset, "week").toDate();

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = dayjs(weekStart)
          .subtract(weekStart.getDay() - dayOffset, "day")
          .toDate();
        const dateKey = dayjs(date).format("YYYY-MM-DD");
        week.push({
          date,
          hasWorkout: dateSet.has(dateKey),
        });
      }
      weeksData.push(week);
    }

    return weeksData;
  }, [workoutDates, weeks]);

  return (
    <div>
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
                  title={`${dayjs(day.date).format("MMM D, YYYY")}${day.hasWorkout ? " - Workout" : ""}`}
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
    </div>
  );
}
