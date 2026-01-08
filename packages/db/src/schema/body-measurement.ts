import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";

/**
 * Weight units for body measurements
 */
export type BodyWeightUnit = "kg" | "lb";

/**
 * Length units for body measurements
 */
export type LengthUnit = "cm" | "in";

/**
 * Body Measurement table - tracks user body measurements over time
 */
export const bodyMeasurement = sqliteTable(
  "body_measurement",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** When the measurement was taken */
    measuredAt: integer("measured_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),

    // Weight
    weight: real("weight"),
    weightUnit: text("weight_unit").$type<BodyWeightUnit>().default("kg"),

    // Body composition
    bodyFatPercentage: real("body_fat_percentage"),

    // Measurements (stored in user's preferred unit)
    chest: real("chest"),
    waist: real("waist"),
    hips: real("hips"),
    leftArm: real("left_arm"),
    rightArm: real("right_arm"),
    leftThigh: real("left_thigh"),
    rightThigh: real("right_thigh"),
    leftCalf: real("left_calf"),
    rightCalf: real("right_calf"),
    neck: real("neck"),
    shoulders: real("shoulders"),
    lengthUnit: text("length_unit").$type<LengthUnit>().default("cm"),

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
    index("body_measurement_user_id_idx").on(table.userId),
    index("body_measurement_measured_at_idx").on(table.measuredAt),
  ],
);

export const bodyMeasurementRelations = relations(bodyMeasurement, ({ one }) => ({
  user: one(user, {
    fields: [bodyMeasurement.userId],
    references: [user.id],
  }),
}));

// Extended user relations for body measurements (merged with auth.ts userRelations by Drizzle)
export const userBodyMeasurementRelations = relations(user, ({ many }) => ({
  bodyMeasurements: many(bodyMeasurement),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Body weight unit enum schema
 */
export const bodyWeightUnitSchema = z.enum(["kg", "lb"]);

/**
 * Length unit enum schema
 */
export const lengthUnitSchema = z.enum(["cm", "in"]);

/**
 * Select schema - for validating data returned from the database
 */
export const selectBodyMeasurementSchema = createSelectSchema(bodyMeasurement, {
  weightUnit: bodyWeightUnitSchema.nullable(),
  lengthUnit: lengthUnitSchema.nullable(),
});

/**
 * Insert schema - for validating data before insertion
 * Omits auto-generated fields (id, userId, createdAt, updatedAt)
 */
export const insertBodyMeasurementSchema = createInsertSchema(bodyMeasurement, {
  measuredAt: z.coerce.date().optional(),
  weight: (schema) => schema.positive().optional(),
  weightUnit: bodyWeightUnitSchema.optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  chest: (schema) => schema.positive().optional(),
  waist: (schema) => schema.positive().optional(),
  hips: (schema) => schema.positive().optional(),
  leftArm: (schema) => schema.positive().optional(),
  rightArm: (schema) => schema.positive().optional(),
  leftThigh: (schema) => schema.positive().optional(),
  rightThigh: (schema) => schema.positive().optional(),
  leftCalf: (schema) => schema.positive().optional(),
  rightCalf: (schema) => schema.positive().optional(),
  neck: (schema) => schema.positive().optional(),
  shoulders: (schema) => schema.positive().optional(),
  lengthUnit: lengthUnitSchema.optional(),
  notes: (schema) => schema.max(1000).optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema - for validating partial updates
 * All fields are optional except id
 */
export const updateBodyMeasurementSchema = insertBodyMeasurementSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectBodyMeasurement = z.infer<typeof selectBodyMeasurementSchema>;
export type InsertBodyMeasurement = z.infer<typeof insertBodyMeasurementSchema>;
export type UpdateBodyMeasurement = z.infer<typeof updateBodyMeasurementSchema>;
