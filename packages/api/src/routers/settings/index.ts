/**
 * Settings Router Module
 *
 * Provides user settings management including:
 * - Unit preferences (weight, distance, length, temperature)
 * - Workout preferences (rest timer, warmup sets, etc.)
 * - Display preferences (theme, date/time format, timezone)
 * - Notification preferences
 * - Privacy preferences
 */

import {
  getRoute,
  resetRoute,
  updateDisplayPreferencesRoute,
  updateNotificationPreferencesRoute,
  updatePrivacyPreferencesRoute,
  updateRoute,
  updateUnitsRoute,
  updateWorkoutPreferencesRoute,
} from "./routes";

// ============================================================================
// Settings Router
// ============================================================================

/**
 * Complete settings router with all endpoints
 */
export const settingsRouter = {
  /** Get user settings (creates defaults if not exists) */
  get: getRoute,

  /** Update any combination of settings */
  update: updateRoute,

  /** Update unit preferences only */
  updateUnits: updateUnitsRoute,

  /** Update workout preferences only */
  updateWorkoutPreferences: updateWorkoutPreferencesRoute,

  /** Update display preferences only */
  updateDisplayPreferences: updateDisplayPreferencesRoute,

  /** Update notification preferences only */
  updateNotificationPreferences: updateNotificationPreferencesRoute,

  /** Update privacy preferences only */
  updatePrivacyPreferences: updatePrivacyPreferencesRoute,

  /** Reset all settings to defaults */
  reset: resetRoute,
};

// ============================================================================
// Re-exports
// ============================================================================

export * from "./schemas";
export * from "./handlers";
export {
  getRoute,
  resetRoute,
  updateDisplayPreferencesRoute,
  updateNotificationPreferencesRoute,
  updatePrivacyPreferencesRoute,
  updateRoute,
  updateUnitsRoute,
  updateWorkoutPreferencesRoute,
} from "./routes";
