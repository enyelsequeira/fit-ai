import type { PeriodType } from "@fit-ai/db/schema/analytics";

import { db } from "@fit-ai/db";
import { trainingSummary } from "@fit-ai/db/schema/analytics";
import { exercise } from "@fit-ai/db/schema/exercise";
import { personalRecord } from "@fit-ai/db/schema/personal-record";
import { exerciseSet, workout, workoutExercise } from "@fit-ai/db/schema/workout";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";

import { notFound } from "../../errors";

import type {
  GenerateSummaryRouteHandler,
  GetComparisonRouteHandler,
  GetConsistencyRouteHandler,
  GetExerciseStatsRouteHandler,
  GetFrequencyRouteHandler,
  GetMonthlySummaryRouteHandler,
  GetStrengthTrendsRouteHandler,
  GetSummaryHistoryRouteHandler,
  GetVolumeByMuscleRouteHandler,
  GetVolumeTrendsRouteHandler,
  GetWeeklySummaryRouteHandler,
} from "./contracts";

// ============================================================================
// Constants
// ============================================================================

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0] ?? "";
}

/**
 * Get the end of the week (Sunday)
 */
function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0] ?? "";
}

/**
 * Get the start of the current month
 */
function getMonthStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split("T")[0] ?? "";
}

/**
 * Get the end of the month
 */
function getMonthEnd(monthStart: string): string {
  const d = new Date(monthStart);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().split("T")[0] ?? "";
}

/**
 * Calculate estimated 1RM using Brzycki formula
 */
function calculateBrzycki1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight * 2;
  return weight * (36 / (37 - reps));
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00Z");
}

/**
 * Format Date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Get days between two dates
 */
function getDaysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Handlers
// ============================================================================

export const getWeeklySummaryHandler: GetWeeklySummaryRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;
  const weekStart = getWeekStart();

  const result = await db
    .select()
    .from(trainingSummary)
    .where(
      and(
        eq(trainingSummary.userId, userId),
        eq(trainingSummary.periodType, "week"),
        eq(trainingSummary.periodStart, weekStart),
      ),
    )
    .limit(1);

  return result[0] ?? null;
};

export const getMonthlySummaryHandler: GetMonthlySummaryRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;
  const monthStart = getMonthStart();

  const result = await db
    .select()
    .from(trainingSummary)
    .where(
      and(
        eq(trainingSummary.userId, userId),
        eq(trainingSummary.periodType, "month"),
        eq(trainingSummary.periodStart, monthStart),
      ),
    )
    .limit(1);

  return result[0] ?? null;
};

export const getSummaryHistoryHandler: GetSummaryHistoryRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;
  const conditions: ReturnType<typeof eq>[] = [eq(trainingSummary.userId, userId)];

  if (input.periodType) {
    conditions.push(eq(trainingSummary.periodType, input.periodType));
  }

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(trainingSummary)
    .where(and(...conditions));

  const total = countResult[0]?.count ?? 0;

  const summaries = await db
    .select()
    .from(trainingSummary)
    .where(and(...conditions))
    .orderBy(desc(trainingSummary.periodStart))
    .limit(input.limit)
    .offset(input.offset);

  return {
    summaries,
    total,
    limit: input.limit,
    offset: input.offset,
  };
};

export const getVolumeTrendsHandler: GetVolumeTrendsRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - input.weeks * 7);

  const summaries = await db
    .select()
    .from(trainingSummary)
    .where(
      and(
        eq(trainingSummary.userId, userId),
        eq(trainingSummary.periodType, input.period),
        gte(trainingSummary.periodStart, formatDate(startDate)),
        lte(trainingSummary.periodStart, formatDate(endDate)),
      ),
    )
    .orderBy(trainingSummary.periodStart);

  const dataPoints = summaries.map((s) => ({
    periodStart: s.periodStart,
    totalVolume: s.totalVolumeKg,
    volumeByMuscle: s.volumeByMuscle ?? {},
  }));

  return {
    period: input.period,
    dataPoints,
  };
};

export const getVolumeByMuscleHandler: GetVolumeByMuscleRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  let startDate: Date;
  let endDate: Date;

  if (input.startDate && input.endDate) {
    startDate = parseDate(input.startDate);
    endDate = parseDate(input.endDate);
  } else {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - input.days);
  }

  const workoutsData = await db
    .select({
      workoutId: workout.id,
      exerciseId: exercise.id,
      muscleGroups: exercise.muscleGroups,
      weight: exerciseSet.weight,
      reps: exerciseSet.reps,
      setType: exerciseSet.setType,
      isCompleted: exerciseSet.isCompleted,
    })
    .from(workout)
    .innerJoin(workoutExercise, eq(workout.id, workoutExercise.workoutId))
    .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .innerJoin(exerciseSet, eq(workoutExercise.id, exerciseSet.workoutExerciseId))
    .where(
      and(
        eq(workout.userId, userId),
        isNotNull(workout.completedAt),
        gte(workout.startedAt, startDate),
        lte(workout.startedAt, endDate),
      ),
    );

  const muscleVolume: Record<string, { volume: number; sets: number }> = {};
  let totalVolume = 0;

  for (const row of workoutsData) {
    if (row.setType === "warmup" || !row.isCompleted) continue;
    if (!row.weight || !row.reps) continue;

    const volume = row.weight * row.reps;
    totalVolume += volume;

    const muscles = row.muscleGroups ?? [];
    const volumePerMuscle = volume / (muscles.length || 1);
    const setsPerMuscle = 1 / (muscles.length || 1);

    for (const muscle of muscles) {
      if (!muscleVolume[muscle]) {
        muscleVolume[muscle] = { volume: 0, sets: 0 };
      }
      muscleVolume[muscle].volume += volumePerMuscle;
      muscleVolume[muscle].sets += setsPerMuscle;
    }
  }

  const muscleGroups = Object.entries(muscleVolume)
    .map(([muscle, data]) => ({
      muscle,
      volume: Math.round(data.volume),
      sets: Math.round(data.sets),
      percentage: totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0,
    }))
    .sort((a, b) => b.volume - a.volume);

  return {
    period: {
      start: formatDate(startDate),
      end: formatDate(endDate),
    },
    totalVolume: Math.round(totalVolume),
    muscleGroups,
  };
};

export const getStrengthTrendsHandler: GetStrengthTrendsRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const exerciseResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  const ex = exerciseResult[0];
  if (!ex) {
    notFound("Exercise", input.exerciseId);
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - input.weeks * 7);

  const setsData = await db
    .select({
      workoutDate: workout.completedAt,
      weight: exerciseSet.weight,
      reps: exerciseSet.reps,
      setType: exerciseSet.setType,
      isCompleted: exerciseSet.isCompleted,
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
    .where(
      and(
        eq(workout.userId, userId),
        eq(workoutExercise.exerciseId, input.exerciseId),
        isNotNull(workout.completedAt),
        gte(workout.startedAt, startDate),
        lte(workout.startedAt, endDate),
      ),
    )
    .orderBy(workout.completedAt);

  const dataByDate = new Map<
    string,
    { estimated1RM: number; maxWeight: number; maxReps: number }
  >();

  for (const row of setsData) {
    if (row.setType === "warmup" || !row.isCompleted) continue;
    if (!row.weight || !row.reps || !row.workoutDate) continue;

    const dateStr = formatDate(row.workoutDate);
    const estimated1RM = calculateBrzycki1RM(row.weight, row.reps);

    const existing = dataByDate.get(dateStr);
    if (!existing || estimated1RM > existing.estimated1RM) {
      dataByDate.set(dateStr, {
        estimated1RM: Math.round(estimated1RM * 10) / 10,
        maxWeight: row.weight,
        maxReps: row.reps,
      });
    }
  }

  const dataPoints = Array.from(dataByDate.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  let percentageChange = 0;
  if (dataPoints.length >= 2) {
    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];
    if (first && last && first.estimated1RM > 0) {
      percentageChange = ((last.estimated1RM - first.estimated1RM) / first.estimated1RM) * 100;
    }
  }

  return {
    exerciseId: input.exerciseId,
    exerciseName: ex.name,
    dataPoints,
    percentageChange: Math.round(percentageChange * 10) / 10,
  };
};

export const getFrequencyHandler: GetFrequencyRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - input.days);

  const workouts = await db
    .select({
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
    })
    .from(workout)
    .where(
      and(
        eq(workout.userId, userId),
        isNotNull(workout.completedAt),
        gte(workout.startedAt, startDate),
        lte(workout.startedAt, endDate),
      ),
    );

  const byDayOfWeek: Record<string, number> = {};
  const byTimeOfDay: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (const day of DAYS_OF_WEEK) {
    byDayOfWeek[day] = 0;
  }

  for (const w of workouts) {
    const date = w.startedAt;
    const dayName = DAYS_OF_WEEK[date.getDay()];
    if (dayName) {
      byDayOfWeek[dayName] = (byDayOfWeek[dayName] ?? 0) + 1;
    }

    const hour = date.getHours();
    if (hour >= 5 && hour < 12) {
      byTimeOfDay.morning = (byTimeOfDay.morning ?? 0) + 1;
    } else if (hour >= 12 && hour < 17) {
      byTimeOfDay.afternoon = (byTimeOfDay.afternoon ?? 0) + 1;
    } else if (hour >= 17 && hour < 21) {
      byTimeOfDay.evening = (byTimeOfDay.evening ?? 0) + 1;
    } else {
      byTimeOfDay.night = (byTimeOfDay.night ?? 0) + 1;
    }
  }

  let mostActiveDay = "Monday";
  let leastActiveDay = "Monday";
  let maxCount = 0;
  let minCount = Number.MAX_VALUE;

  for (const [day, count] of Object.entries(byDayOfWeek)) {
    if (count > maxCount) {
      maxCount = count;
      mostActiveDay = day;
    }
    if (count < minCount) {
      minCount = count;
      leastActiveDay = day;
    }
  }

  const weeks = getDaysBetween(startDate, endDate) / 7;
  const avgPerWeek = weeks > 0 ? workouts.length / weeks : 0;

  return {
    totalWorkouts: workouts.length,
    avgPerWeek: Math.round(avgPerWeek * 10) / 10,
    byDayOfWeek,
    byTimeOfDay,
    mostActiveDay,
    leastActiveDay,
  };
};

export const getConsistencyHandler: GetConsistencyRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  const workouts = await db
    .select({
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
      templateId: workout.templateId,
    })
    .from(workout)
    .where(and(eq(workout.userId, userId), isNotNull(workout.completedAt)))
    .orderBy(desc(workout.startedAt));

  const now = new Date();
  const weekStart = getWeekStart(now);
  const monthStart = getMonthStart(now);

  let workoutsThisWeek = 0;
  let workoutsThisMonth = 0;

  for (const w of workouts) {
    const dateStr = formatDate(w.startedAt);
    if (dateStr >= weekStart) workoutsThisWeek++;
    if (dateStr >= monthStart) workoutsThisMonth++;
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const weeksWithWorkouts = new Set<string>();
  for (const w of workouts) {
    weeksWithWorkouts.add(getWeekStart(w.startedAt));
  }

  let checkWeek = new Date(weekStart);
  while (weeksWithWorkouts.has(formatDate(checkWeek))) {
    currentStreak++;
    checkWeek.setDate(checkWeek.getDate() - 7);
  }

  const sortedWeeks = Array.from(weeksWithWorkouts).sort();
  for (let i = 0; i < sortedWeeks.length; i++) {
    const currentWeekDate = sortedWeeks[i];
    const prevWeekDate = sortedWeeks[i - 1];

    if (i === 0 || !currentWeekDate || !prevWeekDate) {
      tempStreak = 1;
    } else {
      const diff = getDaysBetween(parseDate(prevWeekDate), parseDate(currentWeekDate));
      if (diff === 7) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
  const recentWorkouts = workouts.filter((w) => w.startedAt >= twelveWeeksAgo);
  const avgWorkoutsPerWeek = recentWorkouts.length / 12;

  const dayCount: Record<string, number> = {};
  for (const w of workouts) {
    const day = DAYS_OF_WEEK[w.startedAt.getDay()] ?? "Monday";
    dayCount[day] = (dayCount[day] ?? 0) + 1;
  }

  let mostActiveDay = "Monday";
  let maxCount = 0;
  for (const [day, c] of Object.entries(dayCount)) {
    if (c > maxCount) {
      maxCount = c;
      mostActiveDay = day;
    }
  }

  const templateWorkouts = workouts.filter((w) => w.templateId != null);
  const completionRate =
    templateWorkouts.length > 0 ? templateWorkouts.length / workouts.length : null;

  return {
    currentStreak,
    longestStreak,
    workoutsThisWeek,
    workoutsThisMonth,
    avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
    mostActiveDay,
    completionRate: completionRate !== null ? Math.round(completionRate * 100) / 100 : null,
  };
};

export const getExerciseStatsHandler: GetExerciseStatsRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const exerciseResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  const ex = exerciseResult[0];
  if (!ex) {
    notFound("Exercise", input.exerciseId);
  }

  const setsData = await db
    .select({
      workoutId: workout.id,
      workoutDate: workout.completedAt,
      weight: exerciseSet.weight,
      reps: exerciseSet.reps,
      setType: exerciseSet.setType,
      isCompleted: exerciseSet.isCompleted,
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
    .where(
      and(
        eq(workout.userId, userId),
        eq(workoutExercise.exerciseId, input.exerciseId),
        isNotNull(workout.completedAt),
      ),
    )
    .orderBy(desc(workout.completedAt));

  const workoutIds = new Set<number>();
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let maxWeight: number | null = null;
  let maxReps: number | null = null;
  let currentEstimated1RM: number | null = null;
  let lastPerformed: string | null = null;

  const recentProgressMap = new Map<
    string,
    { estimated1RM: number; maxWeight: number; maxReps: number }
  >();

  for (const row of setsData) {
    if (row.setType === "warmup" || !row.isCompleted) continue;

    workoutIds.add(row.workoutId);
    totalSets++;

    if (row.reps) {
      totalReps += row.reps;
      maxReps = Math.max(maxReps ?? 0, row.reps);
    }

    if (row.weight && row.reps) {
      totalVolume += row.weight * row.reps;
      maxWeight = Math.max(maxWeight ?? 0, row.weight);

      const estimated1RM = calculateBrzycki1RM(row.weight, row.reps);
      if (currentEstimated1RM === null) {
        currentEstimated1RM = estimated1RM;
      }

      if (row.workoutDate) {
        const weekStart = getWeekStart(row.workoutDate);
        const existing = recentProgressMap.get(weekStart);
        if (!existing || estimated1RM > existing.estimated1RM) {
          recentProgressMap.set(weekStart, {
            estimated1RM: Math.round(estimated1RM * 10) / 10,
            maxWeight: row.weight,
            maxReps: row.reps,
          });
        }
      }
    }

    if (row.workoutDate && !lastPerformed) {
      lastPerformed = formatDate(row.workoutDate);
    }
  }

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const eightWeeksAgoStr = formatDate(eightWeeksAgo);

  const recentProgress = Array.from(recentProgressMap.entries())
    .filter(([date]) => date >= eightWeeksAgoStr)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8);

  return {
    exerciseId: input.exerciseId,
    exerciseName: ex.name,
    category: ex.category,
    totalSessions: workoutIds.size,
    totalSets,
    totalReps,
    totalVolume: Math.round(totalVolume),
    maxWeight,
    maxReps,
    estimated1RM: currentEstimated1RM ? Math.round(currentEstimated1RM * 10) / 10 : null,
    recentProgress,
    lastPerformed,
  };
};

export const getComparisonHandler: GetComparisonRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  async function calculatePeriodSummary(
    start: string,
    end: string,
  ): Promise<typeof trainingSummary.$inferSelect | null> {
    const workoutsData = await db
      .select({
        id: workout.id,
        startedAt: workout.startedAt,
        completedAt: workout.completedAt,
      })
      .from(workout)
      .where(
        and(
          eq(workout.userId, userId),
          isNotNull(workout.completedAt),
          gte(workout.startedAt, parseDate(start)),
          lte(workout.startedAt, parseDate(end)),
        ),
      );

    if (workoutsData.length === 0) return null;

    const workoutIds = workoutsData.map((w) => w.id);

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    let totalDuration = 0;

    for (const w of workoutsData) {
      if (w.completedAt && w.startedAt) {
        totalDuration += Math.floor((w.completedAt.getTime() - w.startedAt.getTime()) / 60000);
      }
    }

    for (const wId of workoutIds) {
      const sets = await db
        .select({
          weight: exerciseSet.weight,
          reps: exerciseSet.reps,
          setType: exerciseSet.setType,
          isCompleted: exerciseSet.isCompleted,
        })
        .from(exerciseSet)
        .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
        .where(eq(workoutExercise.workoutId, wId));

      for (const s of sets) {
        if (s.setType === "warmup" || !s.isCompleted) continue;
        totalSets++;
        if (s.reps) totalReps += s.reps;
        if (s.weight && s.reps) totalVolume += s.weight * s.reps;
      }
    }

    const avgDuration = workoutsData.length > 0 ? totalDuration / workoutsData.length : null;

    return {
      id: 0,
      userId,
      periodType: "week" as PeriodType,
      periodStart: start,
      periodEnd: end,
      totalWorkouts: workoutsData.length,
      completedWorkouts: workoutsData.length,
      totalDurationMinutes: totalDuration,
      totalSets,
      totalReps,
      totalVolumeKg: Math.round(totalVolume),
      volumeByMuscle: null,
      setsByMuscle: null,
      uniqueExercises: 0,
      favoriteExerciseId: null,
      prsAchieved: 0,
      avgWorkoutDuration: avgDuration,
      avgRpe: null,
      avgSetsPerWorkout: workoutsData.length > 0 ? totalSets / workoutsData.length : null,
      plannedWorkouts: null,
      completionRate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const summary1 = await calculatePeriodSummary(input.period1Start, input.period1End);
  const summary2 = await calculatePeriodSummary(input.period2Start, input.period2End);

  let volumeChange = 0;
  let workoutsChange = 0;
  let avgDurationChange = 0;

  if (summary1 && summary2) {
    if (summary1.totalVolumeKg > 0) {
      volumeChange =
        ((summary2.totalVolumeKg - summary1.totalVolumeKg) / summary1.totalVolumeKg) * 100;
    }
    workoutsChange = summary2.totalWorkouts - summary1.totalWorkouts;
    if (summary1.avgWorkoutDuration && summary2.avgWorkoutDuration) {
      avgDurationChange =
        ((summary2.avgWorkoutDuration - summary1.avgWorkoutDuration) /
          summary1.avgWorkoutDuration) *
        100;
    }
  }

  return {
    period1: {
      start: input.period1Start,
      end: input.period1End,
      summary: summary1,
    },
    period2: {
      start: input.period2Start,
      end: input.period2End,
      summary: summary2,
    },
    changes: {
      volumeChange: Math.round(volumeChange * 10) / 10,
      workoutsChange,
      avgDurationChange: Math.round(avgDurationChange * 10) / 10,
    },
  };
};

export const generateSummaryHandler: GenerateSummaryRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const periodEnd =
    input.periodType === "week" ? getWeekEnd(input.periodStart) : getMonthEnd(input.periodStart);

  const workouts = await db
    .select({
      id: workout.id,
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
      templateId: workout.templateId,
    })
    .from(workout)
    .where(
      and(
        eq(workout.userId, userId),
        gte(workout.startedAt, parseDate(input.periodStart)),
        lte(workout.startedAt, parseDate(periodEnd)),
      ),
    );

  const completedWorkouts = workouts.filter((w) => w.completedAt != null);

  let totalDuration = 0;
  for (const w of completedWorkouts) {
    if (w.completedAt && w.startedAt) {
      totalDuration += Math.floor((w.completedAt.getTime() - w.startedAt.getTime()) / 60000);
    }
  }

  const workoutIds = workouts.map((w) => w.id);
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let rpeSum = 0;
  let rpeCount = 0;
  const uniqueExerciseIds = new Set<number>();
  const exerciseCount: Record<number, number> = {};
  const muscleVolume: Record<string, number> = {};
  const muscleSets: Record<string, number> = {};

  for (const wId of workoutIds) {
    const sets = await db
      .select({
        exerciseId: workoutExercise.exerciseId,
        muscleGroups: exercise.muscleGroups,
        weight: exerciseSet.weight,
        reps: exerciseSet.reps,
        rpe: exerciseSet.rpe,
        setType: exerciseSet.setType,
        isCompleted: exerciseSet.isCompleted,
      })
      .from(exerciseSet)
      .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
      .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
      .where(eq(workoutExercise.workoutId, wId));

    for (const s of sets) {
      if (s.setType === "warmup" || !s.isCompleted) continue;

      totalSets++;
      uniqueExerciseIds.add(s.exerciseId);
      exerciseCount[s.exerciseId] = (exerciseCount[s.exerciseId] ?? 0) + 1;

      if (s.reps) totalReps += s.reps;
      if (s.rpe) {
        rpeSum += s.rpe;
        rpeCount++;
      }

      if (s.weight && s.reps) {
        const volume = s.weight * s.reps;
        totalVolume += volume;

        const muscles = s.muscleGroups ?? [];
        const volumePerMuscle = volume / (muscles.length || 1);

        for (const muscle of muscles) {
          muscleVolume[muscle] = (muscleVolume[muscle] ?? 0) + volumePerMuscle;
          muscleSets[muscle] = (muscleSets[muscle] ?? 0) + 1 / (muscles.length || 1);
        }
      }
    }
  }

  let favoriteExerciseId: number | null = null;
  let maxExerciseCount = 0;
  for (const [exId, count] of Object.entries(exerciseCount)) {
    if (count > maxExerciseCount) {
      maxExerciseCount = count;
      favoriteExerciseId = Number(exId);
    }
  }

  const prsAchieved = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(personalRecord)
    .where(
      and(
        eq(personalRecord.userId, userId),
        gte(personalRecord.achievedAt, parseDate(input.periodStart)),
        lte(personalRecord.achievedAt, parseDate(periodEnd)),
      ),
    );

  const summaryData = {
    userId,
    periodType: input.periodType as PeriodType,
    periodStart: input.periodStart,
    periodEnd,
    totalWorkouts: workouts.length,
    completedWorkouts: completedWorkouts.length,
    totalDurationMinutes: totalDuration,
    totalSets,
    totalReps,
    totalVolumeKg: Math.round(totalVolume),
    volumeByMuscle: Object.keys(muscleVolume).length > 0 ? muscleVolume : null,
    setsByMuscle: Object.keys(muscleSets).length > 0 ? muscleSets : null,
    uniqueExercises: uniqueExerciseIds.size,
    favoriteExerciseId,
    prsAchieved: prsAchieved[0]?.count ?? 0,
    avgWorkoutDuration:
      completedWorkouts.length > 0 ? totalDuration / completedWorkouts.length : null,
    avgRpe: rpeCount > 0 ? rpeSum / rpeCount : null,
    avgSetsPerWorkout: completedWorkouts.length > 0 ? totalSets / completedWorkouts.length : null,
    plannedWorkouts: workouts.filter((w) => w.templateId != null).length,
    completionRate: workouts.length > 0 ? completedWorkouts.length / workouts.length : null,
  };

  const existing = await db
    .select()
    .from(trainingSummary)
    .where(
      and(
        eq(trainingSummary.userId, userId),
        eq(trainingSummary.periodType, input.periodType),
        eq(trainingSummary.periodStart, input.periodStart),
      ),
    )
    .limit(1);

  if (existing[0]) {
    const result = await db
      .update(trainingSummary)
      .set(summaryData)
      .where(eq(trainingSummary.id, existing[0].id))
      .returning();

    const updated = result[0];
    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update summary" });
    }
    return updated;
  }

  const result = await db.insert(trainingSummary).values(summaryData).returning();

  const created = result[0];
  if (!created) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create summary" });
  }
  return created;
};
