import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthenticatedContext } from "../../../test/helpers";

// Mock database - must be defined before vi.mock
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

// Import handlers after mocks are set up
import {
  createWeightGoalHandler,
  createStrengthGoalHandler,
  createBodyMeasurementGoalHandler,
  createWorkoutFrequencyGoalHandler,
  createCustomGoalHandler,
} from "../handlers";
import { db } from "@fit-ai/db";

// Mock data
const mockWeightGoal = {
  id: 1,
  userId: "test-user-id",
  goalType: "weight" as const,
  title: "Lose 10kg",
  description: "Summer body goal",
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
  targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  completedAt: null,
  progressPercentage: 0,
  updateCount: 0,
  lastProgressUpdate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Create Goal Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // createWeightGoalHandler
  // ===========================================================================

  describe("createWeightGoalHandler", () => {
    it("should insert a weight goal and return it", async () => {
      const mockResult = { ...mockWeightGoal };

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockResult])),
        })),
      } as any);

      const ctx = createAuthenticatedContext({ id: "test-user-id" });
      const result = await createWeightGoalHandler({
        input: {
          title: "Lose 10kg",
          startWeight: 90,
          targetWeight: 80,
          weightUnit: "kg",
          direction: "decrease",
        },
        context: ctx,
      } as any);

      expect(result).toEqual(mockResult);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // createStrengthGoalHandler
  // ===========================================================================

  describe("createStrengthGoalHandler", () => {
    it("should insert a strength goal when exercise exists", async () => {
      const mockStrengthGoal = {
        ...mockWeightGoal,
        id: 2,
        goalType: "strength" as const,
        title: "Bench 100kg",
        direction: "increase" as const,
        startWeight: null,
        targetWeight: null,
        currentWeight: null,
        exerciseId: 1,
        startLiftWeight: 70,
        targetLiftWeight: 100,
        currentLiftWeight: 70,
        weightUnit: "kg" as const,
      };

      // First call: exercise lookup
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve([{ id: 1, name: "Bench Press", category: "chest" }]),
            ),
          })),
        })),
      } as any);

      // Second call: insert returning
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockStrengthGoal])),
        })),
      } as any);

      const ctx = createAuthenticatedContext({ id: "test-user-id" });
      const result = await createStrengthGoalHandler({
        input: {
          title: "Bench 100kg",
          exerciseId: 1,
          startLiftWeight: 70,
          targetLiftWeight: 100,
          weightUnit: "kg",
          direction: "increase",
        },
        context: ctx,
      } as any);

      expect(result).toEqual(mockStrengthGoal);
      expect(result.goalType).toBe("strength");
      expect(db.select).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
    });

    it("should throw when the exercise is not found", async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      } as any);

      const ctx = createAuthenticatedContext({ id: "test-user-id" });

      await expect(
        createStrengthGoalHandler({
          input: {
            title: "Bench 100kg",
            exerciseId: 999,
            startLiftWeight: 70,
            targetLiftWeight: 100,
            weightUnit: "kg",
            direction: "increase",
          },
          context: ctx,
        } as any),
      ).rejects.toThrow();
    });
  });

  // ===========================================================================
  // createBodyMeasurementGoalHandler
  // ===========================================================================

  describe("createBodyMeasurementGoalHandler", () => {
    it("should insert a body measurement goal and return it", async () => {
      const mockBodyGoal = {
        ...mockWeightGoal,
        id: 3,
        goalType: "body_measurement" as const,
        title: "Reduce waist",
        direction: "decrease" as const,
        startWeight: null,
        targetWeight: null,
        currentWeight: null,
        measurementType: "waist" as const,
        startMeasurement: 100,
        targetMeasurement: 85,
        currentMeasurement: 100,
        lengthUnit: "cm" as const,
      };

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockBodyGoal])),
        })),
      } as any);

      const ctx = createAuthenticatedContext({ id: "test-user-id" });
      const result = await createBodyMeasurementGoalHandler({
        input: {
          title: "Reduce waist",
          measurementType: "waist",
          startMeasurement: 100,
          targetMeasurement: 85,
          lengthUnit: "cm",
          direction: "decrease",
        },
        context: ctx,
      } as any);

      expect(result).toEqual(mockBodyGoal);
      expect(result.goalType).toBe("body_measurement");
      expect(db.insert).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // createWorkoutFrequencyGoalHandler
  // ===========================================================================

  describe("createWorkoutFrequencyGoalHandler", () => {
    it("should insert a workout frequency goal with direction increase and return it", async () => {
      const mockFrequencyGoal = {
        ...mockWeightGoal,
        id: 4,
        goalType: "workout_frequency" as const,
        title: "4x per week",
        direction: "increase" as const,
        startWeight: null,
        targetWeight: null,
        currentWeight: null,
        targetWorkoutsPerWeek: 4,
        currentWorkoutsPerWeek: 0,
      };

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockFrequencyGoal])),
        })),
      } as any);

      const ctx = createAuthenticatedContext({ id: "test-user-id" });
      const result = await createWorkoutFrequencyGoalHandler({
        input: {
          title: "4x per week",
          targetWorkoutsPerWeek: 4,
        },
        context: ctx,
      } as any);

      expect(result).toEqual(mockFrequencyGoal);
      expect(result.goalType).toBe("workout_frequency");
      expect(result.direction).toBe("increase");
      expect(db.insert).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // createCustomGoalHandler
  // ===========================================================================

  describe("createCustomGoalHandler", () => {
    it("should insert a custom goal and return it", async () => {
      const mockCustomGoal = {
        ...mockWeightGoal,
        id: 5,
        goalType: "custom" as const,
        title: "Run 10km",
        direction: "increase" as const,
        startWeight: null,
        targetWeight: null,
        currentWeight: null,
        customMetricName: "Running Distance",
        customMetricUnit: "km",
        startCustomValue: 0,
        targetCustomValue: 10,
        currentCustomValue: 0,
      };

      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockCustomGoal])),
        })),
      } as any);

      const ctx = createAuthenticatedContext({ id: "test-user-id" });
      const result = await createCustomGoalHandler({
        input: {
          title: "Run 10km",
          customMetricName: "Running Distance",
          customMetricUnit: "km",
          startCustomValue: 0,
          targetCustomValue: 10,
          direction: "increase",
        },
        context: ctx,
      } as any);

      expect(result).toEqual(mockCustomGoal);
      expect(result.goalType).toBe("custom");
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
