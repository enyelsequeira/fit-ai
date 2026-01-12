/**
 * WorkoutCard - Individual workout card component
 * Displays workout summary with name, date, duration, exercises, and status
 */

import { Box, Flex, Text } from "@mantine/core";
import {
  IconBarbell,
  IconCalendar,
  IconCheck,
  IconClock,
  IconPlayerPlay,
  IconStar,
} from "@tabler/icons-react";
import { FitAiCard, FitAiCardContent } from "@/components/ui/card";
import styles from "./workout-card.module.css";

/**
 * Ensure a value is a valid Date object
 */
function ensureDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

interface WorkoutCardProps {
  id: number;
  name: string | null;
  date: Date;
  duration: number | null;
  exerciseCount?: number;
  setCount?: number;
  isCompleted: boolean;
  mood?: string | null;
  rating?: number | null;
  onClick?: (id: number) => void;
  animationDelay?: number;
}

function formatDate(dateValue: unknown): string {
  const date = ensureDate(dateValue);
  if (!date) return "-";

  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getStatusInfo(isCompleted: boolean): {
  label: string;
  status: "completed" | "scheduled" | "in-progress";
  icon: typeof IconCheck;
} {
  if (isCompleted) {
    return { label: "Completed", status: "completed", icon: IconCheck };
  }
  return { label: "Scheduled", status: "scheduled", icon: IconPlayerPlay };
}

function getMoodEmoji(mood: string | null): string {
  switch (mood) {
    case "great":
      return "Great";
    case "good":
      return "Good";
    case "okay":
      return "Okay";
    case "tired":
      return "Tired";
    case "exhausted":
      return "Exhausted";
    default:
      return "";
  }
}

export function WorkoutCard({
  id,
  name,
  date,
  duration,
  exerciseCount = 0,
  setCount = 0,
  isCompleted,
  mood,
  rating,
  onClick,
  animationDelay = 0,
}: WorkoutCardProps) {
  const statusInfo = getStatusInfo(isCompleted);
  const StatusIcon = statusInfo.icon;

  return (
    <FitAiCard
      className={styles.workoutCard}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onClick?.(id)}
    >
      <FitAiCardContent>
        <Box className={styles.cardHeader}>
          <Box className={styles.cardHeaderLeft}>
            <Box
              className={styles.workoutIcon}
              data-completed={isCompleted}
            >
              <IconBarbell size={20} />
            </Box>
            <Box className={styles.workoutInfo}>
              <Text className={styles.workoutName}>
                {name ?? "Workout"}
              </Text>
              <Flex className={styles.metaRow}>
                <Box className={styles.metaItem}>
                  <IconCalendar
                    size={12}
                    style={{ color: "var(--mantine-color-dimmed)" }}
                  />
                  <Text size="xs" c="dimmed">
                    {formatDate(date)}
                  </Text>
                </Box>
                {duration && (
                  <Box className={styles.metaItem}>
                    <IconClock
                      size={12}
                      style={{ color: "var(--mantine-color-dimmed)" }}
                    />
                    <Text size="xs" c="dimmed">
                      {formatDuration(duration)}
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>
          </Box>

          <Box
            className={styles.statusBadge}
            data-status={statusInfo.status}
          >
            <StatusIcon size={12} />
            {statusInfo.label}
          </Box>
        </Box>

        {/* Stats row */}
        <Flex className={styles.statsRow}>
          <Box className={styles.statItem}>
            <Text className={styles.statValue}>{exerciseCount}</Text>
            <Text className={styles.statLabel}>Exercises</Text>
          </Box>
          <Box className={styles.statItem}>
            <Text className={styles.statValue}>{setCount}</Text>
            <Text className={styles.statLabel}>Sets</Text>
          </Box>
          {duration && (
            <Box className={styles.statItem}>
              <Text className={styles.statValue}>{formatDuration(duration)}</Text>
              <Text className={styles.statLabel}>Duration</Text>
            </Box>
          )}
          {isCompleted && (rating || mood) && (
            <Box className={styles.moodRating}>
              {rating && (
                <Flex align="center" gap={2}>
                  <IconStar size={14} style={{ color: "var(--mantine-color-yellow-6)" }} />
                  <Text size="sm" fw={500}>
                    {rating}/5
                  </Text>
                </Flex>
              )}
              {mood && (
                <Box className={styles.moodBadge}>
                  {getMoodEmoji(mood)}
                </Box>
              )}
            </Box>
          )}
        </Flex>
      </FitAiCardContent>
    </FitAiCard>
  );
}

// Skeleton component for loading states
export function WorkoutCardSkeleton() {
  return (
    <FitAiCard className={styles.workoutCard}>
      <FitAiCardContent>
        <Box className={styles.cardHeader}>
          <Box className={styles.cardHeaderLeft}>
            <Box
              className={styles.workoutIcon}
              style={{ background: "var(--mantine-color-gray-3)" }}
            />
            <Box className={styles.workoutInfo}>
              <Box
                style={{
                  height: 16,
                  width: 120,
                  background: "var(--mantine-color-gray-3)",
                  borderRadius: 4,
                }}
              />
              <Box
                style={{
                  height: 12,
                  width: 80,
                  marginTop: 8,
                  background: "var(--mantine-color-gray-2)",
                  borderRadius: 4,
                }}
              />
            </Box>
          </Box>
          <Box
            style={{
              height: 20,
              width: 80,
              background: "var(--mantine-color-gray-2)",
              borderRadius: 12,
            }}
          />
        </Box>
      </FitAiCardContent>
    </FitAiCard>
  );
}
