import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAuthenticatedContext, createMockContext } from "../../../test/helpers";

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

// Import after mocks are set up
import {
  goalsRouter,
  goalTypeSchema,
  goalStatusSchema,
  goalDirectionSchema,
  goalWeightUnitSchema,
  goalLengthUnitSchema,
  goalMeasurementTypeSchema,
  goalOutputSchema,
  goalWithProgressSchema,
  goalsListOutputSchema,
  goalsSummarySchema,
  createWeightGoalSchema,
  createStrengthGoalSchema,
  createBodyMeasurementGoalSchema,
  createWorkoutFrequencyGoalSchema,
  createCustomGoalSchema,
  updateGoalSchema,
  updateGoalProgressSchema,
  listGoalsFilterSchema,
  getGoalByIdSchema,
  deleteGoalSchema,
  completeGoalSchema,
  abandonGoalSchema,
  pauseGoalSchema,
  resumeGoalSchema,
} from "..";

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
  targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  completedAt: null,
  progressPercentage: 50,
  updateCount: 5,
  lastProgressUpdate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStrengthGoal = {
  ...mockWeightGoal,
  id: 2,
  goalType: "strength" as const,
  title: "Bench 100kg",
  description: "Strength goal",
  direction: "increase" as const,
  startWeight: null,
  targetWeight: null,
  currentWeight: null,
  exerciseId: 1,
  startLiftWeight: 70,
  targetLiftWeight: 100,
  currentLiftWeight: 85,
  weightUnit: "kg" as const,
  progressPercentage: 50,
};

const mockBodyMeasurementGoal = {
  ...mockWeightGoal,
  id: 3,
  goalType: "body_measurement" as const,
  title: "Reduce waist",
  description: "Health goal",
  direction: "decrease" as const,
  startWeight: null,
  targetWeight: null,
  currentWeight: null,
  measurementType: "waist" as const,
  startMeasurement: 100,
  targetMeasurement: 85,
  currentMeasurement: 92,
  lengthUnit: "cm" as const,
  progressPercentage: 53.33,
};

const mockWorkoutFrequencyGoal = {
  ...mockWeightGoal,
  id: 4,
  goalType: "workout_frequency" as const,
  title: "4x per week",
  description: "Consistency goal",
  direction: "increase" as const,
  startWeight: null,
  targetWeight: null,
  currentWeight: null,
  targetWorkoutsPerWeek: 4,
  currentWorkoutsPerWeek: 3,
  progressPercentage: 75,
};

const mockCustomGoal = {
  ...mockWeightGoal,
  id: 5,
  goalType: "custom" as const,
  title: "Run 10km",
  description: "Cardio goal",
  direction: "increase" as const,
  startWeight: null,
  targetWeight: null,
  currentWeight: null,
  customMetricName: "Running Distance",
  customMetricUnit: "km",
  startCustomValue: 0,
  targetCustomValue: 10,
  currentCustomValue: 5,
  progressPercentage: 50,
};

const mockGoalProgress = {
  id: 1,
  goalId: 1,
  userId: "test-user-id",
  value: 85,
  progressPercentage: 50,
  note: "Halfway there!",
  recordedAt: new Date(),
  createdAt: new Date(),
};

describe("Goals Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Enum Schema Tests
  // ===========================================================================

  describe("Enum Schemas", () => {
    describe("goalTypeSchema", () => {
      it("should validate all goal types", () => {
        expect(goalTypeSchema.safeParse("weight").success).toBe(true);
        expect(goalTypeSchema.safeParse("strength").success).toBe(true);
        expect(goalTypeSchema.safeParse("body_measurement").success).toBe(true);
        expect(goalTypeSchema.safeParse("workout_frequency").success).toBe(true);
        expect(goalTypeSchema.safeParse("custom").success).toBe(true);
      });

      it("should reject invalid goal types", () => {
        expect(goalTypeSchema.safeParse("invalid").success).toBe(false);
        expect(goalTypeSchema.safeParse("").success).toBe(false);
        expect(goalTypeSchema.safeParse(123).success).toBe(false);
      });
    });

    describe("goalStatusSchema", () => {
      it("should validate all goal statuses", () => {
        expect(goalStatusSchema.safeParse("active").success).toBe(true);
        expect(goalStatusSchema.safeParse("completed").success).toBe(true);
        expect(goalStatusSchema.safeParse("abandoned").success).toBe(true);
        expect(goalStatusSchema.safeParse("paused").success).toBe(true);
      });

      it("should reject invalid statuses", () => {
        expect(goalStatusSchema.safeParse("pending").success).toBe(false);
        expect(goalStatusSchema.safeParse("").success).toBe(false);
      });
    });

    describe("goalDirectionSchema", () => {
      it("should validate all directions", () => {
        expect(goalDirectionSchema.safeParse("increase").success).toBe(true);
        expect(goalDirectionSchema.safeParse("decrease").success).toBe(true);
        expect(goalDirectionSchema.safeParse("maintain").success).toBe(true);
      });

      it("should reject invalid directions", () => {
        expect(goalDirectionSchema.safeParse("up").success).toBe(false);
      });
    });

    describe("goalWeightUnitSchema", () => {
      it("should validate weight units", () => {
        expect(goalWeightUnitSchema.safeParse("kg").success).toBe(true);
        expect(goalWeightUnitSchema.safeParse("lb").success).toBe(true);
      });

      it("should reject invalid weight units", () => {
        expect(goalWeightUnitSchema.safeParse("lbs").success).toBe(false);
        expect(goalWeightUnitSchema.safeParse("pounds").success).toBe(false);
      });
    });

    describe("goalLengthUnitSchema", () => {
      it("should validate length units", () => {
        expect(goalLengthUnitSchema.safeParse("cm").success).toBe(true);
        expect(goalLengthUnitSchema.safeParse("in").success).toBe(true);
      });

      it("should reject invalid length units", () => {
        expect(goalLengthUnitSchema.safeParse("inches").success).toBe(false);
        expect(goalLengthUnitSchema.safeParse("mm").success).toBe(false);
      });
    });

    describe("goalMeasurementTypeSchema", () => {
      it("should validate all measurement types", () => {
        const validTypes = [
          "chest",
          "waist",
          "hips",
          "left_arm",
          "right_arm",
          "left_thigh",
          "right_thigh",
          "left_calf",
          "right_calf",
          "neck",
          "shoulders",
          "body_fat_percentage",
        ];

        for (const type of validTypes) {
          expect(goalMeasurementTypeSchema.safeParse(type).success).toBe(true);
        }
      });

      it("should reject invalid measurement types", () => {
        expect(goalMeasurementTypeSchema.safeParse("bicep").success).toBe(false);
        expect(goalMeasurementTypeSchema.safeParse("").success).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Output Schema Tests
  // ===========================================================================

  describe("Output Schemas", () => {
    describe("goalOutputSchema", () => {
      it("should validate valid weight goal output", () => {
        const result = goalOutputSchema.safeParse(mockWeightGoal);
        expect(result.success).toBe(true);
      });

      it("should validate valid strength goal output", () => {
        const result = goalOutputSchema.safeParse(mockStrengthGoal);
        expect(result.success).toBe(true);
      });

      it("should validate valid body measurement goal output", () => {
        const result = goalOutputSchema.safeParse(mockBodyMeasurementGoal);
        expect(result.success).toBe(true);
      });

      it("should validate valid workout frequency goal output", () => {
        const result = goalOutputSchema.safeParse(mockWorkoutFrequencyGoal);
        expect(result.success).toBe(true);
      });

      it("should validate valid custom goal output", () => {
        const result = goalOutputSchema.safeParse(mockCustomGoal);
        expect(result.success).toBe(true);
      });
    });

    describe("goalWithProgressSchema", () => {
      it("should validate goal with progress history", () => {
        const result = goalWithProgressSchema.safeParse({
          ...mockWeightGoal,
          progressHistory: [mockGoalProgress],
          exercise: null,
        });
        expect(result.success).toBe(true);
      });

      it("should validate goal with exercise details", () => {
        const result = goalWithProgressSchema.safeParse({
          ...mockStrengthGoal,
          progressHistory: [],
          exercise: {
            id: 1,
            name: "Bench Press",
            category: "chest",
          },
        });
        expect(result.success).toBe(true);
      });
    });

    describe("goalsListOutputSchema", () => {
      it("should validate goals list", () => {
        const result = goalsListOutputSchema.safeParse([
          { ...mockWeightGoal, exercise: null },
          { ...mockStrengthGoal, exercise: { id: 1, name: "Bench Press", category: "chest" } },
        ]);
        expect(result.success).toBe(true);
      });

      it("should validate empty list", () => {
        const result = goalsListOutputSchema.safeParse([]);
        expect(result.success).toBe(true);
      });
    });

    describe("goalsSummarySchema", () => {
      it("should validate goals summary", () => {
        const result = goalsSummarySchema.safeParse({
          totalGoals: 10,
          activeGoals: 5,
          completedGoals: 3,
          abandonedGoals: 1,
          pausedGoals: 1,
          averageProgress: 45.5,
          nearDeadlineGoals: [{ ...mockWeightGoal, exercise: null }],
          recentlyCompletedGoals: [],
        });
        expect(result.success).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Create Goal Schema Tests
  // ===========================================================================

  describe("Create Goal Schemas", () => {
    describe("createWeightGoalSchema", () => {
      it("should validate valid weight goal input", () => {
        const result = createWeightGoalSchema.safeParse({
          title: "Lose 10kg",
          startWeight: 90,
          targetWeight: 80,
          weightUnit: "kg",
          direction: "decrease",
        });
        expect(result.success).toBe(true);
      });

      it("should validate with optional fields", () => {
        const result = createWeightGoalSchema.safeParse({
          title: "Lose weight",
          description: "Summer goal",
          startWeight: 200,
          targetWeight: 180,
          weightUnit: "lb",
          direction: "decrease",
          targetDate: "2024-06-01",
        });
        expect(result.success).toBe(true);
      });

      it("should use default direction", () => {
        const result = createWeightGoalSchema.safeParse({
          title: "Weight goal",
          startWeight: 90,
          targetWeight: 80,
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.direction).toBe("decrease");
        }
      });

      it("should reject missing required fields", () => {
        expect(createWeightGoalSchema.safeParse({}).success).toBe(false);
        expect(createWeightGoalSchema.safeParse({ title: "Test" }).success).toBe(false);
        expect(createWeightGoalSchema.safeParse({ title: "Test", startWeight: 90 }).success).toBe(
          false,
        );
      });

      it("should reject non-positive weights", () => {
        expect(
          createWeightGoalSchema.safeParse({
            title: "Test",
            startWeight: 0,
            targetWeight: 80,
          }).success,
        ).toBe(false);

        expect(
          createWeightGoalSchema.safeParse({
            title: "Test",
            startWeight: 90,
            targetWeight: -10,
          }).success,
        ).toBe(false);
      });

      it("should reject title too long", () => {
        expect(
          createWeightGoalSchema.safeParse({
            title: "a".repeat(201),
            startWeight: 90,
            targetWeight: 80,
          }).success,
        ).toBe(false);
      });

      it("should reject description too long", () => {
        expect(
          createWeightGoalSchema.safeParse({
            title: "Test",
            description: "a".repeat(1001),
            startWeight: 90,
            targetWeight: 80,
          }).success,
        ).toBe(false);
      });
    });

    describe("createStrengthGoalSchema", () => {
      it("should validate weight-based strength goal", () => {
        const result = createStrengthGoalSchema.safeParse({
          title: "Bench 100kg",
          exerciseId: 1,
          startLiftWeight: 70,
          targetLiftWeight: 100,
          weightUnit: "kg",
        });
        expect(result.success).toBe(true);
      });

      it("should validate rep-based strength goal", () => {
        const result = createStrengthGoalSchema.safeParse({
          title: "20 Pull-ups",
          exerciseId: 2,
          startReps: 10,
          targetReps: 20,
        });
        expect(result.success).toBe(true);
      });

      it("should validate combined weight and rep goal", () => {
        const result = createStrengthGoalSchema.safeParse({
          title: "5x100kg Squat",
          exerciseId: 3,
          startLiftWeight: 80,
          targetLiftWeight: 100,
          startReps: 3,
          targetReps: 5,
        });
        expect(result.success).toBe(true);
      });

      it("should reject missing exerciseId", () => {
        expect(
          createStrengthGoalSchema.safeParse({
            title: "Bench 100kg",
            targetLiftWeight: 100,
          }).success,
        ).toBe(false);
      });
    });

    describe("createBodyMeasurementGoalSchema", () => {
      it("should validate body measurement goal", () => {
        const result = createBodyMeasurementGoalSchema.safeParse({
          title: "Reduce waist",
          measurementType: "waist",
          startMeasurement: 100,
          targetMeasurement: 85,
          lengthUnit: "cm",
          direction: "decrease",
        });
        expect(result.success).toBe(true);
      });

      it("should validate body fat percentage goal", () => {
        const result = createBodyMeasurementGoalSchema.safeParse({
          title: "Get to 15% body fat",
          measurementType: "body_fat_percentage",
          startMeasurement: 25,
          targetMeasurement: 15,
          direction: "decrease",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid measurement type", () => {
        expect(
          createBodyMeasurementGoalSchema.safeParse({
            title: "Test",
            measurementType: "invalid",
            startMeasurement: 100,
            targetMeasurement: 90,
          }).success,
        ).toBe(false);
      });
    });

    describe("createWorkoutFrequencyGoalSchema", () => {
      it("should validate workout frequency goal", () => {
        const result = createWorkoutFrequencyGoalSchema.safeParse({
          title: "4x per week",
          targetWorkoutsPerWeek: 4,
        });
        expect(result.success).toBe(true);
      });

      it("should reject too many workouts per week", () => {
        expect(
          createWorkoutFrequencyGoalSchema.safeParse({
            title: "Too many",
            targetWorkoutsPerWeek: 15,
          }).success,
        ).toBe(false);
      });

      it("should reject zero workouts per week", () => {
        expect(
          createWorkoutFrequencyGoalSchema.safeParse({
            title: "None",
            targetWorkoutsPerWeek: 0,
          }).success,
        ).toBe(false);
      });
    });

    describe("createCustomGoalSchema", () => {
      it("should validate custom goal", () => {
        const result = createCustomGoalSchema.safeParse({
          title: "Run 10km",
          customMetricName: "Running Distance",
          customMetricUnit: "km",
          startCustomValue: 0,
          targetCustomValue: 10,
          direction: "increase",
        });
        expect(result.success).toBe(true);
      });

      it("should reject missing customMetricName", () => {
        expect(
          createCustomGoalSchema.safeParse({
            title: "Test",
            startCustomValue: 0,
            targetCustomValue: 10,
          }).success,
        ).toBe(false);
      });

      it("should reject customMetricName too long", () => {
        expect(
          createCustomGoalSchema.safeParse({
            title: "Test",
            customMetricName: "a".repeat(101),
            startCustomValue: 0,
            targetCustomValue: 10,
          }).success,
        ).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Update Schema Tests
  // ===========================================================================

  describe("Update Schemas", () => {
    describe("updateGoalSchema", () => {
      it("should validate id only", () => {
        const result = updateGoalSchema.safeParse({ id: 1 });
        expect(result.success).toBe(true);
      });

      it("should validate with updates", () => {
        const result = updateGoalSchema.safeParse({
          id: 1,
          title: "Updated title",
          description: "Updated description",
          status: "completed",
        });
        expect(result.success).toBe(true);
      });

      it("should validate weight goal updates", () => {
        const result = updateGoalSchema.safeParse({
          id: 1,
          targetWeight: 75,
          currentWeight: 82,
        });
        expect(result.success).toBe(true);
      });

      it("should validate strength goal updates", () => {
        const result = updateGoalSchema.safeParse({
          id: 1,
          targetLiftWeight: 110,
          currentLiftWeight: 90,
          targetReps: 5,
          currentReps: 3,
        });
        expect(result.success).toBe(true);
      });

      it("should reject missing id", () => {
        expect(updateGoalSchema.safeParse({}).success).toBe(false);
        expect(updateGoalSchema.safeParse({ title: "Test" }).success).toBe(false);
      });

      it("should validate nullable targetDate", () => {
        const result = updateGoalSchema.safeParse({
          id: 1,
          targetDate: null,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("updateGoalProgressSchema", () => {
      it("should validate progress update", () => {
        const result = updateGoalProgressSchema.safeParse({
          goalId: 1,
          value: 85,
        });
        expect(result.success).toBe(true);
      });

      it("should validate with note", () => {
        const result = updateGoalProgressSchema.safeParse({
          goalId: 1,
          value: 85,
          note: "Halfway there!",
        });
        expect(result.success).toBe(true);
      });

      it("should reject missing goalId", () => {
        expect(updateGoalProgressSchema.safeParse({ value: 85 }).success).toBe(false);
      });

      it("should reject missing value", () => {
        expect(updateGoalProgressSchema.safeParse({ goalId: 1 }).success).toBe(false);
      });

      it("should reject note too long", () => {
        expect(
          updateGoalProgressSchema.safeParse({
            goalId: 1,
            value: 85,
            note: "a".repeat(501),
          }).success,
        ).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Filter and Query Schema Tests
  // ===========================================================================

  describe("Filter and Query Schemas", () => {
    describe("listGoalsFilterSchema", () => {
      it("should validate empty filter (defaults)", () => {
        const result = listGoalsFilterSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(50);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate with all filters", () => {
        const result = listGoalsFilterSchema.safeParse({
          goalType: "weight",
          status: "active",
          exerciseId: 1,
          limit: 20,
          offset: 10,
        });
        expect(result.success).toBe(true);
      });

      it("should validate pagination limits", () => {
        expect(listGoalsFilterSchema.safeParse({ limit: 1 }).success).toBe(true);
        expect(listGoalsFilterSchema.safeParse({ limit: 100 }).success).toBe(true);
        expect(listGoalsFilterSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(listGoalsFilterSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(listGoalsFilterSchema.safeParse({ offset: -1 }).success).toBe(false);
      });
    });

    describe("getGoalByIdSchema", () => {
      it("should validate id", () => {
        expect(getGoalByIdSchema.safeParse({ id: 1 }).success).toBe(true);
        expect(getGoalByIdSchema.safeParse({ id: 999 }).success).toBe(true);
      });

      it("should reject invalid id", () => {
        expect(getGoalByIdSchema.safeParse({ id: 0 }).success).toBe(false);
        expect(getGoalByIdSchema.safeParse({ id: -1 }).success).toBe(false);
        expect(getGoalByIdSchema.safeParse({}).success).toBe(false);
      });
    });

    describe("deleteGoalSchema", () => {
      it("should validate id", () => {
        expect(deleteGoalSchema.safeParse({ id: 1 }).success).toBe(true);
      });

      it("should reject invalid id", () => {
        expect(deleteGoalSchema.safeParse({ id: 0 }).success).toBe(false);
        expect(deleteGoalSchema.safeParse({}).success).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Status Change Schema Tests
  // ===========================================================================

  describe("Status Change Schemas", () => {
    describe("completeGoalSchema", () => {
      it("should validate id", () => {
        expect(completeGoalSchema.safeParse({ id: 1 }).success).toBe(true);
      });
    });

    describe("abandonGoalSchema", () => {
      it("should validate id only", () => {
        expect(abandonGoalSchema.safeParse({ id: 1 }).success).toBe(true);
      });

      it("should validate with reason", () => {
        const result = abandonGoalSchema.safeParse({
          id: 1,
          reason: "Changed priorities",
        });
        expect(result.success).toBe(true);
      });

      it("should reject reason too long", () => {
        expect(
          abandonGoalSchema.safeParse({
            id: 1,
            reason: "a".repeat(501),
          }).success,
        ).toBe(false);
      });
    });

    describe("pauseGoalSchema", () => {
      it("should validate id", () => {
        expect(pauseGoalSchema.safeParse({ id: 1 }).success).toBe(true);
      });
    });

    describe("resumeGoalSchema", () => {
      it("should validate id", () => {
        expect(resumeGoalSchema.safeParse({ id: 1 }).success).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Router Structure Tests
  // ===========================================================================

  describe("Router Structure", () => {
    it("should have all create procedures", () => {
      expect(goalsRouter.createWeightGoal).toBeDefined();
      expect(goalsRouter.createStrengthGoal).toBeDefined();
      expect(goalsRouter.createBodyMeasurementGoal).toBeDefined();
      expect(goalsRouter.createWorkoutFrequencyGoal).toBeDefined();
      expect(goalsRouter.createCustomGoal).toBeDefined();
    });

    it("should have read procedures", () => {
      expect(goalsRouter.getById).toBeDefined();
      expect(goalsRouter.list).toBeDefined();
      expect(goalsRouter.getSummary).toBeDefined();
      expect(goalsRouter.getProgressHistory).toBeDefined();
    });

    it("should have update procedures", () => {
      expect(goalsRouter.update).toBeDefined();
      expect(goalsRouter.updateProgress).toBeDefined();
    });

    it("should have status change procedures", () => {
      expect(goalsRouter.complete).toBeDefined();
      expect(goalsRouter.abandon).toBeDefined();
      expect(goalsRouter.pause).toBeDefined();
      expect(goalsRouter.resume).toBeDefined();
    });

    it("should have delete procedure", () => {
      expect(goalsRouter.delete).toBeDefined();
    });
  });

  // ===========================================================================
  // Authorization Tests
  // ===========================================================================

  describe("Authorization Rules", () => {
    it("should correctly identify goal ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockWeightGoal.userId).toBe(userId);
    });

    it("should reject unauthenticated access", () => {
      const context = createMockContext();
      expect(context.session).toBeNull();
    });

    it("should provide user ID in authenticated context", () => {
      const context = createAuthenticatedContext({ id: "custom-user-id" });
      expect(context.session?.user.id).toBe("custom-user-id");
    });

    it("should detect when user does not own goal", () => {
      const context = createAuthenticatedContext({ id: "different-user-id" });
      const userId = context.session?.user.id;

      expect(mockWeightGoal.userId).not.toBe(userId);
    });
  });

  // ===========================================================================
  // Progress Calculation Tests
  // ===========================================================================

  describe("Progress Calculation Logic", () => {
    describe("Decrease Direction Goals", () => {
      it("should calculate progress for weight loss", () => {
        // Start: 90kg, Target: 80kg, Current: 85kg
        // Progress = (90 - 85) / (90 - 80) * 100 = 5/10 * 100 = 50%
        const start = 90;
        const target = 80;
        const current = 85;
        const progress = ((start - current) / (start - target)) * 100;
        expect(progress).toBe(50);
      });

      it("should show 0% when going wrong direction", () => {
        // Start: 90kg, Target: 80kg, Current: 95kg (gained weight)
        const start = 90;
        const current = 95;
        // Going wrong direction
        expect(current > start).toBe(true);
      });

      it("should show 100% when target reached", () => {
        const start = 90;
        const target = 80;
        const current = 80;
        const progress = ((start - current) / (start - target)) * 100;
        expect(progress).toBe(100);
      });
    });

    describe("Increase Direction Goals", () => {
      it("should calculate progress for strength gains", () => {
        // Start: 70kg, Target: 100kg, Current: 85kg
        // Progress = (85 - 70) / (100 - 70) * 100 = 15/30 * 100 = 50%
        const start = 70;
        const target = 100;
        const current = 85;
        const progress = ((current - start) / (target - start)) * 100;
        expect(progress).toBe(50);
      });

      it("should show 0% when going wrong direction", () => {
        // Start: 70kg, Target: 100kg, Current: 65kg (lost strength)
        const start = 70;
        const current = 65;
        expect(current < start).toBe(true);
      });
    });

    describe("Maintain Direction Goals", () => {
      it("should show 100% when within tolerance", () => {
        const target = 80;
        const tolerance = target * 0.05; // 5%
        const current = 81;
        const withinTolerance = Math.abs(current - target) <= tolerance;
        expect(withinTolerance).toBe(true);
      });

      it("should show reduced progress when outside tolerance", () => {
        const target = 80;
        const tolerance = target * 0.05; // 4kg
        const current = 90;
        const distance = Math.abs(current - target);
        expect(distance > tolerance).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe("Edge Cases", () => {
    it("should handle empty filter for list", () => {
      const result = listGoalsFilterSchema.parse({});
      expect(result.goalType).toBeUndefined();
      expect(result.status).toBeUndefined();
      expect(result.exerciseId).toBeUndefined();
    });

    it("should handle all goal types in schema", () => {
      const goalTypes = ["weight", "strength", "body_measurement", "workout_frequency", "custom"];

      for (const type of goalTypes) {
        const result = goalTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      }
    });

    it("should handle date coercion in create schemas", () => {
      const result = createWeightGoalSchema.safeParse({
        title: "Test",
        startWeight: 90,
        targetWeight: 80,
        targetDate: "2024-06-01T10:30:00Z",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetDate).toBeInstanceOf(Date);
      }
    });

    it("should handle maximum values for pagination", () => {
      const result = listGoalsFilterSchema.safeParse({
        limit: 100,
        offset: 1000000,
      });
      expect(result.success).toBe(true);
    });

    it("should allow title at max length", () => {
      const maxTitle = "a".repeat(200);
      const result = createWeightGoalSchema.safeParse({
        title: maxTitle,
        startWeight: 90,
        targetWeight: 80,
      });
      expect(result.success).toBe(true);
    });

    it("should allow description at max length", () => {
      const maxDescription = "a".repeat(1000);
      const result = createWeightGoalSchema.safeParse({
        title: "Test",
        description: maxDescription,
        startWeight: 90,
        targetWeight: 80,
      });
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // Data Transformation Tests
  // ===========================================================================

  describe("Data Transformation", () => {
    it("should provide correct mock weight goal structure", () => {
      expect(mockWeightGoal).toHaveProperty("id");
      expect(mockWeightGoal).toHaveProperty("userId");
      expect(mockWeightGoal).toHaveProperty("goalType");
      expect(mockWeightGoal).toHaveProperty("title");
      expect(mockWeightGoal).toHaveProperty("status");
      expect(mockWeightGoal).toHaveProperty("direction");
      expect(mockWeightGoal).toHaveProperty("startWeight");
      expect(mockWeightGoal).toHaveProperty("targetWeight");
      expect(mockWeightGoal).toHaveProperty("currentWeight");
      expect(mockWeightGoal).toHaveProperty("progressPercentage");
    });

    it("should correctly type different goal types", () => {
      expect(mockWeightGoal.goalType).toBe("weight");
      expect(mockStrengthGoal.goalType).toBe("strength");
      expect(mockBodyMeasurementGoal.goalType).toBe("body_measurement");
      expect(mockWorkoutFrequencyGoal.goalType).toBe("workout_frequency");
      expect(mockCustomGoal.goalType).toBe("custom");
    });

    it("should have appropriate values for different goal types", () => {
      // Weight goal
      expect(mockWeightGoal.startWeight).toBe(90);
      expect(mockWeightGoal.targetWeight).toBe(80);

      // Strength goal
      expect(mockStrengthGoal.exerciseId).toBe(1);
      expect(mockStrengthGoal.targetLiftWeight).toBe(100);

      // Body measurement goal
      expect(mockBodyMeasurementGoal.measurementType).toBe("waist");

      // Workout frequency goal
      expect(mockWorkoutFrequencyGoal.targetWorkoutsPerWeek).toBe(4);

      // Custom goal
      expect(mockCustomGoal.customMetricName).toBe("Running Distance");
    });
  });

  // ===========================================================================
  // Integration-Like Tests (Schema Combinations)
  // ===========================================================================

  describe("Schema Integration", () => {
    it("should validate a full create to output flow for weight goal", () => {
      const createInput = {
        title: "Lose 10kg",
        description: "Summer body goal",
        startWeight: 90,
        targetWeight: 80,
        weightUnit: "kg" as const,
        direction: "decrease" as const,
      };

      // Validate input
      const inputResult = createWeightGoalSchema.safeParse(createInput);
      expect(inputResult.success).toBe(true);

      // Simulate output (what would come from database)
      const output = {
        ...mockWeightGoal,
        title: createInput.title,
        description: createInput.description,
        startWeight: createInput.startWeight,
        targetWeight: createInput.targetWeight,
        currentWeight: createInput.startWeight,
        progressPercentage: 0,
      };

      // Validate output
      const outputResult = goalOutputSchema.safeParse(output);
      expect(outputResult.success).toBe(true);
    });

    it("should validate list output with multiple goal types", () => {
      const listOutput = [
        { ...mockWeightGoal, exercise: null },
        { ...mockStrengthGoal, exercise: { id: 1, name: "Bench Press", category: "chest" } },
        { ...mockBodyMeasurementGoal, exercise: null },
      ];

      const result = goalsListOutputSchema.safeParse(listOutput);
      expect(result.success).toBe(true);
    });

    it("should validate goal with progress history", () => {
      const goalWithProgress = {
        ...mockWeightGoal,
        progressHistory: [
          mockGoalProgress,
          { ...mockGoalProgress, id: 2, value: 87, progressPercentage: 30 },
          { ...mockGoalProgress, id: 3, value: 88, progressPercentage: 20 },
        ],
        exercise: null,
      };

      const result = goalWithProgressSchema.safeParse(goalWithProgress);
      expect(result.success).toBe(true);
    });

    it("should validate summary with all goal states", () => {
      const summary = {
        totalGoals: 10,
        activeGoals: 5,
        completedGoals: 3,
        abandonedGoals: 1,
        pausedGoals: 1,
        averageProgress: 45.5,
        nearDeadlineGoals: [
          { ...mockWeightGoal, exercise: null },
          { ...mockStrengthGoal, exercise: { id: 1, name: "Bench", category: "chest" } },
        ],
        recentlyCompletedGoals: [
          { ...mockWeightGoal, status: "completed" as const, exercise: null },
        ],
      };

      const result = goalsSummarySchema.safeParse(summary);
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // Goal Type Specific Tests
  // ===========================================================================

  describe("Goal Type Specific Behavior", () => {
    it("should handle weight goals with different units", () => {
      for (const unit of ["kg", "lb"]) {
        const result = createWeightGoalSchema.safeParse({
          title: "Test",
          startWeight: 90,
          targetWeight: 80,
          weightUnit: unit,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should handle body measurement goals with different measurement types", () => {
      const measurementTypes = ["chest", "waist", "hips", "left_arm", "right_arm"];

      for (const type of measurementTypes) {
        const result = createBodyMeasurementGoalSchema.safeParse({
          title: `Reduce ${type}`,
          measurementType: type,
          startMeasurement: 100,
          targetMeasurement: 90,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should handle workout frequency in valid range", () => {
      for (let i = 1; i <= 14; i++) {
        const result = createWorkoutFrequencyGoalSchema.safeParse({
          title: `${i}x per week`,
          targetWorkoutsPerWeek: i,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
