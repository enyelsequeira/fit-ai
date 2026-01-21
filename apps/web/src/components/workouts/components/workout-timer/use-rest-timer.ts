import { useCallback, useEffect, useRef } from "react";

import { useInterval, useLocalStorage } from "@mantine/hooks";

import { playTimerEndSound, resumeAudioContext, vibrateTimerEnd } from "./timer-audio";
import {
  DEFAULT_TIMER_SETTINGS,
  DEFAULT_TIMER_STATE,
  TIMER_SETTINGS_STORAGE_KEY,
  TIMER_STATE_STORAGE_KEY,
  TimerStatus,
} from "./timer-types";
import type { RestTimerState, TimerSettings } from "./timer-types";

export interface UseRestTimerOptions {
  /** Callback when timer completes */
  onComplete?: () => void;
  /** Callback on each tick (every second) */
  onTick?: (timeRemaining: number) => void;
}

export interface UseRestTimerReturn {
  /** Current time remaining in seconds */
  timeRemaining: number;
  /** Total time the timer was started with */
  totalTime: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Current timer status */
  status: TimerStatus;
  /** ID of the set this timer is for */
  setId: number | null;
  /** Timer settings */
  settings: TimerSettings;
  /** Start the timer with specified seconds */
  startTimer: (seconds: number, setId?: number) => void;
  /** Pause the running timer */
  pauseTimer: () => void;
  /** Resume a paused timer */
  resumeTimer: () => void;
  /** Reset the timer to idle state */
  resetTimer: () => void;
  /** Skip/cancel the current timer */
  skipTimer: () => void;
  /** Add time to the current timer */
  addTime: (seconds: number) => void;
  /** Subtract time from the current timer */
  subtractTime: (seconds: number) => void;
  /** Update timer settings */
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

/**
 * Hook for managing a rest timer with localStorage persistence
 */
export function useRestTimer(options: UseRestTimerOptions = {}): UseRestTimerReturn {
  const { onComplete, onTick } = options;

  // Persist timer state to localStorage
  const [timerState, setTimerState] = useLocalStorage<RestTimerState>({
    key: TIMER_STATE_STORAGE_KEY,
    defaultValue: DEFAULT_TIMER_STATE,
    getInitialValueInEffect: true,
  });

  // Persist timer settings to localStorage
  const [settings, setSettings] = useLocalStorage<TimerSettings>({
    key: TIMER_SETTINGS_STORAGE_KEY,
    defaultValue: DEFAULT_TIMER_SETTINGS,
    getInitialValueInEffect: true,
  });

  // Ref to track if we've already called onComplete for current timer
  const completedRef = useRef(false);

  // Use Mantine's useInterval for the timer tick
  // Updates every 100ms for smoother display, uses timestamp-based calculation for accuracy
  const interval = useInterval(() => {
    setTimerState((prev) => {
      if (!prev.isRunning || !prev.startedAt) {
        return prev;
      }

      // Calculate time remaining based on elapsed time since start (more reliable than decrementing)
      const elapsed = Math.floor((Date.now() - prev.startedAt) / 1000);
      const newTimeRemaining = Math.max(0, prev.totalTime - elapsed);

      // Only update if changed (avoid unnecessary re-renders)
      if (newTimeRemaining === prev.timeRemaining) {
        return prev;
      }

      // Call onTick callback when seconds change
      if (newTimeRemaining !== prev.timeRemaining) {
        onTick?.(newTimeRemaining);
      }

      if (newTimeRemaining <= 0) {
        // Timer complete - this will be handled in the completion check effect
        return {
          ...prev,
          timeRemaining: 0,
        };
      }

      return {
        ...prev,
        timeRemaining: newTimeRemaining,
      };
    });
  }, 100); // Update every 100ms for smoother countdown

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    interval.stop();

    // Play sound if enabled
    if (settings.soundEnabled) {
      playTimerEndSound();
    }

    // Vibrate if enabled
    if (settings.vibrationEnabled) {
      vibrateTimerEnd();
    }

    // Update state to completed
    setTimerState((prev) => ({
      ...prev,
      timeRemaining: 0,
      isRunning: false,
      status: TimerStatus.COMPLETED,
    }));

    // Call onComplete callback
    onComplete?.();
  }, [interval, settings, setTimerState, onComplete]);

  // Start the timer
  const startTimer = useCallback(
    (seconds: number, setId?: number) => {
      // Resume audio context on user interaction
      resumeAudioContext();

      interval.stop();
      completedRef.current = false;

      const now = Date.now();

      setTimerState({
        timeRemaining: seconds,
        totalTime: seconds,
        isRunning: true,
        status: TimerStatus.RUNNING,
        setId: setId ?? null,
        startedAt: now,
        pausedAt: null,
      });

      interval.start();
    },
    [interval, setTimerState],
  );

  // Pause the timer
  const pauseTimer = useCallback(() => {
    interval.stop();

    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      status: TimerStatus.PAUSED,
      pausedAt: Date.now(),
    }));
  }, [interval, setTimerState]);

  // Resume the timer
  const resumeTimer = useCallback(() => {
    completedRef.current = false;

    setTimerState((prev) => {
      // Calculate new startedAt based on current remaining time
      // This ensures the timestamp-based calculation works correctly after pause
      const now = Date.now();
      const elapsedBeforePause = prev.totalTime - prev.timeRemaining;
      const newStartedAt = now - elapsedBeforePause * 1000;

      return {
        ...prev,
        isRunning: true,
        status: TimerStatus.RUNNING,
        startedAt: newStartedAt,
        pausedAt: null,
      };
    });

    interval.start();
  }, [interval, setTimerState]);

  // Reset the timer
  const resetTimer = useCallback(() => {
    interval.stop();
    completedRef.current = false;
    setTimerState(DEFAULT_TIMER_STATE);
  }, [interval, setTimerState]);

  // Skip/cancel the timer
  const skipTimer = useCallback(() => {
    interval.stop();
    completedRef.current = false;

    setTimerState((prev) => ({
      ...prev,
      timeRemaining: 0,
      isRunning: false,
      status: TimerStatus.IDLE,
    }));
  }, [interval, setTimerState]);

  // Add time to the timer
  const addTime = useCallback(
    (seconds: number) => {
      setTimerState((prev) => {
        const newTotalTime = prev.totalTime + seconds;
        const newTimeRemaining = prev.timeRemaining + seconds;
        // Adjust startedAt so timestamp-based calculation works correctly
        const now = Date.now();
        const newElapsed = newTotalTime - newTimeRemaining;
        const newStartedAt = prev.isRunning ? now - newElapsed * 1000 : prev.startedAt;

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          totalTime: newTotalTime,
          startedAt: newStartedAt,
        };
      });
    },
    [setTimerState],
  );

  // Subtract time from the timer
  const subtractTime = useCallback(
    (seconds: number) => {
      setTimerState((prev) => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - seconds);
        // Adjust startedAt so timestamp-based calculation works correctly
        const now = Date.now();
        const newElapsed = prev.totalTime - newTimeRemaining;
        const newStartedAt = prev.isRunning ? now - newElapsed * 1000 : prev.startedAt;

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          startedAt: newStartedAt,
        };
      });
    },
    [setTimerState],
  );

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<TimerSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings],
  );

  // Check for timer completion
  useEffect(() => {
    if (
      timerState.timeRemaining === 0 &&
      timerState.status === TimerStatus.RUNNING &&
      !completedRef.current
    ) {
      handleTimerComplete();
    }
  }, [timerState.timeRemaining, timerState.status, handleTimerComplete]);

  // Restore timer on mount (handle page refresh)
  useEffect(() => {
    if (timerState.isRunning && timerState.startedAt && timerState.status === TimerStatus.RUNNING) {
      // Calculate how much time has passed since page was closed
      const elapsed = Math.floor((Date.now() - timerState.startedAt) / 1000);
      const remaining = Math.max(0, timerState.timeRemaining - elapsed);

      if (remaining <= 0) {
        // Timer would have completed while page was closed
        handleTimerComplete();
      } else {
        // Update remaining time and start the interval
        setTimerState((prev) => ({
          ...prev,
          timeRemaining: remaining,
          startedAt: Date.now(),
        }));
        interval.start();
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    timeRemaining: timerState.timeRemaining,
    totalTime: timerState.totalTime,
    isRunning: timerState.isRunning,
    status: timerState.status,
    setId: timerState.setId,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    addTime,
    subtractTime,
    updateSettings,
  };
}
