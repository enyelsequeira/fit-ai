import type { BodyWeightUnit, LengthUnit } from "@fit-ai/db/schema/body-measurement";

import { db } from "@fit-ai/db";
import { bodyMeasurement } from "@fit-ai/db/schema/body-measurement";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { badRequest, notFound, notOwner } from "../../errors";

import type {
  CreateRouteHandler,
  DeleteRouteHandler,
  GetByIdRouteHandler,
  GetLatestRouteHandler,
  GetTrendsRouteHandler,
  ListRouteHandler,
  UpdateRouteHandler,
} from "./contracts";

// ============================================================================
// Helper Functions
// ============================================================================

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

function getStartDateFromPeriod(period: string, endDate: Date): Date {
  const start = new Date(endDate);

  switch (period) {
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(start.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "all":
      start.setFullYear(2000);
      break;
  }

  return start;
}

// ============================================================================
// Handlers
// ============================================================================

export const listBodyMeasurementsHandler: ListRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;
  const conditions: ReturnType<typeof eq>[] = [eq(bodyMeasurement.userId, userId)];

  if (input.startDate) {
    conditions.push(gte(bodyMeasurement.measuredAt, input.startDate));
  }
  if (input.endDate) {
    conditions.push(lte(bodyMeasurement.measuredAt, input.endDate));
  }

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bodyMeasurement)
    .where(and(...conditions));

  const total = countResult[0]?.count ?? 0;

  const measurements = await db
    .select()
    .from(bodyMeasurement)
    .where(and(...conditions))
    .orderBy(desc(bodyMeasurement.measuredAt))
    .limit(input.limit)
    .offset(input.offset);

  return {
    measurements,
    total,
    limit: input.limit,
    offset: input.offset,
  };
};

export const getByIdHandler: GetByIdRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;
  return verifyMeasurementOwnership(input.id, userId);
};

export const getLatestHandler: GetLatestRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  const result = await db
    .select()
    .from(bodyMeasurement)
    .where(eq(bodyMeasurement.userId, userId))
    .orderBy(desc(bodyMeasurement.measuredAt))
    .limit(1);

  return result[0] ?? null;
};

export const getTrendsHandler: GetTrendsRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const endDate = input.endDate ?? new Date();
  const startDate = input.startDate ?? getStartDateFromPeriod(input.period, endDate);

  const measurements = await db
    .select({
      measuredAt: bodyMeasurement.measuredAt,
      weight: bodyMeasurement.weight,
      bodyFatPercentage: bodyMeasurement.bodyFatPercentage,
    })
    .from(bodyMeasurement)
    .where(
      and(
        eq(bodyMeasurement.userId, userId),
        gte(bodyMeasurement.measuredAt, startDate),
        lte(bodyMeasurement.measuredAt, endDate),
      ),
    )
    .orderBy(bodyMeasurement.measuredAt);

  const dataPoints = measurements.map((m) => ({
    date: m.measuredAt,
    weight: m.weight,
    bodyFatPercentage: m.bodyFatPercentage,
  }));

  let weightChange: number | null = null;
  let bodyFatChange: number | null = null;

  if (measurements.length >= 2) {
    const first = measurements[0];
    const last = measurements[measurements.length - 1];

    if (first && last) {
      if (first.weight !== null && last.weight !== null) {
        weightChange = last.weight - first.weight;
      }
      if (first.bodyFatPercentage !== null && last.bodyFatPercentage !== null) {
        bodyFatChange = last.bodyFatPercentage - first.bodyFatPercentage;
      }
    }
  }

  return {
    dataPoints,
    weightChange,
    bodyFatChange,
    startDate: measurements[0]?.measuredAt ?? null,
    endDate: measurements[measurements.length - 1]?.measuredAt ?? null,
    measurementCount: measurements.length,
  };
};

export const createBodyMeasurementHandler: CreateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const result = await db
    .insert(bodyMeasurement)
    .values({
      userId,
      measuredAt: input.measuredAt ?? new Date(),
      weight: input.weight ?? null,
      weightUnit: (input.weightUnit as BodyWeightUnit) ?? "kg",
      bodyFatPercentage: input.bodyFatPercentage ?? null,
      chest: input.chest ?? null,
      waist: input.waist ?? null,
      hips: input.hips ?? null,
      leftArm: input.leftArm ?? null,
      rightArm: input.rightArm ?? null,
      leftThigh: input.leftThigh ?? null,
      rightThigh: input.rightThigh ?? null,
      leftCalf: input.leftCalf ?? null,
      rightCalf: input.rightCalf ?? null,
      neck: input.neck ?? null,
      shoulders: input.shoulders ?? null,
      lengthUnit: (input.lengthUnit as LengthUnit) ?? "cm",
      notes: input.notes ?? null,
    })
    .returning();

  return result[0];
};

export const updateBodyMeasurementHandler: UpdateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyMeasurementOwnership(input.id, userId);

  const updateData: Partial<typeof bodyMeasurement.$inferInsert> = {};

  if (input.measuredAt !== undefined) updateData.measuredAt = input.measuredAt;
  if (input.weight !== undefined) updateData.weight = input.weight;
  if (input.weightUnit !== undefined)
    updateData.weightUnit = input.weightUnit as BodyWeightUnit | null;
  if (input.bodyFatPercentage !== undefined) updateData.bodyFatPercentage = input.bodyFatPercentage;
  if (input.chest !== undefined) updateData.chest = input.chest;
  if (input.waist !== undefined) updateData.waist = input.waist;
  if (input.hips !== undefined) updateData.hips = input.hips;
  if (input.leftArm !== undefined) updateData.leftArm = input.leftArm;
  if (input.rightArm !== undefined) updateData.rightArm = input.rightArm;
  if (input.leftThigh !== undefined) updateData.leftThigh = input.leftThigh;
  if (input.rightThigh !== undefined) updateData.rightThigh = input.rightThigh;
  if (input.leftCalf !== undefined) updateData.leftCalf = input.leftCalf;
  if (input.rightCalf !== undefined) updateData.rightCalf = input.rightCalf;
  if (input.neck !== undefined) updateData.neck = input.neck;
  if (input.shoulders !== undefined) updateData.shoulders = input.shoulders;
  if (input.lengthUnit !== undefined) updateData.lengthUnit = input.lengthUnit as LengthUnit | null;
  if (input.notes !== undefined) updateData.notes = input.notes;

  if (Object.keys(updateData).length === 0) {
    badRequest("No fields to update", "fields");
  }

  const result = await db
    .update(bodyMeasurement)
    .set(updateData)
    .where(eq(bodyMeasurement.id, input.id))
    .returning();

  return result[0];
};

export const deleteBodyMeasurementHandler: DeleteRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  await verifyMeasurementOwnership(input.id, userId);

  await db.delete(bodyMeasurement).where(eq(bodyMeasurement.id, input.id));

  return { success: true };
};
