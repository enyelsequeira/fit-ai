/**
 * Timer types and constants for the workout rest timer system
 */

/**
 * Timer status enum for tracking timer state
 */
export enum TimerStatus {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
}

/**
 * Rest timer state persisted to localStorage
 */
export interface RestTimerState {
  /** Seconds remaining on the timer */
  timeRemaining: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Total time the timer was started with */
  totalTime: number;
  /** ID of the set this timer is for (for tracking) */
  setId: number | null;
  /** Current timer status */
  status: TimerStatus;
  /** Timestamp when timer was started (for accurate resumption) */
  startedAt: number | null;
  /** Timestamp when timer was paused */
  pausedAt: number | null;
}

/**
 * User preferences for timer behavior
 */
export interface TimerSettings {
  /** Default rest time in seconds */
  defaultRestTime: number;
  /** Whether to play sound when timer ends */
  soundEnabled: boolean;
  /** Whether to vibrate when timer ends */
  vibrationEnabled: boolean;
  /** Custom intervals user has saved (in seconds) */
  customIntervals: number[];
  /** Whether to auto-start timer after completing a set */
  autoStartOnSetComplete: boolean;
}

/**
 * Default rest intervals in seconds
 */
export const DEFAULT_REST_INTERVALS = [30, 60, 90, 120, 180] as const;

/**
 * Default rest interval labels for display
 */
export const REST_INTERVAL_LABELS: Record<number, string> = {
  30: "30s",
  60: "1 min",
  90: "1:30",
  120: "2 min",
  180: "3 min",
};

/**
 * localStorage key for timer state
 */
export const TIMER_STATE_STORAGE_KEY = "fit-ai-rest-timer-state";

/**
 * localStorage key for timer settings
 */
export const TIMER_SETTINGS_STORAGE_KEY = "fit-ai-rest-timer-settings";

/**
 * Default timer settings
 */
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  defaultRestTime: 90,
  soundEnabled: true,
  vibrationEnabled: true,
  customIntervals: [],
  autoStartOnSetComplete: true,
};

/**
 * Default timer state (idle)
 */
export const DEFAULT_TIMER_STATE: RestTimerState = {
  timeRemaining: 0,
  isRunning: false,
  totalTime: 0,
  setId: null,
  status: TimerStatus.IDLE,
  startedAt: null,
  pausedAt: null,
};

/**
 * Props for components that need timer control
 */
export interface RestTimerControlProps {
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  status: TimerStatus;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
}

/**
 * Props for timer display component
 */
export interface RestTimerDisplayProps extends RestTimerControlProps {
  /** Show compact version (for header) */
  compact?: boolean;
}

/**
 * Next set info for display during rest
 */
export interface NextSetInfo {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  targetWeight?: number;
  targetReps?: number;
  previousWeight?: number;
  previousReps?: number;
}
