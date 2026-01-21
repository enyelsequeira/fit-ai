/**
 * RestTimerDisplay - Visual countdown timer with circular progress ring
 * Displays time remaining with color-coded feedback based on urgency
 */

import { ActionIcon, Box, Group, RingProgress, Stack, Text } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay, IconX } from "@tabler/icons-react";

import type { RestTimerDisplayProps } from "./timer-types";
import { TimerStatus } from "./timer-types";
import styles from "./rest-timer-display.module.css";

/** Minimum touch target size for accessibility (in pixels) */
const TOUCH_TARGET_SIZE = 44;

/** Time thresholds in seconds for color changes */
const TIME_THRESHOLD_WARNING = 30;
const TIME_THRESHOLD_CRITICAL = 10;

/**
 * Format seconds to MM:SS display format
 */
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Get the color based on time remaining
 * - Green (teal) when > 30 seconds
 * - Yellow when 10-30 seconds
 * - Red when < 10 seconds
 */
function getTimerColor(timeRemaining: number): string {
  if (timeRemaining <= TIME_THRESHOLD_CRITICAL) {
    return "red";
  }
  if (timeRemaining <= TIME_THRESHOLD_WARNING) {
    return "yellow";
  }
  return "teal";
}

/**
 * Calculate progress percentage (inverted for countdown effect)
 * Returns value from 0-100 representing remaining time
 */
function calculateProgress(timeRemaining: number, totalTime: number): number {
  if (totalTime === 0) return 0;
  return Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
}

/**
 * RestTimerDisplay component
 *
 * Displays a visual countdown timer with:
 * - Circular progress ring showing time remaining
 * - Large countdown text in center
 * - Pause/Resume toggle button
 * - Skip button to end rest early
 * - Color feedback based on urgency
 * - Pulsing animation when critical (<10s)
 */
function RestTimerDisplay({
  timeRemaining,
  totalTime,
  isRunning,
  status,
  onPause,
  onResume,
  onSkip,
  compact = false,
}: RestTimerDisplayProps) {
  const color = getTimerColor(timeRemaining);
  const progress = calculateProgress(timeRemaining, totalTime);
  const isCritical = timeRemaining <= TIME_THRESHOLD_CRITICAL && timeRemaining > 0;
  const isPaused = status === TimerStatus.PAUSED;
  const isIdle = status === TimerStatus.IDLE;

  // Don't render anything if timer is idle and no time set
  if (isIdle && totalTime === 0) {
    return null;
  }

  const handleToggle = () => {
    if (isRunning) {
      onPause();
    } else {
      onResume();
    }
  };

  // Compact variant for header mini-display
  if (compact) {
    return (
      <Group gap="xs" align="center" wrap="nowrap">
        <Box pos="relative" className={styles.compactContainer}>
          <RingProgress
            size={40}
            thickness={4}
            roundCaps
            sections={[{ value: progress, color }]}
            className={styles.compactRing}
            label={
              <Text
                fz={10}
                fw={600}
                ta="center"
                ff="var(--mantine-font-family-monospace)"
                className={styles.timeText}
              >
                {formatTime(timeRemaining)}
              </Text>
            }
          />
        </Box>

        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={handleToggle}
            aria-label={isRunning ? "Pause timer" : "Resume timer"}
            className={styles.controlButton}
          >
            {isRunning ? (
              <IconPlayerPause style={{ width: 14, height: 14 }} />
            ) : (
              <IconPlayerPlay style={{ width: 14, height: 14 }} />
            )}
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={onSkip}
            aria-label="Skip rest timer"
            className={styles.controlButton}
          >
            <IconX style={{ width: 14, height: 14 }} />
          </ActionIcon>
        </Group>
      </Group>
    );
  }

  // Full variant with larger display
  return (
    <Stack align="center" gap="md">
      {/* Circular progress with countdown */}
      <Box pos="relative" className={styles.timerContainer} data-critical={isCritical}>
        <RingProgress
          size={160}
          thickness={12}
          roundCaps
          sections={[{ value: progress, color }]}
          label={
            <Stack align="center" gap={0}>
              <Text
                fz={36}
                fw={700}
                ta="center"
                c={color}
                ff="var(--mantine-font-family-monospace)"
                className={styles.timeText}
              >
                {formatTime(timeRemaining)}
              </Text>
              {isPaused && (
                <Text fz="xs" c="dimmed" tt="uppercase">
                  Paused
                </Text>
              )}
            </Stack>
          }
        />
      </Box>

      {/* Control buttons */}
      <Group gap="md" justify="center">
        <ActionIcon
          variant="light"
          color={isRunning ? "gray" : color}
          size={TOUCH_TARGET_SIZE}
          radius="xl"
          onClick={handleToggle}
          aria-label={isRunning ? "Pause timer" : "Resume timer"}
          className={styles.controlButton}
        >
          {isRunning ? (
            <IconPlayerPause style={{ width: 24, height: 24 }} />
          ) : (
            <IconPlayerPlay style={{ width: 24, height: 24 }} />
          )}
        </ActionIcon>

        <ActionIcon
          variant="light"
          color="gray"
          size={TOUCH_TARGET_SIZE}
          radius="xl"
          onClick={onSkip}
          aria-label="Skip rest timer"
          className={styles.controlButton}
        >
          <IconX style={{ width: 24, height: 24 }} />
        </ActionIcon>
      </Group>

      {/* Status text */}
      <Text fz="sm" c="dimmed" ta="center" className={styles.statusText}>
        {isRunning ? "Rest in progress" : isPaused ? "Timer paused" : "Ready to continue"}
      </Text>
    </Stack>
  );
}

export { RestTimerDisplay };
