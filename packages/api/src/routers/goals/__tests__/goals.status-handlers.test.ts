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
  abandonGoalHandler,
  completeGoalHandler,
  pauseGoalHandler,
  resumeGoalHandler,
} from "../handlers";
import { db } from "@fit-ai/db";

// ============================================================================
// Mock Data
// ============================================================================

const mockActiveGoal = {
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

const mockPausedGoal = { ...mockActiveGoal, status: "paused" as const };

// ============================================================================
// completeGoalHandler
// ============================================================================

describe("completeGoalHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks goal as complete", async () => {
    const completedGoal = {
      ...mockActiveGoal,
      status: "completed" as const,
      progressPercentage: 100,
    };

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockActiveGoal }])),
        })),
      })),
    } as any);

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([completedGoal])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await completeGoalHandler({
      input: { id: 1 },
      context: ctx,
    } as any);

    expect(result.status).toBe("completed");
    expect(result.progressPercentage).toBe(100);
  });

  it("throws when goal not found", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });

    await expect(
      completeGoalHandler({
        input: { id: 999 },
        context: ctx,
      } as any),
    ).rejects.toThrow();
  });

  it("throws when user does not own goal", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockActiveGoal, userId: "other-user" }])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });

    await expect(
      completeGoalHandler({
        input: { id: 1 },
        context: ctx,
      } as any),
    ).rejects.toThrow();
  });
});

// ============================================================================
// pauseGoalHandler
// ============================================================================

describe("pauseGoalHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pauses an active goal", async () => {
    const pausedGoal = { ...mockActiveGoal, status: "paused" as const };

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockActiveGoal }])),
        })),
      })),
    } as any);

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([pausedGoal])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await pauseGoalHandler({
      input: { id: 1 },
      context: ctx,
    } as any);

    expect(result.status).toBe("paused");
  });

  it("throws when trying to pause a non-active goal", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockPausedGoal }])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });

    await expect(
      pauseGoalHandler({
        input: { id: 1 },
        context: ctx,
      } as any),
    ).rejects.toThrow();
  });
});

// ============================================================================
// resumeGoalHandler
// ============================================================================

describe("resumeGoalHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resumes a paused goal", async () => {
    const resumedGoal = { ...mockPausedGoal, status: "active" as const };

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockPausedGoal }])),
        })),
      })),
    } as any);

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([resumedGoal])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await resumeGoalHandler({
      input: { id: 1 },
      context: ctx,
    } as any);

    expect(result.status).toBe("active");
  });

  it("throws when trying to resume a non-paused goal", async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockActiveGoal }])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });

    await expect(
      resumeGoalHandler({
        input: { id: 1 },
        context: ctx,
      } as any),
    ).rejects.toThrow();
  });
});

// ============================================================================
// abandonGoalHandler
// ============================================================================

describe("abandonGoalHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("abandons a goal without reason", async () => {
    const abandonedGoal = { ...mockActiveGoal, status: "abandoned" as const };

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockActiveGoal }])),
        })),
      })),
    } as any);

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([abandonedGoal])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await abandonGoalHandler({
      input: { id: 1 },
      context: ctx,
    } as any);

    expect(result.status).toBe("abandoned");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("abandons a goal with reason and logs progress note", async () => {
    const abandonedGoal = { ...mockActiveGoal, status: "abandoned" as const };

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ ...mockActiveGoal }])),
        })),
      })),
    } as any);

    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    } as any);

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([abandonedGoal])),
        })),
      })),
    } as any);

    const ctx = createAuthenticatedContext({ id: "test-user-id" });
    const result = await abandonGoalHandler({
      input: { id: 1, reason: "Changed priorities" },
      context: ctx,
    } as any);

    expect(db.insert).toHaveBeenCalled();
    expect(result.status).toBe("abandoned");
  });
});
