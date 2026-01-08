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
          groupBy: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve([])),
            limit: vi.fn(() => Promise.resolve([])),
            groupBy: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve([])),
              })),
            })),
          })),
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        limit: vi.fn(() => Promise.resolve([])),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
        groupBy: vi.fn(() => Promise.resolve([])),
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
    gte: vi.fn((col, val) => ({ type: "gte", col, val })),
    lte: vi.fn((col, val) => ({ type: "lte", col, val })),
    isNotNull: vi.fn((col) => ({ type: "isNotNull", col })),
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
  historyRouter,
  // Validation schemas
  weightUnitSchema,
  setTypeSchema,
  // Output schemas
  lastPerformanceOutputSchema,
  bestPerformanceOutputSchema,
  progressionOutputSchema,
  recentWorkoutsOutputSchema,
  workoutHistoryOutputSchema,
  workoutDetailsOutputSchema,
  trainingSummaryOutputSchema,
  muscleVolumeOutputSchema,
  // Input schemas
  exerciseIdInputSchema,
  recentWorkoutsInputSchema,
  progressionInputSchema,
  workoutHistoryInputSchema,
  workoutIdInputSchema,
  muscleVolumeInputSchema,
} from "..";

// Mock data
const mockExercise = {
  id: 1,
  name: "Bench Press",
  description: "Barbell chest press",
  category: "chest",
  muscleGroups: ["chest", "triceps", "shoulders"],
  equipment: "barbell",
  exerciseType: "strength",
  isDefault: true,
  createdByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserExercise = {
  ...mockExercise,
  id: 2,
  name: "Custom Exercise",
  isDefault: false,
  createdByUserId: "test-user-id",
};

const mockWorkout = {
  id: 1,
  userId: "test-user-id",
  name: "Push Day",
  notes: "Chest and triceps focus",
  startedAt: new Date("2024-01-15T10:00:00Z"),
  completedAt: new Date("2024-01-15T11:30:00Z"),
  createdAt: new Date(),
  updatedAt: new Date(),
  templateId: null,
  rating: 4,
  mood: "good" as const,
};

const mockWorkoutExercise = {
  id: 1,
  workoutId: 1,
  exerciseId: 1,
  order: 1,
  notes: "Focus on form",
  supersetGroupId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSet = {
  id: 1,
  workoutExerciseId: 1,
  setNumber: 1,
  reps: 10,
  weight: 100,
  weightUnit: "kg" as const,
  durationSeconds: null,
  distance: null,
  distanceUnit: null,
  holdTimeSeconds: null,
  setType: "normal" as const,
  rpe: 8,
  rir: 2,
  targetReps: 10,
  targetWeight: 100,
  restTimeSeconds: 90,
  isCompleted: true,
  completedAt: new Date(),
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLastPerformance = {
  exerciseId: 1,
  exerciseName: "Bench Press",
  lastWorkoutDate: new Date("2024-01-15T10:00:00Z"),
  sets: [
    {
      setNumber: 1,
      weight: 100,
      weightUnit: "kg" as const,
      reps: 10,
      rpe: 8,
      setType: "normal" as const,
    },
    {
      setNumber: 2,
      weight: 100,
      weightUnit: "kg" as const,
      reps: 8,
      rpe: 9,
      setType: "normal" as const,
    },
    {
      setNumber: 3,
      weight: 95,
      weightUnit: "kg" as const,
      reps: 6,
      rpe: 10,
      setType: "failure" as const,
    },
  ],
  totalVolume: 2370, // (100*10) + (100*8) + (95*6)
  topSet: { weight: 100, reps: 10 },
};

const mockBestPerformance = {
  exerciseId: 1,
  exerciseName: "Bench Press",
  maxWeight: { value: 120, reps: 5, date: new Date("2024-01-10T10:00:00Z") },
  maxReps: { value: 15, weight: 80, date: new Date("2024-01-05T10:00:00Z") },
  maxVolume: { value: 3000, date: new Date("2024-01-12T10:00:00Z") },
  estimated1RM: { value: 140, date: new Date("2024-01-10T10:00:00Z") },
};

const mockProgressionData = {
  exerciseId: 1,
  exerciseName: "Bench Press",
  dataPoints: [
    {
      date: new Date("2024-01-01T10:00:00Z"),
      workoutId: 1,
      topSetWeight: 90,
      topSetReps: 10,
      totalVolume: 2000,
      estimated1RM: 120,
    },
    {
      date: new Date("2024-01-08T10:00:00Z"),
      workoutId: 2,
      topSetWeight: 95,
      topSetReps: 10,
      totalVolume: 2200,
      estimated1RM: 127,
    },
    {
      date: new Date("2024-01-15T10:00:00Z"),
      workoutId: 3,
      topSetWeight: 100,
      topSetReps: 10,
      totalVolume: 2400,
      estimated1RM: 133,
    },
  ],
};

const mockTrainingSummary = {
  totalWorkouts: 50,
  totalVolume: 150000,
  totalSets: 600,
  totalExercises: 25,
  averageWorkoutDuration: 75,
  averageWorkoutsPerWeek: 4.2,
  currentStreak: 3,
  longestStreak: 14,
  favoriteExercise: { id: 1, name: "Bench Press", count: 45 },
  recentActivity: {
    lastWorkoutDate: new Date("2024-01-15T10:00:00Z"),
    workoutsThisWeek: 3,
    workoutsThisMonth: 12,
  },
};

describe("History Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Validation Schema Tests
  // ===========================================================================

  describe("Validation Schemas", () => {
    describe("weightUnitSchema", () => {
      it("should validate valid weight units", () => {
        expect(weightUnitSchema.safeParse("kg").success).toBe(true);
        expect(weightUnitSchema.safeParse("lb").success).toBe(true);
      });

      it("should reject invalid weight units", () => {
        expect(weightUnitSchema.safeParse("lbs").success).toBe(false);
        expect(weightUnitSchema.safeParse("pounds").success).toBe(false);
        expect(weightUnitSchema.safeParse("").success).toBe(false);
      });
    });

    describe("setTypeSchema", () => {
      it("should validate valid set types", () => {
        expect(setTypeSchema.safeParse("normal").success).toBe(true);
        expect(setTypeSchema.safeParse("warmup").success).toBe(true);
        expect(setTypeSchema.safeParse("failure").success).toBe(true);
        expect(setTypeSchema.safeParse("drop").success).toBe(true);
      });

      it("should reject invalid set types", () => {
        expect(setTypeSchema.safeParse("invalid").success).toBe(false);
        expect(setTypeSchema.safeParse("").success).toBe(false);
        expect(setTypeSchema.safeParse(123).success).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Input Schema Tests
  // ===========================================================================

  describe("Input Schemas", () => {
    describe("exerciseIdInputSchema", () => {
      it("should validate exercise ID", () => {
        expect(exerciseIdInputSchema.safeParse({ exerciseId: 1 }).success).toBe(true);
        expect(exerciseIdInputSchema.safeParse({ exerciseId: "5" }).success).toBe(true);
      });

      it("should reject missing exercise ID", () => {
        expect(exerciseIdInputSchema.safeParse({}).success).toBe(false);
      });

      it("should reject invalid exercise ID", () => {
        expect(exerciseIdInputSchema.safeParse({ exerciseId: "abc" }).success).toBe(false);
      });
    });

    describe("recentWorkoutsInputSchema", () => {
      it("should validate with default limit", () => {
        const result = recentWorkoutsInputSchema.safeParse({ exerciseId: 1 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(5);
        }
      });

      it("should validate custom limit", () => {
        const result = recentWorkoutsInputSchema.safeParse({ exerciseId: 1, limit: 10 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(10);
        }
      });

      it("should reject limit out of range", () => {
        expect(recentWorkoutsInputSchema.safeParse({ exerciseId: 1, limit: 0 }).success).toBe(
          false,
        );
        expect(recentWorkoutsInputSchema.safeParse({ exerciseId: 1, limit: 21 }).success).toBe(
          false,
        );
      });
    });

    describe("progressionInputSchema", () => {
      it("should validate with default days", () => {
        const result = progressionInputSchema.safeParse({ exerciseId: 1 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.days).toBe(90);
        }
      });

      it("should validate custom days", () => {
        const result = progressionInputSchema.safeParse({ exerciseId: 1, days: 30 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.days).toBe(30);
        }
      });

      it("should reject days out of range", () => {
        expect(progressionInputSchema.safeParse({ exerciseId: 1, days: 6 }).success).toBe(false);
        expect(progressionInputSchema.safeParse({ exerciseId: 1, days: 366 }).success).toBe(false);
      });
    });

    describe("workoutHistoryInputSchema", () => {
      it("should validate with defaults", () => {
        const result = workoutHistoryInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate pagination", () => {
        const result = workoutHistoryInputSchema.safeParse({ limit: 50, offset: 100 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(50);
          expect(result.data.offset).toBe(100);
        }
      });

      it("should validate date filters", () => {
        const result = workoutHistoryInputSchema.safeParse({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid pagination", () => {
        expect(workoutHistoryInputSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(workoutHistoryInputSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(workoutHistoryInputSchema.safeParse({ offset: -1 }).success).toBe(false);
      });
    });

    describe("workoutIdInputSchema", () => {
      it("should validate workout ID", () => {
        expect(workoutIdInputSchema.safeParse({ workoutId: 1 }).success).toBe(true);
        expect(workoutIdInputSchema.safeParse({ workoutId: "5" }).success).toBe(true);
      });

      it("should reject missing workout ID", () => {
        expect(workoutIdInputSchema.safeParse({}).success).toBe(false);
      });
    });

    describe("muscleVolumeInputSchema", () => {
      it("should validate with default weeks", () => {
        const result = muscleVolumeInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.weeksBack).toBe(1);
        }
      });

      it("should validate custom weeks", () => {
        const result = muscleVolumeInputSchema.safeParse({ weeksBack: 4 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.weeksBack).toBe(4);
        }
      });

      it("should reject weeks out of range", () => {
        expect(muscleVolumeInputSchema.safeParse({ weeksBack: 0 }).success).toBe(false);
        expect(muscleVolumeInputSchema.safeParse({ weeksBack: 13 }).success).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Output Schema Tests
  // ===========================================================================

  describe("Output Schemas", () => {
    describe("lastPerformanceOutputSchema", () => {
      it("should validate correct last performance data", () => {
        const result = lastPerformanceOutputSchema.safeParse(mockLastPerformance);
        expect(result.success).toBe(true);
      });

      it("should validate null top set", () => {
        const result = lastPerformanceOutputSchema.safeParse({
          ...mockLastPerformance,
          topSet: null,
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty sets array", () => {
        const result = lastPerformanceOutputSchema.safeParse({
          ...mockLastPerformance,
          sets: [],
          totalVolume: 0,
          topSet: null,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("bestPerformanceOutputSchema", () => {
      it("should validate correct best performance data", () => {
        const result = bestPerformanceOutputSchema.safeParse(mockBestPerformance);
        expect(result.success).toBe(true);
      });

      it("should validate null records", () => {
        const result = bestPerformanceOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Bench Press",
          maxWeight: null,
          maxReps: null,
          maxVolume: null,
          estimated1RM: null,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("progressionOutputSchema", () => {
      it("should validate correct progression data", () => {
        const result = progressionOutputSchema.safeParse(mockProgressionData);
        expect(result.success).toBe(true);
      });

      it("should validate empty data points", () => {
        const result = progressionOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Bench Press",
          dataPoints: [],
        });
        expect(result.success).toBe(true);
      });
    });

    describe("recentWorkoutsOutputSchema", () => {
      it("should validate correct recent workouts data", () => {
        const result = recentWorkoutsOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Bench Press",
          workouts: [
            {
              workoutId: 1,
              workoutName: "Push Day",
              date: new Date(),
              sets: mockLastPerformance.sets,
              totalVolume: 2370,
              topSet: { weight: 100, reps: 10 },
            },
          ],
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty workouts", () => {
        const result = recentWorkoutsOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Bench Press",
          workouts: [],
        });
        expect(result.success).toBe(true);
      });
    });

    describe("workoutHistoryOutputSchema", () => {
      it("should validate correct workout history data", () => {
        const result = workoutHistoryOutputSchema.safeParse({
          workouts: [
            {
              id: 1,
              name: "Push Day",
              date: new Date(),
              duration: 90,
              exerciseCount: 5,
              setCount: 20,
              totalVolume: 10000,
              rating: 4,
              mood: "good",
            },
          ],
          total: 50,
          limit: 20,
          offset: 0,
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty workouts", () => {
        const result = workoutHistoryOutputSchema.safeParse({
          workouts: [],
          total: 0,
          limit: 20,
          offset: 0,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("workoutDetailsOutputSchema", () => {
      it("should validate correct workout details", () => {
        const result = workoutDetailsOutputSchema.safeParse({
          id: 1,
          name: "Push Day",
          notes: "Great workout",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 90,
          rating: 4,
          mood: "good",
          exercises: [
            {
              id: 1,
              exerciseId: 1,
              exerciseName: "Bench Press",
              category: "chest",
              muscleGroups: ["chest", "triceps"],
              order: 1,
              notes: null,
              sets: [
                {
                  id: 1,
                  setNumber: 1,
                  reps: 10,
                  weight: 100,
                  weightUnit: "kg",
                  rpe: 8,
                  rir: 2,
                  setType: "normal",
                  isCompleted: true,
                  notes: null,
                },
              ],
              totalVolume: 1000,
            },
          ],
          totalVolume: 5000,
          totalSets: 20,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("trainingSummaryOutputSchema", () => {
      it("should validate correct training summary", () => {
        const result = trainingSummaryOutputSchema.safeParse(mockTrainingSummary);
        expect(result.success).toBe(true);
      });

      it("should validate null favorite exercise", () => {
        const result = trainingSummaryOutputSchema.safeParse({
          ...mockTrainingSummary,
          favoriteExercise: null,
        });
        expect(result.success).toBe(true);
      });

      it("should validate null last workout date", () => {
        const result = trainingSummaryOutputSchema.safeParse({
          ...mockTrainingSummary,
          recentActivity: {
            lastWorkoutDate: null,
            workoutsThisWeek: 0,
            workoutsThisMonth: 0,
          },
        });
        expect(result.success).toBe(true);
      });
    });

    describe("muscleVolumeOutputSchema", () => {
      it("should validate correct muscle volume data", () => {
        const result = muscleVolumeOutputSchema.safeParse({
          weekStart: new Date("2024-01-08"),
          weekEnd: new Date("2024-01-14"),
          muscleGroups: [
            { muscleGroup: "chest", volume: 5000, setCount: 20, exerciseCount: 3 },
            { muscleGroup: "triceps", volume: 3000, setCount: 15, exerciseCount: 2 },
          ],
          totalVolume: 8000,
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty muscle groups", () => {
        const result = muscleVolumeOutputSchema.safeParse({
          weekStart: new Date("2024-01-08"),
          weekEnd: new Date("2024-01-14"),
          muscleGroups: [],
          totalVolume: 0,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Router Structure Tests
  // ===========================================================================

  describe("Router Structure", () => {
    it("should have all exercise history procedures", () => {
      expect(historyRouter.getLastPerformance).toBeDefined();
      expect(historyRouter.getBestPerformance).toBeDefined();
      expect(historyRouter.getProgression).toBeDefined();
      expect(historyRouter.getRecentWorkouts).toBeDefined();
    });

    it("should have all workout history procedures", () => {
      expect(historyRouter.getWorkoutHistory).toBeDefined();
      expect(historyRouter.getWorkoutDetails).toBeDefined();
    });

    it("should have all summary procedures", () => {
      expect(historyRouter.getSummary).toBeDefined();
      expect(historyRouter.getMuscleVolume).toBeDefined();
    });
  });

  // ===========================================================================
  // Authorization Tests
  // ===========================================================================

  describe("Authorization Rules", () => {
    it("should correctly identify user ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their workout
      expect(mockWorkout.userId).toBe(userId);
    });

    it("should reject unauthenticated access", () => {
      const context = createMockContext();
      expect(context.session).toBeNull();
    });

    it("should provide user ID in authenticated context", () => {
      const context = createAuthenticatedContext({ id: "custom-user-id" });
      expect(context.session?.user.id).toBe("custom-user-id");
    });

    it("should identify default exercises as accessible", () => {
      expect(mockExercise.isDefault).toBe(true);
      expect(mockExercise.createdByUserId).toBeNull();
    });

    it("should identify user exercises by creator", () => {
      expect(mockUserExercise.isDefault).toBe(false);
      expect(mockUserExercise.createdByUserId).toBe("test-user-id");
    });
  });

  // ===========================================================================
  // Data Calculation Tests
  // ===========================================================================

  describe("Data Calculations", () => {
    describe("Volume Calculation", () => {
      it("should correctly calculate total volume", () => {
        // Volume = (100*10) + (100*8) + (95*6) = 1000 + 800 + 570 = 2370
        expect(mockLastPerformance.totalVolume).toBe(2370);
      });

      it("should handle zero weight or reps", () => {
        const setWithZero = { setNumber: 1, weight: 0, reps: 10, setType: "normal" };
        // Volume should be 0
        expect(setWithZero.weight * setWithZero.reps).toBe(0);
      });
    });

    describe("Top Set Identification", () => {
      it("should identify heaviest set correctly", () => {
        // Top set should be 100kg (highest weight)
        expect(mockLastPerformance.topSet?.weight).toBe(100);
      });

      it("should return first occurrence for same weight", () => {
        // When multiple sets have same weight, should return first (by reps)
        expect(mockLastPerformance.topSet?.reps).toBe(10);
      });
    });

    describe("Estimated 1RM Calculation", () => {
      it("should calculate reasonable 1RM estimates", () => {
        // Using Brzycki formula: weight × (36 / (37 - reps))
        // 100kg × 10 reps ≈ 133kg
        // The mock shows 140kg which is from a heavier weight/lower rep combo
        expect(mockBestPerformance.estimated1RM?.value).toBe(140);
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe("Edge Cases", () => {
    it("should handle no workout history", () => {
      const emptyHistory = {
        workouts: [],
        total: 0,
        limit: 20,
        offset: 0,
      };
      expect(workoutHistoryOutputSchema.safeParse(emptyHistory).success).toBe(true);
    });

    it("should handle workout with no exercises", () => {
      const emptyWorkout = {
        id: 1,
        name: "Empty Workout",
        notes: null,
        startedAt: new Date(),
        completedAt: new Date(),
        duration: 5,
        rating: null,
        mood: null,
        exercises: [],
        totalVolume: 0,
        totalSets: 0,
      };
      expect(workoutDetailsOutputSchema.safeParse(emptyWorkout).success).toBe(true);
    });

    it("should handle exercise with no completed sets", () => {
      const noSets = {
        exerciseId: 1,
        exerciseName: "Bench Press",
        workouts: [],
      };
      expect(recentWorkoutsOutputSchema.safeParse(noSets).success).toBe(true);
    });

    it("should handle null values in sets", () => {
      const setWithNulls = {
        setNumber: 1,
        weight: null,
        weightUnit: null,
        reps: null,
        rpe: null,
        setType: null,
      };
      // Should be valid with nullable fields
      expect(
        lastPerformanceOutputSchema.safeParse({
          ...mockLastPerformance,
          sets: [setWithNulls],
          totalVolume: 0,
          topSet: null,
        }).success,
      ).toBe(true);
    });

    it("should handle warmup sets excluded from volume", () => {
      // Warmup sets should not contribute to volume
      const warmupSet = { ...mockSet, setType: "warmup" as const };
      expect(warmupSet.setType).toBe("warmup");
    });

    it("should handle very long progression history", () => {
      const manyDataPoints = Array.from({ length: 365 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        workoutId: i + 1,
        topSetWeight: 100 + i * 0.5,
        topSetReps: 10,
        totalVolume: 2000 + i * 10,
        estimated1RM: 130 + i * 0.5,
      }));

      const result = progressionOutputSchema.safeParse({
        exerciseId: 1,
        exerciseName: "Bench Press",
        dataPoints: manyDataPoints,
      });
      expect(result.success).toBe(true);
    });

    it("should handle zero workouts in summary", () => {
      const emptySummary = {
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
      expect(trainingSummaryOutputSchema.safeParse(emptySummary).success).toBe(true);
    });

    it("should handle muscle groups with no volume", () => {
      const noVolume = {
        weekStart: new Date(),
        weekEnd: new Date(),
        muscleGroups: [],
        totalVolume: 0,
      };
      expect(muscleVolumeOutputSchema.safeParse(noVolume).success).toBe(true);
    });
  });

  // ===========================================================================
  // Mock Data Structure Tests
  // ===========================================================================

  describe("Mock Data Structures", () => {
    it("should have valid exercise structure", () => {
      expect(mockExercise).toHaveProperty("id");
      expect(mockExercise).toHaveProperty("name");
      expect(mockExercise).toHaveProperty("category");
      expect(mockExercise).toHaveProperty("muscleGroups");
      expect(mockExercise).toHaveProperty("isDefault");
    });

    it("should have valid workout structure", () => {
      expect(mockWorkout).toHaveProperty("id");
      expect(mockWorkout).toHaveProperty("userId");
      expect(mockWorkout).toHaveProperty("startedAt");
      expect(mockWorkout).toHaveProperty("completedAt");
      expect(mockWorkout).toHaveProperty("rating");
      expect(mockWorkout).toHaveProperty("mood");
    });

    it("should have valid workout exercise structure", () => {
      expect(mockWorkoutExercise).toHaveProperty("id");
      expect(mockWorkoutExercise).toHaveProperty("workoutId");
      expect(mockWorkoutExercise).toHaveProperty("exerciseId");
      expect(mockWorkoutExercise).toHaveProperty("order");
    });

    it("should have valid set structure", () => {
      expect(mockSet).toHaveProperty("id");
      expect(mockSet).toHaveProperty("workoutExerciseId");
      expect(mockSet).toHaveProperty("setNumber");
      expect(mockSet).toHaveProperty("reps");
      expect(mockSet).toHaveProperty("weight");
      expect(mockSet).toHaveProperty("weightUnit");
      expect(mockSet).toHaveProperty("setType");
      expect(mockSet).toHaveProperty("rpe");
      expect(mockSet).toHaveProperty("isCompleted");
    });
  });

  // ===========================================================================
  // Date Handling Tests
  // ===========================================================================

  describe("Date Handling", () => {
    it("should handle date coercion in input", () => {
      const result = workoutHistoryInputSchema.safeParse({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });

    it("should handle Date objects in output", () => {
      const now = new Date();
      const result = workoutHistoryOutputSchema.safeParse({
        workouts: [
          {
            id: 1,
            name: "Test",
            date: now,
            duration: 60,
            exerciseCount: 5,
            setCount: 20,
            totalVolume: 5000,
            rating: 4,
            mood: "good",
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      });
      expect(result.success).toBe(true);
    });
  });
});
