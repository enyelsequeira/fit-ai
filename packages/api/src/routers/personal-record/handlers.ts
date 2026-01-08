import type { RecordType } from "@fit-ai/db/schema/personal-record";

import { db } from "@fit-ai/db";
import { exercise } from "@fit-ai/db/schema/exercise";
import { personalRecord } from "@fit-ai/db/schema/personal-record";
import { exerciseSet, workout, workoutExercise } from "@fit-ai/db/schema/workout";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";

import { badRequest, notFound, notOwner } from "../../errors";

import type {
  CalculatePRsInput,
  CreatePersonalRecordInput,
  DeletePersonalRecordInput,
  GetByExerciseInput,
  GetByIdInput,
  GetRecentPersonalRecordsInput,
  ListPersonalRecordsInput,
  UpdatePersonalRecordInput,
} from "./schemas";

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
 * Verify personal record ownership and return the record
 */
async function getPRWithOwnershipCheck(recordId: number, userId: string) {
  const result = await db
    .select()
    .from(personalRecord)
    .where(eq(personalRecord.id, recordId))
    .limit(1);

  const pr = result[0];
  if (!pr) {
    notFound("Personal record", recordId);
  }

  if (pr.userId !== userId) {
    notOwner("personal record");
  }

  return pr;
}

/**
 * Verify workout ownership and return the workout
 */
async function getWorkoutWithOwnershipCheck(workoutId: number, userId: string) {
  const result = await db.select().from(workout).where(eq(workout.id, workoutId)).limit(1);

  const w = result[0];
  if (!w) {
    notFound("Workout", workoutId);
  }

  if (w.userId !== userId) {
    notOwner("workout");
  }

  return w;
}

/**
 * Calculate one rep max using the Epley formula
 * Formula: weight × (1 + reps/30)
 */
function calculateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0) return weight;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Get existing PR for a user/exercise/type combination
 */
async function getExistingPR(
  userId: string,
  exerciseId: number,
  recordType: RecordType,
): Promise<typeof personalRecord.$inferSelect | null> {
  const result = await db
    .select()
    .from(personalRecord)
    .where(
      and(
        eq(personalRecord.userId, userId),
        eq(personalRecord.exerciseId, exerciseId),
        eq(personalRecord.recordType, recordType),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Check if a value beats an existing PR
 */
function beatsExistingPR(
  newValue: number,
  existingValue: number | null,
  recordType: RecordType,
): boolean {
  if (existingValue === null) return true;

  // For time-based records (best_time), lower is better
  if (recordType === "best_time") {
    return newValue < existingValue;
  }

  // For all other records, higher is better
  return newValue > existingValue;
}

// ============================================================================
// List Personal Records Handler
// ============================================================================

export async function listPersonalRecordsHandler(
  input: ListPersonalRecordsInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  const conditions: ReturnType<typeof eq>[] = [eq(personalRecord.userId, userId)];

  // Exercise filter
  if (input.exerciseId) {
    conditions.push(eq(personalRecord.exerciseId, input.exerciseId));
  }

  // Record type filter
  if (input.recordType) {
    conditions.push(eq(personalRecord.recordType, input.recordType));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(personalRecord)
    .where(and(...conditions));

  const total = countResult[0]?.count ?? 0;

  // Get records with exercise details
  const records = await db
    .select({
      record: personalRecord,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
      },
    })
    .from(personalRecord)
    .innerJoin(exercise, eq(personalRecord.exerciseId, exercise.id))
    .where(and(...conditions))
    .orderBy(desc(personalRecord.achievedAt))
    .limit(input.limit)
    .offset(input.offset);

  return {
    records: records.map((r) => ({
      ...r.record,
      exercise: r.exercise,
    })),
    total,
    limit: input.limit,
    offset: input.offset,
  };
}

// ============================================================================
// Get Recent Personal Records Handler
// ============================================================================

export async function getRecentPersonalRecordsHandler(
  input: GetRecentPersonalRecordsInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - input.days);

  const records = await db
    .select({
      record: personalRecord,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
      },
    })
    .from(personalRecord)
    .innerJoin(exercise, eq(personalRecord.exerciseId, exercise.id))
    .where(and(eq(personalRecord.userId, userId), gte(personalRecord.achievedAt, cutoffDate)))
    .orderBy(desc(personalRecord.achievedAt))
    .limit(input.limit);

  return records.map((r) => ({
    ...r.record,
    exercise: r.exercise,
  }));
}

// ============================================================================
// Get By Exercise Handler
// ============================================================================

export async function getByExerciseHandler(
  input: GetByExerciseInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;

  // Verify exercise exists
  const exerciseResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  const ex = exerciseResult[0];
  if (!ex) {
    notFound("Exercise", input.exerciseId);
  }

  const records = await db
    .select()
    .from(personalRecord)
    .where(and(eq(personalRecord.userId, userId), eq(personalRecord.exerciseId, input.exerciseId)))
    .orderBy(desc(personalRecord.achievedAt));

  return records;
}

// ============================================================================
// Get Summary Handler
// ============================================================================

export async function getSummaryHandler(context: AuthenticatedContext) {
  const userId = context.session.user.id;

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(personalRecord)
    .where(eq(personalRecord.userId, userId));

  const totalRecords = totalResult[0]?.count ?? 0;

  // Get count by type
  const countByTypeResult = await db
    .select({
      recordType: personalRecord.recordType,
      count: sql<number>`COUNT(*)`,
    })
    .from(personalRecord)
    .where(eq(personalRecord.userId, userId))
    .groupBy(personalRecord.recordType);

  const countByType: Record<string, number> = {};
  for (const row of countByTypeResult) {
    countByType[row.recordType] = row.count;
  }

  // Get recent records (last 30 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const recentRecords = await db
    .select({
      record: personalRecord,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
      },
    })
    .from(personalRecord)
    .innerJoin(exercise, eq(personalRecord.exerciseId, exercise.id))
    .where(and(eq(personalRecord.userId, userId), gte(personalRecord.achievedAt, cutoffDate)))
    .orderBy(desc(personalRecord.achievedAt))
    .limit(5);

  // Get count of unique exercises with PRs
  const exercisesCountResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${personalRecord.exerciseId})` })
    .from(personalRecord)
    .where(eq(personalRecord.userId, userId));

  const exercisesWithRecords = exercisesCountResult[0]?.count ?? 0;

  return {
    totalRecords,
    countByType,
    recentRecords: recentRecords.map((r) => ({
      ...r.record,
      exercise: r.exercise,
    })),
    exercisesWithRecords,
  };
}

// ============================================================================
// Create Personal Record Handler
// ============================================================================

export async function createPersonalRecordHandler(
  input: CreatePersonalRecordInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;

  // Verify exercise exists
  const exerciseResult = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, input.exerciseId))
    .limit(1);

  const ex = exerciseResult[0];
  if (!ex) {
    notFound("Exercise", input.exerciseId);
  }

  // Check exercise access (default or user's own)
  if (!ex.isDefault && ex.createdByUserId !== userId) {
    notOwner("exercise");
  }

  // Check if this beats an existing PR
  const existingPR = await getExistingPR(userId, input.exerciseId, input.recordType);

  if (existingPR && !beatsExistingPR(input.value, existingPR.value, input.recordType)) {
    badRequest(
      `This value does not beat your existing ${input.recordType} record of ${existingPR.value}`,
      "value",
    );
  }

  // If there's an existing PR, update it instead of creating a new one
  if (existingPR) {
    const result = await db
      .update(personalRecord)
      .set({
        value: input.value,
        displayUnit: input.displayUnit ?? existingPR.displayUnit,
        achievedAt: input.achievedAt ?? new Date(),
        workoutId: input.workoutId ?? null,
        exerciseSetId: input.exerciseSetId ?? null,
        notes: input.notes ?? existingPR.notes,
      })
      .where(eq(personalRecord.id, existingPR.id))
      .returning();

    const updated = result[0];
    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update personal record",
      });
    }

    return updated;
  }

  // Create new PR
  const result = await db
    .insert(personalRecord)
    .values({
      userId,
      exerciseId: input.exerciseId,
      recordType: input.recordType as RecordType,
      value: input.value,
      displayUnit: input.displayUnit ?? null,
      achievedAt: input.achievedAt ?? new Date(),
      workoutId: input.workoutId ?? null,
      exerciseSetId: input.exerciseSetId ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  const newRecord = result[0];
  if (!newRecord) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to create personal record",
    });
  }

  return newRecord;
}

// ============================================================================
// Get By ID Handler
// ============================================================================

export async function getByIdHandler(input: GetByIdInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;
  const pr = await getPRWithOwnershipCheck(input.id, userId);

  // Get exercise details
  const exerciseResult = await db
    .select({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      exerciseType: exercise.exerciseType,
    })
    .from(exercise)
    .where(eq(exercise.id, pr.exerciseId))
    .limit(1);

  return {
    ...pr,
    exercise: exerciseResult[0],
  };
}

// ============================================================================
// Update Personal Record Handler
// ============================================================================

export async function updatePersonalRecordHandler(
  input: UpdatePersonalRecordInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getPRWithOwnershipCheck(input.id, userId);

  // Build update object
  const updateData: Partial<typeof personalRecord.$inferInsert> = {};
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.displayUnit !== undefined) updateData.displayUnit = input.displayUnit;

  if (Object.keys(updateData).length === 0) {
    badRequest("No fields to update", "fields");
  }

  const result = await db
    .update(personalRecord)
    .set(updateData)
    .where(eq(personalRecord.id, input.id))
    .returning();

  const updated = result[0];
  if (!updated) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to update personal record",
    });
  }

  return updated;
}

// ============================================================================
// Delete Personal Record Handler
// ============================================================================

export async function deletePersonalRecordHandler(
  input: DeletePersonalRecordInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;
  await getPRWithOwnershipCheck(input.id, userId);

  await db.delete(personalRecord).where(eq(personalRecord.id, input.id));

  return { success: true };
}

// ============================================================================
// Calculate PRs Handler
// ============================================================================

export async function calculatePRsHandler(input: CalculatePRsInput, context: AuthenticatedContext) {
  const userId = context.session.user.id;

  // Verify workout exists and user owns it
  const w = await getWorkoutWithOwnershipCheck(input.workoutId, userId);

  // Get all exercise sets from the workout with exercise info
  const workoutSets = await db
    .select({
      set: exerciseSet,
      workoutExercise: workoutExercise,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        exerciseType: exercise.exerciseType,
      },
    })
    .from(exerciseSet)
    .innerJoin(workoutExercise, eq(exerciseSet.workoutExerciseId, workoutExercise.id))
    .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .where(eq(workoutExercise.workoutId, input.workoutId));

  const newRecords: Array<
    typeof personalRecord.$inferSelect & {
      exercise?: { id: number; name: string; category: string; exerciseType: string };
    }
  > = [];
  const totalChecked = workoutSets.length;

  // Group sets by exercise to calculate PRs
  const setsByExercise = new Map<
    number,
    Array<{
      set: typeof exerciseSet.$inferSelect;
      exercise: { id: number; name: string; category: string; exerciseType: string };
    }>
  >();

  for (const row of workoutSets) {
    const exerciseId = row.exercise.id;
    const existing = setsByExercise.get(exerciseId) ?? [];
    existing.push({ set: row.set, exercise: row.exercise });
    setsByExercise.set(exerciseId, existing);
  }

  // Process each exercise
  for (const [exerciseId, sets] of setsByExercise) {
    const exerciseInfo = sets[0]?.exercise;
    if (!exerciseInfo) continue;

    // Only process strength exercises for weight-based PRs
    const isStrength = exerciseInfo.exerciseType === "strength";

    if (isStrength) {
      // Track best values across all sets
      let bestOneRepMax = 0;
      let bestOneRepMaxSetId: number | null = null;
      let maxWeight = 0;
      let maxWeightSetId: number | null = null;
      let maxReps = 0;
      let maxRepsSetId: number | null = null;
      let maxVolume = 0;
      let maxVolumeSetId: number | null = null;

      for (const { set } of sets) {
        // Only consider completed sets with valid data
        if (!set.isCompleted || !set.weight || !set.reps) continue;

        const weight = set.weight;
        const reps = set.reps;

        // Calculate 1RM using Epley formula
        const oneRepMax = calculateOneRepMax(weight, reps);
        if (oneRepMax > bestOneRepMax) {
          bestOneRepMax = oneRepMax;
          bestOneRepMaxSetId = set.id;
        }

        // Max weight
        if (weight > maxWeight) {
          maxWeight = weight;
          maxWeightSetId = set.id;
        }

        // Max reps
        if (reps > maxReps) {
          maxReps = reps;
          maxRepsSetId = set.id;
        }

        // Max volume (weight × reps)
        const volume = weight * reps;
        if (volume > maxVolume) {
          maxVolume = volume;
          maxVolumeSetId = set.id;
        }
      }

      // Check and create PRs for each type
      const prCandidates: Array<{
        type: RecordType;
        value: number;
        setId: number | null;
      }> = [
        { type: "one_rep_max", value: bestOneRepMax, setId: bestOneRepMaxSetId },
        { type: "max_weight", value: maxWeight, setId: maxWeightSetId },
        { type: "max_reps", value: maxReps, setId: maxRepsSetId },
        { type: "max_volume", value: maxVolume, setId: maxVolumeSetId },
      ];

      for (const candidate of prCandidates) {
        if (candidate.value <= 0) continue;

        const existingPR = await getExistingPR(userId, exerciseId, candidate.type);

        if (beatsExistingPR(candidate.value, existingPR?.value ?? null, candidate.type)) {
          let newRecord: typeof personalRecord.$inferSelect;

          if (existingPR) {
            // Update existing PR
            const result = await db
              .update(personalRecord)
              .set({
                value: candidate.value,
                achievedAt: w.completedAt ?? new Date(),
                workoutId: input.workoutId,
                exerciseSetId: candidate.setId,
              })
              .where(eq(personalRecord.id, existingPR.id))
              .returning();

            const updated = result[0];
            if (!updated) continue;
            newRecord = updated;
          } else {
            // Create new PR
            const result = await db
              .insert(personalRecord)
              .values({
                userId,
                exerciseId,
                recordType: candidate.type,
                value: candidate.value,
                displayUnit: "kg", // Default to kg for weight-based records
                achievedAt: w.completedAt ?? new Date(),
                workoutId: input.workoutId,
                exerciseSetId: candidate.setId,
              })
              .returning();

            const created = result[0];
            if (!created) continue;
            newRecord = created;
          }

          newRecords.push({
            ...newRecord,
            exercise: exerciseInfo,
          });
        }
      }
    }

    // Handle cardio exercises
    if (exerciseInfo.exerciseType === "cardio") {
      let bestTime = Number.MAX_VALUE;
      let bestTimeSetId: number | null = null;
      let longestDuration = 0;
      let longestDurationSetId: number | null = null;
      let longestDistance = 0;
      let longestDistanceSetId: number | null = null;

      for (const { set } of sets) {
        if (!set.isCompleted) continue;

        // Best time (for fixed distance)
        if (set.durationSeconds && set.distance && set.durationSeconds < bestTime) {
          bestTime = set.durationSeconds;
          bestTimeSetId = set.id;
        }

        // Longest duration
        if (set.durationSeconds && set.durationSeconds > longestDuration) {
          longestDuration = set.durationSeconds;
          longestDurationSetId = set.id;
        }

        // Longest distance
        if (set.distance && set.distance > longestDistance) {
          longestDistance = set.distance;
          longestDistanceSetId = set.id;
        }
      }

      const cardioPRCandidates: Array<{
        type: RecordType;
        value: number;
        setId: number | null;
        unit: string;
      }> = [
        {
          type: "best_time",
          value: bestTime === Number.MAX_VALUE ? 0 : bestTime,
          setId: bestTimeSetId,
          unit: "seconds",
        },
        {
          type: "longest_duration",
          value: longestDuration,
          setId: longestDurationSetId,
          unit: "seconds",
        },
        {
          type: "longest_distance",
          value: longestDistance,
          setId: longestDistanceSetId,
          unit: "m",
        },
      ];

      for (const candidate of cardioPRCandidates) {
        if (candidate.value <= 0) continue;

        const existingPR = await getExistingPR(userId, exerciseId, candidate.type);

        if (beatsExistingPR(candidate.value, existingPR?.value ?? null, candidate.type)) {
          let newRecord: typeof personalRecord.$inferSelect;

          if (existingPR) {
            const result = await db
              .update(personalRecord)
              .set({
                value: candidate.value,
                achievedAt: w.completedAt ?? new Date(),
                workoutId: input.workoutId,
                exerciseSetId: candidate.setId,
              })
              .where(eq(personalRecord.id, existingPR.id))
              .returning();

            const updated = result[0];
            if (!updated) continue;
            newRecord = updated;
          } else {
            const result = await db
              .insert(personalRecord)
              .values({
                userId,
                exerciseId,
                recordType: candidate.type,
                value: candidate.value,
                displayUnit: candidate.unit,
                achievedAt: w.completedAt ?? new Date(),
                workoutId: input.workoutId,
                exerciseSetId: candidate.setId,
              })
              .returning();

            const created = result[0];
            if (!created) continue;
            newRecord = created;
          }

          newRecords.push({
            ...newRecord,
            exercise: exerciseInfo,
          });
        }
      }
    }
  }

  return {
    newRecords,
    totalChecked,
  };
}
