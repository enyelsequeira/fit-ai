import type { MoodType, MuscleGroupType } from "@fit-ai/db/schema/recovery";

import { db } from "@fit-ai/db";
import { dailyCheckIn, muscleRecovery } from "@fit-ai/db/schema/recovery";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { notFound } from "../../errors";

import type {
  CheckInHistoryInput,
  CheckInInput,
  DeleteCheckInInput,
  GetCheckInByDateInput,
  TrendsInput,
} from "./schemas";
import { MUSCLE_GROUPS } from "./schemas";

// ============================================================================
// Types
// ============================================================================

export interface HandlerContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  } | null;
}

export interface AuthenticatedContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

/**
 * Calculate the start date based on the period
 */
function getStartDateFromPeriod(period: string, endDate: string): string {
  const end = new Date(endDate);

  switch (period) {
    case "week":
      end.setDate(end.getDate() - 7);
      break;
    case "month":
      end.setMonth(end.getMonth() - 1);
      break;
    case "quarter":
      end.setMonth(end.getMonth() - 3);
      break;
    case "year":
      end.setFullYear(end.getFullYear() - 1);
      break;
  }

  return end.toISOString().split("T")[0] ?? "";
}

/**
 * Calculate average of numbers, ignoring nulls
 */
function calculateAverage(values: (number | null)[]): number | null {
  const validValues = values.filter((v): v is number => v !== null);
  if (validValues.length === 0) return null;
  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
}

/**
 * Round to 1 decimal place
 */
function roundTo1Decimal(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 10) / 10;
}

/**
 * Calculate readiness recommendation based on score
 */
function getReadinessRecommendation(
  score: number,
): "ready to train hard" | "light training recommended" | "rest day suggested" {
  if (score >= 70) return "ready to train hard";
  if (score >= 40) return "light training recommended";
  return "rest day suggested";
}

// ============================================================================
// Create Check-In Handler
// ============================================================================

export async function createCheckInHandler(input: CheckInInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  const date = input.date ?? getTodayDateString();

  // Check if a check-in already exists for this date
  const existing = await db
    .select()
    .from(dailyCheckIn)
    .where(and(eq(dailyCheckIn.userId, userId), eq(dailyCheckIn.date, date)))
    .limit(1);

  if (existing[0]) {
    // Update existing check-in
    const result = await db
      .update(dailyCheckIn)
      .set({
        sleepHours: input.sleepHours ?? existing[0].sleepHours,
        sleepQuality: input.sleepQuality ?? existing[0].sleepQuality,
        energyLevel: input.energyLevel ?? existing[0].energyLevel,
        stressLevel: input.stressLevel ?? existing[0].stressLevel,
        sorenessLevel: input.sorenessLevel ?? existing[0].sorenessLevel,
        soreAreas: input.soreAreas ?? existing[0].soreAreas,
        restingHeartRate: input.restingHeartRate ?? existing[0].restingHeartRate,
        hrvScore: input.hrvScore ?? existing[0].hrvScore,
        motivationLevel: input.motivationLevel ?? existing[0].motivationLevel,
        mood: (input.mood as MoodType) ?? existing[0].mood,
        nutritionQuality: input.nutritionQuality ?? existing[0].nutritionQuality,
        hydrationLevel: input.hydrationLevel ?? existing[0].hydrationLevel,
        notes: input.notes ?? existing[0].notes,
      })
      .where(eq(dailyCheckIn.id, existing[0].id))
      .returning();

    const updated = result[0];
    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update check-in" });
    }

    return updated;
  }

  // Create new check-in
  const result = await db
    .insert(dailyCheckIn)
    .values({
      userId,
      date,
      sleepHours: input.sleepHours ?? null,
      sleepQuality: input.sleepQuality ?? null,
      energyLevel: input.energyLevel ?? null,
      stressLevel: input.stressLevel ?? null,
      sorenessLevel: input.sorenessLevel ?? null,
      soreAreas: input.soreAreas ?? null,
      restingHeartRate: input.restingHeartRate ?? null,
      hrvScore: input.hrvScore ?? null,
      motivationLevel: input.motivationLevel ?? null,
      mood: (input.mood as MoodType) ?? null,
      nutritionQuality: input.nutritionQuality ?? null,
      hydrationLevel: input.hydrationLevel ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  const created = result[0];
  if (!created) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create check-in" });
  }

  return created;
}

// ============================================================================
// Get Today Check-In Handler
// ============================================================================

export async function getTodayCheckInHandler(context: AuthenticatedContext) {
  const userId = context.session.user.id;
  const today = getTodayDateString();

  const result = await db
    .select()
    .from(dailyCheckIn)
    .where(and(eq(dailyCheckIn.userId, userId), eq(dailyCheckIn.date, today)))
    .limit(1);

  return result[0] ?? null;
}

// ============================================================================
// Get Check-In By Date Handler
// ============================================================================

export async function getCheckInByDateHandler(
  input: GetCheckInByDateInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;

  const result = await db
    .select()
    .from(dailyCheckIn)
    .where(and(eq(dailyCheckIn.userId, userId), eq(dailyCheckIn.date, input.date)))
    .limit(1);

  return result[0] ?? null;
}

// ============================================================================
// Get Check-In History Handler
// ============================================================================

export async function getCheckInHistoryHandler(
  input: CheckInHistoryInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  const conditions: ReturnType<typeof eq>[] = [eq(dailyCheckIn.userId, userId)];

  // Date range filters
  if (input.startDate) {
    conditions.push(gte(dailyCheckIn.date, input.startDate));
  }
  if (input.endDate) {
    conditions.push(lte(dailyCheckIn.date, input.endDate));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(dailyCheckIn)
    .where(and(...conditions));

  const total = countResult[0]?.count ?? 0;

  // Get check-ins
  const checkIns = await db
    .select()
    .from(dailyCheckIn)
    .where(and(...conditions))
    .orderBy(desc(dailyCheckIn.date))
    .limit(input.limit)
    .offset(input.offset);

  return {
    checkIns,
    total,
    limit: input.limit,
    offset: input.offset,
  };
}

// ============================================================================
// Get Trends Handler
// ============================================================================

export async function getTrendsHandler(input: TrendsInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;

  // Calculate date range
  const endDate = input.endDate ?? getTodayDateString();
  const startDate = input.startDate ?? getStartDateFromPeriod(input.period, endDate);

  // Get check-ins in the date range
  const checkIns = await db
    .select()
    .from(dailyCheckIn)
    .where(
      and(
        eq(dailyCheckIn.userId, userId),
        gte(dailyCheckIn.date, startDate),
        lte(dailyCheckIn.date, endDate),
      ),
    )
    .orderBy(dailyCheckIn.date);

  // Calculate averages
  const averages = {
    sleepHours: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.sleepHours))),
    sleepQuality: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.sleepQuality))),
    energyLevel: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.energyLevel))),
    stressLevel: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.stressLevel))),
    sorenessLevel: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.sorenessLevel))),
    motivationLevel: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.motivationLevel))),
    nutritionQuality: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.nutritionQuality))),
    hydrationLevel: roundTo1Decimal(calculateAverage(checkIns.map((c) => c.hydrationLevel))),
  };

  // Calculate mood distribution
  const moodDistribution = {
    great: checkIns.filter((c) => c.mood === "great").length,
    good: checkIns.filter((c) => c.mood === "good").length,
    neutral: checkIns.filter((c) => c.mood === "neutral").length,
    low: checkIns.filter((c) => c.mood === "low").length,
    bad: checkIns.filter((c) => c.mood === "bad").length,
  };

  return {
    period: input.period,
    startDate: checkIns[0]?.date ?? null,
    endDate: checkIns[checkIns.length - 1]?.date ?? null,
    dataPoints: checkIns.length,
    averages,
    moodDistribution,
  };
}

// ============================================================================
// Delete Check-In Handler
// ============================================================================

export async function deleteCheckInHandler(
  input: DeleteCheckInInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;

  // Verify check-in exists
  const existing = await db
    .select()
    .from(dailyCheckIn)
    .where(and(eq(dailyCheckIn.userId, userId), eq(dailyCheckIn.date, input.date)))
    .limit(1);

  if (!existing[0]) {
    notFound("Check-in", input.date);
  }

  await db
    .delete(dailyCheckIn)
    .where(and(eq(dailyCheckIn.userId, userId), eq(dailyCheckIn.date, input.date)));

  return { success: true };
}

// ============================================================================
// Get Recovery Status Handler
// ============================================================================

export async function getRecoveryStatusHandler(context: AuthenticatedContext) {
  const userId = context.session.user.id;

  // Get all muscle recovery records
  const recoveryRecords = await db
    .select()
    .from(muscleRecovery)
    .where(eq(muscleRecovery.userId, userId));

  // Create a map for easy lookup
  const recoveryMap = new Map(recoveryRecords.map((r) => [r.muscleGroup, r]));

  // Build status for all muscle groups
  const muscleGroups = MUSCLE_GROUPS.map((group) => {
    const record = recoveryMap.get(group);
    return {
      muscleGroup: group as MuscleGroupType,
      recoveryScore: record?.recoveryScore ?? 100,
      fatigueLevel: record?.fatigueLevel ?? 0,
      lastWorkedAt: record?.lastWorkedAt ?? null,
      setsLast7Days: record?.setsLast7Days ?? 0,
      volumeLast7Days: record?.volumeLast7Days ?? 0,
      estimatedFullRecovery: record?.estimatedFullRecovery ?? null,
      updatedAt: record?.updatedAt ?? new Date(),
    };
  });

  // Calculate overall recovery
  const recoveryScores = muscleGroups
    .map((m) => m.recoveryScore)
    .filter((s): s is number => s !== null);
  const overallRecovery =
    recoveryScores.length > 0
      ? Math.round(recoveryScores.reduce((sum, s) => sum + s, 0) / recoveryScores.length)
      : 100;

  return {
    muscleGroups,
    overallRecovery,
    updatedAt: new Date(),
  };
}

// ============================================================================
// Get Readiness Handler
// ============================================================================

export async function getReadinessHandler(context: AuthenticatedContext) {
  const userId = context.session.user.id;
  const today = getTodayDateString();

  // Get today's check-in (or most recent)
  const recentCheckIns = await db
    .select()
    .from(dailyCheckIn)
    .where(eq(dailyCheckIn.userId, userId))
    .orderBy(desc(dailyCheckIn.date))
    .limit(1);

  const checkIn = recentCheckIns[0];
  const todayCheckIn = checkIn?.date === today;

  // Get muscle recovery status
  const recoveryRecords = await db
    .select()
    .from(muscleRecovery)
    .where(eq(muscleRecovery.userId, userId));

  // Calculate individual factor scores (normalized to 0-100)
  // Sleep score: based on quality (1-5 -> 0-100)
  const sleepScore = checkIn?.sleepQuality ? ((checkIn.sleepQuality - 1) / 4) * 100 : null;

  // Energy score: (1-10 -> 0-100)
  const energyScore = checkIn?.energyLevel ? ((checkIn.energyLevel - 1) / 9) * 100 : null;

  // Soreness score: inverse (1-10 -> 100-0)
  const sorenessScore = checkIn?.sorenessLevel ? ((10 - checkIn.sorenessLevel) / 9) * 100 : null;

  // Stress score: inverse (1-10 -> 100-0)
  const stressScore = checkIn?.stressLevel ? ((10 - checkIn.stressLevel) / 9) * 100 : null;

  // Muscle recovery score: average of all muscle groups
  const muscleScores = recoveryRecords
    .map((r) => r.recoveryScore)
    .filter((s): s is number => s !== null);
  const muscleRecoveryScore =
    muscleScores.length > 0
      ? muscleScores.reduce((sum, s) => sum + s, 0) / muscleScores.length
      : null;

  // Calculate weighted readiness score
  // Weights: sleep (25%), energy (20%), soreness (20%), stress (15%), muscle recovery (20%)
  const weights = {
    sleep: 0.25,
    energy: 0.2,
    soreness: 0.2,
    stress: 0.15,
    muscle: 0.2,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  if (sleepScore !== null) {
    weightedSum += sleepScore * weights.sleep;
    totalWeight += weights.sleep;
  }
  if (energyScore !== null) {
    weightedSum += energyScore * weights.energy;
    totalWeight += weights.energy;
  }
  if (sorenessScore !== null) {
    weightedSum += sorenessScore * weights.soreness;
    totalWeight += weights.soreness;
  }
  if (stressScore !== null) {
    weightedSum += stressScore * weights.stress;
    totalWeight += weights.stress;
  }
  if (muscleRecoveryScore !== null) {
    weightedSum += muscleRecoveryScore * weights.muscle;
    totalWeight += weights.muscle;
  }

  // Calculate final score (default to 50 if no data)
  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;

  return {
    score,
    recommendation: getReadinessRecommendation(score),
    factors: {
      sleepScore: sleepScore !== null ? Math.round(sleepScore) : null,
      energyScore: energyScore !== null ? Math.round(energyScore) : null,
      sorenessScore: sorenessScore !== null ? Math.round(sorenessScore) : null,
      stressScore: stressScore !== null ? Math.round(stressScore) : null,
      muscleRecoveryScore: muscleRecoveryScore !== null ? Math.round(muscleRecoveryScore) : null,
    },
    todayCheckIn,
    lastCheckInDate: checkIn?.date ?? null,
  };
}

// ============================================================================
// Refresh Recovery Handler
// ============================================================================

export async function refreshRecoveryHandler(context: AuthenticatedContext) {
  const userId = context.session.user.id;

  // For now, we'll create/update baseline recovery records for all muscle groups
  // In a real implementation, this would analyze workout data
  let updatedCount = 0;

  for (const muscleGroup of MUSCLE_GROUPS) {
    // Check if record exists
    const existing = await db
      .select()
      .from(muscleRecovery)
      .where(and(eq(muscleRecovery.userId, userId), eq(muscleRecovery.muscleGroup, muscleGroup)))
      .limit(1);

    if (existing[0]) {
      // Update existing record
      await db
        .update(muscleRecovery)
        .set({
          recoveryScore: existing[0].recoveryScore ?? 100,
          fatigueLevel: existing[0].fatigueLevel ?? 0,
        })
        .where(eq(muscleRecovery.id, existing[0].id));
    } else {
      // Create new record with defaults
      await db.insert(muscleRecovery).values({
        userId,
        muscleGroup: muscleGroup as MuscleGroupType,
        recoveryScore: 100,
        fatigueLevel: 0,
        setsLast7Days: 0,
        volumeLast7Days: 0,
      });
    }

    updatedCount++;
  }

  return {
    success: true,
    updatedMuscleGroups: updatedCount,
    message: `Successfully refreshed recovery data for ${updatedCount} muscle groups`,
  };
}
