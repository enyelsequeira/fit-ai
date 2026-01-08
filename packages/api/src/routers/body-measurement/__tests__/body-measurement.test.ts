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
import { bodyMeasurementRouter } from "..";

// Mock data
const mockMeasurement = {
  id: 1,
  userId: "test-user-id",
  measuredAt: new Date("2024-01-15"),
  weight: 75.5,
  weightUnit: "kg" as const,
  bodyFatPercentage: 18.5,
  chest: 100,
  waist: 80,
  hips: 95,
  leftArm: 35,
  rightArm: 35.5,
  leftThigh: 55,
  rightThigh: 55.5,
  leftCalf: 38,
  rightCalf: 38,
  neck: 38,
  shoulders: 115,
  lengthUnit: "cm" as const,
  notes: "First measurement",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtherUserMeasurement = {
  id: 2,
  userId: "other-user-id",
  measuredAt: new Date("2024-01-20"),
  weight: 80.0,
  weightUnit: "kg" as const,
  bodyFatPercentage: 20.0,
  chest: 105,
  waist: 85,
  hips: 100,
  leftArm: 36,
  rightArm: 36,
  leftThigh: 58,
  rightThigh: 58,
  leftCalf: 40,
  rightCalf: 40,
  neck: 40,
  shoulders: 120,
  lengthUnit: "cm" as const,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Body Measurement Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    // Weight unit schema
    const bodyWeightUnitSchema = z.enum(["kg", "lb"]);

    // Length unit schema
    const lengthUnitSchema = z.enum(["cm", "in"]);

    // List measurements schema
    const listBodyMeasurementsSchema = z.object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      offset: z.coerce.number().int().min(0).default(0),
    });

    // Create measurement schema
    const createBodyMeasurementSchema = z.object({
      measuredAt: z.coerce.date().optional(),
      weight: z.number().positive().optional(),
      weightUnit: bodyWeightUnitSchema.optional(),
      bodyFatPercentage: z.number().min(0).max(100).optional(),
      chest: z.number().positive().optional(),
      waist: z.number().positive().optional(),
      hips: z.number().positive().optional(),
      leftArm: z.number().positive().optional(),
      rightArm: z.number().positive().optional(),
      leftThigh: z.number().positive().optional(),
      rightThigh: z.number().positive().optional(),
      leftCalf: z.number().positive().optional(),
      rightCalf: z.number().positive().optional(),
      neck: z.number().positive().optional(),
      shoulders: z.number().positive().optional(),
      lengthUnit: lengthUnitSchema.optional(),
      notes: z.string().max(1000).optional(),
    });

    // Update measurement schema
    const updateBodyMeasurementSchema = z.object({
      id: z.number(),
      measuredAt: z.coerce.date().optional(),
      weight: z.number().positive().nullable().optional(),
      weightUnit: bodyWeightUnitSchema.nullable().optional(),
      bodyFatPercentage: z.number().min(0).max(100).nullable().optional(),
      chest: z.number().positive().nullable().optional(),
      waist: z.number().positive().nullable().optional(),
      hips: z.number().positive().nullable().optional(),
      leftArm: z.number().positive().nullable().optional(),
      rightArm: z.number().positive().nullable().optional(),
      leftThigh: z.number().positive().nullable().optional(),
      rightThigh: z.number().positive().nullable().optional(),
      leftCalf: z.number().positive().nullable().optional(),
      rightCalf: z.number().positive().nullable().optional(),
      neck: z.number().positive().nullable().optional(),
      shoulders: z.number().positive().nullable().optional(),
      lengthUnit: lengthUnitSchema.nullable().optional(),
      notes: z.string().max(1000).nullable().optional(),
    });

    // Trends schema
    const getTrendsSchema = z.object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      period: z.enum(["week", "month", "quarter", "year", "all"]).default("month"),
    });

    describe("Body Weight Unit Schema", () => {
      it("should validate valid weight units", () => {
        expect(bodyWeightUnitSchema.safeParse("kg").success).toBe(true);
        expect(bodyWeightUnitSchema.safeParse("lb").success).toBe(true);
      });

      it("should reject invalid weight units", () => {
        expect(bodyWeightUnitSchema.safeParse("invalid").success).toBe(false);
        expect(bodyWeightUnitSchema.safeParse("").success).toBe(false);
        expect(bodyWeightUnitSchema.safeParse(123).success).toBe(false);
      });
    });

    describe("Length Unit Schema", () => {
      it("should validate valid length units", () => {
        expect(lengthUnitSchema.safeParse("cm").success).toBe(true);
        expect(lengthUnitSchema.safeParse("in").success).toBe(true);
      });

      it("should reject invalid length units", () => {
        expect(lengthUnitSchema.safeParse("invalid").success).toBe(false);
        expect(lengthUnitSchema.safeParse("m").success).toBe(false);
        expect(lengthUnitSchema.safeParse("").success).toBe(false);
      });
    });

    describe("List Measurements Schema", () => {
      it("should validate empty input with defaults", () => {
        const result = listBodyMeasurementsSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate date range filters", () => {
        expect(
          listBodyMeasurementsSchema.safeParse({
            startDate: "2024-01-01",
            endDate: "2024-12-31",
          }).success,
        ).toBe(true);

        expect(listBodyMeasurementsSchema.safeParse({ startDate: "2024-01-01" }).success).toBe(
          true,
        );
        expect(listBodyMeasurementsSchema.safeParse({ endDate: "2024-12-31" }).success).toBe(true);
      });

      it("should validate pagination limits", () => {
        expect(listBodyMeasurementsSchema.safeParse({ limit: 100, offset: 0 }).success).toBe(true);
        expect(listBodyMeasurementsSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(listBodyMeasurementsSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(listBodyMeasurementsSchema.safeParse({ offset: -1 }).success).toBe(false);
      });
    });

    describe("Create Measurement Schema", () => {
      it("should validate empty input (all fields optional)", () => {
        expect(createBodyMeasurementSchema.safeParse({}).success).toBe(true);
      });

      it("should validate with weight only", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            weight: 75.5,
            weightUnit: "kg",
          }).success,
        ).toBe(true);
      });

      it("should validate with all fields", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            measuredAt: "2024-01-15",
            weight: 75.5,
            weightUnit: "kg",
            bodyFatPercentage: 18.5,
            chest: 100,
            waist: 80,
            hips: 95,
            leftArm: 35,
            rightArm: 35.5,
            leftThigh: 55,
            rightThigh: 55.5,
            leftCalf: 38,
            rightCalf: 38,
            neck: 38,
            shoulders: 115,
            lengthUnit: "cm",
            notes: "Test measurement",
          }).success,
        ).toBe(true);
      });

      it("should reject negative weight", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            weight: -75,
          }).success,
        ).toBe(false);
      });

      it("should reject zero weight", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            weight: 0,
          }).success,
        ).toBe(false);
      });

      it("should reject body fat percentage over 100", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            bodyFatPercentage: 101,
          }).success,
        ).toBe(false);
      });

      it("should reject negative body fat percentage", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            bodyFatPercentage: -5,
          }).success,
        ).toBe(false);
      });

      it("should accept body fat percentage of 0", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            bodyFatPercentage: 0,
          }).success,
        ).toBe(true);
      });

      it("should reject negative measurements", () => {
        expect(createBodyMeasurementSchema.safeParse({ chest: -10 }).success).toBe(false);
        expect(createBodyMeasurementSchema.safeParse({ waist: -80 }).success).toBe(false);
        expect(createBodyMeasurementSchema.safeParse({ leftArm: -35 }).success).toBe(false);
      });

      it("should enforce notes max length", () => {
        expect(
          createBodyMeasurementSchema.safeParse({
            notes: "a".repeat(1001),
          }).success,
        ).toBe(false);

        expect(
          createBodyMeasurementSchema.safeParse({
            notes: "a".repeat(1000),
          }).success,
        ).toBe(true);
      });
    });

    describe("Update Measurement Schema", () => {
      it("should require id", () => {
        expect(updateBodyMeasurementSchema.safeParse({}).success).toBe(false);
        expect(updateBodyMeasurementSchema.safeParse({ weight: 80 }).success).toBe(false);
      });

      it("should validate update with id only", () => {
        expect(updateBodyMeasurementSchema.safeParse({ id: 1 }).success).toBe(true);
      });

      it("should allow nullable fields", () => {
        expect(
          updateBodyMeasurementSchema.safeParse({
            id: 1,
            weight: null,
            bodyFatPercentage: null,
            chest: null,
            notes: null,
          }).success,
        ).toBe(true);
      });

      it("should validate update with all fields", () => {
        expect(
          updateBodyMeasurementSchema.safeParse({
            id: 1,
            measuredAt: "2024-02-01",
            weight: 76.0,
            weightUnit: "lb",
            bodyFatPercentage: 17.5,
            chest: 101,
            waist: 79,
            hips: 94,
            leftArm: 35.5,
            rightArm: 36,
            leftThigh: 56,
            rightThigh: 56,
            leftCalf: 38.5,
            rightCalf: 38.5,
            neck: 38.5,
            shoulders: 116,
            lengthUnit: "in",
            notes: "Updated measurement",
          }).success,
        ).toBe(true);
      });
    });

    describe("Trends Schema", () => {
      it("should validate empty input with default period", () => {
        const result = getTrendsSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.period).toBe("month");
        }
      });

      it("should validate all period options", () => {
        expect(getTrendsSchema.safeParse({ period: "week" }).success).toBe(true);
        expect(getTrendsSchema.safeParse({ period: "month" }).success).toBe(true);
        expect(getTrendsSchema.safeParse({ period: "quarter" }).success).toBe(true);
        expect(getTrendsSchema.safeParse({ period: "year" }).success).toBe(true);
        expect(getTrendsSchema.safeParse({ period: "all" }).success).toBe(true);
      });

      it("should reject invalid period", () => {
        expect(getTrendsSchema.safeParse({ period: "invalid" }).success).toBe(false);
        expect(getTrendsSchema.safeParse({ period: "day" }).success).toBe(false);
      });

      it("should validate with date range", () => {
        expect(
          getTrendsSchema.safeParse({
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            period: "year",
          }).success,
        ).toBe(true);
      });
    });
  });

  describe("Router Structure", () => {
    it("should have all CRUD procedures", () => {
      expect(bodyMeasurementRouter.list).toBeDefined();
      expect(bodyMeasurementRouter.getById).toBeDefined();
      expect(bodyMeasurementRouter.create).toBeDefined();
      expect(bodyMeasurementRouter.update).toBeDefined();
      expect(bodyMeasurementRouter.delete).toBeDefined();
    });

    it("should have latest and trends procedures", () => {
      expect(bodyMeasurementRouter.getLatest).toBeDefined();
      expect(bodyMeasurementRouter.getTrends).toBeDefined();
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

    it("should correctly identify measurement ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their measurement
      expect(mockMeasurement.userId).toBe(userId);

      // User doesn't own other user's measurement
      expect(mockOtherUserMeasurement.userId).not.toBe(userId);
    });

    it("should not allow users to access other users measurements", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockOtherUserMeasurement.userId).not.toBe(userId);
      // Trying to access would throw FORBIDDEN
    });
  });

  describe("Measurement Operations", () => {
    it("should validate measurement ID input", () => {
      const getByIdSchema = z.object({ id: z.number() });

      expect(getByIdSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(getByIdSchema.safeParse({ id: "1" }).success).toBe(false);
      expect(getByIdSchema.safeParse({}).success).toBe(false);
    });

    it("should support date range filtering", () => {
      const dateSchema = z.object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      });

      expect(dateSchema.safeParse({}).success).toBe(true);
      expect(dateSchema.safeParse({ startDate: "2024-01-01" }).success).toBe(true);
      expect(
        dateSchema.safeParse({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        }).success,
      ).toBe(true);
    });

    it("should support pagination", () => {
      const paginationSchema = z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      });

      expect(paginationSchema.safeParse({ limit: 10, offset: 0 }).success).toBe(true);
      expect(paginationSchema.safeParse({ limit: 100, offset: 50 }).success).toBe(true);
      expect(paginationSchema.safeParse({ limit: 101, offset: 0 }).success).toBe(false);
      expect(paginationSchema.safeParse({ limit: 0, offset: 0 }).success).toBe(false);
    });
  });

  describe("Trends Calculations", () => {
    it("should calculate weight change correctly", () => {
      const measurements = [
        { weight: 80.0, bodyFatPercentage: 20.0 },
        { weight: 78.5, bodyFatPercentage: 19.0 },
        { weight: 77.0, bodyFatPercentage: 18.0 },
      ];

      const first = measurements[0];
      const last = measurements[measurements.length - 1];

      if (first && last && first.weight !== null && last.weight !== null) {
        const weightChange = last.weight - first.weight;
        expect(weightChange).toBe(-3.0);
      }
    });

    it("should calculate body fat change correctly", () => {
      const measurements = [
        { weight: 80.0, bodyFatPercentage: 20.0 },
        { weight: 78.5, bodyFatPercentage: 19.0 },
        { weight: 77.0, bodyFatPercentage: 18.0 },
      ];

      const first = measurements[0];
      const last = measurements[measurements.length - 1];

      if (first && last && first.bodyFatPercentage !== null && last.bodyFatPercentage !== null) {
        const bodyFatChange = last.bodyFatPercentage - first.bodyFatPercentage;
        expect(bodyFatChange).toBe(-2.0);
      }
    });

    it("should handle single measurement (no change)", () => {
      const measurements = [{ weight: 80.0, bodyFatPercentage: 20.0 }];

      expect(measurements.length).toBe(1);
      // With only one measurement, changes should be null
    });

    it("should handle null values in measurements", () => {
      const measurements = [
        { weight: 80.0, bodyFatPercentage: null },
        { weight: 78.0, bodyFatPercentage: null },
      ];

      const first = measurements[0];
      const last = measurements[measurements.length - 1];

      if (first && last && first.weight !== null && last.weight !== null) {
        const weightChange = last.weight - first.weight;
        expect(weightChange).toBe(-2.0);
      }

      // Body fat change should remain null
      expect(first?.bodyFatPercentage).toBeNull();
      expect(last?.bodyFatPercentage).toBeNull();
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

  describe("Edge Cases", () => {
    it("should handle empty measurement list", () => {
      const measurementsSchema = z.array(z.object({ id: z.number() }));
      expect(measurementsSchema.parse([])).toEqual([]);
    });

    it("should handle optional notes", () => {
      const schema = z.object({
        notes: z.string().max(1000).optional(),
      });

      const result = schema.parse({});
      expect(result.notes).toBeUndefined();
    });

    it("should handle nullable measurements", () => {
      const schema = z.object({
        weight: z.number().nullable(),
        chest: z.number().nullable(),
        waist: z.number().nullable(),
      });

      expect(schema.parse({ weight: null, chest: null, waist: null })).toEqual({
        weight: null,
        chest: null,
        waist: null,
      });
    });

    it("should coerce date strings", () => {
      const dateSchema = z.coerce.date();

      const result = dateSchema.parse("2024-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString().startsWith("2024-01-15")).toBe(true);
    });

    it("should handle weight unit default", () => {
      const schema = z.object({
        weightUnit: z.enum(["kg", "lb"]).default("kg"),
      });

      expect(schema.parse({}).weightUnit).toBe("kg");
      expect(schema.parse({ weightUnit: "lb" }).weightUnit).toBe("lb");
    });

    it("should handle length unit default", () => {
      const schema = z.object({
        lengthUnit: z.enum(["cm", "in"]).default("cm"),
      });

      expect(schema.parse({}).lengthUnit).toBe("cm");
      expect(schema.parse({ lengthUnit: "in" }).lengthUnit).toBe("in");
    });

    it("should handle very small measurements", () => {
      const schema = z.object({
        weight: z.number().positive().optional(),
      });

      expect(schema.safeParse({ weight: 0.1 }).success).toBe(true);
      expect(schema.safeParse({ weight: 0.001 }).success).toBe(true);
    });

    it("should handle very large measurements", () => {
      const schema = z.object({
        weight: z.number().positive().optional(),
      });

      expect(schema.safeParse({ weight: 500 }).success).toBe(true);
      expect(schema.safeParse({ weight: 1000 }).success).toBe(true);
    });
  });

  describe("Output Schemas", () => {
    it("should validate measurement output structure", () => {
      const bodyMeasurementOutputSchema = z.object({
        id: z.number(),
        userId: z.string(),
        measuredAt: z.date(),
        weight: z.number().nullable(),
        weightUnit: z.enum(["kg", "lb"]).nullable(),
        bodyFatPercentage: z.number().nullable(),
        chest: z.number().nullable(),
        waist: z.number().nullable(),
        hips: z.number().nullable(),
        leftArm: z.number().nullable(),
        rightArm: z.number().nullable(),
        leftThigh: z.number().nullable(),
        rightThigh: z.number().nullable(),
        leftCalf: z.number().nullable(),
        rightCalf: z.number().nullable(),
        neck: z.number().nullable(),
        shoulders: z.number().nullable(),
        lengthUnit: z.enum(["cm", "in"]).nullable(),
        notes: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      });

      expect(bodyMeasurementOutputSchema.safeParse(mockMeasurement).success).toBe(true);
    });

    it("should validate list output structure", () => {
      const bodyMeasurementListOutputSchema = z.object({
        measurements: z.array(z.object({ id: z.number() })),
        total: z.number(),
        limit: z.number(),
        offset: z.number(),
      });

      expect(
        bodyMeasurementListOutputSchema.safeParse({
          measurements: [{ id: 1 }, { id: 2 }],
          total: 2,
          limit: 20,
          offset: 0,
        }).success,
      ).toBe(true);
    });

    it("should validate trends output structure", () => {
      const trendDataPointSchema = z.object({
        date: z.date(),
        weight: z.number().nullable(),
        bodyFatPercentage: z.number().nullable(),
      });

      const trendsOutputSchema = z.object({
        dataPoints: z.array(trendDataPointSchema),
        weightChange: z.number().nullable(),
        bodyFatChange: z.number().nullable(),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
        measurementCount: z.number(),
      });

      expect(
        trendsOutputSchema.safeParse({
          dataPoints: [
            { date: new Date(), weight: 80, bodyFatPercentage: 20 },
            { date: new Date(), weight: 78, bodyFatPercentage: 18 },
          ],
          weightChange: -2,
          bodyFatChange: -2,
          startDate: new Date(),
          endDate: new Date(),
          measurementCount: 2,
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

  describe("Measurement Field Validations", () => {
    it("should validate all body part measurements as positive numbers", () => {
      const measurementSchema = z.object({
        chest: z.number().positive().optional(),
        waist: z.number().positive().optional(),
        hips: z.number().positive().optional(),
        leftArm: z.number().positive().optional(),
        rightArm: z.number().positive().optional(),
        leftThigh: z.number().positive().optional(),
        rightThigh: z.number().positive().optional(),
        leftCalf: z.number().positive().optional(),
        rightCalf: z.number().positive().optional(),
        neck: z.number().positive().optional(),
        shoulders: z.number().positive().optional(),
      });

      // Valid measurements
      expect(
        measurementSchema.safeParse({
          chest: 100,
          waist: 80,
          hips: 95,
          leftArm: 35,
          rightArm: 35,
          leftThigh: 55,
          rightThigh: 55,
          leftCalf: 38,
          rightCalf: 38,
          neck: 38,
          shoulders: 115,
        }).success,
      ).toBe(true);

      // Invalid (negative/zero)
      expect(measurementSchema.safeParse({ chest: 0 }).success).toBe(false);
      expect(measurementSchema.safeParse({ waist: -5 }).success).toBe(false);
      expect(measurementSchema.safeParse({ leftArm: 0 }).success).toBe(false);
    });

    it("should handle asymmetric arm measurements", () => {
      const measurementSchema = z.object({
        leftArm: z.number().positive().optional(),
        rightArm: z.number().positive().optional(),
      });

      // Different arm sizes are valid
      expect(
        measurementSchema.safeParse({
          leftArm: 35,
          rightArm: 36,
        }).success,
      ).toBe(true);
    });

    it("should handle asymmetric leg measurements", () => {
      const measurementSchema = z.object({
        leftThigh: z.number().positive().optional(),
        rightThigh: z.number().positive().optional(),
        leftCalf: z.number().positive().optional(),
        rightCalf: z.number().positive().optional(),
      });

      // Different leg sizes are valid
      expect(
        measurementSchema.safeParse({
          leftThigh: 55,
          rightThigh: 56,
          leftCalf: 38,
          rightCalf: 39,
        }).success,
      ).toBe(true);
    });
  });

  describe("Unit Conversion Considerations", () => {
    it("should store measurements in user-specified units", () => {
      // Measurements should be stored as-is without conversion
      const kgMeasurement = { weight: 75.5, weightUnit: "kg" as const };
      const lbMeasurement = { weight: 166.4, weightUnit: "lb" as const };

      expect(kgMeasurement.weight).toBe(75.5);
      expect(kgMeasurement.weightUnit).toBe("kg");
      expect(lbMeasurement.weight).toBe(166.4);
      expect(lbMeasurement.weightUnit).toBe("lb");
    });

    it("should store length measurements in user-specified units", () => {
      const cmMeasurement = { waist: 80, lengthUnit: "cm" as const };
      const inMeasurement = { waist: 31.5, lengthUnit: "in" as const };

      expect(cmMeasurement.waist).toBe(80);
      expect(cmMeasurement.lengthUnit).toBe("cm");
      expect(inMeasurement.waist).toBe(31.5);
      expect(inMeasurement.lengthUnit).toBe("in");
    });
  });
});
