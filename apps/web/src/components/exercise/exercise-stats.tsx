import { Box, Card, Flex, Group, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconTrendingUp, IconTrophy } from "@tabler/icons-react";

import { orpc } from "@/utils/orpc";

interface ExerciseStatsProps {
  exerciseId: number;
}

export function ExerciseStats({ exerciseId }: ExerciseStatsProps) {
  const lastPerformance = useQuery(
    orpc.history.getLastPerformance.queryOptions({ input: { exerciseId } }),
  );

  const bestPerformance = useQuery(
    orpc.history.getBestPerformance.queryOptions({ input: { exerciseId } }),
  );

  const personalRecords = useQuery(
    orpc.personalRecord.getByExercise.queryOptions({ input: { exerciseId } }),
  );

  const isLoading =
    lastPerformance.isLoading || bestPerformance.isLoading || personalRecords.isLoading;

  if (isLoading) {
    return <ExerciseStatsSkeleton />;
  }

  const hasData = lastPerformance.data || bestPerformance.data || personalRecords.data?.length;

  if (!hasData) {
    return (
      <Card withBorder>
        <Box py="xl" ta="center">
          <Text fz="sm" c="dimmed">
            You haven&apos;t performed this exercise yet.
          </Text>
          <Text fz="xs" c="dimmed" mt={4}>
            Add this exercise to a workout to start tracking your progress.
          </Text>
        </Box>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {lastPerformance.data && (
        <Card withBorder>
          <Box pb="xs">
            <Group gap="xs">
              <IconTrendingUp size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
              <Text fz="sm" fw={500}>
                Last Performance
              </Text>
            </Group>
          </Box>
          <Stack gap={4}>
            <Text fz="xs" c="dimmed">
              {new Date(lastPerformance.data.lastWorkoutDate).toLocaleDateString()}
            </Text>
            {lastPerformance.data.topSet && (
              <>
                <Text fz="sm" fw={500}>
                  {lastPerformance.data.topSet.weight} kg
                </Text>
                <Text fz="xs" c="dimmed">
                  {lastPerformance.data.topSet.reps} reps
                </Text>
              </>
            )}
            <Text fz="xs" c="dimmed">
              Total volume: {lastPerformance.data.totalVolume}
            </Text>
          </Stack>
        </Card>
      )}

      {bestPerformance.data && (
        <Card withBorder>
          <Box pb="xs">
            <Group gap="xs">
              <IconTrophy size={16} style={{ color: "var(--mantine-color-yellow-5)" }} />
              <Text fz="sm" fw={500}>
                Best Performance
              </Text>
            </Group>
          </Box>
          <Stack gap="xs">
            {bestPerformance.data.maxWeight && (
              <Box>
                <Text fz="xs" c="dimmed">
                  Max Weight
                </Text>
                <Text fz="sm" fw={500}>
                  {bestPerformance.data.maxWeight.value} kg x {bestPerformance.data.maxWeight.reps}{" "}
                  reps
                </Text>
              </Box>
            )}
            {bestPerformance.data.estimated1RM && (
              <Box>
                <Text fz="xs" c="dimmed">
                  Estimated 1RM
                </Text>
                <Text fz="sm" fw={500}>
                  {bestPerformance.data.estimated1RM.value.toFixed(1)} kg
                </Text>
              </Box>
            )}
          </Stack>
        </Card>
      )}

      {personalRecords.data && personalRecords.data.length > 0 && (
        <Card withBorder>
          <Box pb="xs">
            <Group gap="xs">
              <IconTrophy size={16} style={{ color: "var(--mantine-color-orange-5)" }} />
              <Text fz="sm" fw={500}>
                Personal Records
              </Text>
            </Group>
          </Box>
          <Stack gap="xs">
            {personalRecords.data.slice(0, 3).map((pr) => (
              <Flex key={pr.id} justify="space-between">
                <Text fz="xs" c="dimmed" style={{ textTransform: "capitalize" }}>
                  {pr.recordType.replace(/_/g, " ")}
                </Text>
                <Text fz="xs" fw={500}>
                  {pr.value}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Card>
      )}
    </SimpleGrid>
  );
}

function ExerciseStatsSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {[1, 2, 3].map((i) => (
        <Card key={i} withBorder>
          <Box pb="xs">
            <Skeleton h={16} w={128} radius="sm" />
          </Box>
          <Stack gap="xs">
            <Skeleton h={12} w={80} radius="sm" />
            <Skeleton h={20} w={96} radius="sm" />
            <Skeleton h={12} w={64} radius="sm" />
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
