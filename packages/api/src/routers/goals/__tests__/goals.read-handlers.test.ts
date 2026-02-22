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

import {
  listGoalsHandler,
  getGoalByIdHandler,
  getGoalsSummaryHandler,
  getGoalProgressHistoryHandler,
} from "../handlers";
import { db } from "@fit-ai/db";

// Mock data
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
  currentWeight: 85,
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
  progressPercentage: 50,
  updateCount: 5,
  lastProgressUpdate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGoalProgress = {
  id: 1,
  goalId: 1,
  userId: "test-user-id",
  value: 85,
  progressPercentage: 50,
  note: "Making progress",
  recordedAt: new Date(),
  createdAt: new Date(),
};

describe("listGoalsHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns goals for the current user", async () => {
    // First select: goals
    // mockWeightGoal has exerciseId: null so no second db.select call for exercises
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve([{ ...mockWeightGoal }])),
            })),
          })),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await listGoalsHandler({
      input: { limit: 50, offset: 0 },
      context: ctx,
    } as any);

    expect(result).toHaveLength(1);
    expect(result[0]?.goalType).toBe("weight");
  });

  it("returns empty array when no goals", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await listGoalsHandler({
      input: { limit: 50, offset: 0 },
      context: ctx,
    } as any);

    expect(result).toHaveLength(0);
  });
});

describe("getGoalByIdHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns goal with progress history", async () => {
    // Mock 1: ownership check
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockWeightGoal }])),
        })),
      })),
    } as any);
    // Mock 2: progress history (mock for exercise details skipped - exerciseId is null)
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ ...mockGoalProgress }])),
          })),
        })),
      })),
    } as any);

    // Note: mock 2 for exercise details is NOT needed since mockWeightGoal.exerciseId is null
    // getExerciseDetails(null) returns early without calling db.select

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await getGoalByIdHandler({
      input: { id: 1 },
      context: ctx,
    } as any);

    expect(result.id).toBe(1);
    expect(result.exercise).toBeNull();
    expect(result.progressHistory).toHaveLength(1);
  });

  it("throws when goal not found", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as any);

    await expect(
      getGoalByIdHandler({
        input: { id: 999 },
        context: createAuthenticatedContext(),
      } as any),
    ).rejects.toThrow();
  });
});

describe("getGoalsSummaryHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct summary counts", async () => {
    const mockGoals = [
      { ...mockWeightGoal, status: "active" as const, progressPercentage: 60 },
      { ...mockWeightGoal, id: 2, status: "active" as const, progressPercentage: 40 },
      { ...mockWeightGoal, id: 3, status: "completed" as const },
      { ...mockWeightGoal, id: 4, status: "abandoned" as const },
      { ...mockWeightGoal, id: 5, status: "paused" as const },
    ];

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockGoals)),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await getGoalsSummaryHandler({ input: {}, context: ctx } as any);

    expect(result.totalGoals).toBe(5);
    expect(result.activeGoals).toBe(2);
    expect(result.completedGoals).toBe(1);
    expect(result.abandonedGoals).toBe(1);
    expect(result.pausedGoals).toBe(1);
    expect(result.averageProgress).toBe(50); // (60 + 40) / 2
  });
});

describe("getGoalProgressHistoryHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns progress history", async () => {
    // Ownership check
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockWeightGoal }])),
        })),
      })),
    } as any);
    // Progress history
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve([mockGoalProgress])),
            })),
          })),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await getGoalProgressHistoryHandler({
      input: { goalId: 1 },
      context: ctx,
    } as any);

    expect(result).toHaveLength(1);
  });

  it("throws when goal not found", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as any);

    await expect(
      getGoalProgressHistoryHandler({
        input: { goalId: 999 },
        context: createAuthenticatedContext(),
      } as any),
    ).rejects.toThrow();
  });
});
