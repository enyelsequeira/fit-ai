/**
 * MoodDisplay - Mood indicator badge
 */

import { Badge, Group, Text } from "@mantine/core";
import type { Mood } from "./types";
import { MOOD_CONFIG } from "./utils";

interface MoodDisplayProps {
  mood: Mood | null;
}

function MoodDisplay({ mood }: MoodDisplayProps) {
  if (!mood) return null;

  const moodInfo = MOOD_CONFIG[mood];

  return (
    <Group gap="xs">
      <Text fz="xs" c="dimmed">
        Mood:
      </Text>
      <Badge size="sm" color={moodInfo.color} variant="light">
        {moodInfo.label}
      </Badge>
    </Group>
  );
}

export { MoodDisplay };
export type { MoodDisplayProps };
