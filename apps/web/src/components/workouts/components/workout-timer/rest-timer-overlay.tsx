/**
 * RestTimerOverlay - Full-screen overlay displaying rest timer during workout
 * Shows countdown, next set preview, and timer settings access
 */

import type { NextSetInfo, RestTimerOverlayProps } from "./rest-timer-overlay.types";

import {
  ActionIcon,
  Box,
  Group,
  Overlay,
  Paper,
  Popover,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import { IconSettings, IconWindowMinimize } from "@tabler/icons-react";
import { useState } from "react";

import { RestTimerDisplay } from "./rest-timer-display";
import { RestTimerSettings } from "./rest-timer-settings";

/**
 * Format weight for display with unit
 */
function formatWeight(weight: number): string {
  return `${weight} kg`;
}

/**
 * RestTimerOverlay component
 *
 * Full-screen overlay that displays:
 * - Large countdown timer with circular progress
 * - "Next Up" preview showing upcoming set details
 * - Settings popover for timer customization
 * - Minimize button to hide overlay while timer continues
 *
 * Animations:
 * - Fade + scale transition on enter/exit
 * - Semi-transparent backdrop for focus
 */
function RestTimerOverlay({ isOpen, onClose, timer, nextSetInfo }: RestTimerOverlayProps) {
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [selectedTime, setSelectedTime] = useState(
    timer.totalTime || timer.settings.defaultRestTime,
  );

  const handleTimeSelect = (seconds: number) => {
    setSelectedTime(seconds);
    timer.updateSettings({ defaultRestTime: seconds });
  };

  return (
    <Transition mounted={isOpen} transition="fade" duration={200} timingFunction="ease">
      {(styles) => (
        <Box
          style={{
            ...styles,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Semi-transparent backdrop */}
          <Overlay color="#000" backgroundOpacity={0.7} blur={2} zIndex={-1} onClick={onClose} />

          {/* Main content card */}
          <Transition mounted={isOpen} transition="scale" duration={250} timingFunction="ease-out">
            {(cardStyles) => (
              <Paper
                shadow="xl"
                radius="lg"
                p="xl"
                style={{
                  ...cardStyles,
                  width: "100%",
                  maxWidth: 400,
                  margin: 16,
                  position: "relative",
                }}
              >
                {/* Header with settings and minimize buttons */}
                <Group justify="space-between" mb="lg">
                  <Popover
                    opened={settingsOpened}
                    onChange={setSettingsOpened}
                    position="bottom-start"
                    width={300}
                    shadow="md"
                  >
                    <Popover.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        radius="xl"
                        onClick={() => setSettingsOpened((o) => !o)}
                        aria-label="Timer settings"
                      >
                        <IconSettings style={{ width: 20, height: 20 }} />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <RestTimerSettings
                        settings={timer.settings}
                        onSettingsChange={timer.updateSettings}
                        selectedTime={selectedTime}
                        onTimeSelect={handleTimeSelect}
                      />
                    </Popover.Dropdown>
                  </Popover>

                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                    onClick={onClose}
                    aria-label="Minimize timer overlay"
                  >
                    <IconWindowMinimize style={{ width: 20, height: 20 }} />
                  </ActionIcon>
                </Group>

                {/* Rest Time heading */}
                <Text
                  fz="lg"
                  fw={600}
                  ta="center"
                  mb="md"
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Rest Time
                </Text>

                {/* Timer display */}
                <Box mb="xl">
                  <RestTimerDisplay
                    timeRemaining={timer.timeRemaining}
                    totalTime={timer.totalTime}
                    isRunning={timer.isRunning}
                    status={timer.status}
                    onPause={timer.pauseTimer}
                    onResume={timer.resumeTimer}
                    onSkip={timer.skipTimer}
                    onReset={timer.resetTimer}
                  />
                </Box>

                {/* Next Up section */}
                {nextSetInfo && (
                  <Paper withBorder p="md" radius="md" bg="var(--mantine-color-dark-7)">
                    <Stack gap="xs">
                      <Text fz="xs" fw={500} c="dimmed" tt="uppercase">
                        Next Up
                      </Text>

                      <Text fz="md" fw={600}>
                        {nextSetInfo.exerciseName}
                      </Text>

                      <Text fz="sm" c="dimmed">
                        Set {nextSetInfo.setNumber} of {nextSetInfo.totalSets}
                      </Text>

                      {/* Target/previous info */}
                      {(nextSetInfo.targetWeight !== undefined ||
                        nextSetInfo.targetReps !== undefined) && (
                        <Group gap="md" mt="xs">
                          {nextSetInfo.targetWeight !== undefined && (
                            <Stack gap={2}>
                              <Text fz="xs" c="dimmed">
                                Target Weight
                              </Text>
                              <Text fz="sm" fw={500}>
                                {formatWeight(nextSetInfo.targetWeight)}
                              </Text>
                            </Stack>
                          )}
                          {nextSetInfo.targetReps !== undefined && (
                            <Stack gap={2}>
                              <Text fz="xs" c="dimmed">
                                Target Reps
                              </Text>
                              <Text fz="sm" fw={500}>
                                {nextSetInfo.targetReps} reps
                              </Text>
                            </Stack>
                          )}
                        </Group>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Paper>
            )}
          </Transition>

          {/* Mobile full-screen styles */}
          <style>
            {`
              @media (max-width: 480px) {
                .rest-timer-overlay-card {
                  max-width: 100% !important;
                  margin: 0 !important;
                  border-radius: 0 !important;
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                }
              }
            `}
          </style>
        </Box>
      )}
    </Transition>
  );
}

export { RestTimerOverlay };
export type { RestTimerOverlayProps, NextSetInfo };
