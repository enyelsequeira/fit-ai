/**
 * SorenessDisplay - Display soreness areas as badges
 */

import { Badge, Group, Text } from "@mantine/core";

interface SorenessDisplayProps {
  soreAreas: string[] | null;
  maxVisible?: number;
}

function SorenessDisplay({ soreAreas, maxVisible = 3 }: SorenessDisplayProps) {
  if (!soreAreas || soreAreas.length === 0) return null;

  const visibleAreas = soreAreas.slice(0, maxVisible);
  const remainingCount = soreAreas.length - maxVisible;

  return (
    <Group gap="xs">
      <Text fz="xs" c="dimmed">
        Sore:
      </Text>
      <Group gap={4}>
        {visibleAreas.map((area) => (
          <Badge key={area} size="xs" color="red" variant="light" tt="capitalize">
            {area}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Text fz="xs" c="dimmed">
            +{remainingCount}
          </Text>
        )}
      </Group>
    </Group>
  );
}

export { SorenessDisplay };
export type { SorenessDisplayProps };
