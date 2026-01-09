import { Box, Card, Flex, Group, Skeleton, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconBarbell, IconCalendar } from "@tabler/icons-react";

import { orpc } from "@/utils/orpc";

interface ExerciseHistoryProps {
  exerciseId: number;
  limit?: number;
}

export function ExerciseHistory({ exerciseId, limit = 10 }: ExerciseHistoryProps) {
  const progression = useQuery(
    orpc.history.getProgression.queryOptions({
      input: { exerciseId, limit },
    }),
  );

  if (progression.isLoading) {
    return <ExerciseHistorySkeleton />;
  }

  const dataPoints = progression.data?.dataPoints;

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <Card withBorder>
        <Box py="xl" ta="center">
          <IconBarbell
            size={32}
            style={{
              color: "var(--mantine-color-dimmed)",
              margin: "0 auto",
            }}
          />
          <Text fz="sm" c="dimmed" mt="xs">
            No history yet
          </Text>
          <Text fz="xs" c="dimmed" mt={4}>
            Complete workouts with this exercise to see your progress.
          </Text>
        </Box>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Box mb="md">
        <Group gap="xs">
          <IconCalendar size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
          <Text fz="sm" fw={500}>
            Exercise History
          </Text>
        </Group>
      </Box>
      <Stack gap={0}>
        {dataPoints.map((entry, index) => (
          <Flex
            key={index}
            align="center"
            justify="space-between"
            py="sm"
            style={{
              borderTop: index > 0 ? "1px solid var(--mantine-color-default-border)" : undefined,
            }}
          >
            <Stack gap={4}>
              <Text fz="xs" fw={500}>
                {new Date(entry.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </Stack>

            <Stack gap={4} align="flex-end">
              <Text fz="sm" fw={500}>
                {entry.topSetWeight} kg x {entry.topSetReps}
              </Text>
              <Text fz="xs" c="dimmed">
                Volume: {entry.totalVolume}
              </Text>
              {entry.estimated1RM > 0 && (
                <Text fz="xs" c="dimmed">
                  Est. 1RM: {entry.estimated1RM.toFixed(1)} kg
                </Text>
              )}
            </Stack>
          </Flex>
        ))}
      </Stack>
    </Card>
  );
}

function ExerciseHistorySkeleton() {
  return (
    <Card withBorder>
      <Box mb="md">
        <Skeleton h={16} w={128} radius="sm" />
      </Box>
      <Stack gap={0}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Flex
            key={i}
            align="center"
            justify="space-between"
            py="sm"
            style={{
              borderTop: i > 1 ? "1px solid var(--mantine-color-default-border)" : undefined,
            }}
          >
            <Stack gap={4}>
              <Skeleton h={12} w={96} radius="sm" />
              <Skeleton h={12} w={64} radius="sm" />
            </Stack>
            <Stack gap={4} align="flex-end">
              <Skeleton h={16} w={80} radius="sm" />
              <Skeleton h={12} w={64} radius="sm" />
            </Stack>
          </Flex>
        ))}
      </Stack>
    </Card>
  );
}
