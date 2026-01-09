import { useEffect, useState } from "react";

import { Group, Text } from "@mantine/core";

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

function WorkoutTimer({ startedAt }: WorkoutTimerProps) {
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
    <Group gap="xs" style={{ fontFamily: "monospace" }}>
      <Text fz="sm" c="dimmed">
        Duration:
      </Text>
      <Text fz="sm" fw={500} style={{ fontVariantNumeric: "tabular-nums" }}>
        {formatTime(elapsed)}
      </Text>
    </Group>
  );
}

export { WorkoutTimer, formatTime };
