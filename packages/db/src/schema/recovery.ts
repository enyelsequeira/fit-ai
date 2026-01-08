import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";

/**
 * Mood type for daily check-ins
 */
export type MoodType = "great" | "good" | "neutral" | "low" | "bad";

/**
 * Muscle group type for recovery tracking
 */
export type MuscleGroupType =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves";

/**
 * Daily wellness/recovery check-in
 * Users log how they feel each day to help with training recommendations
 */
export const dailyCheckIn = sqliteTable(
  "daily_check_in",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** Date of check-in (YYYY-MM-DD format, one per day per user) */
    date: text("date").notNull(),

    // Sleep metrics
    /** Hours of sleep (0-24) */
    sleepHours: real("sleep_hours"),
    /** Sleep quality on 1-5 scale */
    sleepQuality: integer("sleep_quality"),

    // Energy & stress
    /** Energy level on 1-10 scale */
    energyLevel: integer("energy_level"),
    /** Stress level on 1-10 scale */
    stressLevel: integer("stress_level"),

    // Muscle soreness
    /** Overall soreness level on 1-10 scale */
    sorenessLevel: integer("soreness_level"),
    /** Array of sore muscle areas */
    soreAreas: text("sore_areas", { mode: "json" }).$type<string[]>(),

    // Recovery indicators
    /** Resting heart rate in BPM */
    restingHeartRate: integer("resting_heart_rate"),
    /** Heart rate variability score (from wearable) */
    hrvScore: real("hrv_score"),

    // Mental state
    /** Motivation level on 1-10 scale */
    motivationLevel: integer("motivation_level"),
    /** Mood category */
    mood: text("mood").$type<MoodType>(),

    // Nutrition & hydration
    /** Nutrition quality on 1-5 scale */
    nutritionQuality: integer("nutrition_quality"),
    /** Hydration level on 1-5 scale */
    hydrationLevel: integer("hydration_level"),

    /** Additional notes */
    notes: text("notes"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("daily_check_in_user_id_idx").on(table.userId),
    index("daily_check_in_date_idx").on(table.date),
    index("daily_check_in_user_date_idx").on(table.userId, table.date),
  ],
);

/**
 * Muscle group recovery status (calculated/cached)
 * Updated after workouts and check-ins
 */
export const muscleRecovery = sqliteTable(
  "muscle_recovery",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** Muscle group identifier */
    muscleGroup: text("muscle_group").$type<MuscleGroupType>().notNull(),

    // Recovery metrics
    /** Recovery score 0-100 (100 = fully recovered) */
    recoveryScore: integer("recovery_score"),
    /** Fatigue level 0-100 (100 = max fatigue) */
    fatigueLevel: integer("fatigue_level"),

    // Training data
    /** When this muscle was last worked */
    lastWorkedAt: integer("last_worked_at", { mode: "timestamp_ms" }),
    /** Number of sets in the last 7 days */
    setsLast7Days: integer("sets_last_7_days").default(0),
    /** Total volume (kg) in the last 7 days */
    volumeLast7Days: real("volume_last_7_days").default(0),

    /** Estimated time of full recovery */
    estimatedFullRecovery: integer("estimated_full_recovery", { mode: "timestamp_ms" }),

    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("muscle_recovery_user_id_idx").on(table.userId),
    index("muscle_recovery_muscle_idx").on(table.muscleGroup),
    index("muscle_recovery_user_muscle_idx").on(table.userId, table.muscleGroup),
  ],
);

// Relations
export const dailyCheckInRelations = relations(dailyCheckIn, ({ one }) => ({
  user: one(user, {
    fields: [dailyCheckIn.userId],
    references: [user.id],
  }),
}));

export const muscleRecoveryRelations = relations(muscleRecovery, ({ one }) => ({
  user: one(user, {
    fields: [muscleRecovery.userId],
    references: [user.id],
  }),
}));

// Extended user relations for recovery tracking (merged with auth.ts userRelations by Drizzle)
export const userRecoveryRelations = relations(user, ({ many }) => ({
  dailyCheckIns: many(dailyCheckIn),
  muscleRecoveries: many(muscleRecovery),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Mood enum schema
 */
export const moodSchema = z.enum(["great", "good", "neutral", "low", "bad"]);

/**
 * Muscle group enum schema
 */
export const muscleGroupSchema = z.enum([
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
]);

// ============================================================================
// Daily Check-In Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectDailyCheckInSchema = createSelectSchema(dailyCheckIn, {
  mood: moodSchema.nullable(),
  soreAreas: z.array(z.string()).nullable(),
});

/**
 * Insert schema - for validating data before insertion
 */
export const insertDailyCheckInSchema = createInsertSchema(dailyCheckIn, {
  date: (schema) => schema.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  sleepHours: (schema) => schema.min(0).max(24),
  sleepQuality: (schema) => schema.int().min(1).max(5),
  energyLevel: (schema) => schema.int().min(1).max(10),
  stressLevel: (schema) => schema.int().min(1).max(10),
  sorenessLevel: (schema) => schema.int().min(1).max(10),
  soreAreas: z.array(z.string()).nullable().optional(),
  restingHeartRate: (schema) => schema.int().min(30).max(200),
  hrvScore: (schema) => schema.min(0),
  motivationLevel: (schema) => schema.int().min(1).max(10),
  mood: moodSchema.nullable().optional(),
  nutritionQuality: (schema) => schema.int().min(1).max(5),
  hydrationLevel: (schema) => schema.int().min(1).max(5),
  notes: (schema) => schema.max(1000),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - partial insert with required id
 */
export const updateDailyCheckInSchema = insertDailyCheckInSchema.partial().extend({
  id: z.number(),
});

// Type exports for Daily Check-In
export type SelectDailyCheckIn = z.infer<typeof selectDailyCheckInSchema>;
export type InsertDailyCheckIn = z.infer<typeof insertDailyCheckInSchema>;
export type UpdateDailyCheckIn = z.infer<typeof updateDailyCheckInSchema>;

// ============================================================================
// Muscle Recovery Schemas
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectMuscleRecoverySchema = createSelectSchema(muscleRecovery, {
  muscleGroup: muscleGroupSchema,
});

/**
 * Insert schema - for validating data before insertion
 */
export const insertMuscleRecoverySchema = createInsertSchema(muscleRecovery, {
  muscleGroup: muscleGroupSchema,
  recoveryScore: (schema) => schema.int().min(0).max(100),
  fatigueLevel: (schema) => schema.int().min(0).max(100),
  setsLast7Days: (schema) => schema.int().min(0),
  volumeLast7Days: (schema) => schema.min(0),
}).omit({
  id: true,
  userId: true,
  updatedAt: true,
});

/**
 * Update schema - partial insert with required id
 */
export const updateMuscleRecoverySchema = insertMuscleRecoverySchema.partial().extend({
  id: z.number(),
});

// Type exports for Muscle Recovery
export type SelectMuscleRecovery = z.infer<typeof selectMuscleRecoverySchema>;
export type InsertMuscleRecovery = z.infer<typeof insertMuscleRecoverySchema>;
export type UpdateMuscleRecovery = z.infer<typeof updateMuscleRecoverySchema>;
