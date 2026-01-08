import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { bodyMeasurement } from "./body-measurement";

/**
 * Pose types for progress photos
 */
export type PoseType = "front" | "side" | "back" | "other";

/**
 * Progress Photo table - tracks visual progress over time
 */
export const progressPhoto = sqliteTable(
  "progress_photo",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Photo data
    /** URL to the stored photo */
    photoUrl: text("photo_url").notNull(),
    /** Smaller version for lists/thumbnails */
    thumbnailUrl: text("thumbnail_url"),

    // Metadata
    /** When the photo was taken */
    takenAt: integer("taken_at", { mode: "timestamp_ms" }).notNull(),
    /** Pose type: front, side, back, or other */
    poseType: text("pose_type").$type<PoseType>(),

    // Optional link to body measurement taken same day
    /** Reference to body measurement for correlation */
    bodyMeasurementId: integer("body_measurement_id").references(() => bodyMeasurement.id, {
      onDelete: "set null",
    }),

    // Privacy
    /** Whether the photo is private (default: true) */
    isPrivate: integer("is_private", { mode: "boolean" }).default(true).notNull(),

    // Additional info
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
    index("progress_photo_user_id_idx").on(table.userId),
    index("progress_photo_taken_at_idx").on(table.takenAt),
    index("progress_photo_body_measurement_id_idx").on(table.bodyMeasurementId),
    index("progress_photo_pose_type_idx").on(table.poseType),
  ],
);

// Relations
export const progressPhotoRelations = relations(progressPhoto, ({ one }) => ({
  user: one(user, {
    fields: [progressPhoto.userId],
    references: [user.id],
  }),
  bodyMeasurement: one(bodyMeasurement, {
    fields: [progressPhoto.bodyMeasurementId],
    references: [bodyMeasurement.id],
  }),
}));

// Extended user relations for progress photos (merged with auth.ts userRelations by Drizzle)
export const userProgressPhotoRelations = relations(user, ({ many }) => ({
  progressPhotos: many(progressPhoto),
}));

// Extended body measurement relations for progress photos (merged with body-measurement.ts by Drizzle)
export const bodyMeasurementProgressPhotoRelations = relations(bodyMeasurement, ({ many }) => ({
  progressPhotos: many(progressPhoto),
}));

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Pose type enum schema
 */
export const poseTypeSchema = z.enum(["front", "side", "back", "other"]);

/**
 * Select schema - for validating data returned from the database
 */
export const selectProgressPhotoSchema = createSelectSchema(progressPhoto, {
  poseType: poseTypeSchema.nullable(),
});

/**
 * Insert schema - for validating data before insertion
 * Omits auto-generated fields (id, userId, createdAt, updatedAt)
 */
export const insertProgressPhotoSchema = createInsertSchema(progressPhoto, {
  photoUrl: (schema) => schema.url(),
  thumbnailUrl: (schema) => schema.url().optional(),
  takenAt: z.coerce.date(),
  poseType: poseTypeSchema.optional(),
  bodyMeasurementId: z.number().optional(),
  isPrivate: z.boolean().default(true),
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
export const updateProgressPhotoSchema = insertProgressPhotoSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectProgressPhoto = z.infer<typeof selectProgressPhotoSchema>;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;
export type UpdateProgressPhoto = z.infer<typeof updateProgressPhotoSchema>;
