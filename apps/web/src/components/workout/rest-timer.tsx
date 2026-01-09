import { IconPlayerPause, IconPlayerPlay, IconRotate } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ActionIcon, Box, Flex, Group, Text } from "@mantine/core";

interface RestTimerProps {
  defaultSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function RestTimer({ defaultSeconds = 90, autoStart = false, onComplete }: RestTimerProps) {
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasCompleted, setHasCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNotification = useCallback(() => {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch {
      // Audio not supported
    }
  }, []);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHasCompleted(true);
          playNotification();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining, onComplete, playNotification]);

  const handleToggle = () => {
    if (remaining === 0) {
      setRemaining(defaultSeconds);
      setHasCompleted(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setRemaining(defaultSeconds);
    setIsRunning(false);
    setHasCompleted(false);
  };

  const progress = (remaining / defaultSeconds) * 100;

  return (
    <Flex align="center" gap="sm">
      <Box
        pos="relative"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <svg
          style={{
            width: 48,
            height: 48,
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--mantine-color-default-border)"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={hasCompleted ? "var(--mantine-color-green-5)" : "var(--mantine-color-blue-5)"}
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
            style={{ transition: "all 1s" }}
          />
        </svg>
        <Text
          fz="xs"
          style={{
            position: "absolute",
            fontFamily: "monospace",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(remaining)}
        </Text>
      </Box>

      <Group gap={4}>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={handleToggle}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <IconPlayerPause style={{ width: 12, height: 12 }} />
          ) : (
            <IconPlayerPlay style={{ width: 12, height: 12 }} />
          )}
        </ActionIcon>
        <ActionIcon variant="subtle" size="sm" onClick={handleReset} aria-label="Reset timer">
          <IconRotate style={{ width: 12, height: 12 }} />
        </ActionIcon>
      </Group>

      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>
    </Flex>
  );
}

export { RestTimer };
