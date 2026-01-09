import {
  IconBarbell,
  IconCalendar,
  IconClock,
  IconDotsVertical,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { ActionIcon, Badge, Box, Button, Card, Flex, Group, Menu, Text } from "@mantine/core";

interface WorkoutCardProps {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exerciseCount?: number;
  duration?: number | null;
  totalVolume?: number;
  rating?: number | null;
  onDelete?: () => void;
  onContinue?: () => void;
  className?: string;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume} kg`;
}

function WorkoutCard({
  id,
  name,
  startedAt,
  completedAt,
  exerciseCount = 0,
  duration,
  totalVolume = 0,
  rating,
  onDelete,
  onContinue,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const isInProgress = !completedAt;
  const workoutUrl = `/workouts/${id}`;

  const handleNavigate = () => {
    navigate({ to: workoutUrl });
  };

  return (
    <Card withBorder padding="md" style={{ position: "relative" }}>
      <Flex justify="space-between" align="flex-start" gap="xs" pb="xs">
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Link to={workoutUrl} style={{ textDecoration: "none" }}>
            <Text fw={500} fz="sm" truncate style={{ cursor: "pointer" }} c="inherit">
              {name || `Workout #${id}`}
            </Text>
          </Link>
          <Group gap={8} mt={2}>
            <IconCalendar style={{ width: 12, height: 12, color: "var(--mantine-color-dimmed)" }} />
            <Text fz="xs" c="dimmed">
              {formatDate(startedAt)}
            </Text>
          </Group>
        </Box>

        <Group gap={4}>
          <Badge color={isInProgress ? "yellow" : "green"} variant="light">
            {isInProgress ? "In Progress" : "Completed"}
          </Badge>

          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="sm"
                style={{ opacity: 0, transition: "opacity 150ms" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0";
                }}
              >
                <IconDotsVertical style={{ width: 16, height: 16 }} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={handleNavigate}>View Details</Menu.Item>
              {isInProgress && onContinue && (
                <Menu.Item
                  onClick={onContinue}
                  leftSection={<IconPlayerPlay style={{ width: 16, height: 16 }} />}
                >
                  Continue Workout
                </Menu.Item>
              )}
              {onDelete && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    onClick={onDelete}
                    color="red"
                    leftSection={<IconTrash style={{ width: 16, height: 16 }} />}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>

      <Group gap="md" pt={0}>
        <Group gap={4}>
          <IconBarbell style={{ width: 12, height: 12, color: "var(--mantine-color-dimmed)" }} />
          <Text fz="xs" c="dimmed">
            {exerciseCount} exercises
          </Text>
        </Group>

        {duration && (
          <Group gap={4}>
            <IconClock style={{ width: 12, height: 12, color: "var(--mantine-color-dimmed)" }} />
            <Text fz="xs" c="dimmed">
              {formatDuration(duration)}
            </Text>
          </Group>
        )}

        {totalVolume > 0 && (
          <Group gap={4}>
            <Text fz="xs" c="dimmed">
              {formatVolume(totalVolume)}
            </Text>
          </Group>
        )}

        {rating && (
          <Group gap={4}>
            <Text fz="xs" c="dimmed">
              {"★".repeat(rating)}
            </Text>
          </Group>
        )}
      </Group>

      {isInProgress && (
        <Button
          variant="filled"
          size="sm"
          fullWidth
          mt="sm"
          onClick={handleNavigate}
          leftSection={<IconPlayerPlay style={{ width: 16, height: 16 }} />}
        >
          Continue Workout
        </Button>
      )}
    </Card>
  );
}

export { WorkoutCard, formatDate, formatDuration, formatVolume };
