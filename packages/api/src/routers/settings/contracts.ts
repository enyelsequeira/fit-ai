import { protectedProcedure } from "../../index";
import {
  activeTemplateOutputSchema,
  setActiveTemplateSchema,
  settingsOutputSchema,
  updateDisplayPreferencesSchema,
  updateNotificationPreferencesSchema,
  updatePrivacyPreferencesSchema,
  updateSettingsSchema,
  updateUnitsSchema,
  updateWorkoutPreferencesSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * Get user settings (creates defaults if not exists)
 */
export const getRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/settings",
    summary: "Get user settings",
    description: "Retrieves the user's settings. Creates default settings if they don't exist.",
    tags: ["Settings"],
  })
  .output(settingsOutputSchema);

/**
 * Update any combination of settings
 */
export const updateRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings",
    summary: "Update settings",
    description:
      "Update any combination of user settings. All fields are optional - only provided fields are updated.",
    tags: ["Settings"],
  })
  .input(updateSettingsSchema)
  .output(settingsOutputSchema);

/**
 * Update unit preferences
 */
export const updateUnitsRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/units",
    summary: "Update unit preferences",
    description: "Update weight, distance, length, and temperature unit preferences.",
    tags: ["Settings"],
  })
  .input(updateUnitsSchema)
  .output(settingsOutputSchema);

/**
 * Update workout preferences
 */
export const updateWorkoutPreferencesRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/workout",
    summary: "Update workout preferences",
    description: "Update workout-related preferences like rest timer, warmup sets, etc.",
    tags: ["Settings"],
  })
  .input(updateWorkoutPreferencesSchema)
  .output(settingsOutputSchema);

/**
 * Update display preferences
 */
export const updateDisplayPreferencesRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/display",
    summary: "Update display preferences",
    description: "Update theme, date/time format, timezone, etc.",
    tags: ["Settings"],
  })
  .input(updateDisplayPreferencesSchema)
  .output(settingsOutputSchema);

/**
 * Update notification preferences
 */
export const updateNotificationPreferencesRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/notifications",
    summary: "Update notification preferences",
    description: "Update notification settings for reminders, PRs, streaks, etc.",
    tags: ["Settings"],
  })
  .input(updateNotificationPreferencesSchema)
  .output(settingsOutputSchema);

/**
 * Update privacy preferences
 */
export const updatePrivacyPreferencesRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/settings/privacy",
    summary: "Update privacy preferences",
    description: "Update profile visibility and sharing settings.",
    tags: ["Settings"],
  })
  .input(updatePrivacyPreferencesSchema)
  .output(settingsOutputSchema);

/**
 * Reset settings to defaults
 */
export const resetRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/settings/reset",
    summary: "Reset settings to defaults",
    description: "Reset all user settings to their default values.",
    tags: ["Settings"],
  })
  .output(settingsOutputSchema);

// ============================================================================
// Active Template Route Contracts
// ============================================================================

/**
 * Get user's active template
 */
export const getActiveTemplateRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/settings/active-template",
    summary: "Get active template",
    description:
      "Retrieves the user's currently active workout template. Returns null if no template is set as active.",
    tags: ["Settings"],
  })
  .output(activeTemplateOutputSchema);

/**
 * Set active template
 */
export const setActiveTemplateRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/settings/active-template",
    summary: "Set active template",
    description:
      "Sets a workout template as the user's active template. The template must exist and belong to the user.",
    tags: ["Settings"],
  })
  .input(setActiveTemplateSchema)
  .output(settingsOutputSchema);

/**
 * Clear active template
 */
export const clearActiveTemplateRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/settings/active-template",
    summary: "Clear active template",
    description: "Removes the user's active template setting.",
    tags: ["Settings"],
  })
  .output(settingsOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type GetRouteHandler = Parameters<typeof getRouteContract.handler>[0];
export type UpdateRouteHandler = Parameters<typeof updateRouteContract.handler>[0];
export type UpdateUnitsRouteHandler = Parameters<typeof updateUnitsRouteContract.handler>[0];
export type UpdateWorkoutPreferencesRouteHandler = Parameters<
  typeof updateWorkoutPreferencesRouteContract.handler
>[0];
export type UpdateDisplayPreferencesRouteHandler = Parameters<
  typeof updateDisplayPreferencesRouteContract.handler
>[0];
export type UpdateNotificationPreferencesRouteHandler = Parameters<
  typeof updateNotificationPreferencesRouteContract.handler
>[0];
export type UpdatePrivacyPreferencesRouteHandler = Parameters<
  typeof updatePrivacyPreferencesRouteContract.handler
>[0];
export type ResetRouteHandler = Parameters<typeof resetRouteContract.handler>[0];
export type GetActiveTemplateRouteHandler = Parameters<
  typeof getActiveTemplateRouteContract.handler
>[0];
export type SetActiveTemplateRouteHandler = Parameters<
  typeof setActiveTemplateRouteContract.handler
>[0];
export type ClearActiveTemplateRouteHandler = Parameters<
  typeof clearActiveTemplateRouteContract.handler
>[0];
