/**
 * CompleteWorkoutModal - Modal for completing a workout with rating and mood
 * Allows user to rate the workout, select mood, and add final notes
 */

import { useState, useCallback } from "react";
import {
  Modal,
  Button,
  Stack,
  Group,
  Center,
  Text,
  Textarea,
  Rating,
  SegmentedControl,
  Box,
  Alert,
} from "@mantine/core";
import {
  IconCheck,
  IconMoodSmile,
  IconStar,
  IconNotes,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useCompleteWorkout } from "../../hooks/use-mutations.ts";
import { WORKOUT_MOODS, MOOD_LABELS, type WorkoutMood } from "../../types.ts";
import styles from "./complete-workout-modal.module.css";

interface CompleteWorkoutModalProps {
  opened: boolean;
  onClose: () => void;
  workoutId: number;
  /** Whether the workout is already completed */
  isAlreadyCompleted?: boolean;
  /** Callback when workout is successfully completed */
  onSuccess?: () => void;
}

export function CompleteWorkoutModal({
  opened,
  onClose,
  workoutId,
  isAlreadyCompleted = false,
  onSuccess,
}: CompleteWorkoutModalProps) {
  const completeWorkoutMutation = useCompleteWorkout();

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [mood, setMood] = useState<WorkoutMood | null>(null);
  const [notes, setNotes] = useState("");

  const handleComplete = useCallback(() => {
    completeWorkoutMutation.mutate(
      {
        workoutId,
        rating: rating > 0 ? rating : undefined,
        mood: mood ?? undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          // Reset form state
          setRating(0);
          setMood(null);
          setNotes("");
          onClose();
          // Call success callback (e.g., to navigate away)
          onSuccess?.();
        },
      },
    );
  }, [completeWorkoutMutation, workoutId, rating, mood, notes, onClose, onSuccess]);

  const handleClose = useCallback(() => {
    // Reset form state on close
    setRating(0);
    setMood(null);
    setNotes("");
    onClose();
  }, [onClose]);

  // Create mood options for SegmentedControl
  const moodOptions = WORKOUT_MOODS.map((m) => ({
    value: m,
    label: MOOD_LABELS[m],
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <Center w={24} h={24} className={styles.modalIcon}>
            <IconCheck size={20} />
          </Center>
          <Text fw={600}>{isAlreadyCompleted ? "Workout Completed" : "Complete Workout"}</Text>
        </Group>
      }
      size="md"
    >
      {/* Already completed state */}
      {isAlreadyCompleted ? (
        <Stack gap="lg" py="xs">
          <Alert
            icon={<IconCheck size={16} />}
            title="Already completed!"
            color="green"
            variant="light"
          >
            <Text size="sm">This workout has already been marked as complete. Great work!</Text>
          </Alert>
          <Group justify="flex-end" pt="md">
            <Button color="green" onClick={handleClose}>
              Close
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="lg" py="xs">
          {/* Success Message */}
          <Alert icon={<IconCheck size={16} />} title="Great job!" color="green" variant="light">
            <Text size="sm">Take a moment to rate your workout and track how you felt.</Text>
          </Alert>

          {/* Rating */}
          <Box>
            <Group gap="xs" mb="xs">
              <IconStar size={18} className={styles.sectionIcon} />
              <Text fw={500}>How was your workout?</Text>
            </Group>
            <Center>
              <Rating value={rating} onChange={setRating} size="xl" count={5} />
            </Center>
            {rating > 0 && (
              <Text size="sm" c="dimmed" ta="center" mt="xs">
                {getRatingLabel(rating)}
              </Text>
            )}
          </Box>

          {/* Mood */}
          <Box>
            <Group gap="xs" mb="xs">
              <IconMoodSmile size={18} className={styles.sectionIcon} />
              <Text fw={500}>How do you feel?</Text>
            </Group>
            <SegmentedControl
              value={mood ?? ""}
              onChange={(value) => setMood((value as WorkoutMood) || null)}
              data={moodOptions}
              fullWidth
              size="sm"
            />
          </Box>

          {/* Notes */}
          <Box>
            <Group gap="xs" mb="xs">
              <IconNotes size={18} className={styles.sectionIcon} />
              <Text fw={500}>Final notes (optional)</Text>
            </Group>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              placeholder="Any thoughts about this session..."
              minRows={2}
              maxRows={4}
            />
          </Box>

          {/* Error State */}
          {completeWorkoutMutation.isError && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" variant="light">
              <Text size="sm">
                {completeWorkoutMutation.error?.message ??
                  "Failed to complete workout. Please try again."}
              </Text>
            </Alert>
          )}

          {/* Actions */}
          <Group justify="flex-end" gap="sm" pt="md" className={styles.modalActions}>
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleComplete}
              loading={completeWorkoutMutation.isPending}
            >
              Complete Workout
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

/**
 * Get a label for the rating value
 */
function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1:
      return "Poor - Need improvement";
    case 2:
      return "Below average";
    case 3:
      return "Average workout";
    case 4:
      return "Good workout!";
    case 5:
      return "Excellent workout!";
    default:
      return "";
  }
}
