import {
  dateFormatSchema,
  firstDayOfWeekSchema,
  selectUserSettingsSchema,
  settingsDistanceUnitSchema,
  settingsLengthUnitSchema,
  settingsWeightUnitSchema,
  temperatureUnitSchema,
  themePreferenceSchema,
  timeFormatSchema,
  updateUserSettingsSchema as dbUpdateUserSettingsSchema,
} from "@fit-ai/db/schema/user-settings";
import z from "zod";

// ============================================================================
// Re-export base schemas from DB package
// ============================================================================

export {
  settingsWeightUnitSchema,
  settingsDistanceUnitSchema,
  settingsLengthUnitSchema,
  temperatureUnitSchema,
  dateFormatSchema,
  timeFormatSchema,
  themePreferenceSchema,
  firstDayOfWeekSchema,
};

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * User settings output schema (from drizzle-zod)
 */
export const settingsOutputSchema = selectUserSettingsSchema;

export type SettingsOutput = z.infer<typeof settingsOutputSchema>;

/**
 * Success result schema
 */
export const successResultSchema = z.object({
  success: z.boolean().describe("Whether the operation was successful"),
});

export type SuccessResult = z.infer<typeof successResultSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Update settings input schema (from drizzle-zod - all fields optional)
 * Users can update any combination of settings at once
 */
export const updateSettingsSchema = dbUpdateUserSettingsSchema;

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

/**
 * Update unit preferences shorthand
 */
export const updateUnitsSchema = z.object({
  weightUnit: settingsWeightUnitSchema.optional(),
  distanceUnit: settingsDistanceUnitSchema.optional(),
  lengthUnit: settingsLengthUnitSchema.optional(),
  temperatureUnit: temperatureUnitSchema.optional(),
});

export type UpdateUnitsInput = z.infer<typeof updateUnitsSchema>;

/**
 * Update workout preferences shorthand
 */
export const updateWorkoutPreferencesSchema = z.object({
  defaultRestTimerSeconds: z.number().int().min(0).max(600).optional(),
  autoStartRestTimer: z.boolean().optional(),
  restTimerAlert: z.boolean().optional(),
  keepScreenAwake: z.boolean().optional(),
  showExerciseHistory: z.boolean().optional(),
  defaultWarmupSets: z.number().int().min(0).max(10).optional(),
});

export type UpdateWorkoutPreferencesInput = z.infer<typeof updateWorkoutPreferencesSchema>;

/**
 * Update display preferences shorthand
 */
export const updateDisplayPreferencesSchema = z.object({
  theme: themePreferenceSchema.optional(),
  dateFormat: dateFormatSchema.optional(),
  timeFormat: timeFormatSchema.optional(),
  firstDayOfWeek: firstDayOfWeekSchema.optional(),
  timezone: z.string().optional(),
});

export type UpdateDisplayPreferencesInput = z.infer<typeof updateDisplayPreferencesSchema>;

/**
 * Update notification preferences shorthand
 */
export const updateNotificationPreferencesSchema = z.object({
  workoutReminders: z.boolean().optional(),
  prNotifications: z.boolean().optional(),
  streakNotifications: z.boolean().optional(),
  weeklySummary: z.boolean().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;

/**
 * Update privacy preferences shorthand
 */
export const updatePrivacyPreferencesSchema = z.object({
  publicProfile: z.boolean().optional(),
  showWorkoutsPublicly: z.boolean().optional(),
  showPRsPublicly: z.boolean().optional(),
});

export type UpdatePrivacyPreferencesInput = z.infer<typeof updatePrivacyPreferencesSchema>;
