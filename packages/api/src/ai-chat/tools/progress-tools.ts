import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { goal } from "@fit-ai/db/schema/goals";
import { personalRecord } from "@fit-ai/db/schema/personal-record";
import { workout } from "@fit-ai/db/schema/workout";
import { and, desc, eq, gte, sql } from "drizzle-orm";

import { getProgressSummaryDef } from "../tool-definitions";

export function createProgressTools(userId: string) {
  const getProgressSummary = getProgressSummaryDef.server(async () => {
    try {
      // 1. Active goals (limit 5)
      const activeGoals = await db
        .select({
          title: goal.title,
          progressPercentage: goal.progressPercentage,
          goalType: goal.goalType,
        })
        .from(goal)
        .where(and(eq(goal.userId, userId), eq(goal.status, "active")))
        .limit(5);

      // 2. Recent PRs (last 30 days, limit 5)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPRs = await db
        .select({
          exerciseName: exercise.name,
          value: personalRecord.value,
          recordType: personalRecord.recordType,
          achievedAt: personalRecord.achievedAt,
        })
        .from(personalRecord)
        .leftJoin(exercise, eq(exercise.id, personalRecord.exerciseId))
        .where(
          and(eq(personalRecord.userId, userId), gte(personalRecord.achievedAt, thirtyDaysAgo)),
        )
        .orderBy(desc(personalRecord.achievedAt))
        .limit(5);

      // 3. Workout frequency: this week vs last week
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - mondayOffset);
      thisWeekStart.setHours(0, 0, 0, 0);

      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const thisWeekResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(workout)
        .where(and(eq(workout.userId, userId), gte(workout.startedAt, thisWeekStart)));

      const lastWeekResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(workout)
        .where(
          and(
            eq(workout.userId, userId),
            gte(workout.startedAt, lastWeekStart),
            sql`${workout.startedAt} < ${thisWeekStart.getTime()}`,
          ),
        );

      // 4. Calculate streak (consecutive days with workouts going backwards)
      const streak = await calculateStreak(userId);

      return {
        activeGoals: activeGoals.map((g) => ({
          title: g.title,
          progressPercentage: g.progressPercentage,
          goalType: g.goalType,
        })),
        recentPRs: recentPRs.map((pr) => ({
          exerciseName: pr.exerciseName ?? "Unknown",
          value: pr.value,
          recordType: pr.recordType,
          achievedAt: pr.achievedAt.toISOString(),
        })),
        thisWeekWorkouts: thisWeekResult[0]?.count ?? 0,
        lastWeekWorkouts: lastWeekResult[0]?.count ?? 0,
        currentStreak: streak,
      };
    } catch (error) {
      console.error("[ai-tool] getProgressSummary failed:", error);
      return {
        activeGoals: [],
        recentPRs: [],
        thisWeekWorkouts: 0,
        lastWeekWorkouts: 0,
        currentStreak: 0,
        error: "Failed to load progress summary.",
      };
    }
  });

  return [getProgressSummary];
}

async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get distinct workout dates for the last 60 days, ordered descending
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const workoutDates = await db
      .select({
        dateStr: sql<string>`DATE(${workout.startedAt} / 1000, 'unixepoch')`,
      })
      .from(workout)
      .where(and(eq(workout.userId, userId), gte(workout.startedAt, sixtyDaysAgo)))
      .groupBy(sql`DATE(${workout.startedAt} / 1000, 'unixepoch')`)
      .orderBy(desc(sql`DATE(${workout.startedAt} / 1000, 'unixepoch')`));

    if (workoutDates.length === 0) return 0;

    // Check consecutive days starting from today going backwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateSet = new Set(workoutDates.map((d) => d.dateStr));
    const todayStr = formatDateStr(today);

    // If no workout today, check if there was one yesterday (streak might still be active)
    let checkDate = new Date(today);
    if (!dateSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (!dateSet.has(formatDateStr(checkDate))) {
        return 0;
      }
    }

    let streak = 0;
    while (dateSet.has(formatDateStr(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  } catch (error) {
    console.error("[ai-tool] calculateStreak failed:", error);
    return 0;
  }
}

function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
