import { protectedProcedure } from "../../index";
import {
  getSettingsHandler,
  resetSettingsHandler,
  updateDisplayPreferencesHandler,
  updateNotificationPreferencesHandler,
  updatePrivacyPreferencesHandler,
  updateSettingsHandler,
  updateUnitsHandler,
  updateWorkoutPreferencesHandler,
} from "./handlers";
import {
  settingsOutputSchema,
  updateDisplayPreferencesSchema,
  updateNotificationPreferencesSchema,
  updatePrivacyPreferencesSchema,
  updateSettingsSchema,
  updateUnitsSchema,
  updateWorkoutPreferencesSchema,
} from "./schemas";

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * Get user settings (creates defaults if not exists)
 */
export const getRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/settings",
    summary: "Get user settings",
    description: "Retrieves the user's settings. Creates default settings if they don't exist.",
    tags: ["Settings"],
  })
  .output(settingsOutputSchema)
  .handler(async ({ context }) => {
    return getSettingsHandler(context);
  });

/**
 * Update any combination of settings
 */
export const updateRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings",
    summary: "Update settings",
    description:
      "Update any combination of user settings. All fields are optional - only provided fields are updated.",
    tags: ["Settings"],
  })
  .input(updateSettingsSchema)
  .output(settingsOutputSchema)
  .handler(async ({ input, context }) => {
    return updateSettingsHandler(input, context);
  });

/**
 * Update unit preferences
 */
export const updateUnitsRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/units",
    summary: "Update unit preferences",
    description: "Update weight, distance, length, and temperature unit preferences.",
    tags: ["Settings"],
  })
  .input(updateUnitsSchema)
  .output(settingsOutputSchema)
  .handler(async ({ input, context }) => {
    return updateUnitsHandler(input, context);
  });

/**
 * Update workout preferences
 */
export const updateWorkoutPreferencesRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/workout",
    summary: "Update workout preferences",
    description: "Update workout-related preferences like rest timer, warmup sets, etc.",
    tags: ["Settings"],
  })
  .input(updateWorkoutPreferencesSchema)
  .output(settingsOutputSchema)
  .handler(async ({ input, context }) => {
    return updateWorkoutPreferencesHandler(input, context);
  });

/**
 * Update display preferences
 */
export const updateDisplayPreferencesRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/display",
    summary: "Update display preferences",
    description: "Update theme, date/time format, timezone, etc.",
    tags: ["Settings"],
  })
  .input(updateDisplayPreferencesSchema)
  .output(settingsOutputSchema)
  .handler(async ({ input, context }) => {
    return updateDisplayPreferencesHandler(input, context);
  });

/**
 * Update notification preferences
 */
export const updateNotificationPreferencesRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/notifications",
    summary: "Update notification preferences",
    description: "Update notification settings for reminders, PRs, streaks, etc.",
    tags: ["Settings"],
  })
  .input(updateNotificationPreferencesSchema)
  .output(settingsOutputSchema)
  .handler(async ({ input, context }) => {
    return updateNotificationPreferencesHandler(input, context);
  });

/**
 * Update privacy preferences
 */
export const updatePrivacyPreferencesRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/privacy",
    summary: "Update privacy preferences",
    description: "Update profile visibility and sharing settings.",
    tags: ["Settings"],
  })
  .input(updatePrivacyPreferencesSchema)
  .output(settingsOutputSchema)
  .handler(async ({ input, context }) => {
    return updatePrivacyPreferencesHandler(input, context);
  });

/**
 * Reset settings to defaults
 */
export const resetRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/settings/reset",
    summary: "Reset settings to defaults",
    description: "Reset all user settings to their default values.",
    tags: ["Settings"],
  })
  .output(settingsOutputSchema)
  .handler(async ({ context }) => {
    return resetSettingsHandler(context);
  });
