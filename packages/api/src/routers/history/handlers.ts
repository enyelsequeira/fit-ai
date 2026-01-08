import type { SetType, WeightUnit } from "@fit-ai/db/schema/workout";

import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { exerciseSet, workout, workoutExercise } from "@fit-ai/db/schema/workout";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";

import { notFound, notOwner } from "../../errors";

import type {
  GetBestPerformanceRouteHandler,
  GetLastPerformanceRouteHandler,
  GetMuscleVolumeRouteHandler,
  GetProgressionRouteHandler,
  GetRecentWorkoutsRouteHandler,
  GetSummaryRouteHandler,
  GetWorkoutDetailsRouteHandler,
  GetWorkoutHistoryRouteHandler,
} from "./contracts";

// ============================================================================
// Helper Functions
// ============================================================================

function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps > 10) {
    return weight * (1 + reps / 30);
  }
  return Math.round(weight * (36 / (37 - reps)));
}

function calculateVolume(
  sets: Array<{ weight: number | null; reps: number | null; setType: string | null }>,
): number {
  return sets.reduce((total, set) => {
    if (set.setType === "warmup") return total;
    const weight = set.weight ?? 0;
    const reps = set.reps ?? 0;
    return total + weight * reps;
  }, 0);
}

function findTopSet(
  sets: Array<{ weight: number | null; reps: number | null; setType: string | null }>,
): { weight: number; reps: number } | null {
  let topSet: { weight: number; reps: number } | null = null;
  let maxWeight = 0;

  for (const set of sets) {
    if (set.setType === "warmup") continue;
    const weight = set.weight ?? 0;
    const reps = set.reps ?? 0;

    if (weight > maxWeight && reps > 0) {
      maxWeight = weight;
      topSet = { weight, reps };
    }
  }

  return topSet;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

async function verifyExerciseAccess(exerciseId: number, userId: string) {
  const result = await db.select().from(exercise).where(eq(exercise.id, exerciseId)).limit(1);

  const ex = result[0];
  if (!ex) {
    notFound("Exercise", exerciseId);
  }

  if (!ex.isDefault && ex.createdByUserId !== userId) {
    notOwner("exercise");
  }

  return ex;
}

async function getExercisePerformanceData(exerciseId: number, userId: string) {
  const results = await db
    .select({
      workout: {
        id: workout.id,
        startedAt: workout.startedAt,
        completedAt: workout.completedAt,
      },
      workoutExercise: {
        id: workoutExercise.id,
      },
      set: {
        id: exerciseSet.id,
        setNumber: exerciseSet.setNumber,
        weight: exerciseSet.weight,
        weightUnit: exerciseSet.weightUnit,
        reps: exerciseSet.reps,
        rpe: exerciseSet.rpe,
        setType: exerciseSet.setType,
        isCompleted: exerciseSet.isCompleted,
      },
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
    .where(
      and(
        eq(workoutExercise.exerciseId, exerciseId),
        eq(workout.userId, userId),
        isNotNull(workout.completedAt),
      ),
    )
    .orderBy(desc(workout.startedAt), exerciseSet.setNumber);

  return results;
}

// ============================================================================
// Exercise History Handlers
// ============================================================================

export const getLastPerformanceHandler: GetLastPerformanceRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;
  const ex = await verifyExerciseAccess(input.exerciseId, userId);

  const lastWorkout = await db
    .select({
      workoutId: workout.id,
      workoutDate: workout.startedAt,
      workoutExerciseId: workoutExercise.id,
    })
    .from(workout)
    .innerJoin(workoutExercise, eq(workoutExercise.workoutId, workout.id))
    .where(
      and(
        eq(workout.userId, userId),
        eq(workoutExercise.exerciseId, input.exerciseId),
        isNotNull(workout.completedAt),
      ),
    )
    .orderBy(desc(workout.startedAt))
    .limit(1);

  const lastWorkoutData = lastWorkout[0];
  if (!lastWorkoutData) {
    return null;
  }

  const sets = await db
    .select()
    .from(exerciseSet)
    .where(eq(exerciseSet.workoutExerciseId, lastWorkoutData.workoutExerciseId))
    .orderBy(exerciseSet.setNumber);

  const formattedSets = sets.map((s) => ({
    setNumber: s.setNumber,
    weight: s.weight,
    weightUnit: s.weightUnit as WeightUnit | null,
    reps: s.reps,
    rpe: s.rpe,
    setType: s.setType as SetType | null,
  }));

  return {
    exerciseId: input.exerciseId,
    exerciseName: ex.name,
    lastWorkoutDate: lastWorkoutData.workoutDate,
    sets: formattedSets,
    totalVolume: calculateVolume(sets),
    topSet: findTopSet(sets),
  };
};

export const getBestPerformanceHandler: GetBestPerformanceRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;
  const ex = await verifyExerciseAccess(input.exerciseId, userId);

  const performanceData = await getExercisePerformanceData(input.exerciseId, userId);

  if (performanceData.length === 0) {
    return {
      exerciseId: input.exerciseId,
      exerciseName: ex.name,
      maxWeight: null,
      maxReps: null,
      maxVolume: null,
      estimated1RM: null,
    };
  }

  let maxWeight: { value: number; reps: number; date: Date } | null = null;
  let maxReps: { value: number; weight: number; date: Date } | null = null;
  let best1RM: { value: number; date: Date } | null = null;

  const workoutVolumes = new Map<number, { volume: number; date: Date }>();

  for (const row of performanceData) {
    const weight = row.set.weight ?? 0;
    const reps = row.set.reps ?? 0;
    const date = row.workout.startedAt;
    const setType = row.set.setType;

    if (setType === "warmup") continue;

    if (weight > 0 && reps > 0) {
      if (!maxWeight || weight > maxWeight.value) {
        maxWeight = { value: weight, reps, date };
      }
    }

    if (reps > 0 && weight > 0) {
      if (!maxReps || reps > maxReps.value) {
        maxReps = { value: reps, weight, date };
      }
    }

    if (weight > 0 && reps > 0) {
      const estimated = calculateEstimated1RM(weight, reps);
      if (!best1RM || estimated > best1RM.value) {
        best1RM = { value: estimated, date };
      }
    }

    const workoutId = row.workout.id;
    const existing = workoutVolumes.get(workoutId);
    const setVolume = weight * reps;
    if (existing) {
      existing.volume += setVolume;
    } else {
      workoutVolumes.set(workoutId, { volume: setVolume, date });
    }
  }

  let maxVolume: { value: number; date: Date } | null = null;
  for (const [, data] of workoutVolumes) {
    if (!maxVolume || data.volume > maxVolume.value) {
      maxVolume = { value: data.volume, date: data.date };
    }
  }

  return {
    exerciseId: input.exerciseId,
    exerciseName: ex.name,
    maxWeight,
    maxReps,
    maxVolume,
    estimated1RM: best1RM,
  };
};

export const getProgressionHandler: GetProgressionRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;
  const ex = await verifyExerciseAccess(input.exerciseId, userId);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - input.days);

  const results = await db
    .select({
      workout: {
        id: workout.id,
        startedAt: workout.startedAt,
      },
      workoutExercise: {
        id: workoutExercise.id,
      },
      set: {
        weight: exerciseSet.weight,
        reps: exerciseSet.reps,
        setType: exerciseSet.setType,
      },
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
    .where(
      and(
        eq(workoutExercise.exerciseId, input.exerciseId),
        eq(workout.userId, userId),
        isNotNull(workout.completedAt),
        gte(workout.startedAt, startDate),
      ),
    )
    .orderBy(workout.startedAt, exerciseSet.setNumber);

  const workoutMap = new Map<
    number,
    {
      date: Date;
      sets: Array<{ weight: number | null; reps: number | null; setType: string | null }>;
    }
  >();

  for (const row of results) {
    const existing = workoutMap.get(row.workout.id);
    if (existing) {
      existing.sets.push({
        weight: row.set.weight,
        reps: row.set.reps,
        setType: row.set.setType,
      });
    } else {
      workoutMap.set(row.workout.id, {
        date: row.workout.startedAt,
        sets: [{ weight: row.set.weight, reps: row.set.reps, setType: row.set.setType }],
      });
    }
  }

  const dataPoints: Array<{
    date: Date;
    workoutId: number;
    topSetWeight: number;
    topSetReps: number;
    totalVolume: number;
    estimated1RM: number;
  }> = [];

  for (const [workoutId, data] of workoutMap) {
    const topSet = findTopSet(data.sets);
    const volume = calculateVolume(data.sets);
    const estimated1RM = topSet ? calculateEstimated1RM(topSet.weight, topSet.reps) : 0;

    dataPoints.push({
      date: data.date,
      workoutId,
      topSetWeight: topSet?.weight ?? 0,
      topSetReps: topSet?.reps ?? 0,
      totalVolume: volume,
      estimated1RM,
    });
  }

  dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    exerciseId: input.exerciseId,
    exerciseName: ex.name,
    dataPoints,
  };
};

export const getRecentWorkoutsHandler: GetRecentWorkoutsRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;
  const ex = await verifyExerciseAccess(input.exerciseId, userId);

  const recentWorkoutIds = await db
    .select({
      workoutId: workout.id,
      workoutName: workout.name,
      workoutDate: workout.startedAt,
      workoutExerciseId: workoutExercise.id,
    })
    .from(workout)
    .innerJoin(workoutExercise, eq(workoutExercise.workoutId, workout.id))
    .where(
      and(
        eq(workout.userId, userId),
        eq(workoutExercise.exerciseId, input.exerciseId),
        isNotNull(workout.completedAt),
      ),
    )
    .orderBy(desc(workout.startedAt))
    .limit(input.limit);

  if (recentWorkoutIds.length === 0) {
    return {
      exerciseId: input.exerciseId,
      exerciseName: ex.name,
      workouts: [],
    };
  }

  const workoutExerciseIds = recentWorkoutIds.map((w) => w.workoutExerciseId);

  const allSets = await db
    .select()
    .from(exerciseSet)
    .where(
      sql`${exerciseSet.workoutExerciseId} IN (${sql.join(
        workoutExerciseIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    )
    .orderBy(exerciseSet.setNumber);

  const setsByWorkoutExercise = new Map<number, (typeof exerciseSet.$inferSelect)[]>();
  for (const set of allSets) {
    const existing = setsByWorkoutExercise.get(set.workoutExerciseId) ?? [];
    existing.push(set);
    setsByWorkoutExercise.set(set.workoutExerciseId, existing);
  }

  const workouts = recentWorkoutIds.map((w) => {
    const sets = setsByWorkoutExercise.get(w.workoutExerciseId) ?? [];
    const formattedSets = sets.map((s) => ({
      setNumber: s.setNumber,
      weight: s.weight,
      weightUnit: s.weightUnit as WeightUnit | null,
      reps: s.reps,
      rpe: s.rpe,
      setType: s.setType as SetType | null,
    }));

    return {
      workoutId: w.workoutId,
      workoutName: w.workoutName,
      date: w.workoutDate,
      sets: formattedSets,
      totalVolume: calculateVolume(sets),
      topSet: findTopSet(sets),
    };
  });

  return {
    exerciseId: input.exerciseId,
    exerciseName: ex.name,
    workouts,
  };
};

// ============================================================================
// Workout History Handlers
// ============================================================================

export const getWorkoutHistoryHandler: GetWorkoutHistoryRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const conditions: ReturnType<typeof eq>[] = [
    eq(workout.userId, userId),
    isNotNull(workout.completedAt),
  ];

  if (input.startDate) {
    conditions.push(gte(workout.startedAt, input.startDate));
  }

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(workout)
    .where(and(...conditions));

  const total = countResult[0]?.count ?? 0;

  const workouts = await db
    .select()
    .from(workout)
    .where(and(...conditions))
    .orderBy(desc(workout.startedAt))
    .limit(input.limit)
    .offset(input.offset);

  if (workouts.length === 0) {
    return {
      workouts: [],
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }

  const workoutIds = workouts.map((w) => w.id);

  const exerciseCounts = await db
    .select({
      workoutId: workoutExercise.workoutId,
      exerciseCount: sql<number>`COUNT(DISTINCT ${workoutExercise.id})`,
    })
    .from(workoutExercise)
    .where(
      sql`${workoutExercise.workoutId} IN (${sql.join(
        workoutIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    )
    .groupBy(workoutExercise.workoutId);

  const exerciseCountMap = new Map(exerciseCounts.map((e) => [e.workoutId, e.exerciseCount]));

  const setData = await db
    .select({
      workoutId: workoutExercise.workoutId,
      weight: exerciseSet.weight,
      reps: exerciseSet.reps,
      setType: exerciseSet.setType,
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .where(
      sql`${workoutExercise.workoutId} IN (${sql.join(
        workoutIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    );

  const workoutStats = new Map<number, { setCount: number; volume: number }>();
  for (const row of setData) {
    const existing = workoutStats.get(row.workoutId) ?? { setCount: 0, volume: 0 };
    existing.setCount++;
    if (row.setType !== "warmup") {
      existing.volume += (row.weight ?? 0) * (row.reps ?? 0);
    }
    workoutStats.set(row.workoutId, existing);
  }

  const workoutSummaries = workouts.map((w) => {
    const stats = workoutStats.get(w.id) ?? { setCount: 0, volume: 0 };
    const duration =
      w.completedAt && w.startedAt
        ? Math.round((w.completedAt.getTime() - w.startedAt.getTime()) / 60000)
        : null;

    return {
      id: w.id,
      name: w.name,
      date: w.startedAt,
      duration,
      exerciseCount: exerciseCountMap.get(w.id) ?? 0,
      setCount: stats.setCount,
      totalVolume: stats.volume,
      rating: w.rating,
      mood: w.mood,
    };
  });

  return {
    workouts: workoutSummaries,
    total,
    limit: input.limit,
    offset: input.offset,
  };
};

export const getWorkoutDetailsHandler: GetWorkoutDetailsRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  const workoutResult = await db
    .select()
    .from(workout)
    .where(and(eq(workout.id, input.workoutId), eq(workout.userId, userId)))
    .limit(1);

  const w = workoutResult[0];
  if (!w) {
    notFound("Workout", input.workoutId);
  }

  const exercisesData = await db
    .select({
      workoutExercise: {
        id: workoutExercise.id,
        exerciseId: workoutExercise.exerciseId,
        order: workoutExercise.order,
        notes: workoutExercise.notes,
      },
      exercise: {
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
      },
    })
    .from(workoutExercise)
    .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .where(eq(workoutExercise.workoutId, input.workoutId))
    .orderBy(workoutExercise.order);

  if (exercisesData.length === 0) {
    return {
      id: w.id,
      name: w.name,
      notes: w.notes,
      startedAt: w.startedAt,
      completedAt: w.completedAt,
      duration:
        w.completedAt && w.startedAt
          ? Math.round((w.completedAt.getTime() - w.startedAt.getTime()) / 60000)
          : null,
      rating: w.rating,
      mood: w.mood,
      exercises: [],
      totalVolume: 0,
      totalSets: 0,
    };
  }

  const workoutExerciseIds = exercisesData.map((e) => e.workoutExercise.id);

  const allSets = await db
    .select()
    .from(exerciseSet)
    .where(
      sql`${exerciseSet.workoutExerciseId} IN (${sql.join(
        workoutExerciseIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    )
    .orderBy(exerciseSet.setNumber);

  const setsByExercise = new Map<number, (typeof exerciseSet.$inferSelect)[]>();
  for (const set of allSets) {
    const existing = setsByExercise.get(set.workoutExerciseId) ?? [];
    existing.push(set);
    setsByExercise.set(set.workoutExerciseId, existing);
  }

  let totalVolume = 0;
  let totalSets = 0;

  const exercises = exercisesData.map((e) => {
    const sets = setsByExercise.get(e.workoutExercise.id) ?? [];
    const exerciseVolume = calculateVolume(sets);
    totalVolume += exerciseVolume;
    totalSets += sets.length;

    return {
      id: e.workoutExercise.id,
      exerciseId: e.workoutExercise.exerciseId,
      exerciseName: e.exercise.name,
      category: e.exercise.category,
      muscleGroups: e.exercise.muscleGroups ?? [],
      order: e.workoutExercise.order,
      notes: e.workoutExercise.notes,
      sets: sets.map((s) => ({
        id: s.id,
        setNumber: s.setNumber,
        reps: s.reps,
        weight: s.weight,
        weightUnit: s.weightUnit,
        rpe: s.rpe,
        rir: s.rir,
        setType: s.setType,
        isCompleted: s.isCompleted,
        notes: s.notes,
      })),
      totalVolume: exerciseVolume,
    };
  });

  return {
    id: w.id,
    name: w.name,
    notes: w.notes,
    startedAt: w.startedAt,
    completedAt: w.completedAt,
    duration:
      w.completedAt && w.startedAt
        ? Math.round((w.completedAt.getTime() - w.startedAt.getTime()) / 60000)
        : null,
    rating: w.rating,
    mood: w.mood,
    exercises,
    totalVolume,
    totalSets,
  };
};

// ============================================================================
// Summary Handlers
// ============================================================================

export const getSummaryHandler: GetSummaryRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  const completedWorkouts = await db
    .select({
      id: workout.id,
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
    })
    .from(workout)
    .where(and(eq(workout.userId, userId), isNotNull(workout.completedAt)))
    .orderBy(desc(workout.startedAt));

  const totalWorkouts = completedWorkouts.length;

  if (totalWorkouts === 0) {
    return {
      totalWorkouts: 0,
      totalVolume: 0,
      totalSets: 0,
      totalExercises: 0,
      averageWorkoutDuration: null,
      averageWorkoutsPerWeek: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteExercise: null,
      recentActivity: {
        lastWorkoutDate: null,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
      },
    };
  }

  let totalDuration = 0;
  let durationCount = 0;
  for (const w of completedWorkouts) {
    if (w.completedAt && w.startedAt) {
      totalDuration += w.completedAt.getTime() - w.startedAt.getTime();
      durationCount++;
    }
  }
  const averageWorkoutDuration =
    durationCount > 0 ? Math.round(totalDuration / durationCount / 60000) : null;

  const workoutIds = completedWorkouts.map((w) => w.id);

  const setStats = await db
    .select({
      weight: exerciseSet.weight,
      reps: exerciseSet.reps,
      setType: exerciseSet.setType,
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .where(
      sql`${workoutExercise.workoutId} IN (${sql.join(
        workoutIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    );

  let totalVolume = 0;
  const totalSets = setStats.length;
  for (const s of setStats) {
    if (s.setType !== "warmup") {
      totalVolume += (s.weight ?? 0) * (s.reps ?? 0);
    }
  }

  const uniqueExercises = await db
    .select({ exerciseId: workoutExercise.exerciseId })
    .from(workoutExercise)
    .where(
      sql`${workoutExercise.workoutId} IN (${sql.join(
        workoutIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    )
    .groupBy(workoutExercise.exerciseId);

  const totalExercises = uniqueExercises.length;

  const firstWorkout = completedWorkouts.at(-1);
  const lastWorkout = completedWorkouts[0];
  let averageWorkoutsPerWeek = 0;
  if (firstWorkout && lastWorkout) {
    const weeks = Math.max(
      1,
      (lastWorkout.startedAt.getTime() - firstWorkout.startedAt.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    );
    averageWorkoutsPerWeek = Math.round((totalWorkouts / weeks) * 10) / 10;
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  const sortedWorkouts = [...completedWorkouts].reverse();

  for (const w of sortedWorkouts) {
    const workoutDate = new Date(w.startedAt);
    workoutDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      tempStreak = 1;
    } else {
      const daysDiff = Math.floor(
        (workoutDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (daysDiff <= 1) {
        if (daysDiff === 1) {
          tempStreak++;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    lastDate = workoutDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (lastDate) {
    const daysSinceLast = Math.floor(
      (today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000),
    );
    currentStreak = daysSinceLast <= 1 ? tempStreak : 0;
  }

  const exerciseCounts = await db
    .select({
      exerciseId: workoutExercise.exerciseId,
      count: sql<number>`COUNT(*)`,
    })
    .from(workoutExercise)
    .where(
      sql`${workoutExercise.workoutId} IN (${sql.join(
        workoutIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    )
    .groupBy(workoutExercise.exerciseId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(1);

  let favoriteExercise: { id: number; name: string; count: number } | null = null;
  const topExercise = exerciseCounts[0];
  if (topExercise) {
    const ex = await db
      .select({ name: exercise.name })
      .from(exercise)
      .where(eq(exercise.id, topExercise.exerciseId))
      .limit(1);

    if (ex[0]) {
      favoriteExercise = {
        id: topExercise.exerciseId,
        name: ex[0].name,
        count: topExercise.count,
      };
    }
  }

  const now = new Date();
  const weekStart = getWeekStart(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let workoutsThisWeek = 0;
  let workoutsThisMonth = 0;
  for (const w of completedWorkouts) {
    if (w.startedAt >= weekStart) workoutsThisWeek++;
    if (w.startedAt >= monthStart) workoutsThisMonth++;
  }

  return {
    totalWorkouts,
    totalVolume,
    totalSets,
    totalExercises,
    averageWorkoutDuration,
    averageWorkoutsPerWeek,
    currentStreak,
    longestStreak,
    favoriteExercise,
    recentActivity: {
      lastWorkoutDate: completedWorkouts[0]?.startedAt ?? null,
      workoutsThisWeek,
      workoutsThisMonth,
    },
  };
};

export const getMuscleVolumeHandler: GetMuscleVolumeRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const now = new Date();
  const weekStart = getWeekStart(now);
  const targetWeekStart = new Date(weekStart);
  targetWeekStart.setDate(targetWeekStart.getDate() - (input.weeksBack - 1) * 7);
  const weekEnd = getWeekEnd(targetWeekStart);

  const workoutsData = await db
    .select({
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
        gte(workout.startedAt, targetWeekStart),
        sql`${workout.startedAt} <= ${weekEnd}`,
      ),
    );

  const muscleData: Record<string, { volume: number; setCount: number; exerciseIds: Set<number> }> =
    {};
  let totalVolume = 0;

  for (const row of workoutsData) {
    if (row.setType === "warmup" || !row.isCompleted) continue;
    if (!row.weight || !row.reps) continue;

    const volume = row.weight * row.reps;
    totalVolume += volume;

    const muscles = row.muscleGroups ?? [];
    const volumePerMuscle = volume / (muscles.length || 1);

    for (const muscle of muscles) {
      if (!muscleData[muscle]) {
        muscleData[muscle] = { volume: 0, setCount: 0, exerciseIds: new Set() };
      }
      muscleData[muscle].volume += volumePerMuscle;
      muscleData[muscle].setCount++;
    }
  }

  const muscleGroups = Object.entries(muscleData)
    .map(([muscleGroup, data]) => ({
      muscleGroup,
      volume: Math.round(data.volume),
      setCount: data.setCount,
      exerciseCount: data.exerciseIds.size,
    }))
    .sort((a, b) => b.volume - a.volume);

  return {
    weekStart: targetWeekStart,
    weekEnd,
    muscleGroups,
    totalVolume: Math.round(totalVolume),
  };
};
