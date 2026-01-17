/**
 * WorkoutDetailView - Full page component for viewing and editing a workout
 * Shows workout header, exercises with sets, and completion controls
 */

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Badge,
  ActionIcon,
  TextInput,
  Loader,
  Center,
  Divider,
  Alert,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBarbell,
  IconCheck,
  IconPlayerPlay,
  IconClock,
  IconCalendar,
  IconPlus,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useWorkoutById } from "../../queries/use-queries.ts";
import { useUpdateWorkout } from "../../hooks/use-mutations.ts";
import {
  formatRelativeDate,
  formatDuration,
  calculateWorkoutDuration,
  countSets,
  formatTime,
} from "../../utils.ts";
import { ExerciseList } from "../exercise-list/exercise-list.tsx";
import { AddExerciseModal } from "../add-exercise-modal/add-exercise-modal.tsx";
import { CompleteWorkoutModal } from "../complete-workout-modal/complete-workout-modal.tsx";
import styles from "./workout-detail-view.module.css";

interface WorkoutDetailViewProps {
  workoutId: number;
}

export function WorkoutDetailView({ workoutId }: WorkoutDetailViewProps) {
  const { data: workout, isLoading, isError, error } = useWorkoutById(workoutId);
  const updateWorkoutMutation = useUpdateWorkout();

  // State for inline name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  // State for modals
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [completeWorkoutModalOpen, setCompleteWorkoutModalOpen] = useState(false);

  // State for live duration timer
  const [liveDuration, setLiveDuration] = useState<number | null>(null);

  // Update edited name when workout loads
  useEffect(() => {
    if (workout?.name) {
      setEditedName(workout.name);
    }
  }, [workout?.name]);

  // Live duration timer for in-progress workouts
  useEffect(() => {
    if (!workout?.startedAt || workout?.completedAt) {
      setLiveDuration(null);
      return;
    }

    const updateDuration = () => {
      setLiveDuration(calculateWorkoutDuration(workout.startedAt, null));
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [workout?.startedAt, workout?.completedAt]);

  const handleSaveName = useCallback(() => {
    if (!editedName.trim() || editedName === workout?.name) {
      setIsEditingName(false);
      setEditedName(workout?.name ?? "");
      return;
    }

    updateWorkoutMutation.mutate(
      { workoutId, name: editedName.trim() },
      {
        onSuccess: () => {
          setIsEditingName(false);
        },
      },
    );
  }, [editedName, workout?.name, workoutId, updateWorkoutMutation]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingName(false);
    setEditedName(workout?.name ?? "");
  }, [workout?.name]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSaveName();
      } else if (event.key === "Escape") {
        handleCancelEdit();
      }
    },
    [handleSaveName, handleCancelEdit],
  );

  // Loading state
  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading workout...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Error state
  if (isError || !workout) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error Loading Workout"
          color="red"
          variant="light"
        >
          <Stack gap="md">
            <Text size="sm">
              {error?.message ??
                "Unable to load workout details. The workout may not exist or you may not have access."}
            </Text>
            <Group>
              <Button
                component={Link}
                to="/dashboard/workouts"
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
              >
                Back to Workouts
              </Button>
            </Group>
          </Stack>
        </Alert>
      </Container>
    );
  }

  const { name, notes, startedAt, completedAt, workoutExercises } = workout;

  const isCompleted = completedAt !== null;
  const duration = isCompleted ? calculateWorkoutDuration(startedAt, completedAt) : liveDuration;
  const exerciseCount = workoutExercises?.length ?? 0;
  const { total: setCount, completed: completedSets } = countSets(workoutExercises);

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        {/* Back Navigation */}
        <Box>
          <Button
            component={Link}
            to="/dashboard/workouts"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            size="sm"
          >
            Back to Workouts
          </Button>
        </Box>

        {/* Workout Header */}
        <Paper withBorder p="lg" radius="md" className={styles.headerPaper}>
          <Stack gap="md">
            {/* Title Row */}
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <Box flex={1} miw={200}>
                {isEditingName ? (
                  <Group gap="xs">
                    <TextInput
                      value={editedName}
                      onChange={(e) => setEditedName(e.currentTarget.value)}
                      onKeyDown={handleKeyDown}
                      size="lg"
                      fw={700}
                      autoFocus
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      variant="filled"
                      color="green"
                      onClick={handleSaveName}
                      loading={updateWorkoutMutation.isPending}
                      aria-label="Save name"
                    >
                      <IconDeviceFloppy size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={handleCancelEdit}
                      aria-label="Cancel edit"
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Group gap="xs">
                    <Text size="xl" fw={700}>
                      {name ?? "Untitled Workout"}
                    </Text>
                    {!isCompleted && (
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => setIsEditingName(true)}
                        aria-label="Edit name"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                )}
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

            {/* Metadata Row */}
            <Group gap="lg" wrap="wrap">
              <Group gap={6}>
                <IconCalendar size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" c="dimmed">
                  {formatRelativeDate(startedAt)} at {formatTime(startedAt)}
                </Text>
              </Group>
              {duration !== null && (
                <Group gap={6}>
                  <IconClock size={16} style={{ opacity: 0.6 }} />
                  <Text size="sm" c="dimmed">
                    {formatDuration(duration)}
                    {!isCompleted && " (in progress)"}
                  </Text>
                </Group>
              )}
            </Group>

            {/* Notes */}
            {notes && (
              <Box className={styles.notesBox}>
                <Text size="sm" c="dimmed">
                  {notes}
                </Text>
              </Box>
            )}

            {/* Stats Row */}
            <Divider />
            <Group gap="xl">
              <Box className={styles.statItem}>
                <Group gap="xs">
                  <IconBarbell size={20} className={styles.statIcon} />
                  <Box>
                    <Text size="lg" fw={600}>
                      {exerciseCount}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {exerciseCount === 1 ? "Exercise" : "Exercises"}
                    </Text>
                  </Box>
                </Group>
              </Box>
              <Box className={styles.statItem}>
                <Group gap="xs">
                  <IconCheck size={20} className={styles.statIcon} />
                  <Box>
                    <Text size="lg" fw={600}>
                      {completedSets}/{setCount}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Sets Completed
                    </Text>
                  </Box>
                </Group>
              </Box>
            </Group>
          </Stack>
        </Paper>

        {/* Exercises Section */}
        <Paper withBorder p="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconBarbell size={20} />
                <Text fw={600} size="lg">
                  Exercises
                </Text>
              </Group>
              {!isCompleted && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  variant="light"
                  onClick={() => setAddExerciseModalOpen(true)}
                >
                  Add Exercise
                </Button>
              )}
            </Group>

            {workoutExercises && workoutExercises.length > 0 ? (
              <ExerciseList
                workoutId={workoutId}
                exercises={workoutExercises}
                isWorkoutCompleted={isCompleted}
              />
            ) : (
              <Box py="xl">
                <Center>
                  <Stack align="center" gap="md">
                    <IconBarbell size={48} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" ta="center">
                      No exercises added yet.
                      {!isCompleted && " Click the button above to add exercises."}
                    </Text>
                    {!isCompleted && (
                      <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setAddExerciseModalOpen(true)}
                      >
                        Add Your First Exercise
                      </Button>
                    )}
                  </Stack>
                </Center>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Complete Workout Button (for in-progress workouts) */}
        {!isCompleted && (
          <Paper withBorder p="lg" radius="md" className={styles.completeSection}>
            <Group justify="space-between" align="center" wrap="wrap">
              <Box>
                <Text fw={600}>Ready to finish?</Text>
                <Text size="sm" c="dimmed">
                  Complete your workout and rate how it went.
                </Text>
              </Box>
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                onClick={() => setCompleteWorkoutModalOpen(true)}
              >
                Complete Workout
              </Button>
            </Group>
          </Paper>
        )}
      </Stack>

      {/* Modals */}
      <AddExerciseModal
        opened={addExerciseModalOpen}
        onClose={() => setAddExerciseModalOpen(false)}
        workoutId={workoutId}
        existingExerciseIds={workoutExercises?.map((we) => we.exerciseId) ?? []}
      />

      <CompleteWorkoutModal
        opened={completeWorkoutModalOpen}
        onClose={() => setCompleteWorkoutModalOpen(false)}
        workoutId={workoutId}
      />
    </Container>
  );
}
