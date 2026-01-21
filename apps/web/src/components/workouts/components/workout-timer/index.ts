/**
 * Workout Timer Components
 *
 * Rest timer system with persistence and audio/vibration alerts
 */

// Types and constants
export {
  DEFAULT_REST_INTERVALS,
  DEFAULT_TIMER_SETTINGS,
  DEFAULT_TIMER_STATE,
  REST_INTERVAL_LABELS,
  TIMER_SETTINGS_STORAGE_KEY,
  TIMER_STATE_STORAGE_KEY,
  TimerStatus,
} from "./timer-types";
export type {
  NextSetInfo,
  RestTimerControlProps,
  RestTimerDisplayProps,
  RestTimerState,
  TimerSettings,
} from "./timer-types";

// Audio utilities
export {
  cleanupAudioContext,
  isAudioEnabled,
  playTickSound,
  playTimerEndSound,
  requestAudioPermission,
  resumeAudioContext,
  vibrate,
  vibrateTimerEnd,
} from "./timer-audio";

// Hooks
export { useRestTimer } from "./use-rest-timer";
export type { UseRestTimerOptions, UseRestTimerReturn } from "./use-rest-timer";

// Components
export { RestTimerDisplay } from "./rest-timer-display";
export { RestTimerSettings } from "./rest-timer-settings";
export type { RestTimerSettingsProps } from "./rest-timer-settings";
export { RestTimerOverlay } from "./rest-timer-overlay";
export type { RestTimerOverlayProps } from "./rest-timer-overlay";
