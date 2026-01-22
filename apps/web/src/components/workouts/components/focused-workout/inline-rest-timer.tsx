/**
 * @deprecated This component has been replaced by RestTimerModal.
 * The RestTimerModal provides a better UX with a modal-based approach
 * that doesn't interfere with the main workout UI.
 *
 * This file is kept for reference but is no longer used in the application.
 * Consider removing this file and inline-rest-timer.module.css in a future cleanup.
 *
 * @see RestTimerModal in ./rest-timer-modal.tsx
 */

import { useEffect } from "react";

import { ActionIcon, Box, Button, Group, RingProgress, Text, Transition } from "@mantine/core";
import { IconMinus, IconPlayerPause, IconPlayerPlay, IconPlus, IconX } from "@tabler/icons-react";

import { TimerStatus } from "../workout-timer/timer-types";

import type { InlineRestTimerProps } from "./inline-rest-timer.types";

import styles from "./inline-rest-timer.module.css";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** @deprecated Use RestTimerModal instead */
export function InlineRestTimer({ timer, nextSetInfo, onDismiss }: InlineRestTimerProps) {
  const isVisible = timer.status === TimerStatus.RUNNING || timer.status === TimerStatus.PAUSED;
  const progress = timer.totalTime > 0 ? (timer.timeRemaining / timer.totalTime) * 100 : 0;
  const isUrgent = timer.timeRemaining < 10 && timer.timeRemaining > 0;

  // Auto-dismiss when timer completes
  useEffect(() => {
    if (timer.status === TimerStatus.COMPLETED) {
      onDismiss();
    }
  }, [timer.status, onDismiss]);

  const handlePauseResume = () => {
    if (timer.isRunning) {
      timer.pauseTimer();
    } else {
      timer.resumeTimer();
    }
  };

  const handleSubtract30 = () => {
    timer.subtractTime(30);
  };

  const handleAdd30 = () => {
    timer.addTime(30);
  };

  const handleSkip = () => {
    timer.skipTimer();
    onDismiss();
  };

  return (
    <Transition mounted={isVisible} transition="slide-up" duration={300}>
      {(transitionStyles) => (
        <Box className={styles.container} style={transitionStyles}>
          <div className={styles.header}>
            <Text fw={600} size="lg">
              Rest
            </Text>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={onDismiss}
              aria-label="Dismiss timer"
            >
              <IconX size={18} />
            </ActionIcon>
          </div>

          <Text className={styles.timeDisplay} data-urgent={isUrgent ? "true" : undefined}>
            {formatTime(timer.timeRemaining)}
          </Text>

          <div className={styles.ringContainer}>
            <RingProgress
              size={120}
              thickness={8}
              roundCaps
              sections={[{ value: progress, color: isUrgent ? "red" : "blue" }]}
            />
          </div>

          {nextSetInfo && (
            <Text className={styles.nextUp}>
              Next: {nextSetInfo.exerciseName} - Set {nextSetInfo.setNumber}
            </Text>
          )}

          <Group className={styles.actions}>
            <ActionIcon
              className={styles.actionButton}
              variant="light"
              size="lg"
              onClick={handleSubtract30}
              aria-label="Subtract 30 seconds"
              disabled={timer.timeRemaining < 30}
            >
              <IconMinus size={20} />
            </ActionIcon>

            <ActionIcon
              className={styles.actionButton}
              variant="filled"
              size="lg"
              onClick={handlePauseResume}
              aria-label={timer.isRunning ? "Pause timer" : "Resume timer"}
            >
              {timer.isRunning ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
            </ActionIcon>

            <ActionIcon
              className={styles.actionButton}
              variant="light"
              size="lg"
              onClick={handleAdd30}
              aria-label="Add 30 seconds"
            >
              <IconPlus size={20} />
            </ActionIcon>

            <Button variant="outline" size="sm" onClick={handleSkip}>
              Skip
            </Button>
          </Group>
        </Box>
      )}
    </Transition>
  );
}
