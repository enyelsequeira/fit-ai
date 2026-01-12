import { IconBarbell, IconCalendar, IconClock } from "@tabler/icons-react";
import { Box, Flex, Stack, Text } from "@mantine/core";
import { FitAiButton } from "@/components/ui/button";
import {
  FitAiCard,
  FitAiCardContent,
  FitAiCardDescription,
  FitAiCardHeader,
  FitAiCardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./recent-workouts.module.css";

interface Workout {
  id: number;
  name: string | null;
  date: Date;
  duration: number | null;
  exerciseCount: number;
  setCount: number;
  totalVolume: number;
}

interface RecentWorkoutsProps {
  workouts: Workout[];
  isLoading?: boolean;
  onWorkoutClick?: (workoutId: number) => void;
  onStartWorkout?: () => void;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function WorkoutItemSkeleton() {
  return (
    <Flex align="center" justify="space-between" p="sm">
      <Flex align="center" gap="sm">
        <Skeleton h={40} w={40} radius="md" />
        <Box>
          <Skeleton h={16} w={128} mb={4} />
          <Skeleton h={12} w={96} />
        </Box>
      </Flex>
      <Box ta="right">
        <Skeleton h={16} w={80} mb={4} />
        <Skeleton h={12} w={64} />
      </Box>
    </Flex>
  );
}

export function RecentWorkouts({
  workouts,
  isLoading,
  onWorkoutClick,
  onStartWorkout,
}: RecentWorkoutsProps) {
  return (
    <FitAiCard className={styles.card}>
      <FitAiCardHeader>
        <FitAiCardTitle>Recent Workouts</FitAiCardTitle>
        <FitAiCardDescription>Your last 5 completed workouts</FitAiCardDescription>
      </FitAiCardHeader>
      <FitAiCardContent>
        {isLoading ? (
          <Stack gap="xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <WorkoutItemSkeleton key={i} />
            ))}
          </Stack>
        ) : workouts.length === 0 ? (
          <Stack py="md" gap="xs" align="center" ta="center" className={styles.emptyState}>
            <Box className={styles.emptyIcon}>
              <IconBarbell size={32} />
            </Box>
            <Text size="sm" c="dimmed">
              No workouts yet. Start your fitness journey!
            </Text>
            <FitAiButton size="sm" onClick={onStartWorkout}>
              Start Your First Workout
            </FitAiButton>
          </Stack>
        ) : (
          <Stack gap={4}>
            {workouts.map((workout) => (
              <Flex
                align="center"
                justify="space-between"
                p="sm"
                className={styles.workoutItem}
                key={workout.id}
                onClick={() => onWorkoutClick?.(workout.id)}
              >
                <Flex align="center" gap="sm">
                  <Flex
                    h={40}
                    w={40}
                    align="center"
                    justify="center"
                    className={styles.workoutIcon}
                  >
                    <IconBarbell size={20} />
                  </Flex>
                  <Box>
                    <Text fw={500}>{workout.name ?? "Workout"}</Text>
                    <Flex gap="sm">
                      <Flex align="center" gap={4}>
                        <IconCalendar size={12} style={{ color: "var(--mantine-color-dimmed)" }} />
                        <Text size="xs" c="dimmed">
                          {formatDate(workout.date)}
                        </Text>
                      </Flex>
                      <Flex align="center" gap={4}>
                        <IconClock size={12} style={{ color: "var(--mantine-color-dimmed)" }} />
                        <Text size="xs" c="dimmed">
                          {formatDuration(workout.duration)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                </Flex>
                <Box ta="right">
                  <Text size="sm" c="dimmed">
                    {workout.exerciseCount} exercises
                  </Text>
                  <Text size="xs" c="dimmed">
                    {workout.setCount} sets
                  </Text>
                </Box>
              </Flex>
            ))}
          </Stack>
        )}
      </FitAiCardContent>
    </FitAiCard>
  );
}

export function RecentWorkoutsSkeleton() {
  return <RecentWorkouts workouts={[]} isLoading={true} />;
}
