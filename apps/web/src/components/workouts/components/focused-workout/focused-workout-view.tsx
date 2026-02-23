import type { ExerciseTabItem } from "./exercise-tab-strip";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Button, Divider, Group, ScrollArea, Stack, Text } from "@mantine/core";
import {
  IconBarbell,
  IconChevronLeft,
  IconChevronRight,
  IconFlag,
  IconPlus,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useDisclosure } from "@mantine/hooks";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import { useWorkoutById } from "../../queries/use-queries";
import { useRestTimer } from "../workout-timer/use-rest-timer";
import { useWorkoutSession } from "../../hooks/use-workout-session";
import { AddExerciseModal } from "../add-exercise-modal/add-exercise-modal";
import { CompleteWorkoutModal } from "../complete-workout-modal/complete-workout-modal";
import { FocusedWorkoutHeader } from "./focused-workout-header";
import { ExerciseTabStrip } from "./exercise-tab-strip";
import { FocusedExerciseCard } from "./focused-exercise-card";
import { RestTimerModal } from "./rest-timer-modal";

import styles from "./focused-workout-view.module.css";

type FocusedWorkoutViewProps = {
  workoutId: number;
};

export function FocusedWorkoutView({ workoutId }: FocusedWorkoutViewProps) {
  const navigate = useNavigate();
  const { data: workout } = useWorkoutById(workoutId);

  // Exercise navigation
  const [pagerIndex, setPagerIndex] = useState(0);

  // Modals
  const [addExerciseOpened, addExerciseHandlers] = useDisclosure(false);
  const [completeWorkoutOpened, completeWorkoutHandlers] = useDisclosure(false);

  // Rest timer
  const restTimer = useRestTimer();

  // Workout session (stats, navigation, nextSetInfo)
  const workoutSession = useWorkoutSession({
    workout: workout as Parameters<typeof useWorkoutSession>[0]["workout"],
    restTimer,
  });

  // Sync pager with session
  useEffect(() => {
    setPagerIndex(workoutSession.currentExerciseIndex);
  }, [workoutSession.currentExerciseIndex]);

  // Auto-dismiss rest timer when completed
  useEffect(() => {
    if (restTimer.status === "completed") {
      restTimer.resetTimer();
    }
  }, [restTimer.status, restTimer.resetTimer]);

  const handlePagerChange = useCallback(
    (index: number) => {
      setPagerIndex(index);
      workoutSession.goToExercise(index);
    },
    [workoutSession],
  );

  // Cross-cutting: rest timer + auto-advance on set completion
  const handleSetCompleted = useCallback(
    ({ isLastSet }: { isLastSet: boolean }) => {
      restTimer.startTimer(restTimer.settings.defaultRestTime);
      const totalExercises = workout?.workoutExercises?.length ?? 0;
      const hasNextExercise = pagerIndex + 1 < totalExercises;
      if (isLastSet && hasNextExercise) {
        setTimeout(() => handlePagerChange(pagerIndex + 1), 1200);
      }
    },
    [restTimer, workout?.workoutExercises?.length, pagerIndex, handlePagerChange],
  );

  // Derive exercise tab items from session data
  const exerciseTabItems = useMemo(() => {
    return workoutSession.exercisesForNav.map((ex, index) => ({
      ...ex,
      status:
        ex.completedSets === ex.totalSets && ex.totalSets > 0
          ? "completed"
          : index === pagerIndex
            ? "current"
            : "pending",
    })) satisfies ExerciseTabItem[];
  }, [workoutSession.exercisesForNav, pagerIndex]);

  const hasExercises = workout?.workoutExercises && workout?.workoutExercises.length > 0;
  const currentExercise = workout?.workoutExercises?.[pagerIndex] ?? null;
  const isFirstExercise = pagerIndex === 0;
  const isLastExercise = pagerIndex === (workout?.workoutExercises?.length ?? 1) - 1;
  const canFinish = workoutSession.stats.completedSets > 0 && workout?.completedAt === null;

  return (
    <Stack gap={0} w="100%" className={styles.container}>
      <FocusedWorkoutHeader
        workoutName={workout?.name ?? "Untitled"}
        elapsedTime={workoutSession.stats.elapsedTime}
        totalSets={workoutSession.stats.totalSets}
        completedSets={workoutSession.stats.completedSets}
        onBackClick={() => navigate({ to: "/dashboard/workouts" })}
      />

      {hasExercises && (
        <ExerciseTabStrip
          exercises={exerciseTabItems}
          currentIndex={pagerIndex}
          onSelectExercise={handlePagerChange}
        />
      )}

      <ScrollArea flex={1} type="auto" className={styles.scrollArea}>
        <Stack p="md" gap="md" w="100%">
          {hasExercises && currentExercise ? (
            <>
              <FocusedExerciseCard
                workoutId={workoutId}
                exercise={currentExercise}
                onSetCompleted={handleSetCompleted}
              />

              {/* Exercise navigation */}
              <Group justify="space-between" align="center">
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<IconChevronLeft size={16} />}
                  disabled={isFirstExercise}
                  onClick={() => handlePagerChange(pagerIndex - 1)}
                >
                  Prev
                </Button>
                <Text size="xs" c="dimmed">
                  {pagerIndex + 1} / {workout?.workoutExercises?.length}
                </Text>
                <Button
                  variant="subtle"
                  color="gray"
                  rightSection={<IconChevronRight size={16} />}
                  disabled={isLastExercise}
                  onClick={() => handlePagerChange(pagerIndex + 1)}
                >
                  Next
                </Button>
              </Group>

              {/* Workout actions */}
              <Divider />
              <Group justify="space-between">
                <Button
                  variant="subtle"
                  color="gray"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={addExerciseHandlers.open}
                >
                  Add Exercise
                </Button>
                <Button
                  variant="filled"
                  color="teal"
                  size="sm"
                  leftSection={<IconFlag size={14} />}
                  disabled={!canFinish}
                  onClick={completeWorkoutHandlers.open}
                >
                  Finish Workout
                </Button>
              </Group>
            </>
          ) : (
            <Box className={styles.emptyState}>
              <Stack align="center" gap="md">
                <IconBarbell size={64} style={{ opacity: 0.3 }} aria-hidden="true" />
                <FitAiText.Muted ta="center">No exercises yet</FitAiText.Muted>
                <FitAiText.Caption ta="center">
                  Add exercises to start your workout
                </FitAiText.Caption>
                <FitAiButton variant="secondary" onClick={addExerciseHandlers.open}>
                  Add Exercise
                </FitAiButton>
              </Stack>
            </Box>
          )}
        </Stack>
      </ScrollArea>

      <RestTimerModal
        timer={restTimer}
        nextSetInfo={
          workoutSession.nextSetInfo
            ? {
                exerciseName: workoutSession.nextSetInfo.exerciseName,
                setNumber: workoutSession.nextSetInfo.setNumber,
                targetWeight: workoutSession.nextSetInfo.targetWeight ?? undefined,
                targetReps: workoutSession.nextSetInfo.targetReps ?? undefined,
              }
            : undefined
        }
        onDismiss={() => restTimer.resetTimer()}
      />

      <AddExerciseModal
        opened={addExerciseOpened}
        onClose={addExerciseHandlers.close}
        workoutId={workoutId}
        existingExerciseIds={workout?.workoutExercises?.map((we) => we.exerciseId) ?? []}
      />

      <CompleteWorkoutModal
        opened={completeWorkoutOpened}
        onClose={completeWorkoutHandlers.close}
        workoutId={workoutId}
        isAlreadyCompleted={workout?.completedAt !== null}
        onSuccess={() => navigate({ to: "/dashboard/workouts" })}
      />
    </Stack>
  );
}
