/**
 * WorkoutHeader - Enhanced sticky header for active workout sessions
 * Displays workout name, elapsed timer, rest timer indicator, progress bar, and settings
 */

import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { IconClock, IconSettings } from "@tabler/icons-react";

import { WorkoutProgressBar } from "../workout-progress/workout-progress-bar.tsx";
import styles from "./workout-header.module.css";

interface WorkoutHeaderProps {
  workoutName: string;
  elapsedTime: number;
  restTimerActive?: boolean;
  restTimeRemaining?: number;
  completedSets: number;
  totalSets: number;
  onSettingsClick?: () => void;
  onNameClick?: () => void;
}

/**
 * Format seconds to HH:MM:SS or MM:SS display format
 */
function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format seconds to MM:SS for rest timer
 */
function formatRestTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Determine rest timer urgency color
 */
function getRestTimerColor(timeRemaining: number): string {
  if (timeRemaining <= 10) return "red";
  if (timeRemaining <= 30) return "yellow";
  return "teal";
}

/**
 * WorkoutHeader component
 *
 * A sticky header that shows:
 * - Workout name (clickable for editing)
 * - Elapsed session timer (prominent monospace display)
 * - Mini rest timer indicator when active
 * - Progress bar showing set completion
 * - Settings menu button
 */
export function WorkoutHeader({
  workoutName,
  elapsedTime,
  restTimerActive = false,
  restTimeRemaining = 0,
  completedSets,
  totalSets,
  onSettingsClick,
  onNameClick,
}: WorkoutHeaderProps) {
  const showRestTimer = restTimerActive && restTimeRemaining > 0;
  const restTimerColor = getRestTimerColor(restTimeRemaining);

  return (
    <Paper className={styles.header} withBorder>
      <Stack gap="sm">
        {/* Main header row */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          {/* Left section: Workout name */}
          <Box className={styles.nameSection}>
            {onNameClick ? (
              <Tooltip label="Click to edit name" position="bottom" withArrow>
                <UnstyledButton
                  onClick={onNameClick}
                  className={styles.nameButton}
                  aria-label={`Edit workout name: ${workoutName}`}
                >
                  <Text size="lg" fw={700} lineClamp={1} className={styles.workoutName}>
                    {workoutName}
                  </Text>
                </UnstyledButton>
              </Tooltip>
            ) : (
              <Text size="lg" fw={700} lineClamp={1} className={styles.workoutName}>
                {workoutName}
              </Text>
            )}
          </Box>

          {/* Right section: Timers and settings */}
          <Group gap="md" wrap="nowrap" className={styles.rightSection}>
            {/* Rest timer indicator (mini) */}
            {showRestTimer && (
              <Badge
                variant="light"
                color={restTimerColor}
                size="lg"
                radius="md"
                leftSection={<IconClock size={14} />}
                className={styles.restTimerBadge}
                data-critical={restTimeRemaining <= 10}
              >
                {formatRestTime(restTimeRemaining)}
              </Badge>
            )}

            {/* Elapsed time display */}
            <Box className={styles.timerDisplay}>
              <Text
                size="xl"
                fw={700}
                ff="var(--mantine-font-family-monospace)"
                className={styles.elapsedTime}
                aria-label={`Elapsed time: ${formatElapsedTime(elapsedTime)}`}
              >
                {formatElapsedTime(elapsedTime)}
              </Text>
            </Box>

            {/* Settings button */}
            {onSettingsClick && (
              <Tooltip label="Workout settings" position="bottom" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={onSettingsClick}
                  aria-label="Open workout settings"
                  className={styles.settingsButton}
                >
                  <IconSettings size={20} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        {/* Progress bar */}
        <Box className={styles.progressContainer}>
          <WorkoutProgressBar completedSets={completedSets} totalSets={totalSets} />
        </Box>
      </Stack>
    </Paper>
  );
}
