import { db } from "@fit-ai/db";
import { bodyMeasurement } from "@fit-ai/db/schema/body-measurement";
import { progressPhoto } from "@fit-ai/db/schema/progress-photo";
import { and, between, desc, eq, sql } from "drizzle-orm";

import { notFound, notOwner } from "../../errors";

import type {
  CompareRouteHandler,
  CreateRouteHandler,
  DeleteRouteHandler,
  GetByIdRouteHandler,
  LinkMeasurementRouteHandler,
  ListRouteHandler,
  TimelineRouteHandler,
  UnlinkMeasurementRouteHandler,
  UpdateRouteHandler,
} from "./contracts";
import type { PhotoWithMeasurement } from "./schemas";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify that a photo belongs to the user
 */
async function verifyPhotoOwnership(
  photoId: number,
  userId: string,
): Promise<typeof progressPhoto.$inferSelect> {
  const result = await db
    .select()
    .from(progressPhoto)
    .where(eq(progressPhoto.id, photoId))
    .limit(1);

  const photo = result[0];
  if (!photo) {
    notFound("Progress photo", photoId);
  }

  if (photo.userId !== userId) {
    notOwner("photo");
  }

  return photo;
}

/**
 * Verify that a body measurement belongs to the user
 */
async function verifyMeasurementOwnership(
  measurementId: number,
  userId: string,
): Promise<typeof bodyMeasurement.$inferSelect> {
  const result = await db
    .select()
    .from(bodyMeasurement)
    .where(eq(bodyMeasurement.id, measurementId))
    .limit(1);

  const measurement = result[0];
  if (!measurement) {
    notFound("Body measurement", measurementId);
  }

  if (measurement.userId !== userId) {
    notOwner("measurement");
  }

  return measurement;
}

/**
 * Get photo with linked measurement data
 */
async function getPhotoWithMeasurement(
  photoId: number,
  userId: string,
): Promise<PhotoWithMeasurement> {
  const photo = await verifyPhotoOwnership(photoId, userId);

  let measurementData = null;
  if (photo.bodyMeasurementId) {
    const measurementResult = await db
      .select({
        id: bodyMeasurement.id,
        measuredAt: bodyMeasurement.measuredAt,
        weight: bodyMeasurement.weight,
        weightUnit: bodyMeasurement.weightUnit,
        bodyFatPercentage: bodyMeasurement.bodyFatPercentage,
      })
      .from(bodyMeasurement)
      .where(eq(bodyMeasurement.id, photo.bodyMeasurementId))
      .limit(1);

    measurementData = measurementResult[0] ?? null;
  }

  return {
    ...photo,
    bodyMeasurement: measurementData,
  };
}

// ============================================================================
// List Photos Handler
// ============================================================================

export const listPhotosHandler: ListRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const conditions = [eq(progressPhoto.userId, userId)];

  if (input.poseType) {
    conditions.push(eq(progressPhoto.poseType, input.poseType));
  }

  if (input.startDate && input.endDate) {
    conditions.push(between(progressPhoto.takenAt, input.startDate, input.endDate));
  } else if (input.startDate) {
    conditions.push(sql`${progressPhoto.takenAt} >= ${input.startDate}`);
  } else if (input.endDate) {
    conditions.push(sql`${progressPhoto.takenAt} <= ${input.endDate}`);
  }

  const photos = await db
    .select()
    .from(progressPhoto)
    .where(and(...conditions))
    .orderBy(desc(progressPhoto.takenAt))
    .limit(input.limit)
    .offset(input.offset);

  return photos;
};

// ============================================================================
// Get By ID Handler
// ============================================================================

export const getByIdHandler: GetByIdRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;
  return getPhotoWithMeasurement(input.id, userId);
};

// ============================================================================
// Create Photo Handler
// ============================================================================

export const createPhotoHandler: CreateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Verify measurement ownership if linking
  if (input.bodyMeasurementId) {
    await verifyMeasurementOwnership(input.bodyMeasurementId, userId);
  }

  const result = await db
    .insert(progressPhoto)
    .values({
      userId,
      photoUrl: input.photoUrl,
      thumbnailUrl: input.thumbnailUrl,
      takenAt: input.takenAt,
      poseType: input.poseType,
      bodyMeasurementId: input.bodyMeasurementId,
      isPrivate: input.isPrivate,
      notes: input.notes,
    })
    .returning();

  return result[0];
};

// ============================================================================
// Update Photo Handler
// ============================================================================

export const updatePhotoHandler: UpdateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyPhotoOwnership(input.id, userId);

  const updateData: Partial<typeof progressPhoto.$inferInsert> = {};
  if (input.poseType !== undefined) updateData.poseType = input.poseType;
  if (input.isPrivate !== undefined) updateData.isPrivate = input.isPrivate;
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.takenAt !== undefined) updateData.takenAt = input.takenAt;

  const result = await db
    .update(progressPhoto)
    .set(updateData)
    .where(eq(progressPhoto.id, input.id))
    .returning();

  return result[0];
};

// ============================================================================
// Delete Photo Handler
// ============================================================================

export const deletePhotoHandler: DeleteRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyPhotoOwnership(input.id, userId);

  await db.delete(progressPhoto).where(eq(progressPhoto.id, input.id));

  return { success: true };
};

// ============================================================================
// Link Measurement Handler
// ============================================================================

export const linkMeasurementHandler: LinkMeasurementRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Verify both photo and measurement belong to the user
  await verifyPhotoOwnership(input.id, userId);
  await verifyMeasurementOwnership(input.bodyMeasurementId, userId);

  // Update the photo with the measurement link
  await db
    .update(progressPhoto)
    .set({ bodyMeasurementId: input.bodyMeasurementId })
    .where(eq(progressPhoto.id, input.id));

  return getPhotoWithMeasurement(input.id, userId);
};

// ============================================================================
// Unlink Measurement Handler
// ============================================================================

export const unlinkMeasurementHandler: UnlinkMeasurementRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  await verifyPhotoOwnership(input.id, userId);

  const result = await db
    .update(progressPhoto)
    .set({ bodyMeasurementId: null })
    .where(eq(progressPhoto.id, input.id))
    .returning();

  return result[0];
};

// ============================================================================
// Compare Photos Handler
// ============================================================================

export const comparePhotosHandler: CompareRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Get both photos with their measurements
  const [photo1, photo2] = await Promise.all([
    getPhotoWithMeasurement(input.photoId1, userId),
    getPhotoWithMeasurement(input.photoId2, userId),
  ]);

  // Calculate days between photos
  const timeDiff = Math.abs(photo2.takenAt.getTime() - photo1.takenAt.getTime());
  const daysBetween = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return {
    photo1,
    photo2,
    daysBetween,
  };
};

// ============================================================================
// Timeline Handler
// ============================================================================

export const timelineHandler: TimelineRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Get all photos ordered by date
  const photos = await db
    .select()
    .from(progressPhoto)
    .where(eq(progressPhoto.userId, userId))
    .orderBy(desc(progressPhoto.takenAt))
    .limit(input.limit);

  // Group photos by year-month
  const groupMap = new Map<string, Array<typeof progressPhoto.$inferSelect>>();

  for (const photo of photos) {
    const yearMonth = `${photo.takenAt.getFullYear()}-${String(photo.takenAt.getMonth() + 1).padStart(2, "0")}`;

    const existing = groupMap.get(yearMonth);
    if (existing) {
      existing.push(photo);
    } else {
      groupMap.set(yearMonth, [photo]);
    }
  }

  // Convert to array format
  const groups = Array.from(groupMap.entries()).map(([yearMonth, groupPhotos]) => ({
    yearMonth,
    photos: groupPhotos,
    count: groupPhotos.length,
  }));

  return {
    groups,
    totalCount: photos.length,
  };
};
