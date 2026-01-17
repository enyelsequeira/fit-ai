/**
 * WorkoutDetailModal - Modal for viewing and editing workout details
 * Shows workout summary, exercises, sets, and completion info
 */

import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Divider,
  ScrollArea,
  Center,
  Loader,
  Box,
} from "@mantine/core";
import {
  IconBarbell,
  IconCheck,
  IconPlayerPlay,
  IconClock,
  IconCalendar,
  IconStar,
  IconMoodSmile,
  IconListDetails,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useWorkoutById } from "../../queries/use-queries.ts";
import { formatRelativeDate, formatDuration, calculateWorkoutDuration, countSets } from "../../utils";
import { MOOD_LABELS, MOOD_COLORS } from "../../types";
import type { WorkoutMood } from "../../types";
import styles from "./workout-detail-modal.module.css";

interface WorkoutDetailModalProps {
  opened: boolean;
  onClose: () => void;
  workoutId: number | null;
}

export function WorkoutDetailModal({ opened, onClose, workoutId }: WorkoutDetailModalProps) {
  const navigate = useNavigate();
  const { data: workout, isLoading, isError } = useWorkoutById(workoutId);

  const handleContinueWorkout = () => {
    if (workoutId) {
      onClose();
      navigate({ to: `/dashboard/workouts/${workoutId}` as string });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Modal opened={opened} onClose={onClose} title="Workout Details" size="lg">
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Modal>
    );
  }

  // Error or no workout state
  if (isError || !workout) {
    return (
      <Modal opened={opened} onClose={onClose} title="Workout Details" size="lg">
        <Center py="xl">
          <Stack align="center" gap="md">
            <Text c="dimmed">Unable to load workout details</Text>
            <Button variant="light" onClick={onClose}>
              Close
            </Button>
          </Stack>
        </Center>
      </Modal>
    );
  }

  const {
    name,
    notes,
    startedAt,
    completedAt,
    rating,
    mood,
    workoutExercises,
  } = workout;

  const isCompleted = completedAt !== null;
  const duration = calculateWorkoutDuration(startedAt, completedAt);
  const exerciseCount = workoutExercises?.length ?? 0;
  const { total: setCount, completed: completedSets } = countSets(workoutExercises);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Center w={24} h={24} className={styles.modalIcon}>
            <IconBarbell size={20} />
          </Center>
          <Text fw={600}>Workout Details</Text>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        {/* Workout Header */}
        <Box className={styles.workoutHeader}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xl" fw={700}>
                {name ?? "Untitled Workout"}
              </Text>
              <Group gap="md" mt="xs">
                <Group gap={4}>
                  <IconCalendar size={14} style={{ opacity: 0.6 }} />
                  <Text size="sm" c="dimmed">
                    {formatRelativeDate(startedAt)}
                  </Text>
                </Group>
                {duration && (
                  <Group gap={4}>
                    <IconClock size={14} style={{ opacity: 0.6 }} />
                    <Text size="sm" c="dimmed">
                      {formatDuration(duration)}
                    </Text>
                  </Group>
                )}
              </Group>
            </Box>
            <Badge
              size="lg"
              color={isCompleted ? "green" : "orange"}
              variant="light"
              leftSection={isCompleted ? <IconCheck size={14} /> : <IconPlayerPlay size={14} />}
            >
              {isCompleted ? "Completed" : "In Progress"}
            </Badge>
          </Group>
        </Box>

        {/* Notes */}
        {notes && (
          <Box className={styles.notesSection}>
            <Text size="sm" fw={600} mb="xs">
              Notes
            </Text>
            <Text size="sm" c="dimmed">
              {notes}
            </Text>
          </Box>
        )}

        {/* Stats */}
        <Group gap="lg" className={styles.statsSection}>
          <Box className={styles.statItem}>
            <Text size="xl" fw={700}>
              {exerciseCount}
            </Text>
            <Text size="xs" c="dimmed">
              Exercises
            </Text>
          </Box>
          <Box className={styles.statItem}>
            <Text size="xl" fw={700}>
              {completedSets}/{setCount}
            </Text>
            <Text size="xs" c="dimmed">
              Sets Completed
            </Text>
          </Box>
          {duration && (
            <Box className={styles.statItem}>
              <Text size="xl" fw={700}>
                {formatDuration(duration)}
              </Text>
              <Text size="xs" c="dimmed">
                Duration
              </Text>
            </Box>
          )}
        </Group>

        {/* Completion Info */}
        {isCompleted && (rating || mood) && (
          <>
            <Divider />
            <Group gap="lg">
              {rating && (
                <Group gap="xs">
                  <IconStar size={18} style={{ color: "var(--mantine-color-yellow-6)" }} />
                  <Text fw={500}>Rating: {rating}/5</Text>
                </Group>
              )}
              {mood && (
                <Group gap="xs">
                  <IconMoodSmile
                    size={18}
                    style={{ color: `var(--mantine-color-${MOOD_COLORS[mood as WorkoutMood] ?? "gray"}-6)` }}
                  />
                  <Text fw={500}>Mood: {MOOD_LABELS[mood as WorkoutMood] ?? mood}</Text>
                </Group>
              )}
            </Group>
          </>
        )}

        {/* Exercises List */}
        {workoutExercises && workoutExercises.length > 0 && (
          <>
            <Divider />
            <Box>
              <Group gap="xs" mb="sm">
                <IconListDetails size={18} />
                <Text fw={600}>Exercises</Text>
              </Group>
              <ScrollArea.Autosize mah={250}>
                <Stack gap="xs">
                  {workoutExercises.map((exercise, index) => (
                    <Box key={exercise.id} className={styles.exerciseItem}>
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Text size="sm" c="dimmed" w={24}>
                            {index + 1}.
                          </Text>
                          <Text size="sm" fw={500}>
                            {exercise.exercise?.name ?? "Unknown Exercise"}
                          </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          {exercise.sets?.filter((s) => s.completedAt).length ?? 0}/
                          {exercise.sets?.length ?? 0} sets
                        </Text>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            </Box>
          </>
        )}

        {/* Actions */}
        <Divider />
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose}>
            Close
          </Button>
          <Button
            leftSection={isCompleted ? <IconListDetails size={16} /> : <IconPlayerPlay size={16} />}
            onClick={handleContinueWorkout}
          >
            {isCompleted ? "View Full Details" : "Continue Workout"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
