import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { workoutTemplate } from "./workout-template";

// ============================================================================
// Type Definitions (prefixed with Settings to avoid conflicts)
// ============================================================================

/**
 * Weight unit preference for settings
 */
export type SettingsWeightUnit = "kg" | "lb";

/**
 * Distance unit preference for settings
 */
export type SettingsDistanceUnit = "km" | "mi";

/**
 * Length/measurement unit preference for settings
 */
export type SettingsLengthUnit = "cm" | "in";

/**
 * Temperature unit preference
 */
export type TemperatureUnit = "celsius" | "fahrenheit";

/**
 * Date format preference
 */
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

/**
 * Time format preference
 */
export type TimeFormat = "12h" | "24h";

/**
 * Theme preference
 */
export type ThemePreference = "light" | "dark" | "system";

/**
 * First day of week preference
 */
export type FirstDayOfWeek = "sunday" | "monday";

// ============================================================================
// User Settings Table
// ============================================================================

/**
 * User settings table - stores user preferences (1:1 with user)
 * All fields are optional with sensible defaults
 */
export const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // ========== Unit Preferences ==========
  /** Weight unit (kg or lb) */
  weightUnit: text("weight_unit").$type<SettingsWeightUnit>().default("kg").notNull(),
  /** Distance unit (km or mi) */
  distanceUnit: text("distance_unit").$type<SettingsDistanceUnit>().default("km").notNull(),
  /** Length/measurement unit (cm or in) */
  lengthUnit: text("length_unit").$type<SettingsLengthUnit>().default("cm").notNull(),
  /** Temperature unit */
  temperatureUnit: text("temperature_unit").$type<TemperatureUnit>().default("celsius").notNull(),

  // ========== Workout Preferences ==========
  /** Currently active workout template for quick access */
  activeTemplateId: integer("active_template_id").references(() => workoutTemplate.id, {
    onDelete: "set null",
  }),
  /** Default rest timer duration in seconds */
  defaultRestTimerSeconds: integer("default_rest_timer_seconds").default(90).notNull(),
  /** Auto-start rest timer after completing a set */
  autoStartRestTimer: integer("auto_start_rest_timer", { mode: "boolean" }).default(true).notNull(),
  /** Vibrate/sound when rest timer ends */
  restTimerAlert: integer("rest_timer_alert", { mode: "boolean" }).default(true).notNull(),
  /** Keep screen awake during workout */
  keepScreenAwake: integer("keep_screen_awake", { mode: "boolean" }).default(true).notNull(),
  /** Show exercise history/previous performance */
  showExerciseHistory: integer("show_exercise_history", { mode: "boolean" })
    .default(true)
    .notNull(),
  /** Default number of warmup sets to suggest */
  defaultWarmupSets: integer("default_warmup_sets").default(2).notNull(),

  // ========== Display Preferences ==========
  /** Theme preference */
  theme: text("theme").$type<ThemePreference>().default("system").notNull(),
  /** Date format */
  dateFormat: text("date_format").$type<DateFormat>().default("YYYY-MM-DD").notNull(),
  /** Time format (12h or 24h) */
  timeFormat: text("time_format").$type<TimeFormat>().default("24h").notNull(),
  /** First day of week for calendar views */
  firstDayOfWeek: text("first_day_of_week").$type<FirstDayOfWeek>().default("monday").notNull(),
  /** User's timezone (IANA format, e.g., "America/New_York") */
  timezone: text("timezone").default("UTC").notNull(),

  // ========== Notification Preferences ==========
  /** Enable workout reminders */
  workoutReminders: integer("workout_reminders", { mode: "boolean" }).default(true).notNull(),
  /** Enable PR notifications */
  prNotifications: integer("pr_notifications", { mode: "boolean" }).default(true).notNull(),
  /** Enable streak notifications */
  streakNotifications: integer("streak_notifications", { mode: "boolean" }).default(true).notNull(),
  /** Enable weekly summary notifications */
  weeklySummary: integer("weekly_summary", { mode: "boolean" }).default(true).notNull(),

  // ========== Privacy Preferences ==========
  /** Show profile to other users */
  publicProfile: integer("public_profile", { mode: "boolean" }).default(false).notNull(),
  /** Show workouts on public profile */
  showWorkoutsPublicly: integer("show_workouts_publicly", { mode: "boolean" })
    .default(false)
    .notNull(),
  /** Show PRs on public profile */
  showPRsPublicly: integer("show_prs_publicly", { mode: "boolean" }).default(false).notNull(),

  // ========== Body Measurement Defaults ==========
  /** Default body weight for quick logging */
  defaultBodyWeight: real("default_body_weight"),
  /** Default body weight unit */
  defaultBodyWeightUnit: text("default_body_weight_unit").$type<SettingsWeightUnit>().default("kg"),

  // ========== Timestamps ==========
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
  activeTemplate: one(workoutTemplate, {
    fields: [userSettings.activeTemplateId],
    references: [workoutTemplate.id],
  }),
}));

// Extended user relations for settings
export const userSettingsUserRelations = relations(user, ({ one }) => ({
  settings: one(userSettings, {
    fields: [user.id],
    references: [userSettings.userId],
  }),
}));

// ============================================================================
// Zod Schemas (prefixed with "settings" to avoid conflicts with other schemas)
// ============================================================================

/**
 * Weight unit enum schema for settings
 */
export const settingsWeightUnitSchema = z.enum(["kg", "lb"]);

/**
 * Distance unit enum schema for settings
 */
export const settingsDistanceUnitSchema = z.enum(["km", "mi"]);

/**
 * Length unit enum schema for settings
 */
export const settingsLengthUnitSchema = z.enum(["cm", "in"]);

/**
 * Temperature unit enum schema
 */
export const temperatureUnitSchema = z.enum(["celsius", "fahrenheit"]);

/**
 * Date format enum schema
 */
export const dateFormatSchema = z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]);

/**
 * Time format enum schema
 */
export const timeFormatSchema = z.enum(["12h", "24h"]);

/**
 * Theme preference enum schema
 */
export const themePreferenceSchema = z.enum(["light", "dark", "system"]);

/**
 * First day of week enum schema
 */
export const firstDayOfWeekSchema = z.enum(["sunday", "monday"]);

/**
 * Select schema - for validating data returned from the database
 */
export const selectUserSettingsSchema = createSelectSchema(userSettings, {
  weightUnit: settingsWeightUnitSchema,
  distanceUnit: settingsDistanceUnitSchema,
  lengthUnit: settingsLengthUnitSchema,
  temperatureUnit: temperatureUnitSchema,
  dateFormat: dateFormatSchema,
  timeFormat: timeFormatSchema,
  theme: themePreferenceSchema,
  firstDayOfWeek: firstDayOfWeekSchema,
  defaultBodyWeightUnit: settingsWeightUnitSchema.nullable(),
});

/**
 * Insert schema - for creating new settings
 */
export const insertUserSettingsSchema = createInsertSchema(userSettings, {
  weightUnit: settingsWeightUnitSchema.default("kg"),
  distanceUnit: settingsDistanceUnitSchema.default("km"),
  lengthUnit: settingsLengthUnitSchema.default("cm"),
  temperatureUnit: temperatureUnitSchema.default("celsius"),
  dateFormat: dateFormatSchema.default("YYYY-MM-DD"),
  timeFormat: timeFormatSchema.default("24h"),
  theme: themePreferenceSchema.default("system"),
  firstDayOfWeek: firstDayOfWeekSchema.default("monday"),
  timezone: z.string().default("UTC"),
  defaultRestTimerSeconds: z.number().int().min(0).max(600).default(90),
  defaultWarmupSets: z.number().int().min(0).max(10).default(2),
  defaultBodyWeight: z.number().positive().optional(),
  defaultBodyWeightUnit: settingsWeightUnitSchema.optional(),
  activeTemplateId: z.number().int().positive().optional().nullable(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - for partial updates (all fields optional)
 */
export const updateUserSettingsSchema = insertUserSettingsSchema.partial();

// ============================================================================
// Type Exports
// ============================================================================

export type SelectUserSettings = z.infer<typeof selectUserSettingsSchema>;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
