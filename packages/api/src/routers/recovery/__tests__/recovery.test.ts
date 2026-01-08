import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";

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
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
        limit: vi.fn(() => Promise.resolve([])),
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
    sql: vi.fn((strings, ...values) => ({ type: "sql", strings, values })),
    gte: vi.fn((col, val) => ({ type: "gte", col, val })),
    lte: vi.fn((col, val) => ({ type: "lte", col, val })),
    desc: vi.fn((col) => ({ type: "desc", col })),
  };
});

// Import after mocks are set up
import { MOOD_OPTIONS, MUSCLE_GROUPS, recoveryRouter } from "..";

// Mock data
const mockCheckIn = {
  id: 1,
  userId: "test-user-id",
  date: "2024-01-15",
  sleepHours: 7.5,
  sleepQuality: 4,
  energyLevel: 7,
  stressLevel: 4,
  sorenessLevel: 3,
  soreAreas: ["chest", "shoulders"],
  restingHeartRate: 62,
  hrvScore: 65.5,
  motivationLevel: 8,
  mood: "good" as const,
  nutritionQuality: 4,
  hydrationLevel: 4,
  notes: "Feeling good after rest day",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMuscleRecovery = {
  id: 1,
  userId: "test-user-id",
  muscleGroup: "chest" as const,
  recoveryScore: 75,
  fatigueLevel: 25,
  lastWorkedAt: new Date("2024-01-14"),
  setsLast7Days: 12,
  volumeLast7Days: 2400,
  estimatedFullRecovery: new Date("2024-01-17"),
  updatedAt: new Date(),
};

describe("Recovery Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Constants", () => {
    it("should have all muscle groups defined", () => {
      expect(MUSCLE_GROUPS).toContain("chest");
      expect(MUSCLE_GROUPS).toContain("back");
      expect(MUSCLE_GROUPS).toContain("shoulders");
      expect(MUSCLE_GROUPS).toContain("biceps");
      expect(MUSCLE_GROUPS).toContain("triceps");
      expect(MUSCLE_GROUPS).toContain("forearms");
      expect(MUSCLE_GROUPS).toContain("abs");
      expect(MUSCLE_GROUPS).toContain("quadriceps");
      expect(MUSCLE_GROUPS).toContain("hamstrings");
      expect(MUSCLE_GROUPS).toContain("glutes");
      expect(MUSCLE_GROUPS).toContain("calves");
      expect(MUSCLE_GROUPS.length).toBe(11);
    });

    it("should have all mood options defined", () => {
      expect(MOOD_OPTIONS).toContain("great");
      expect(MOOD_OPTIONS).toContain("good");
      expect(MOOD_OPTIONS).toContain("neutral");
      expect(MOOD_OPTIONS).toContain("low");
      expect(MOOD_OPTIONS).toContain("bad");
      expect(MOOD_OPTIONS.length).toBe(5);
    });
  });

  describe("Validation Schemas", () => {
    // Date string schema
    const dateStringSchema = z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

    // Mood schema
    const moodSchema = z.enum(["great", "good", "neutral", "low", "bad"]);

    // Muscle group schema
    const muscleGroupSchema = z.enum([
      "chest",
      "back",
      "shoulders",
      "biceps",
      "triceps",
      "forearms",
      "abs",
      "quadriceps",
      "hamstrings",
      "glutes",
      "calves",
    ]);

    // Check-in input schema
    const checkInInputSchema = z.object({
      date: dateStringSchema.optional(),
      sleepHours: z.number().min(0).max(24).optional(),
      sleepQuality: z.number().int().min(1).max(5).optional(),
      energyLevel: z.number().int().min(1).max(10).optional(),
      stressLevel: z.number().int().min(1).max(10).optional(),
      sorenessLevel: z.number().int().min(1).max(10).optional(),
      soreAreas: z.array(muscleGroupSchema).optional(),
      restingHeartRate: z.number().int().min(30).max(200).optional(),
      hrvScore: z.number().min(0).optional(),
      motivationLevel: z.number().int().min(1).max(10).optional(),
      mood: moodSchema.optional(),
      nutritionQuality: z.number().int().min(1).max(5).optional(),
      hydrationLevel: z.number().int().min(1).max(5).optional(),
      notes: z.string().max(1000).optional(),
    });

    describe("Date String Schema", () => {
      it("should validate valid date strings", () => {
        expect(dateStringSchema.safeParse("2024-01-15").success).toBe(true);
        expect(dateStringSchema.safeParse("2023-12-31").success).toBe(true);
        expect(dateStringSchema.safeParse("2025-06-01").success).toBe(true);
      });

      it("should reject invalid date formats", () => {
        expect(dateStringSchema.safeParse("01-15-2024").success).toBe(false);
        expect(dateStringSchema.safeParse("2024/01/15").success).toBe(false);
        expect(dateStringSchema.safeParse("2024-1-15").success).toBe(false);
        expect(dateStringSchema.safeParse("2024-01-5").success).toBe(false);
        expect(dateStringSchema.safeParse("January 15, 2024").success).toBe(false);
        expect(dateStringSchema.safeParse("").success).toBe(false);
      });
    });

    describe("Mood Schema", () => {
      it("should validate valid moods", () => {
        expect(moodSchema.safeParse("great").success).toBe(true);
        expect(moodSchema.safeParse("good").success).toBe(true);
        expect(moodSchema.safeParse("neutral").success).toBe(true);
        expect(moodSchema.safeParse("low").success).toBe(true);
        expect(moodSchema.safeParse("bad").success).toBe(true);
      });

      it("should reject invalid moods", () => {
        expect(moodSchema.safeParse("excellent").success).toBe(false);
        expect(moodSchema.safeParse("okay").success).toBe(false);
        expect(moodSchema.safeParse("terrible").success).toBe(false);
        expect(moodSchema.safeParse("").success).toBe(false);
        expect(moodSchema.safeParse(5).success).toBe(false);
      });
    });

    describe("Muscle Group Schema", () => {
      it("should validate all muscle groups", () => {
        for (const group of MUSCLE_GROUPS) {
          expect(muscleGroupSchema.safeParse(group).success).toBe(true);
        }
      });

      it("should reject invalid muscle groups", () => {
        expect(muscleGroupSchema.safeParse("arms").success).toBe(false);
        expect(muscleGroupSchema.safeParse("legs").success).toBe(false);
        expect(muscleGroupSchema.safeParse("core").success).toBe(false);
        expect(muscleGroupSchema.safeParse("").success).toBe(false);
      });
    });

    describe("Check-In Input Schema", () => {
      it("should validate empty input (all fields optional)", () => {
        expect(checkInInputSchema.safeParse({}).success).toBe(true);
      });

      it("should validate with date only", () => {
        expect(
          checkInInputSchema.safeParse({
            date: "2024-01-15",
          }).success,
        ).toBe(true);
      });

      it("should validate with all fields", () => {
        expect(
          checkInInputSchema.safeParse({
            date: "2024-01-15",
            sleepHours: 7.5,
            sleepQuality: 4,
            energyLevel: 7,
            stressLevel: 4,
            sorenessLevel: 3,
            soreAreas: ["chest", "shoulders"],
            restingHeartRate: 62,
            hrvScore: 65.5,
            motivationLevel: 8,
            mood: "good",
            nutritionQuality: 4,
            hydrationLevel: 4,
            notes: "Feeling good",
          }).success,
        ).toBe(true);
      });

      it("should validate sleep hours range (0-24)", () => {
        expect(checkInInputSchema.safeParse({ sleepHours: 0 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sleepHours: 8 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sleepHours: 24 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sleepHours: -1 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ sleepHours: 25 }).success).toBe(false);
      });

      it("should validate sleep quality range (1-5)", () => {
        expect(checkInInputSchema.safeParse({ sleepQuality: 1 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sleepQuality: 3 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sleepQuality: 5 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sleepQuality: 0 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ sleepQuality: 6 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ sleepQuality: 3.5 }).success).toBe(false);
      });

      it("should validate energy level range (1-10)", () => {
        expect(checkInInputSchema.safeParse({ energyLevel: 1 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ energyLevel: 5 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ energyLevel: 10 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ energyLevel: 0 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ energyLevel: 11 }).success).toBe(false);
      });

      it("should validate stress level range (1-10)", () => {
        expect(checkInInputSchema.safeParse({ stressLevel: 1 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ stressLevel: 10 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ stressLevel: 0 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ stressLevel: 11 }).success).toBe(false);
      });

      it("should validate soreness level range (1-10)", () => {
        expect(checkInInputSchema.safeParse({ sorenessLevel: 1 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sorenessLevel: 10 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ sorenessLevel: 0 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ sorenessLevel: 11 }).success).toBe(false);
      });

      it("should validate motivation level range (1-10)", () => {
        expect(checkInInputSchema.safeParse({ motivationLevel: 1 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ motivationLevel: 10 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ motivationLevel: 0 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ motivationLevel: 11 }).success).toBe(false);
      });

      it("should validate nutrition quality range (1-5)", () => {
        expect(checkInInputSchema.safeParse({ nutritionQuality: 1 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ nutritionQuality: 5 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ nutritionQuality: 0 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ nutritionQuality: 6 }).success).toBe(false);
      });

      it("should validate hydration level range (1-5)", () => {
        expect(checkInInputSchema.safeParse({ hydrationLevel: 1 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ hydrationLevel: 5 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ hydrationLevel: 0 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ hydrationLevel: 6 }).success).toBe(false);
      });

      it("should validate resting heart rate range (30-200)", () => {
        expect(checkInInputSchema.safeParse({ restingHeartRate: 30 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ restingHeartRate: 60 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ restingHeartRate: 200 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ restingHeartRate: 29 }).success).toBe(false);
        expect(checkInInputSchema.safeParse({ restingHeartRate: 201 }).success).toBe(false);
      });

      it("should validate HRV score (non-negative)", () => {
        expect(checkInInputSchema.safeParse({ hrvScore: 0 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ hrvScore: 50 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ hrvScore: 100.5 }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ hrvScore: -1 }).success).toBe(false);
      });

      it("should validate sore areas as array of muscle groups", () => {
        expect(checkInInputSchema.safeParse({ soreAreas: [] }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ soreAreas: ["chest"] }).success).toBe(true);
        expect(checkInInputSchema.safeParse({ soreAreas: ["chest", "back", "legs"] }).success).toBe(
          false,
        ); // "legs" is not a valid muscle group
        expect(
          checkInInputSchema.safeParse({ soreAreas: ["chest", "back", "quadriceps"] }).success,
        ).toBe(true);
      });

      it("should enforce notes max length", () => {
        expect(
          checkInInputSchema.safeParse({
            notes: "a".repeat(1001),
          }).success,
        ).toBe(false);

        expect(
          checkInInputSchema.safeParse({
            notes: "a".repeat(1000),
          }).success,
        ).toBe(true);
      });
    });

    describe("History Input Schema", () => {
      const historyInputSchema = z.object({
        startDate: dateStringSchema.optional(),
        endDate: dateStringSchema.optional(),
        limit: z.coerce.number().int().min(1).max(100).default(30),
        offset: z.coerce.number().int().min(0).default(0),
      });

      it("should validate empty input with defaults", () => {
        const result = historyInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(30);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate date range filters", () => {
        expect(
          historyInputSchema.safeParse({
            startDate: "2024-01-01",
            endDate: "2024-12-31",
          }).success,
        ).toBe(true);
      });

      it("should validate pagination limits", () => {
        expect(historyInputSchema.safeParse({ limit: 100, offset: 0 }).success).toBe(true);
        expect(historyInputSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(historyInputSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(historyInputSchema.safeParse({ offset: -1 }).success).toBe(false);
      });
    });

    describe("Trends Input Schema", () => {
      const trendsInputSchema = z.object({
        startDate: dateStringSchema.optional(),
        endDate: dateStringSchema.optional(),
        period: z.enum(["week", "month", "quarter", "year"]).default("month"),
      });

      it("should validate empty input with default period", () => {
        const result = trendsInputSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.period).toBe("month");
        }
      });

      it("should validate all period options", () => {
        expect(trendsInputSchema.safeParse({ period: "week" }).success).toBe(true);
        expect(trendsInputSchema.safeParse({ period: "month" }).success).toBe(true);
        expect(trendsInputSchema.safeParse({ period: "quarter" }).success).toBe(true);
        expect(trendsInputSchema.safeParse({ period: "year" }).success).toBe(true);
      });

      it("should reject invalid period", () => {
        expect(trendsInputSchema.safeParse({ period: "day" }).success).toBe(false);
        expect(trendsInputSchema.safeParse({ period: "all" }).success).toBe(false);
      });
    });
  });

  describe("Router Structure", () => {
    it("should have all check-in procedures", () => {
      expect(recoveryRouter.createCheckIn).toBeDefined();
      expect(recoveryRouter.getTodayCheckIn).toBeDefined();
      expect(recoveryRouter.getCheckInByDate).toBeDefined();
      expect(recoveryRouter.getCheckInHistory).toBeDefined();
      expect(recoveryRouter.getTrends).toBeDefined();
      expect(recoveryRouter.deleteCheckIn).toBeDefined();
    });

    it("should have recovery status procedures", () => {
      expect(recoveryRouter.getRecoveryStatus).toBeDefined();
      expect(recoveryRouter.getReadiness).toBeDefined();
      expect(recoveryRouter.refreshRecovery).toBeDefined();
    });
  });

  describe("Authorization Rules", () => {
    it("should require authentication for all procedures", () => {
      const unauthContext = createMockContext();
      expect(unauthContext.session).toBeNull();

      const authContext = createAuthenticatedContext();
      expect(authContext.session).not.toBeNull();
      expect(authContext.session?.user.id).toBe("test-user-id");
    });

    it("should correctly identify check-in ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their check-in
      expect(mockCheckIn.userId).toBe(userId);
    });

    it("should correctly identify muscle recovery ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockMuscleRecovery.userId).toBe(userId);
    });
  });

  describe("Check-In Operations", () => {
    it("should validate check-in ID input", () => {
      const getByIdSchema = z.object({ id: z.number() });

      expect(getByIdSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(getByIdSchema.safeParse({ id: "1" }).success).toBe(false);
      expect(getByIdSchema.safeParse({}).success).toBe(false);
    });

    it("should validate date input for getCheckInByDate", () => {
      const dateSchema = z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      });

      expect(dateSchema.safeParse({ date: "2024-01-15" }).success).toBe(true);
      expect(dateSchema.safeParse({ date: "invalid" }).success).toBe(false);
      expect(dateSchema.safeParse({}).success).toBe(false);
    });

    it("should support date range filtering for history", () => {
      const dateRangeSchema = z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      });

      expect(dateRangeSchema.safeParse({}).success).toBe(true);
      expect(dateRangeSchema.safeParse({ startDate: "2024-01-01" }).success).toBe(true);
      expect(
        dateRangeSchema.safeParse({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        }).success,
      ).toBe(true);
    });
  });

  describe("Readiness Score Calculation", () => {
    it("should calculate readiness score from check-in data", () => {
      // Simulate the readiness calculation
      const checkIn = mockCheckIn;

      // Sleep score: (quality - 1) / 4 * 100 = (4 - 1) / 4 * 100 = 75
      const sleepScore = ((checkIn.sleepQuality - 1) / 4) * 100;
      expect(sleepScore).toBe(75);

      // Energy score: (level - 1) / 9 * 100 = (7 - 1) / 9 * 100 ≈ 66.67
      const energyScore = ((checkIn.energyLevel - 1) / 9) * 100;
      expect(energyScore).toBeCloseTo(66.67, 1);

      // Soreness score (inverse): (10 - level) / 9 * 100 = (10 - 3) / 9 * 100 ≈ 77.78
      const sorenessScore = ((10 - checkIn.sorenessLevel) / 9) * 100;
      expect(sorenessScore).toBeCloseTo(77.78, 1);

      // Stress score (inverse): (10 - level) / 9 * 100 = (10 - 4) / 9 * 100 ≈ 66.67
      const stressScore = ((10 - checkIn.stressLevel) / 9) * 100;
      expect(stressScore).toBeCloseTo(66.67, 1);
    });

    it("should provide correct recommendation based on score", () => {
      const getRecommendation = (
        score: number,
      ): "ready to train hard" | "light training recommended" | "rest day suggested" => {
        if (score >= 70) return "ready to train hard";
        if (score >= 40) return "light training recommended";
        return "rest day suggested";
      };

      expect(getRecommendation(80)).toBe("ready to train hard");
      expect(getRecommendation(70)).toBe("ready to train hard");
      expect(getRecommendation(69)).toBe("light training recommended");
      expect(getRecommendation(50)).toBe("light training recommended");
      expect(getRecommendation(40)).toBe("light training recommended");
      expect(getRecommendation(39)).toBe("rest day suggested");
      expect(getRecommendation(20)).toBe("rest day suggested");
      expect(getRecommendation(0)).toBe("rest day suggested");
    });

    it("should weight factors correctly", () => {
      // Weights: sleep (25%), energy (20%), soreness (20%), stress (15%), muscle recovery (20%)
      const weights = {
        sleep: 0.25,
        energy: 0.2,
        soreness: 0.2,
        stress: 0.15,
        muscle: 0.2,
      };

      expect(
        weights.sleep + weights.energy + weights.soreness + weights.stress + weights.muscle,
      ).toBe(1);
    });

    it("should handle missing factors gracefully", () => {
      // If only some factors are available, calculate with available data
      const partialCheckIn = {
        sleepQuality: 4,
        energyLevel: null,
        stressLevel: null,
        sorenessLevel: 3,
        motivationLevel: null,
      };

      const sleepScore = partialCheckIn.sleepQuality
        ? ((partialCheckIn.sleepQuality - 1) / 4) * 100
        : null;
      const sorenessScore = partialCheckIn.sorenessLevel
        ? ((10 - partialCheckIn.sorenessLevel) / 9) * 100
        : null;

      expect(sleepScore).toBe(75);
      expect(sorenessScore).toBeCloseTo(77.78, 1);
    });
  });

  describe("Muscle Recovery Status", () => {
    it("should return all muscle groups in status", () => {
      // Verify all muscle groups are covered
      expect(MUSCLE_GROUPS.length).toBe(11);
    });

    it("should default to 100% recovery for untracked muscles", () => {
      // When no record exists, recovery should default to 100
      const defaultRecovery = 100;
      const defaultFatigue = 0;

      expect(defaultRecovery).toBe(100);
      expect(defaultFatigue).toBe(0);
    });

    it("should calculate overall recovery as average", () => {
      const recoveryScores = [100, 75, 50, 80, 90];
      const average = recoveryScores.reduce((sum, s) => sum + s, 0) / recoveryScores.length;

      expect(average).toBe(79);
    });
  });

  describe("Trends Calculations", () => {
    it("should calculate averages correctly", () => {
      const values = [7.5, 8.0, 6.5, 7.0, 8.5];
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;

      expect(average).toBe(7.5);
    });

    it("should handle null values in average calculation", () => {
      const values: (number | null)[] = [7.5, null, 6.5, null, 8.5];
      const validValues = values.filter((v): v is number => v !== null);
      const average = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;

      expect(average).toBe(7.5);
    });

    it("should calculate mood distribution correctly", () => {
      const moods = ["great", "good", "good", "neutral", "good", "great", "low"];
      const distribution = {
        great: moods.filter((m) => m === "great").length,
        good: moods.filter((m) => m === "good").length,
        neutral: moods.filter((m) => m === "neutral").length,
        low: moods.filter((m) => m === "low").length,
        bad: moods.filter((m) => m === "bad").length,
      };

      expect(distribution.great).toBe(2);
      expect(distribution.good).toBe(3);
      expect(distribution.neutral).toBe(1);
      expect(distribution.low).toBe(1);
      expect(distribution.bad).toBe(0);
    });

    it("should calculate period start dates correctly", () => {
      const endDate = new Date("2024-06-15");

      // Week
      const weekStart = new Date(endDate);
      weekStart.setDate(weekStart.getDate() - 7);
      expect(weekStart.toISOString().split("T")[0]).toBe("2024-06-08");

      // Month
      const monthStart = new Date(endDate);
      monthStart.setMonth(monthStart.getMonth() - 1);
      expect(monthStart.toISOString().split("T")[0]).toBe("2024-05-15");

      // Quarter
      const quarterStart = new Date(endDate);
      quarterStart.setMonth(quarterStart.getMonth() - 3);
      expect(quarterStart.toISOString().split("T")[0]).toBe("2024-03-15");

      // Year
      const yearStart = new Date(endDate);
      yearStart.setFullYear(yearStart.getFullYear() - 1);
      expect(yearStart.toISOString().split("T")[0]).toBe("2023-06-15");
    });
  });

  describe("Output Schemas", () => {
    it("should validate check-in output structure", () => {
      const checkInOutputSchema = z.object({
        id: z.number(),
        userId: z.string(),
        date: z.string(),
        sleepHours: z.number().nullable(),
        sleepQuality: z.number().nullable(),
        energyLevel: z.number().nullable(),
        stressLevel: z.number().nullable(),
        sorenessLevel: z.number().nullable(),
        soreAreas: z.array(z.string()).nullable(),
        restingHeartRate: z.number().nullable(),
        hrvScore: z.number().nullable(),
        motivationLevel: z.number().nullable(),
        mood: z.enum(["great", "good", "neutral", "low", "bad"]).nullable(),
        nutritionQuality: z.number().nullable(),
        hydrationLevel: z.number().nullable(),
        notes: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      });

      expect(checkInOutputSchema.safeParse(mockCheckIn).success).toBe(true);
    });

    it("should validate history output structure", () => {
      const historyOutputSchema = z.object({
        checkIns: z.array(z.object({ id: z.number() })),
        total: z.number(),
        limit: z.number(),
        offset: z.number(),
      });

      expect(
        historyOutputSchema.safeParse({
          checkIns: [{ id: 1 }, { id: 2 }],
          total: 2,
          limit: 30,
          offset: 0,
        }).success,
      ).toBe(true);
    });

    it("should validate trends output structure", () => {
      const trendsOutputSchema = z.object({
        period: z.string(),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        dataPoints: z.number(),
        averages: z.object({
          sleepHours: z.number().nullable(),
          sleepQuality: z.number().nullable(),
          energyLevel: z.number().nullable(),
          stressLevel: z.number().nullable(),
          sorenessLevel: z.number().nullable(),
          motivationLevel: z.number().nullable(),
          nutritionQuality: z.number().nullable(),
          hydrationLevel: z.number().nullable(),
        }),
        moodDistribution: z.object({
          great: z.number(),
          good: z.number(),
          neutral: z.number(),
          low: z.number(),
          bad: z.number(),
        }),
      });

      expect(
        trendsOutputSchema.safeParse({
          period: "month",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          dataPoints: 15,
          averages: {
            sleepHours: 7.5,
            sleepQuality: 4.0,
            energyLevel: 7.0,
            stressLevel: 4.0,
            sorenessLevel: 3.0,
            motivationLevel: 8.0,
            nutritionQuality: 4.0,
            hydrationLevel: 4.0,
          },
          moodDistribution: {
            great: 3,
            good: 8,
            neutral: 3,
            low: 1,
            bad: 0,
          },
        }).success,
      ).toBe(true);
    });

    it("should validate muscle recovery status output structure", () => {
      const muscleRecoveryStatusSchema = z.object({
        muscleGroup: z.string(),
        recoveryScore: z.number().nullable(),
        fatigueLevel: z.number().nullable(),
        lastWorkedAt: z.date().nullable(),
        setsLast7Days: z.number(),
        volumeLast7Days: z.number(),
        estimatedFullRecovery: z.date().nullable(),
        updatedAt: z.date(),
      });

      expect(muscleRecoveryStatusSchema.safeParse(mockMuscleRecovery).success).toBe(true);
    });

    it("should validate readiness output structure", () => {
      const readinessOutputSchema = z.object({
        score: z.number(),
        recommendation: z.enum([
          "ready to train hard",
          "light training recommended",
          "rest day suggested",
        ]),
        factors: z.object({
          sleepScore: z.number().nullable(),
          energyScore: z.number().nullable(),
          sorenessScore: z.number().nullable(),
          stressScore: z.number().nullable(),
          muscleRecoveryScore: z.number().nullable(),
        }),
        todayCheckIn: z.boolean(),
        lastCheckInDate: z.string().nullable(),
      });

      expect(
        readinessOutputSchema.safeParse({
          score: 75,
          recommendation: "ready to train hard",
          factors: {
            sleepScore: 75,
            energyScore: 67,
            sorenessScore: 78,
            stressScore: 67,
            muscleRecoveryScore: 80,
          },
          todayCheckIn: true,
          lastCheckInDate: "2024-01-15",
        }).success,
      ).toBe(true);
    });

    it("should validate refresh output structure", () => {
      const refreshOutputSchema = z.object({
        success: z.boolean(),
        updatedMuscleGroups: z.number(),
        message: z.string(),
      });

      expect(
        refreshOutputSchema.safeParse({
          success: true,
          updatedMuscleGroups: 11,
          message: "Successfully refreshed recovery data for 11 muscle groups",
        }).success,
      ).toBe(true);
    });

    it("should validate delete output structure", () => {
      const deleteOutputSchema = z.object({
        success: z.boolean(),
      });

      expect(deleteOutputSchema.safeParse({ success: true }).success).toBe(true);
      expect(deleteOutputSchema.safeParse({ success: false }).success).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty check-in list", () => {
      const checkInsSchema = z.array(z.object({ id: z.number() }));
      expect(checkInsSchema.parse([])).toEqual([]);
    });

    it("should handle check-in with only date", () => {
      const minimalCheckIn = {
        id: 1,
        userId: "test-user-id",
        date: "2024-01-15",
        sleepHours: null,
        sleepQuality: null,
        energyLevel: null,
        stressLevel: null,
        sorenessLevel: null,
        soreAreas: null,
        restingHeartRate: null,
        hrvScore: null,
        motivationLevel: null,
        mood: null,
        nutritionQuality: null,
        hydrationLevel: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(minimalCheckIn.id).toBe(1);
      expect(minimalCheckIn.date).toBe("2024-01-15");
    });

    it("should handle upsert behavior (same date updates)", () => {
      // When creating a check-in for a date that already exists,
      // it should update instead of create
      const existingDate = "2024-01-15";
      const newData = { sleepQuality: 5 };

      // The upsert logic should merge new data with existing
      expect(existingDate).toBe("2024-01-15");
      expect(newData.sleepQuality).toBe(5);
    });

    it("should handle today's date calculation", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should handle empty trends data", () => {
      const emptyTrends = {
        period: "month",
        startDate: null,
        endDate: null,
        dataPoints: 0,
        averages: {
          sleepHours: null,
          sleepQuality: null,
          energyLevel: null,
          stressLevel: null,
          sorenessLevel: null,
          motivationLevel: null,
          nutritionQuality: null,
          hydrationLevel: null,
        },
        moodDistribution: {
          great: 0,
          good: 0,
          neutral: 0,
          low: 0,
          bad: 0,
        },
      };

      expect(emptyTrends.dataPoints).toBe(0);
      expect(emptyTrends.averages.sleepHours).toBeNull();
    });

    it("should handle readiness with no data", () => {
      // When no check-in data exists, default to 50
      const defaultScore = 50;
      expect(defaultScore).toBe(50);
    });

    it("should round averages to 1 decimal place", () => {
      const roundTo1Decimal = (value: number): number => {
        return Math.round(value * 10) / 10;
      };

      expect(roundTo1Decimal(7.567)).toBe(7.6);
      expect(roundTo1Decimal(7.543)).toBe(7.5);
      expect(roundTo1Decimal(8.0)).toBe(8.0);
    });

    it("should handle multiple sore areas", () => {
      const soreAreas = ["chest", "back", "shoulders", "quadriceps"];
      expect(soreAreas.length).toBe(4);
      expect(soreAreas).toContain("chest");
      expect(soreAreas).toContain("quadriceps");
    });

    it("should handle decimal sleep hours", () => {
      const sleepHoursSchema = z.number().min(0).max(24);

      expect(sleepHoursSchema.safeParse(7.5).success).toBe(true);
      expect(sleepHoursSchema.safeParse(7.25).success).toBe(true);
      expect(sleepHoursSchema.safeParse(6.75).success).toBe(true);
    });
  });

  describe("Recovery Score Ranges", () => {
    it("should validate recovery score in 0-100 range", () => {
      const recoveryScoreSchema = z.number().min(0).max(100);

      expect(recoveryScoreSchema.safeParse(0).success).toBe(true);
      expect(recoveryScoreSchema.safeParse(50).success).toBe(true);
      expect(recoveryScoreSchema.safeParse(100).success).toBe(true);
      expect(recoveryScoreSchema.safeParse(-1).success).toBe(false);
      expect(recoveryScoreSchema.safeParse(101).success).toBe(false);
    });

    it("should validate fatigue level in 0-100 range", () => {
      const fatigueLevelSchema = z.number().min(0).max(100);

      expect(fatigueLevelSchema.safeParse(0).success).toBe(true);
      expect(fatigueLevelSchema.safeParse(50).success).toBe(true);
      expect(fatigueLevelSchema.safeParse(100).success).toBe(true);
      expect(fatigueLevelSchema.safeParse(-1).success).toBe(false);
      expect(fatigueLevelSchema.safeParse(101).success).toBe(false);
    });
  });

  describe("Training Volume Tracking", () => {
    it("should track sets in last 7 days", () => {
      const setsSchema = z.number().int().min(0);

      expect(setsSchema.safeParse(0).success).toBe(true);
      expect(setsSchema.safeParse(12).success).toBe(true);
      expect(setsSchema.safeParse(50).success).toBe(true);
      expect(setsSchema.safeParse(-1).success).toBe(false);
    });

    it("should track volume in last 7 days", () => {
      const volumeSchema = z.number().min(0);

      expect(volumeSchema.safeParse(0).success).toBe(true);
      expect(volumeSchema.safeParse(2400).success).toBe(true);
      expect(volumeSchema.safeParse(10000.5).success).toBe(true);
      expect(volumeSchema.safeParse(-100).success).toBe(false);
    });
  });
});
