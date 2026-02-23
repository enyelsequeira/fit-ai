import { Box, Stack, Text, Tooltip } from "@mantine/core";

import { formatShortDate, formatVolume, isToday } from "@/components/ui/utils";

import type { DayData } from "./utils";
import { getIntensityLevel } from "./utils";

import styles from "./workout-frequency.module.css";

interface HeatmapCellProps {
  day: DayData;
  index: number;
}

function TooltipContent({ day }: { day: DayData }) {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600}>
        {formatShortDate(day.date)}
      </Text>
      {day.workoutCount > 0 ? (
        <>
          <Text size="xs">
            {day.workoutCount} workout{day.workoutCount > 1 ? "s" : ""}
          </Text>
          <Text size="xs" c="dimmed">
            Volume: {formatVolume(day.totalVolume)}
          </Text>
          {day.workoutNames && day.workoutNames.length > 0 && (
            <Text size="xs" c="dimmed">
              {day.workoutNames.slice(0, 3).join(", ")}
              {day.workoutNames.length > 3 && ` +${day.workoutNames.length - 3} more`}
            </Text>
          )}
        </>
      ) : (
        <Text size="xs" c="dimmed">
          Rest day
        </Text>
      )}
    </Stack>
  );
}

export function HeatmapCell({ day, index }: HeatmapCellProps) {
  const level = getIntensityLevel(day.workoutCount, day.totalVolume);
  const levelClass = styles[`level${level}` as keyof typeof styles];
  const isTodayCell = isToday(day.date);

  return (
    <Tooltip label={<TooltipContent day={day} />} position="top" withArrow>
      <Box
        className={`${styles.cell} ${levelClass} ${isTodayCell ? styles.today : ""}`}
        style={{ animationDelay: `${index * 15}ms` }}
        aria-label={`${formatShortDate(day.date)}: ${day.workoutCount} workouts`}
      />
    </Tooltip>
  );
}
