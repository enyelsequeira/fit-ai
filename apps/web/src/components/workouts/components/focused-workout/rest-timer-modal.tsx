/**
 * RestTimerModal - Full-screen modal rest timer overlay
 * Shows large countdown with progress ring, next set info, and controls
 */

import { useEffect } from "react";
import { RingProgress, Transition } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";
import { FitAiText } from "@/components/ui/fit-ai-text/fit-ai-text";

import { TimerStatus } from "../workout-timer/timer-types";
import type { InlineRestTimerProps } from "./inline-rest-timer.types";

import styles from "./rest-timer-modal.module.css";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function RestTimerModal({ timer, nextSetInfo, onDismiss }: InlineRestTimerProps) {
  const isVisible = timer.status === TimerStatus.RUNNING || timer.status === TimerStatus.PAUSED;
  const progress = timer.totalTime > 0 ? (timer.timeRemaining / timer.totalTime) * 100 : 0;
  const isUrgent = timer.timeRemaining <= 10 && timer.timeRemaining > 0;

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
    <Transition mounted={isVisible} transition="fade" duration={200}>
      {(transitionStyles) => (
        <div className={styles.overlay} style={transitionStyles} onClick={onDismiss}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <FitAiText.Label className={styles.title}>REST TIME</FitAiText.Label>

            <div className={styles.timeDisplay} data-urgent={isUrgent ? "true" : undefined}>
              {formatTime(timer.timeRemaining)}
            </div>

            <div className={styles.ringContainer}>
              <RingProgress
                size={160}
                thickness={10}
                roundCaps
                sections={[{ value: progress, color: isUrgent ? "red" : "cyan" }]}
                rootColor="dark.5"
              />
            </div>

            {nextSetInfo && (
              <div className={styles.nextSetInfo}>
                <FitAiText.Caption>
                  Next: <strong>Set {nextSetInfo.setNumber}</strong>
                </FitAiText.Caption>
                {nextSetInfo.targetWeight && nextSetInfo.targetReps && (
                  <FitAiText.Caption className={styles.targetInfo}>
                    Target: {nextSetInfo.targetWeight}kg × {nextSetInfo.targetReps}
                  </FitAiText.Caption>
                )}
              </div>
            )}

            <div className={styles.controls}>
              <FitAiButton
                variant="secondary"
                className={styles.controlButton}
                onClick={handleSubtract30}
                disabled={timer.timeRemaining < 30}
                aria-label="Subtract 30 seconds"
              >
                -30
              </FitAiButton>

              <FitAiButton
                variant="primary"
                className={styles.controlButtonPrimary}
                onClick={handlePauseResume}
                aria-label={timer.isRunning ? "Pause timer" : "Resume timer"}
              >
                {timer.isRunning ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
              </FitAiButton>

              <FitAiButton
                variant="secondary"
                className={styles.controlButton}
                onClick={handleAdd30}
                aria-label="Add 30 seconds"
              >
                +30
              </FitAiButton>
            </div>

            <FitAiButton
              variant="outline"
              fullWidth
              className={styles.skipButton}
              onClick={handleSkip}
            >
              Skip Rest
            </FitAiButton>
          </div>
        </div>
      )}
    </Transition>
  );
}
