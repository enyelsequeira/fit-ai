import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthenticatedContext } from "../../../test/helpers";

vi.mock("@fit-ai/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve([])),
            })),
          })),
          groupBy: vi.fn(() => Promise.resolve([])),
        })),
        innerJoin: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([])),
          })),
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve([])),
              })),
            })),
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
        limit: vi.fn(() => Promise.resolve([])),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ success: true })),
    })),
  },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn((col, val) => ({ type: "eq", col, val })),
    and: vi.fn((...conditions) => ({ type: "and", conditions })),
    or: vi.fn((...conditions) => ({ type: "or", conditions })),
    desc: vi.fn((col) => ({ type: "desc", col })),
    inArray: vi.fn((col, vals) => ({ type: "inArray", col, vals })),
    gte: vi.fn((col, val) => ({ type: "gte", col, val })),
    lte: vi.fn((col, val) => ({ type: "lte", col, val })),
    sql: Object.assign(
      vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
        type: "sql",
        strings,
        values,
      })),
      {
        join: vi.fn((values: unknown[], separator: unknown) => ({
          type: "sql.join",
          values,
          separator,
        })),
      },
    ),
  };
});

import { updateGoalProgressHandler, updateGoalHandler, deleteGoalHandler } from "../handlers";
import { db } from "@fit-ai/db";

const mockWeightGoal = {
  id: 1,
  userId: "test-user-id",
  goalType: "weight" as const,
  title: "Lose 10kg",
  description: null,
  status: "active" as const,
  direction: "decrease" as const,
  startWeight: 90,
  targetWeight: 80,
  currentWeight: 90,
  weightUnit: "kg" as const,
  exerciseId: null,
  startLiftWeight: null,
  targetLiftWeight: null,
  currentLiftWeight: null,
  targetReps: null,
  currentReps: null,
  startReps: null,
  measurementType: null,
  startMeasurement: null,
  targetMeasurement: null,
  currentMeasurement: null,
  lengthUnit: null,
  targetWorkoutsPerWeek: null,
  currentWorkoutsPerWeek: null,
  customMetricName: null,
  customMetricUnit: null,
  startCustomValue: null,
  targetCustomValue: null,
  currentCustomValue: null,
  startDate: new Date(),
  targetDate: null,
  completedAt: null,
  progressPercentage: 0,
  updateCount: 0,
  lastProgressUpdate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStrengthGoal = {
  ...mockWeightGoal,
  id: 2,
  goalType: "strength" as const,
  direction: "increase" as const,
  startWeight: null,
  targetWeight: null,
  currentWeight: null,
  exerciseId: 1,
  startLiftWeight: 70,
  targetLiftWeight: 100,
  currentLiftWeight: 70,
};

const mockWorkoutFrequencyGoal = {
  ...mockWeightGoal,
  id: 3,
  goalType: "workout_frequency" as const,
  direction: "increase" as const,
  startWeight: null,
  targetWeight: null,
  currentWeight: null,
  targetWorkoutsPerWeek: 4,
  currentWorkoutsPerWeek: 0,
};

const mockGoalProgress = {
  id: 1,
  goalId: 1,
  userId: "test-user-id",
  value: 85,
  progressPercentage: 50,
  note: null,
  recordedAt: new Date(),
  createdAt: new Date(),
};

function mockOwnershipCheck(goal: typeof mockWeightGoal) {
  vi.mocked(db.select).mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve([{ ...goal }])),
      })),
    })),
  } as any);
}

function mockExerciseDetails(exercise?: { id: number; name: string; category: string }) {
  vi.mocked(db.select).mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve(exercise ? [exercise] : [])),
      })),
    })),
  } as any);
}

function mockProgressHistory(history: (typeof mockGoalProgress)[]) {
  vi.mocked(db.select).mockReturnValueOnce({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(history)),
        })),
      })),
    })),
  } as any);
}

function mockUpdate(returnValue: typeof mockWeightGoal) {
  vi.mocked(db.update).mockReturnValueOnce({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ ...returnValue }])),
      })),
    })),
  } as any);
}

describe("updateGoalProgressHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates progress for a weight goal and calculates percentage", async () => {
    mockOwnershipCheck(mockWeightGoal);
    // No mockExerciseDetails - exerciseId is null so getExerciseDetails returns early
    mockProgressHistory([mockGoalProgress]);
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([mockGoalProgress])) })),
    } as any);
    mockUpdate({ ...mockWeightGoal, currentWeight: 85, progressPercentage: 50 });
    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await updateGoalProgressHandler({
      input: { goalId: 1, value: 85 },
      context: ctx,
    } as any);
    expect(result.progressPercentage).toBe(50);
    expect(result.progressHistory).toHaveLength(1);
    expect(db.insert).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });

  it("updates progress for a strength goal", async () => {
    mockOwnershipCheck(mockStrengthGoal);
    mockExerciseDetails({ id: 1, name: "Bench", category: "chest" });
    mockProgressHistory([]);
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ ...mockGoalProgress, goalId: 2 }])),
      })),
    } as any);
    mockUpdate({ ...mockStrengthGoal, currentLiftWeight: 85, progressPercentage: 50 });
    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await updateGoalProgressHandler({
      input: { goalId: 2, value: 85 },
      context: ctx,
    } as any);
    expect(result.progressPercentage).toBeCloseTo(50);
    expect(db.insert).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });

  it("updates progress for a workout_frequency goal", async () => {
    mockOwnershipCheck(mockWorkoutFrequencyGoal);
    // No mockExerciseDetails - exerciseId is null so getExerciseDetails returns early
    mockProgressHistory([]);
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ ...mockGoalProgress, goalId: 3 }])),
      })),
    } as any);
    mockUpdate({ ...mockWorkoutFrequencyGoal, currentWorkoutsPerWeek: 2, progressPercentage: 50 });
    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await updateGoalProgressHandler({
      input: { goalId: 3, value: 2 },
      context: ctx,
    } as any);
    expect(result.progressPercentage).toBe(50);
    expect(db.insert).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });

  it("throws when goal is not active", async () => {
    mockOwnershipCheck({ ...mockWeightGoal, status: "paused" as const });
    await expect(
      updateGoalProgressHandler({
        input: { goalId: 1, value: 85 },
        context: createAuthenticatedContext({ id: "test-user-id" }),
      } as any),
    ).rejects.toThrow();
  });
});

describe("updateGoalHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates title only", async () => {
    mockOwnershipCheck(mockWeightGoal);
    mockUpdate({ ...mockWeightGoal, title: "New Title" });
    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await updateGoalHandler({
      input: { id: 1, title: "New Title" },
      context: ctx,
    } as any);
    expect(result.title).toBe("New Title");
    expect(db.update).toHaveBeenCalled();
  });

  it("recalculates progress when currentWeight is updated", async () => {
    mockOwnershipCheck(mockWeightGoal);
    mockUpdate({ ...mockWeightGoal, currentWeight: 85, progressPercentage: 50 });
    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    await updateGoalHandler({ input: { id: 1, currentWeight: 85 }, context: ctx } as any);
    expect(db.update).toHaveBeenCalled();
  });

  it("throws when goal not found", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })),
      })),
    } as any);

    await expect(
      updateGoalHandler({
        input: { id: 999, title: "Ghost Goal" },
        context: createAuthenticatedContext({ id: "test-user-id" }),
      } as any),
    ).rejects.toThrow();
  });
});

describe("deleteGoalHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes progress history and goal", async () => {
    mockOwnershipCheck(mockWeightGoal);
    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await deleteGoalHandler({ input: { id: 1 }, context: ctx } as any);
    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalledTimes(2);
  });

  it("throws when goal not found", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })),
      })),
    } as any);

    await expect(
      deleteGoalHandler({
        input: { id: 999 },
        context: createAuthenticatedContext({ id: "test-user-id" }),
      } as any),
    ).rejects.toThrow();
  });
});
