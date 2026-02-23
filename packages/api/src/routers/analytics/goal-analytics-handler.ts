import { db } from "@fit-ai/db";
import { goal } from "@fit-ai/db/schema/goals";
import { desc, eq } from "drizzle-orm";

import type { GetGoalAnalyticsRouteHandler } from "./contracts";

/**
 * Format Date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Get goal analytics handler
 * Calculates goal completion rates, progress stats, and breakdowns
 */
export const getGoalAnalyticsHandler: GetGoalAnalyticsRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  const allGoals = await db
    .select()
    .from(goal)
    .where(eq(goal.userId, userId))
    .orderBy(desc(goal.createdAt));

  const totalGoals = allGoals.length;
  const activeGoals = allGoals.filter((g) => g.status === "active").length;
  const completedGoals = allGoals.filter((g) => g.status === "completed").length;
  const abandonedGoals = allGoals.filter((g) => g.status === "abandoned").length;
  const pausedGoals = allGoals.filter((g) => g.status === "paused").length;

  const overallCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Calculate average completion days
  let avgCompletionDays: number | null = null;
  const completed = allGoals.filter((g) => g.status === "completed" && g.completedAt);
  if (completed.length > 0) {
    let totalDays = 0;
    for (const g of completed) {
      if (g.startDate && g.completedAt) {
        const start = new Date(g.startDate);
        const end = new Date(g.completedAt);
        totalDays += Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    avgCompletionDays = Math.round(totalDays / completed.length);
  }

  // Goals by type
  const typeMap = new Map<string, { count: number; completedCount: number }>();
  for (const g of allGoals) {
    const existing = typeMap.get(g.goalType) ?? { count: 0, completedCount: 0 };
    existing.count++;
    if (g.status === "completed") existing.completedCount++;
    typeMap.set(g.goalType, existing);
  }
  const goalsByType = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    completedCount: data.completedCount,
  }));

  // Recently completed (last 5)
  const recentlyCompleted = allGoals
    .filter((g) => g.status === "completed")
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5)
    .map((g) => ({
      id: g.id,
      title: g.title,
      goalType: g.goalType,
      completedAt: g.completedAt ? formatDate(new Date(g.completedAt)) : null,
      progressPercentage: g.progressPercentage ?? 100,
    }));

  // Active progress
  const now = new Date();
  const activeProgress = allGoals
    .filter((g) => g.status === "active")
    .sort((a, b) => (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0))
    .map((g) => {
      let daysRemaining: number | null = null;
      if (g.targetDate) {
        const target = new Date(g.targetDate);
        daysRemaining = Math.max(
          0,
          Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        );
      }
      return {
        id: g.id,
        title: g.title,
        goalType: g.goalType,
        progressPercentage: g.progressPercentage ?? 0,
        targetDate: g.targetDate,
        daysRemaining,
      };
    });

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    abandonedGoals,
    pausedGoals,
    overallCompletionRate: Math.round(overallCompletionRate * 10) / 10,
    avgCompletionDays,
    goalsByType,
    recentlyCompleted,
    activeProgress,
  };
};
