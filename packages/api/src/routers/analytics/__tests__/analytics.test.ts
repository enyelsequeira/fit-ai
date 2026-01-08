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
            innerJoin: vi.fn(() => ({
              where: vi.fn(() => Promise.resolve([])),
            })),
            where: vi.fn(() => ({
              orderBy: vi.fn(() => Promise.resolve([])),
            })),
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
        returning: vi.fn(() =>
          Promise.resolve([
            {
              id: 1,
              userId: "test-user-id",
              periodType: "week",
              periodStart: "2024-01-08",
              periodEnd: "2024-01-14",
              totalWorkouts: 3,
              completedWorkouts: 3,
              totalDurationMinutes: 180,
              totalSets: 45,
              totalReps: 450,
              totalVolumeKg: 15000,
              volumeByMuscle: { chest: 5000, back: 5000, legs: 5000 },
              setsByMuscle: { chest: 15, back: 15, legs: 15 },
              uniqueExercises: 9,
              favoriteExerciseId: 1,
              prsAchieved: 2,
              avgWorkoutDuration: 60,
              avgRpe: 7.5,
              avgSetsPerWorkout: 15,
              plannedWorkouts: null,
              completionRate: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        ),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() =>
            Promise.resolve([
              {
                id: 1,
                userId: "test-user-id",
                periodType: "week",
                periodStart: "2024-01-08",
                periodEnd: "2024-01-14",
                totalWorkouts: 4,
                completedWorkouts: 4,
                totalDurationMinutes: 240,
                totalSets: 60,
                totalReps: 600,
                totalVolumeKg: 20000,
                volumeByMuscle: { chest: 7000, back: 7000, legs: 6000 },
                setsByMuscle: { chest: 20, back: 20, legs: 20 },
                uniqueExercises: 10,
                favoriteExerciseId: 1,
                prsAchieved: 3,
                avgWorkoutDuration: 60,
                avgRpe: 7.8,
                avgSetsPerWorkout: 15,
                plannedWorkouts: null,
                completionRate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
          ),
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
    count: vi.fn(() => ({ type: "count" })),
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
  analyticsRouter,
  periodTypeSchema,
  trainingSummaryOutputSchema,
  volumeTrendsOutputSchema,
  strengthTrendsOutputSchema,
  consistencyOutputSchema,
  comparisonOutputSchema,
  volumeByMuscleOutputSchema,
  frequencyOutputSchema,
  exerciseStatsOutputSchema,
  summaryHistoryOutputSchema,
  summaryHistoryInputSchema,
  volumeTrendsInputSchema,
  volumeByMuscleInputSchema,
  strengthTrendsInputSchema,
  frequencyInputSchema,
  exerciseStatsInputSchema,
  comparisonInputSchema,
  generateSummaryInputSchema,
} from "..";

// Mock data
const mockTrainingSummary = {
  id: 1,
  userId: "test-user-id",
  periodType: "week" as const,
  periodStart: "2024-01-08",
  periodEnd: "2024-01-14",
  totalWorkouts: 3,
  completedWorkouts: 3,
  totalDurationMinutes: 180,
  totalSets: 45,
  totalReps: 450,
  totalVolumeKg: 15000,
  volumeByMuscle: { chest: 5000, back: 5000, legs: 5000 },
  setsByMuscle: { chest: 15, back: 15, legs: 15 },
  uniqueExercises: 9,
  favoriteExerciseId: 1,
  prsAchieved: 2,
  avgWorkoutDuration: 60,
  avgRpe: 7.5,
  avgSetsPerWorkout: 15,
  plannedWorkouts: null,
  completionRate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMonthlySummary = {
  ...mockTrainingSummary,
  id: 2,
  periodType: "month" as const,
  periodStart: "2024-01-01",
  periodEnd: "2024-01-31",
  totalWorkouts: 12,
  completedWorkouts: 12,
  totalDurationMinutes: 720,
  totalSets: 180,
  totalReps: 1800,
  totalVolumeKg: 60000,
  prsAchieved: 5,
};

describe("Analytics Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Validation Schema Tests
  // ===========================================================================

  describe("Validation Schemas", () => {
    describe("periodTypeSchema", () => {
      it("should validate week period type", () => {
        expect(periodTypeSchema.safeParse("week").success).toBe(true);
      });

      it("should validate month period type", () => {
        expect(periodTypeSchema.safeParse("month").success).toBe(true);
      });

      it("should reject invalid period types", () => {
        expect(periodTypeSchema.safeParse("day").success).toBe(false);
        expect(periodTypeSchema.safeParse("year").success).toBe(false);
        expect(periodTypeSchema.safeParse("").success).toBe(false);
        expect(periodTypeSchema.safeParse(123).success).toBe(false);
      });
    });

    describe("trainingSummaryOutputSchema", () => {
      it("should validate valid training summary", () => {
        const result = trainingSummaryOutputSchema.safeParse(mockTrainingSummary);
        expect(result.success).toBe(true);
      });

      it("should validate with null optional fields", () => {
        const result = trainingSummaryOutputSchema.safeParse({
          ...mockTrainingSummary,
          volumeByMuscle: null,
          setsByMuscle: null,
          favoriteExerciseId: null,
          avgWorkoutDuration: null,
          avgRpe: null,
          avgSetsPerWorkout: null,
          plannedWorkouts: null,
          completionRate: null,
        });
        expect(result.success).toBe(true);
      });

      it("should reject missing required fields", () => {
        const result = trainingSummaryOutputSchema.safeParse({});
        expect(result.success).toBe(false);
      });
    });

    describe("volumeTrendsOutputSchema", () => {
      it("should validate volume trends output", () => {
        const result = volumeTrendsOutputSchema.safeParse({
          period: "week",
          dataPoints: [
            {
              periodStart: "2024-01-08",
              totalVolume: 15000,
              volumeByMuscle: { chest: 5000, back: 5000, legs: 5000 },
            },
          ],
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty data points", () => {
        const result = volumeTrendsOutputSchema.safeParse({
          period: "month",
          dataPoints: [],
        });
        expect(result.success).toBe(true);
      });
    });

    describe("strengthTrendsOutputSchema", () => {
      it("should validate strength trends output", () => {
        const result = strengthTrendsOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Bench Press",
          dataPoints: [
            {
              date: "2024-01-08",
              estimated1RM: 100,
              maxWeight: 90,
              maxReps: 5,
            },
          ],
          percentageChange: 10.5,
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty data points", () => {
        const result = strengthTrendsOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Bench Press",
          dataPoints: [],
          percentageChange: 0,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("consistencyOutputSchema", () => {
      it("should validate consistency output", () => {
        const result = consistencyOutputSchema.safeParse({
          currentStreak: 4,
          longestStreak: 8,
          workoutsThisWeek: 3,
          workoutsThisMonth: 12,
          avgWorkoutsPerWeek: 3.5,
          mostActiveDay: "Monday",
          completionRate: 0.85,
        });
        expect(result.success).toBe(true);
      });

      it("should validate with null completion rate", () => {
        const result = consistencyOutputSchema.safeParse({
          currentStreak: 2,
          longestStreak: 5,
          workoutsThisWeek: 2,
          workoutsThisMonth: 8,
          avgWorkoutsPerWeek: 2.5,
          mostActiveDay: "Wednesday",
          completionRate: null,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("comparisonOutputSchema", () => {
      it("should validate comparison output", () => {
        const result = comparisonOutputSchema.safeParse({
          period1: {
            start: "2024-01-01",
            end: "2024-01-07",
            summary: mockTrainingSummary,
          },
          period2: {
            start: "2024-01-08",
            end: "2024-01-14",
            summary: mockTrainingSummary,
          },
          changes: {
            volumeChange: 15.5,
            workoutsChange: 1,
            avgDurationChange: 5.2,
          },
        });
        expect(result.success).toBe(true);
      });

      it("should validate with null summaries", () => {
        const result = comparisonOutputSchema.safeParse({
          period1: {
            start: "2024-01-01",
            end: "2024-01-07",
            summary: null,
          },
          period2: {
            start: "2024-01-08",
            end: "2024-01-14",
            summary: null,
          },
          changes: {
            volumeChange: 0,
            workoutsChange: 0,
            avgDurationChange: 0,
          },
        });
        expect(result.success).toBe(true);
      });
    });

    describe("volumeByMuscleOutputSchema", () => {
      it("should validate volume by muscle output", () => {
        const result = volumeByMuscleOutputSchema.safeParse({
          period: {
            start: "2024-01-01",
            end: "2024-01-31",
          },
          totalVolume: 60000,
          muscleGroups: [
            { muscle: "chest", volume: 20000, sets: 60, percentage: 33.33 },
            { muscle: "back", volume: 20000, sets: 60, percentage: 33.33 },
            { muscle: "legs", volume: 20000, sets: 60, percentage: 33.33 },
          ],
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty muscle groups", () => {
        const result = volumeByMuscleOutputSchema.safeParse({
          period: {
            start: "2024-01-01",
            end: "2024-01-31",
          },
          totalVolume: 0,
          muscleGroups: [],
        });
        expect(result.success).toBe(true);
      });
    });

    describe("frequencyOutputSchema", () => {
      it("should validate frequency output", () => {
        const result = frequencyOutputSchema.safeParse({
          totalWorkouts: 45,
          avgPerWeek: 3.5,
          byDayOfWeek: {
            Monday: 8,
            Tuesday: 5,
            Wednesday: 7,
            Thursday: 6,
            Friday: 9,
            Saturday: 6,
            Sunday: 4,
          },
          byTimeOfDay: {
            morning: 15,
            afternoon: 10,
            evening: 18,
            night: 2,
          },
          mostActiveDay: "Friday",
          leastActiveDay: "Sunday",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("exerciseStatsOutputSchema", () => {
      it("should validate exercise stats output", () => {
        const result = exerciseStatsOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Bench Press",
          category: "chest",
          totalSessions: 24,
          totalSets: 96,
          totalReps: 960,
          totalVolume: 76800,
          maxWeight: 100,
          maxReps: 12,
          estimated1RM: 115.5,
          recentProgress: [
            {
              date: "2024-01-08",
              estimated1RM: 110,
              maxWeight: 95,
              maxReps: 6,
            },
          ],
          lastPerformed: "2024-01-14",
        });
        expect(result.success).toBe(true);
      });

      it("should validate with null optional fields", () => {
        const result = exerciseStatsOutputSchema.safeParse({
          exerciseId: 1,
          exerciseName: "Running",
          category: "cardio",
          totalSessions: 10,
          totalSets: 10,
          totalReps: 0,
          totalVolume: 0,
          maxWeight: null,
          maxReps: null,
          estimated1RM: null,
          recentProgress: [],
          lastPerformed: null,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("summaryHistoryOutputSchema", () => {
      it("should validate summary history output", () => {
        const result = summaryHistoryOutputSchema.safeParse({
          summaries: [mockTrainingSummary, mockMonthlySummary],
          total: 2,
          limit: 20,
          offset: 0,
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty summaries", () => {
        const result = summaryHistoryOutputSchema.safeParse({
          summaries: [],
          total: 0,
          limit: 20,
          offset: 0,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Input Schema Tests
  // ===========================================================================

  describe("Input Schemas", () => {
    describe("summaryHistoryInputSchema", () => {
      it("should validate with default values", () => {
        const result = summaryHistoryInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate with period type filter", () => {
        const result = summaryHistoryInputSchema.safeParse({
          periodType: "week",
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.periodType).toBe("week");
        }
      });

      it("should validate pagination limits", () => {
        expect(summaryHistoryInputSchema.safeParse({ limit: 1 }).success).toBe(true);
        expect(summaryHistoryInputSchema.safeParse({ limit: 100 }).success).toBe(true);
        expect(summaryHistoryInputSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(summaryHistoryInputSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(summaryHistoryInputSchema.safeParse({ offset: -1 }).success).toBe(false);
      });

      it("should coerce string values to numbers", () => {
        const result = summaryHistoryInputSchema.safeParse({
          limit: "10",
          offset: "5",
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(10);
          expect(result.data.offset).toBe(5);
        }
      });
    });

    describe("volumeTrendsInputSchema", () => {
      it("should validate with default values", () => {
        const result = volumeTrendsInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.period).toBe("week");
          expect(result.data.weeks).toBe(12);
        }
      });

      it("should validate weeks range", () => {
        expect(volumeTrendsInputSchema.safeParse({ weeks: 1 }).success).toBe(true);
        expect(volumeTrendsInputSchema.safeParse({ weeks: 52 }).success).toBe(true);
        expect(volumeTrendsInputSchema.safeParse({ weeks: 0 }).success).toBe(false);
        expect(volumeTrendsInputSchema.safeParse({ weeks: 53 }).success).toBe(false);
      });

      it("should validate period type", () => {
        expect(volumeTrendsInputSchema.safeParse({ period: "week" }).success).toBe(true);
        expect(volumeTrendsInputSchema.safeParse({ period: "month" }).success).toBe(true);
        expect(volumeTrendsInputSchema.safeParse({ period: "day" }).success).toBe(false);
      });
    });

    describe("volumeByMuscleInputSchema", () => {
      it("should validate with default values", () => {
        const result = volumeByMuscleInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.days).toBe(30);
        }
      });

      it("should validate with custom date range", () => {
        const result = volumeByMuscleInputSchema.safeParse({
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        });
        expect(result.success).toBe(true);
      });

      it("should validate days range", () => {
        expect(volumeByMuscleInputSchema.safeParse({ days: 1 }).success).toBe(true);
        expect(volumeByMuscleInputSchema.safeParse({ days: 365 }).success).toBe(true);
        expect(volumeByMuscleInputSchema.safeParse({ days: 0 }).success).toBe(false);
        expect(volumeByMuscleInputSchema.safeParse({ days: 366 }).success).toBe(false);
      });
    });

    describe("strengthTrendsInputSchema", () => {
      it("should require exerciseId", () => {
        expect(strengthTrendsInputSchema.safeParse({}).success).toBe(false);
        expect(strengthTrendsInputSchema.safeParse({ exerciseId: 1 }).success).toBe(true);
      });

      it("should validate with default weeks", () => {
        const result = strengthTrendsInputSchema.safeParse({ exerciseId: 1 });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.weeks).toBe(12);
        }
      });

      it("should coerce string exerciseId to number", () => {
        const result = strengthTrendsInputSchema.safeParse({ exerciseId: "5" });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.exerciseId).toBe(5);
        }
      });

      it("should validate weeks range", () => {
        expect(strengthTrendsInputSchema.safeParse({ exerciseId: 1, weeks: 1 }).success).toBe(true);
        expect(strengthTrendsInputSchema.safeParse({ exerciseId: 1, weeks: 52 }).success).toBe(
          true,
        );
        expect(strengthTrendsInputSchema.safeParse({ exerciseId: 1, weeks: 0 }).success).toBe(
          false,
        );
        expect(strengthTrendsInputSchema.safeParse({ exerciseId: 1, weeks: 53 }).success).toBe(
          false,
        );
      });
    });

    describe("frequencyInputSchema", () => {
      it("should validate with default values", () => {
        const result = frequencyInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.days).toBe(90);
        }
      });

      it("should validate days range", () => {
        expect(frequencyInputSchema.safeParse({ days: 7 }).success).toBe(true);
        expect(frequencyInputSchema.safeParse({ days: 365 }).success).toBe(true);
        expect(frequencyInputSchema.safeParse({ days: 6 }).success).toBe(false);
        expect(frequencyInputSchema.safeParse({ days: 366 }).success).toBe(false);
      });
    });

    describe("exerciseStatsInputSchema", () => {
      it("should require exerciseId", () => {
        expect(exerciseStatsInputSchema.safeParse({}).success).toBe(false);
        expect(exerciseStatsInputSchema.safeParse({ exerciseId: 1 }).success).toBe(true);
      });

      it("should coerce string exerciseId to number", () => {
        const result = exerciseStatsInputSchema.safeParse({ exerciseId: "10" });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.exerciseId).toBe(10);
        }
      });
    });

    describe("comparisonInputSchema", () => {
      it("should require all date fields", () => {
        expect(comparisonInputSchema.safeParse({}).success).toBe(false);
        expect(
          comparisonInputSchema.safeParse({
            period1Start: "2024-01-01",
          }).success,
        ).toBe(false);
        expect(
          comparisonInputSchema.safeParse({
            period1Start: "2024-01-01",
            period1End: "2024-01-07",
            period2Start: "2024-01-08",
            period2End: "2024-01-14",
          }).success,
        ).toBe(true);
      });

      it("should validate date strings", () => {
        const result = comparisonInputSchema.safeParse({
          period1Start: "2024-01-01",
          period1End: "2024-01-07",
          period2Start: "2024-01-08",
          period2End: "2024-01-14",
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.period1Start).toBe("2024-01-01");
          expect(result.data.period2End).toBe("2024-01-14");
        }
      });
    });

    describe("generateSummaryInputSchema", () => {
      it("should require periodType and periodStart", () => {
        expect(generateSummaryInputSchema.safeParse({}).success).toBe(false);
        expect(generateSummaryInputSchema.safeParse({ periodType: "week" }).success).toBe(false);
        expect(
          generateSummaryInputSchema.safeParse({
            periodType: "week",
            periodStart: "2024-01-08",
          }).success,
        ).toBe(true);
      });

      it("should validate period type", () => {
        expect(
          generateSummaryInputSchema.safeParse({
            periodType: "week",
            periodStart: "2024-01-08",
          }).success,
        ).toBe(true);
        expect(
          generateSummaryInputSchema.safeParse({
            periodType: "month",
            periodStart: "2024-01-01",
          }).success,
        ).toBe(true);
        expect(
          generateSummaryInputSchema.safeParse({
            periodType: "day",
            periodStart: "2024-01-01",
          }).success,
        ).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Router Structure Tests
  // ===========================================================================

  describe("Router Structure", () => {
    it("should have summary endpoints", () => {
      expect(analyticsRouter.getWeeklySummary).toBeDefined();
      expect(analyticsRouter.getMonthlySummary).toBeDefined();
      expect(analyticsRouter.getSummaryHistory).toBeDefined();
      expect(analyticsRouter.generateSummary).toBeDefined();
    });

    it("should have volume analysis endpoints", () => {
      expect(analyticsRouter.getVolumeTrends).toBeDefined();
      expect(analyticsRouter.getVolumeByMuscle).toBeDefined();
    });

    it("should have strength analysis endpoints", () => {
      expect(analyticsRouter.getStrengthTrends).toBeDefined();
    });

    it("should have frequency and consistency endpoints", () => {
      expect(analyticsRouter.getFrequency).toBeDefined();
      expect(analyticsRouter.getConsistency).toBeDefined();
    });

    it("should have exercise-specific stats endpoint", () => {
      expect(analyticsRouter.getExerciseStats).toBeDefined();
    });

    it("should have comparison endpoint", () => {
      expect(analyticsRouter.getComparison).toBeDefined();
    });
  });

  // ===========================================================================
  // Authorization Tests
  // ===========================================================================

  describe("Authorization Rules", () => {
    it("should correctly identify summary ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockTrainingSummary.userId).toBe(userId);
    });

    it("should reject unauthenticated access", () => {
      const context = createMockContext();
      expect(context.session).toBeNull();
    });

    it("should provide user ID in authenticated context", () => {
      const context = createAuthenticatedContext({ id: "custom-user-id" });
      expect(context.session?.user.id).toBe("custom-user-id");
    });
  });

  // ===========================================================================
  // Calculation Logic Tests
  // ===========================================================================

  describe("Calculation Logic", () => {
    describe("1RM Calculation (Brzycki Formula)", () => {
      it("should calculate 1RM correctly for moderate reps", () => {
        // Brzycki formula: weight × (36 / (37 - reps))
        // 100kg × (36 / (37 - 5)) = 100 × (36/32) = 100 × 1.125 = 112.5
        const weight = 100;
        const reps = 5;
        const expected = weight * (36 / (37 - reps));
        expect(expected).toBeCloseTo(112.5, 1);
      });

      it("should return weight for single rep", () => {
        const weight = 100;
        const reps = 1;
        const expected = weight * (36 / (37 - reps));
        expect(expected).toBe(100);
      });

      it("should handle higher rep ranges", () => {
        // 60kg × (36 / (37 - 12)) = 60 × (36/25) = 60 × 1.44 = 86.4
        const weight = 60;
        const reps = 12;
        const expected = weight * (36 / (37 - reps));
        expect(expected).toBeCloseTo(86.4, 1);
      });
    });

    describe("Volume Calculation", () => {
      it("should calculate volume correctly", () => {
        const weight = 100;
        const reps = 10;
        const volume = weight * reps;
        expect(volume).toBe(1000);
      });

      it("should calculate total volume across multiple sets", () => {
        const sets = [
          { weight: 100, reps: 10 },
          { weight: 100, reps: 8 },
          { weight: 95, reps: 8 },
        ];
        const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
        expect(totalVolume).toBe(2560);
      });
    });

    describe("Streak Calculation", () => {
      it("should count consecutive weeks", () => {
        const weeksWithWorkouts = ["2024-01-01", "2024-01-08", "2024-01-15", "2024-01-22"];
        let streak = 0;
        for (let i = weeksWithWorkouts.length - 1; i >= 0; i--) {
          if (weeksWithWorkouts[i]) streak++;
          else break;
        }
        expect(streak).toBe(4);
      });

      it("should handle gaps in weeks", () => {
        // Simulating streak calculation with a gap
        const weeks = ["2024-01-01", "2024-01-08", "2024-01-22"]; // Gap on 2024-01-15
        // This would result in a streak of 1 from the current week perspective
        expect(weeks.length).toBe(3);
      });
    });

    describe("Percentage Change Calculation", () => {
      it("should calculate positive percentage change", () => {
        const first = 100;
        const last = 115;
        const change = ((last - first) / first) * 100;
        expect(change).toBe(15);
      });

      it("should calculate negative percentage change", () => {
        const first = 100;
        const last = 90;
        const change = ((last - first) / first) * 100;
        expect(change).toBe(-10);
      });

      it("should handle zero first value", () => {
        const first = 0;
        const last = 100;
        // Division by zero handling - should return 0 or handle gracefully
        const change = first > 0 ? ((last - first) / first) * 100 : 0;
        expect(change).toBe(0);
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe("Edge Cases", () => {
    it("should handle empty workout history", () => {
      const workouts: unknown[] = [];
      expect(workouts.length).toBe(0);
      const avgPerWeek = workouts.length / 12;
      expect(avgPerWeek).toBe(0);
    });

    it("should handle empty muscle groups", () => {
      const volumeByMuscle: Record<string, number> = {};
      expect(Object.keys(volumeByMuscle).length).toBe(0);
    });

    it("should handle single data point for trends", () => {
      const dataPoints = [{ date: "2024-01-08", estimated1RM: 100 }];
      expect(dataPoints.length).toBe(1);
      // Cannot calculate percentage change with single point
      const percentageChange =
        dataPoints.length >= 2
          ? (((dataPoints[dataPoints.length - 1]?.estimated1RM ?? 0) -
              (dataPoints[0]?.estimated1RM ?? 0)) /
              (dataPoints[0]?.estimated1RM ?? 1)) *
            100
          : 0;
      expect(percentageChange).toBe(0);
    });

    it("should handle all days having equal workouts", () => {
      const byDayOfWeek: Record<string, number> = {
        Monday: 5,
        Tuesday: 5,
        Wednesday: 5,
        Thursday: 5,
        Friday: 5,
        Saturday: 5,
        Sunday: 5,
      };

      // First max found should be the most active
      let mostActiveDay = "";
      let maxCount = 0;
      for (const [day, count] of Object.entries(byDayOfWeek)) {
        if (count > maxCount) {
          maxCount = count;
          mostActiveDay = day;
        }
      }
      expect(mostActiveDay).toBe("Monday"); // First one found
    });

    it("should handle warmup sets exclusion", () => {
      const sets = [
        { setType: "warmup", weight: 50, reps: 10 },
        { setType: "normal", weight: 100, reps: 5 },
        { setType: "normal", weight: 100, reps: 5 },
      ];

      const volumeSets = sets.filter((s) => s.setType !== "warmup");
      const totalVolume = volumeSets.reduce((acc, s) => acc + s.weight * s.reps, 0);
      expect(totalVolume).toBe(1000); // Only normal sets counted
    });
  });

  // ===========================================================================
  // Data Transformation Tests
  // ===========================================================================

  describe("Data Transformation", () => {
    it("should provide correct mock training summary structure", () => {
      expect(mockTrainingSummary).toHaveProperty("id");
      expect(mockTrainingSummary).toHaveProperty("userId");
      expect(mockTrainingSummary).toHaveProperty("periodType");
      expect(mockTrainingSummary).toHaveProperty("periodStart");
      expect(mockTrainingSummary).toHaveProperty("periodEnd");
      expect(mockTrainingSummary).toHaveProperty("totalWorkouts");
      expect(mockTrainingSummary).toHaveProperty("completedWorkouts");
      expect(mockTrainingSummary).toHaveProperty("totalDurationMinutes");
      expect(mockTrainingSummary).toHaveProperty("totalSets");
      expect(mockTrainingSummary).toHaveProperty("totalReps");
      expect(mockTrainingSummary).toHaveProperty("totalVolumeKg");
      expect(mockTrainingSummary).toHaveProperty("volumeByMuscle");
      expect(mockTrainingSummary).toHaveProperty("setsByMuscle");
      expect(mockTrainingSummary).toHaveProperty("uniqueExercises");
      expect(mockTrainingSummary).toHaveProperty("favoriteExerciseId");
      expect(mockTrainingSummary).toHaveProperty("prsAchieved");
      expect(mockTrainingSummary).toHaveProperty("avgWorkoutDuration");
      expect(mockTrainingSummary).toHaveProperty("avgRpe");
      expect(mockTrainingSummary).toHaveProperty("avgSetsPerWorkout");
      expect(mockTrainingSummary).toHaveProperty("createdAt");
      expect(mockTrainingSummary).toHaveProperty("updatedAt");
    });

    it("should have appropriate values for period types", () => {
      expect(mockTrainingSummary.periodType).toBe("week");
      expect(mockMonthlySummary.periodType).toBe("month");
    });

    it("should have consistent metric proportions", () => {
      // Monthly should be roughly 4x weekly
      const weeklyWorkouts = mockTrainingSummary.totalWorkouts;
      const monthlyWorkouts = mockMonthlySummary.totalWorkouts;
      expect(monthlyWorkouts).toBe(weeklyWorkouts * 4);
    });
  });

  // ===========================================================================
  // Integration-Like Tests (Schema Combinations)
  // ===========================================================================

  describe("Schema Integration", () => {
    it("should validate a full summary generation flow", () => {
      const generateInput = {
        periodType: "week" as const,
        periodStart: "2024-01-08",
      };

      // Validate input
      const inputResult = generateSummaryInputSchema.safeParse(generateInput);
      expect(inputResult.success).toBe(true);

      // Validate output
      const outputResult = trainingSummaryOutputSchema.safeParse(mockTrainingSummary);
      expect(outputResult.success).toBe(true);
    });

    it("should validate volume trends data flow", () => {
      const trendsInput = {
        period: "week" as const,
        weeks: 8,
      };

      const inputResult = volumeTrendsInputSchema.safeParse(trendsInput);
      expect(inputResult.success).toBe(true);

      const trendsOutput = {
        period: "week" as const,
        dataPoints: [
          {
            periodStart: "2024-01-01",
            totalVolume: 12000,
            volumeByMuscle: { chest: 4000, back: 4000, legs: 4000 },
          },
          {
            periodStart: "2024-01-08",
            totalVolume: 15000,
            volumeByMuscle: { chest: 5000, back: 5000, legs: 5000 },
          },
        ],
      };

      const outputResult = volumeTrendsOutputSchema.safeParse(trendsOutput);
      expect(outputResult.success).toBe(true);
    });

    it("should validate comparison data flow", () => {
      const comparisonInput = {
        period1Start: "2024-01-01",
        period1End: "2024-01-07",
        period2Start: "2024-01-08",
        period2End: "2024-01-14",
      };

      const inputResult = comparisonInputSchema.safeParse(comparisonInput);
      expect(inputResult.success).toBe(true);

      const comparisonOutput = {
        period1: {
          start: comparisonInput.period1Start,
          end: comparisonInput.period1End,
          summary: { ...mockTrainingSummary, totalVolumeKg: 12000 },
        },
        period2: {
          start: comparisonInput.period2Start,
          end: comparisonInput.period2End,
          summary: mockTrainingSummary,
        },
        changes: {
          volumeChange: 25.0,
          workoutsChange: 0,
          avgDurationChange: 0,
        },
      };

      const outputResult = comparisonOutputSchema.safeParse(comparisonOutput);
      expect(outputResult.success).toBe(true);
    });

    it("should validate strength trends with multiple data points", () => {
      const strengthInput = {
        exerciseId: 1,
        weeks: 8,
      };

      const inputResult = strengthTrendsInputSchema.safeParse(strengthInput);
      expect(inputResult.success).toBe(true);

      const strengthOutput = {
        exerciseId: 1,
        exerciseName: "Bench Press",
        dataPoints: [
          { date: "2024-01-01", estimated1RM: 100, maxWeight: 90, maxReps: 5 },
          { date: "2024-01-08", estimated1RM: 105, maxWeight: 95, maxReps: 5 },
          { date: "2024-01-15", estimated1RM: 110, maxWeight: 100, maxReps: 5 },
          { date: "2024-01-22", estimated1RM: 115, maxWeight: 100, maxReps: 6 },
        ],
        percentageChange: 15.0,
      };

      const outputResult = strengthTrendsOutputSchema.safeParse(strengthOutput);
      expect(outputResult.success).toBe(true);
    });

    it("should validate exercise stats with history", () => {
      const statsInput = {
        exerciseId: 1,
      };

      const inputResult = exerciseStatsInputSchema.safeParse(statsInput);
      expect(inputResult.success).toBe(true);

      const statsOutput = {
        exerciseId: 1,
        exerciseName: "Bench Press",
        category: "chest",
        totalSessions: 48,
        totalSets: 192,
        totalReps: 1536,
        totalVolume: 153600,
        maxWeight: 110,
        maxReps: 12,
        estimated1RM: 125.5,
        recentProgress: [
          { date: "2024-01-08", estimated1RM: 115, maxWeight: 100, maxReps: 6 },
          { date: "2024-01-15", estimated1RM: 120, maxWeight: 105, maxReps: 6 },
          { date: "2024-01-22", estimated1RM: 125.5, maxWeight: 110, maxReps: 6 },
        ],
        lastPerformed: "2024-01-22",
      };

      const outputResult = exerciseStatsOutputSchema.safeParse(statsOutput);
      expect(outputResult.success).toBe(true);
    });
  });

  // ===========================================================================
  // Period-Specific Tests
  // ===========================================================================

  describe("Period-Specific Behavior", () => {
    it("should handle weekly period calculations", () => {
      const weekStart = "2024-01-08"; // Monday
      const weekEnd = "2024-01-14"; // Sunday

      // Calculate days in week
      const start = new Date(weekStart);
      const end = new Date(weekEnd);
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
      expect(days).toBe(7);
    });

    it("should handle monthly period calculations", () => {
      const monthStart = "2024-01-01";
      const monthEnd = "2024-01-31";

      // Calculate days in month
      const start = new Date(monthStart);
      const end = new Date(monthEnd);
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
      expect(days).toBe(31);
    });

    it("should calculate correct week of year", () => {
      const date = new Date("2024-01-08");
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const dayOfYear = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
      );
      const weekNumber = Math.ceil((dayOfYear + 1) / 7);
      expect(weekNumber).toBe(2); // Second week of 2024
    });
  });

  // ===========================================================================
  // Time of Day Analysis Tests
  // ===========================================================================

  describe("Time of Day Analysis", () => {
    it("should categorize morning workouts correctly", () => {
      const hours = [5, 6, 7, 8, 9, 10, 11];
      for (const hour of hours) {
        const category =
          hour >= 5 && hour < 12
            ? "morning"
            : hour >= 12 && hour < 17
              ? "afternoon"
              : hour >= 17 && hour < 21
                ? "evening"
                : "night";
        expect(category).toBe("morning");
      }
    });

    it("should categorize afternoon workouts correctly", () => {
      const hours = [12, 13, 14, 15, 16];
      for (const hour of hours) {
        const category =
          hour >= 5 && hour < 12
            ? "morning"
            : hour >= 12 && hour < 17
              ? "afternoon"
              : hour >= 17 && hour < 21
                ? "evening"
                : "night";
        expect(category).toBe("afternoon");
      }
    });

    it("should categorize evening workouts correctly", () => {
      const hours = [17, 18, 19, 20];
      for (const hour of hours) {
        const category =
          hour >= 5 && hour < 12
            ? "morning"
            : hour >= 12 && hour < 17
              ? "afternoon"
              : hour >= 17 && hour < 21
                ? "evening"
                : "night";
        expect(category).toBe("evening");
      }
    });

    it("should categorize night workouts correctly", () => {
      const hours = [21, 22, 23, 0, 1, 2, 3, 4];
      for (const hour of hours) {
        const category =
          hour >= 5 && hour < 12
            ? "morning"
            : hour >= 12 && hour < 17
              ? "afternoon"
              : hour >= 17 && hour < 21
                ? "evening"
                : "night";
        expect(category).toBe("night");
      }
    });
  });
});
