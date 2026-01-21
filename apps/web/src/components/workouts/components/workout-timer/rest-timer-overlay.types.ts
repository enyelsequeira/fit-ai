import type { NextSetInfo, TimerSettings, TimerStatus } from "./timer-types";

/**
 * Timer control interface - subset of UseRestTimerReturn for overlay props
 */
export interface TimerControl {
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  status: TimerStatus;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipTimer: () => void;
  resetTimer: () => void;
  settings: TimerSettings;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

/**
 * Simplified props for RestTimerOverlay component
 * Consolidates 12 individual props into 4 structured props
 */
export interface RestTimerOverlayProps {
  /** Whether the overlay is open */
  isOpen: boolean;
  /** Callback to close the overlay */
  onClose: () => void;
  /** Timer control object containing state and actions */
  timer: TimerControl;
  /** Optional info about the next set to display during rest */
  nextSetInfo?: NextSetInfo;
}

export type { NextSetInfo };
