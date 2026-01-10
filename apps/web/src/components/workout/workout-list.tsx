import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconLoader2 } from "@tabler/icons-react";
import { useCallback } from "react";
import { toast } from "@/components/ui/sonner";

import { Box, Button, Flex, SimpleGrid, Skeleton, Stack } from "@mantine/core";

import { EmptyState } from "@/components/ui/empty-state";
import { client, orpc } from "@/utils/orpc";

import { WorkoutCard } from "./workout-card";

interface WorkoutListProps {
  status?: "all" | "in-progress" | "completed";
}

function WorkoutList({ status = "all" }: WorkoutListProps) {
  const queryClient = useQueryClient();

  const workouts = useInfiniteQuery({
    queryKey: ["workouts", status],
    queryFn: async ({ pageParam }) => {
      const completed = status === "all" ? undefined : status === "completed" ? true : false;

      const result = await client.workout.list({
        limit: 20,
        offset: pageParam,
        completed,
      });

      return result;
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });

  const deleteMutation = useMutation({
    ...orpc.workout.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete workout", {
        description: error.message,
      });
    },
  });

  const handleDelete = useCallback(
    (workoutId: number) => {
      if (window.confirm("Are you sure you want to delete this workout?")) {
        deleteMutation.mutate({ workoutId });
      }
    },
    [deleteMutation],
  );

  if (workouts.isLoading) {
    return <WorkoutListSkeleton />;
  }

  if (workouts.isError) {
    return (
      <EmptyState
        title="Failed to load workouts"
        description={workouts.error.message}
        action={
          <Button variant="outline" onClick={() => workouts.refetch()}>
            Try Again
          </Button>
        }
      />
    );
  }

  const allWorkouts = workouts.data?.pages.flatMap((page) => page.workouts) ?? [];

  if (allWorkouts.length === 0) {
    return (
      <EmptyState
        title={
          status === "in-progress"
            ? "No workouts in progress"
            : status === "completed"
              ? "No completed workouts"
              : "No workouts yet"
        }
        description={
          status === "in-progress"
            ? "Start a new workout to see it here"
            : status === "completed"
              ? "Complete a workout to see it here"
              : "Start your first workout to track your progress"
        }
      />
    );
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {allWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            id={workout.id}
            name={workout.name}
            startedAt={workout.startedAt}
            completedAt={workout.completedAt}
            rating={workout.rating}
            onDelete={() => handleDelete(workout.id)}
          />
        ))}
      </SimpleGrid>

      {workouts.hasNextPage && (
        <Flex justify="center" pt="md">
          <Button
            variant="outline"
            onClick={() => workouts.fetchNextPage()}
            disabled={workouts.isFetchingNextPage}
          >
            {workouts.isFetchingNextPage ? (
              <>
                <IconLoader2
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 8,
                    animation: "spin 1s linear infinite",
                  }}
                />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </Flex>
      )}
    </Stack>
  );
}

function WorkoutListSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          p="md"
          style={{
            border: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <Stack gap="sm">
            <Flex justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Skeleton height={16} width={128} />
                <Skeleton height={12} width={80} />
              </Stack>
              <Skeleton height={20} width={64} />
            </Flex>
            <Flex gap="md">
              <Skeleton height={12} width={80} />
              <Skeleton height={12} width={64} />
            </Flex>
          </Stack>
        </Box>
      ))}
    </SimpleGrid>
  );
}

export { WorkoutList, WorkoutListSkeleton };
