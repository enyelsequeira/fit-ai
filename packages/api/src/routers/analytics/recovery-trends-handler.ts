import { db } from "@fit-ai/db";
import { dailyCheckIn } from "@fit-ai/db/schema/recovery";
import { and, eq, gte, lte } from "drizzle-orm";

import type { GetRecoveryTrendsRouteHandler } from "./contracts";

/**
 * Format Date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Calculate average of non-null values
 */
function avgNonNull(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((sum, v) => sum + v, 0) / valid.length) * 10) / 10;
}

/**
 * Calculate trend as percentage change between first half and second half averages
 */
function calculateTrend(values: (number | null)[]): number {
  const mid = Math.floor(values.length / 2);
  if (mid === 0) return 0;

  const firstHalf = avgNonNull(values.slice(0, mid));
  const secondHalf = avgNonNull(values.slice(mid));

  if (firstHalf === null || secondHalf === null || firstHalf === 0) return 0;
  return Math.round(((secondHalf - firstHalf) / firstHalf) * 100 * 10) / 10;
}

/**
 * Get recovery trends handler
 * Retrieves recovery and wellness trends over time from daily check-ins
 */
export const getRecoveryTrendsHandler: GetRecoveryTrendsRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - input.days);

  const checkIns = await db
    .select()
    .from(dailyCheckIn)
    .where(
      and(
        eq(dailyCheckIn.userId, userId),
        gte(dailyCheckIn.date, formatDate(startDate)),
        lte(dailyCheckIn.date, formatDate(endDate)),
      ),
    )
    .orderBy(dailyCheckIn.date);

  const dataPoints = checkIns.map((c) => ({
    date: c.date,
    sleepHours: c.sleepHours,
    sleepQuality: c.sleepQuality,
    energyLevel: c.energyLevel,
    stressLevel: c.stressLevel,
    sorenessLevel: c.sorenessLevel,
    motivationLevel: c.motivationLevel,
    mood: c.mood,
  }));

  const averages = {
    sleepHours: avgNonNull(dataPoints.map((d) => d.sleepHours)),
    sleepQuality: avgNonNull(dataPoints.map((d) => d.sleepQuality)),
    energyLevel: avgNonNull(dataPoints.map((d) => d.energyLevel)),
    stressLevel: avgNonNull(dataPoints.map((d) => d.stressLevel)),
    sorenessLevel: avgNonNull(dataPoints.map((d) => d.sorenessLevel)),
    motivationLevel: avgNonNull(dataPoints.map((d) => d.motivationLevel)),
  };

  const trends = {
    sleepTrend: calculateTrend(dataPoints.map((d) => d.sleepHours)),
    energyTrend: calculateTrend(dataPoints.map((d) => d.energyLevel)),
    stressTrend: calculateTrend(dataPoints.map((d) => d.stressLevel)),
    sorenessTrend: calculateTrend(dataPoints.map((d) => d.sorenessLevel)),
  };

  return {
    period: {
      start: formatDate(startDate),
      end: formatDate(endDate),
    },
    dataPoints,
    averages,
    trends,
  };
};
