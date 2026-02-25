import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";

import { auth } from "@fit-ai/auth";
import { db } from "@fit-ai/db";
import { userTrainingPreferences } from "@fit-ai/db/schema/ai";
import { goal } from "@fit-ai/db/schema/goals";
import { workout } from "@fit-ai/db/schema/workout";
import { workoutTemplate } from "@fit-ai/db/schema/workout-template";

const GENERIC_PROMPTS = [
  "Create a 4-day push/pull/legs workout plan for me",
  "What exercises target my chest without equipment?",
  "Suggest a beginner-friendly full body routine",
  "Help me build a workout plan for weight loss",
  "Show me my current workout templates",
];

const MAX_PROMPTS = 5;

export const aiSuggestedPromptsApp = new Hono();

aiSuggestedPromptsApp.get("/api/ai/suggested-prompts", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userId = session.user.id;
  const prompts: string[] = [];

  try {
    // 1. Check last workout date
    const lastWorkout = await db
      .select({ startedAt: workout.startedAt })
      .from(workout)
      .where(eq(workout.userId, userId))
      .orderBy(desc(workout.startedAt))
      .limit(1);

    const lastDate = lastWorkout[0]?.startedAt;
    if (lastDate) {
      const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 3) {
        prompts.push(`I haven't worked out in ${daysSince} days — suggest a comeback session`);
      } else if (daysSince === 0) {
        prompts.push("I just finished a workout — what should I focus on next?");
      }
    } else {
      prompts.push("I'm new here — help me create my first workout plan");
    }

    // 2. Check active goals with lowest progress
    const activeGoals = await db
      .select({
        title: goal.title,
        progressPercentage: goal.progressPercentage,
      })
      .from(goal)
      .where(and(eq(goal.userId, userId), eq(goal.status, "active")))
      .orderBy(goal.progressPercentage)
      .limit(1);

    const lowestGoal = activeGoals[0];
    if (lowestGoal) {
      prompts.push(
        `Help me make progress on my goal: "${lowestGoal.title}" (${Math.round(lowestGoal.progressPercentage)}% done)`,
      );
    }

    // 3. Check most-used template
    const topTemplate = await db
      .select({
        name: workoutTemplate.name,
        timesUsed: workoutTemplate.timesUsed,
      })
      .from(workoutTemplate)
      .where(eq(workoutTemplate.userId, userId))
      .orderBy(desc(workoutTemplate.timesUsed))
      .limit(1);

    const tmpl = topTemplate[0];
    if (tmpl && tmpl.timesUsed > 0) {
      prompts.push(`Review my "${tmpl.name}" template and suggest improvements`);
    }

    // 4. Check if training preferences exist
    const prefs = await db
      .select({ id: userTrainingPreferences.id })
      .from(userTrainingPreferences)
      .where(eq(userTrainingPreferences.userId, userId))
      .limit(1);

    if (!prefs[0]) {
      prompts.push("Set up my training preferences so you can personalize my workouts");
    }

    // 5. Count total workouts this week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekWorkouts = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(workout)
      .where(
        and(eq(workout.userId, userId), sql`${workout.startedAt} >= ${startOfWeek.getTime()}`),
      );

    const wCount = weekWorkouts[0]?.count ?? 0;
    if (wCount > 0) {
      prompts.push(
        `I've done ${wCount} workout${wCount > 1 ? "s" : ""} this week — what should I train today?`,
      );
    }
  } catch {
    // On any error, return empty prompts (frontend will use static fallback)
  }

  // Fill up to MAX_PROMPTS with generic ones if we don't have enough
  let genericIdx = 0;
  while (prompts.length < MAX_PROMPTS && genericIdx < GENERIC_PROMPTS.length) {
    const generic = GENERIC_PROMPTS[genericIdx];
    if (generic && !prompts.includes(generic)) {
      prompts.push(generic);
    }
    genericIdx++;
  }

  return c.json({ prompts: prompts.slice(0, MAX_PROMPTS) });
});
