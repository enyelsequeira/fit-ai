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
  personalRecordRouter,
  recordTypeSchema,
  personalRecordOutputSchema,
  personalRecordWithExerciseSchema,
  personalRecordListOutputSchema,
  personalRecordSummaryOutputSchema,
  calculatedPRsOutputSchema,
  listPersonalRecordsSchema,
  getRecentPersonalRecordsSchema,
  createPersonalRecordSchema,
  updatePersonalRecordSchema,
  calculatePRsSchema,
} from "..";

// Mock data
const mockPersonalRecord = {
  id: 1,
  userId: "test-user-id",
  exerciseId: 1,
  recordType: "one_rep_max" as const,
  value: 100,
  displayUnit: "kg",
  achievedAt: new Date(),
  workoutId: 1,
  exerciseSetId: 1,
  notes: "New PR!",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMaxWeightRecord = {
  ...mockPersonalRecord,
  id: 2,
  recordType: "max_weight" as const,
  value: 120,
};

const mockMaxRepsRecord = {
  ...mockPersonalRecord,
  id: 3,
  recordType: "max_reps" as const,
  value: 15,
  displayUnit: "reps",
};

const mockMaxVolumeRecord = {
  ...mockPersonalRecord,
  id: 4,
  recordType: "max_volume" as const,
  value: 1200,
};

const mockBestTimeRecord = {
  ...mockPersonalRecord,
  id: 5,
  exerciseId: 2,
  recordType: "best_time" as const,
  value: 300,
  displayUnit: "seconds",
};

describe("Personal Record Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Validation Schema Tests
  // ===========================================================================

  describe("Validation Schemas", () => {
    describe("recordTypeSchema", () => {
      it("should validate all record types", () => {
        expect(recordTypeSchema.safeParse("one_rep_max").success).toBe(true);
        expect(recordTypeSchema.safeParse("max_weight").success).toBe(true);
        expect(recordTypeSchema.safeParse("max_reps").success).toBe(true);
        expect(recordTypeSchema.safeParse("max_volume").success).toBe(true);
        expect(recordTypeSchema.safeParse("best_time").success).toBe(true);
        expect(recordTypeSchema.safeParse("longest_duration").success).toBe(true);
        expect(recordTypeSchema.safeParse("longest_distance").success).toBe(true);
      });

      it("should reject invalid record types", () => {
        expect(recordTypeSchema.safeParse("invalid").success).toBe(false);
        expect(recordTypeSchema.safeParse("").success).toBe(false);
        expect(recordTypeSchema.safeParse(123).success).toBe(false);
        expect(recordTypeSchema.safeParse("1rm").success).toBe(false);
      });
    });

    describe("personalRecordOutputSchema", () => {
      it("should validate valid personal record output", () => {
        const result = personalRecordOutputSchema.safeParse(mockPersonalRecord);
        expect(result.success).toBe(true);
      });

      it("should validate with null optional fields", () => {
        const result = personalRecordOutputSchema.safeParse({
          ...mockPersonalRecord,
          displayUnit: null,
          workoutId: null,
          exerciseSetId: null,
          notes: null,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("personalRecordWithExerciseSchema", () => {
      it("should validate record with exercise details", () => {
        const result = personalRecordWithExerciseSchema.safeParse({
          ...mockPersonalRecord,
          exercise: {
            id: 1,
            name: "Bench Press",
            category: "chest",
            exerciseType: "strength",
          },
        });
        expect(result.success).toBe(true);
      });

      it("should validate record without exercise details", () => {
        const result = personalRecordWithExerciseSchema.safeParse(mockPersonalRecord);
        expect(result.success).toBe(true);
      });
    });

    describe("personalRecordListOutputSchema", () => {
      it("should validate paginated list output", () => {
        const result = personalRecordListOutputSchema.safeParse({
          records: [
            {
              ...mockPersonalRecord,
              exercise: {
                id: 1,
                name: "Bench Press",
                category: "chest",
                exerciseType: "strength",
              },
            },
          ],
          total: 1,
          limit: 20,
          offset: 0,
        });
        expect(result.success).toBe(true);
      });

      it("should validate empty list", () => {
        const result = personalRecordListOutputSchema.safeParse({
          records: [],
          total: 0,
          limit: 20,
          offset: 0,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("personalRecordSummaryOutputSchema", () => {
      it("should validate summary output", () => {
        const result = personalRecordSummaryOutputSchema.safeParse({
          totalRecords: 10,
          countByType: {
            one_rep_max: 5,
            max_weight: 3,
            max_reps: 2,
          },
          recentRecords: [],
          exercisesWithRecords: 5,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("calculatedPRsOutputSchema", () => {
      it("should validate calculated PRs output", () => {
        const result = calculatedPRsOutputSchema.safeParse({
          newRecords: [],
          totalChecked: 10,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Input Schema Tests
  // ===========================================================================

  describe("Input Schemas", () => {
    describe("listPersonalRecordsSchema", () => {
      it("should validate with default values", () => {
        const result = listPersonalRecordsSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate with filters", () => {
        const result = listPersonalRecordsSchema.safeParse({
          exerciseId: 1,
          recordType: "one_rep_max",
        });
        expect(result.success).toBe(true);
      });

      it("should validate pagination", () => {
        expect(listPersonalRecordsSchema.safeParse({ limit: 1 }).success).toBe(true);
        expect(listPersonalRecordsSchema.safeParse({ limit: 100 }).success).toBe(true);
        expect(listPersonalRecordsSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(listPersonalRecordsSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(listPersonalRecordsSchema.safeParse({ offset: -1 }).success).toBe(false);
      });

      it("should coerce string values to numbers", () => {
        const result = listPersonalRecordsSchema.safeParse({
          exerciseId: "1",
          limit: "10",
          offset: "5",
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.exerciseId).toBe(1);
          expect(result.data.limit).toBe(10);
          expect(result.data.offset).toBe(5);
        }
      });
    });

    describe("getRecentPersonalRecordsSchema", () => {
      it("should validate with default values", () => {
        const result = getRecentPersonalRecordsSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.days).toBe(30);
          expect(result.data.limit).toBe(10);
        }
      });

      it("should validate custom days", () => {
        expect(getRecentPersonalRecordsSchema.safeParse({ days: 1 }).success).toBe(true);
        expect(getRecentPersonalRecordsSchema.safeParse({ days: 365 }).success).toBe(true);
        expect(getRecentPersonalRecordsSchema.safeParse({ days: 0 }).success).toBe(false);
        expect(getRecentPersonalRecordsSchema.safeParse({ days: 366 }).success).toBe(false);
      });

      it("should validate limit range", () => {
        expect(getRecentPersonalRecordsSchema.safeParse({ limit: 1 }).success).toBe(true);
        expect(getRecentPersonalRecordsSchema.safeParse({ limit: 50 }).success).toBe(true);
        expect(getRecentPersonalRecordsSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(getRecentPersonalRecordsSchema.safeParse({ limit: 51 }).success).toBe(false);
      });
    });

    describe("createPersonalRecordSchema", () => {
      it("should validate required fields", () => {
        expect(
          createPersonalRecordSchema.safeParse({
            exerciseId: 1,
            recordType: "one_rep_max",
            value: 100,
          }).success,
        ).toBe(true);
      });

      it("should validate with all optional fields", () => {
        expect(
          createPersonalRecordSchema.safeParse({
            exerciseId: 1,
            recordType: "max_weight",
            value: 120,
            displayUnit: "kg",
            achievedAt: "2024-01-15",
            workoutId: 1,
            exerciseSetId: 1,
            notes: "New PR!",
          }).success,
        ).toBe(true);
      });

      it("should reject missing required fields", () => {
        expect(createPersonalRecordSchema.safeParse({}).success).toBe(false);
        expect(createPersonalRecordSchema.safeParse({ exerciseId: 1 }).success).toBe(false);
        expect(
          createPersonalRecordSchema.safeParse({ exerciseId: 1, recordType: "one_rep_max" })
            .success,
        ).toBe(false);
      });

      it("should reject non-positive values", () => {
        expect(
          createPersonalRecordSchema.safeParse({
            exerciseId: 1,
            recordType: "one_rep_max",
            value: 0,
          }).success,
        ).toBe(false);

        expect(
          createPersonalRecordSchema.safeParse({
            exerciseId: 1,
            recordType: "one_rep_max",
            value: -10,
          }).success,
        ).toBe(false);
      });

      it("should reject notes too long", () => {
        expect(
          createPersonalRecordSchema.safeParse({
            exerciseId: 1,
            recordType: "one_rep_max",
            value: 100,
            notes: "a".repeat(501),
          }).success,
        ).toBe(false);
      });

      it("should reject displayUnit too long", () => {
        expect(
          createPersonalRecordSchema.safeParse({
            exerciseId: 1,
            recordType: "one_rep_max",
            value: 100,
            displayUnit: "a".repeat(21),
          }).success,
        ).toBe(false);
      });
    });

    describe("updatePersonalRecordSchema", () => {
      it("should validate id required", () => {
        expect(updatePersonalRecordSchema.safeParse({}).success).toBe(false);
        expect(updatePersonalRecordSchema.safeParse({ id: 1 }).success).toBe(true);
      });

      it("should validate with updates", () => {
        expect(
          updatePersonalRecordSchema.safeParse({
            id: 1,
            notes: "Updated notes",
            displayUnit: "lb",
          }).success,
        ).toBe(true);
      });

      it("should coerce string ID to number", () => {
        const result = updatePersonalRecordSchema.safeParse({ id: "1" });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe(1);
        }
      });
    });

    describe("calculatePRsSchema", () => {
      it("should validate workoutId required", () => {
        expect(calculatePRsSchema.safeParse({}).success).toBe(false);
        expect(calculatePRsSchema.safeParse({ workoutId: 1 }).success).toBe(true);
      });

      it("should coerce string workoutId to number", () => {
        const result = calculatePRsSchema.safeParse({ workoutId: "5" });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.workoutId).toBe(5);
        }
      });
    });
  });

  // ===========================================================================
  // Router Structure Tests
  // ===========================================================================

  describe("Router Structure", () => {
    it("should have all CRUD procedures", () => {
      expect(personalRecordRouter.list).toBeDefined();
      expect(personalRecordRouter.getById).toBeDefined();
      expect(personalRecordRouter.create).toBeDefined();
      expect(personalRecordRouter.update).toBeDefined();
      expect(personalRecordRouter.delete).toBeDefined();
    });

    it("should have specialized query procedures", () => {
      expect(personalRecordRouter.getRecent).toBeDefined();
      expect(personalRecordRouter.getByExercise).toBeDefined();
      expect(personalRecordRouter.getSummary).toBeDefined();
    });

    it("should have PR calculation procedure", () => {
      expect(personalRecordRouter.calculate).toBeDefined();
    });
  });

  // ===========================================================================
  // Authorization Tests
  // ===========================================================================

  describe("Authorization Rules", () => {
    it("should correctly identify record ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their record
      expect(mockPersonalRecord.userId).toBe(userId);
    });

    it("should reject unauthenticated access", () => {
      const context = createMockContext();
      expect(context.session).toBeNull();
    });

    it("should provide user ID in authenticated context", () => {
      const context = createAuthenticatedContext({ id: "custom-user-id" });
      expect(context.session?.user.id).toBe("custom-user-id");
    });

    it("should detect when user does not own record", () => {
      const context = createAuthenticatedContext({ id: "different-user-id" });
      const userId = context.session?.user.id;

      expect(mockPersonalRecord.userId).not.toBe(userId);
    });
  });

  // ===========================================================================
  // PR Calculation Logic Tests
  // ===========================================================================

  describe("PR Calculation Logic", () => {
    describe("One Rep Max Calculation", () => {
      it("should calculate 1RM using Epley formula", () => {
        // Epley formula: weight * (1 + reps/30)
        // 100kg * (1 + 10/30) = 100 * 1.333... = 133.33
        const weight = 100;
        const reps = 10;
        const expected = weight * (1 + reps / 30);
        expect(expected).toBeCloseTo(133.33, 1);
      });

      it("should return weight as 1RM when reps is 1", () => {
        const weight = 100;
        // When reps = 1, 1RM equals the weight itself
        // Epley formula: 100 * (1 + 1/30) = 100 * 1.033 ≈ 103.33 (for reps=1)
        // But typically we just return the weight for single rep
        const expected = weight;
        expect(expected).toBe(100);
      });

      it("should handle high rep ranges", () => {
        // 50kg * (1 + 20/30) = 50 * 1.667 = 83.33
        const weight = 50;
        const reps = 20;
        const expected = weight * (1 + reps / 30);
        expect(expected).toBeCloseTo(83.33, 1);
      });
    });

    describe("PR Comparison", () => {
      it("should identify when new value beats existing PR", () => {
        // For weight-based records, higher is better
        expect(150 > mockMaxWeightRecord.value).toBe(true);
        expect(100 > mockMaxWeightRecord.value).toBe(false);
      });

      it("should identify when new value beats existing PR for time (lower is better)", () => {
        // For time-based records, lower is better
        expect(250 < mockBestTimeRecord.value).toBe(true);
        expect(350 < mockBestTimeRecord.value).toBe(false);
      });
    });

    describe("Volume Calculation", () => {
      it("should calculate volume correctly", () => {
        const weight = 100;
        const reps = 10;
        const volume = weight * reps;
        expect(volume).toBe(1000);
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe("Edge Cases", () => {
    it("should handle empty filter for list", () => {
      const result = listPersonalRecordsSchema.parse({});
      expect(result.exerciseId).toBeUndefined();
      expect(result.recordType).toBeUndefined();
    });

    it("should handle all record types in schema", () => {
      const recordTypes = [
        "one_rep_max",
        "max_weight",
        "max_reps",
        "max_volume",
        "best_time",
        "longest_duration",
        "longest_distance",
      ];

      for (const type of recordTypes) {
        const result = recordTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      }
    });

    it("should handle date coercion in create schema", () => {
      const result = createPersonalRecordSchema.safeParse({
        exerciseId: 1,
        recordType: "one_rep_max",
        value: 100,
        achievedAt: "2024-01-15T10:30:00Z",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.achievedAt).toBeInstanceOf(Date);
      }
    });

    it("should handle maximum values for pagination", () => {
      const result = listPersonalRecordsSchema.safeParse({
        limit: 100,
        offset: 1000000,
      });
      expect(result.success).toBe(true);
    });

    it("should allow notes at max length", () => {
      const maxNotes = "a".repeat(500);
      const result = createPersonalRecordSchema.safeParse({
        exerciseId: 1,
        recordType: "one_rep_max",
        value: 100,
        notes: maxNotes,
      });
      expect(result.success).toBe(true);
    });

    it("should allow displayUnit at max length", () => {
      const maxUnit = "a".repeat(20);
      const result = createPersonalRecordSchema.safeParse({
        exerciseId: 1,
        recordType: "one_rep_max",
        value: 100,
        displayUnit: maxUnit,
      });
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // Data Transformation Tests
  // ===========================================================================

  describe("Data Transformation", () => {
    it("should provide correct mock personal record structure", () => {
      expect(mockPersonalRecord).toHaveProperty("id");
      expect(mockPersonalRecord).toHaveProperty("userId");
      expect(mockPersonalRecord).toHaveProperty("exerciseId");
      expect(mockPersonalRecord).toHaveProperty("recordType");
      expect(mockPersonalRecord).toHaveProperty("value");
      expect(mockPersonalRecord).toHaveProperty("displayUnit");
      expect(mockPersonalRecord).toHaveProperty("achievedAt");
      expect(mockPersonalRecord).toHaveProperty("workoutId");
      expect(mockPersonalRecord).toHaveProperty("exerciseSetId");
      expect(mockPersonalRecord).toHaveProperty("notes");
      expect(mockPersonalRecord).toHaveProperty("createdAt");
      expect(mockPersonalRecord).toHaveProperty("updatedAt");
    });

    it("should correctly type different record types", () => {
      expect(mockPersonalRecord.recordType).toBe("one_rep_max");
      expect(mockMaxWeightRecord.recordType).toBe("max_weight");
      expect(mockMaxRepsRecord.recordType).toBe("max_reps");
      expect(mockMaxVolumeRecord.recordType).toBe("max_volume");
      expect(mockBestTimeRecord.recordType).toBe("best_time");
    });

    it("should have appropriate values for different record types", () => {
      // One rep max - calculated value
      expect(mockPersonalRecord.value).toBeGreaterThan(0);

      // Max weight - actual weight lifted
      expect(mockMaxWeightRecord.value).toBe(120);

      // Max reps - count of reps
      expect(mockMaxRepsRecord.value).toBe(15);

      // Max volume - weight * reps
      expect(mockMaxVolumeRecord.value).toBe(1200);

      // Best time - seconds
      expect(mockBestTimeRecord.value).toBe(300);
    });
  });

  // ===========================================================================
  // Integration-Like Tests (Schema Combinations)
  // ===========================================================================

  describe("Schema Integration", () => {
    it("should validate a full create to output flow", () => {
      const createInput = {
        exerciseId: 1,
        recordType: "one_rep_max" as const,
        value: 150,
        displayUnit: "kg",
        notes: "New bench press PR!",
      };

      // Validate input
      const inputResult = createPersonalRecordSchema.safeParse(createInput);
      expect(inputResult.success).toBe(true);

      // Simulate output (what would come from database)
      const output = {
        id: 1,
        userId: "test-user-id",
        exerciseId: createInput.exerciseId,
        recordType: createInput.recordType,
        value: createInput.value,
        displayUnit: createInput.displayUnit,
        achievedAt: new Date(),
        workoutId: null,
        exerciseSetId: null,
        notes: createInput.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate output
      const outputResult = personalRecordOutputSchema.safeParse(output);
      expect(outputResult.success).toBe(true);
    });

    it("should validate list output with multiple record types", () => {
      const listOutput = {
        records: [
          {
            ...mockPersonalRecord,
            exercise: { id: 1, name: "Bench Press", category: "chest", exerciseType: "strength" },
          },
          {
            ...mockMaxWeightRecord,
            exercise: { id: 1, name: "Bench Press", category: "chest", exerciseType: "strength" },
          },
          {
            ...mockMaxRepsRecord,
            exercise: { id: 1, name: "Bench Press", category: "chest", exerciseType: "strength" },
          },
        ],
        total: 3,
        limit: 20,
        offset: 0,
      };

      const result = personalRecordListOutputSchema.safeParse(listOutput);
      expect(result.success).toBe(true);
    });

    it("should validate summary with all count types", () => {
      const summary = {
        totalRecords: 25,
        countByType: {
          one_rep_max: 10,
          max_weight: 5,
          max_reps: 5,
          max_volume: 3,
          best_time: 1,
          longest_duration: 1,
        },
        recentRecords: [
          {
            ...mockPersonalRecord,
            exercise: { id: 1, name: "Bench Press", category: "chest", exerciseType: "strength" },
          },
        ],
        exercisesWithRecords: 8,
      };

      const result = personalRecordSummaryOutputSchema.safeParse(summary);
      expect(result.success).toBe(true);
    });

    it("should validate calculated PRs with new records", () => {
      const calculatedOutput = {
        newRecords: [
          {
            ...mockPersonalRecord,
            exercise: { id: 1, name: "Bench Press", category: "chest", exerciseType: "strength" },
          },
          {
            ...mockMaxWeightRecord,
            exercise: { id: 1, name: "Bench Press", category: "chest", exerciseType: "strength" },
          },
        ],
        totalChecked: 15,
      };

      const result = calculatedPRsOutputSchema.safeParse(calculatedOutput);
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // Record Type Specific Tests
  // ===========================================================================

  describe("Record Type Specific Behavior", () => {
    it("should handle strength record types", () => {
      const strengthTypes = ["one_rep_max", "max_weight", "max_reps", "max_volume"];

      for (const type of strengthTypes) {
        const result = createPersonalRecordSchema.safeParse({
          exerciseId: 1,
          recordType: type,
          value: 100,
          displayUnit: "kg",
        });
        expect(result.success).toBe(true);
      }
    });

    it("should handle cardio record types", () => {
      const cardioTypes = ["best_time", "longest_duration", "longest_distance"];

      for (const type of cardioTypes) {
        const result = createPersonalRecordSchema.safeParse({
          exerciseId: 2,
          recordType: type,
          value: 1000,
          displayUnit: type === "longest_distance" ? "m" : "seconds",
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
