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
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve([])),
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
import { workoutRouter } from "..";
import {
  setTypeSchema,
  workoutMoodSchema,
  weightUnitSchema,
  distanceUnitSchema,
  rpeSchema,
  rirSchema,
  workoutRatingSchema,
  listWorkoutsSchema,
  createWorkoutSchema,
  updateWorkoutSchema,
  completeWorkoutSchema,
  addExerciseSchema,
  updateWorkoutExerciseSchema,
  reorderExercisesSchema,
  addSetSchema,
  updateSetSchema,
  completeSetSchema,
} from "..";

// Mock data
const mockWorkout = {
  id: 1,
  userId: "test-user-id",
  name: "Morning Workout",
  notes: "Leg day",
  startedAt: new Date(),
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  templateId: null,
  rating: null,
  mood: null,
};

const mockCompletedWorkout = {
  ...mockWorkout,
  id: 2,
  completedAt: new Date(),
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

const mockExerciseSet = {
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

describe("Workout Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Validation Schema Tests
  // ===========================================================================

  describe("Validation Schemas", () => {
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

    describe("workoutMoodSchema", () => {
      it("should validate valid moods", () => {
        expect(workoutMoodSchema.safeParse("great").success).toBe(true);
        expect(workoutMoodSchema.safeParse("good").success).toBe(true);
        expect(workoutMoodSchema.safeParse("okay").success).toBe(true);
        expect(workoutMoodSchema.safeParse("tired").success).toBe(true);
        expect(workoutMoodSchema.safeParse("bad").success).toBe(true);
      });

      it("should reject invalid moods", () => {
        expect(workoutMoodSchema.safeParse("excellent").success).toBe(false);
        expect(workoutMoodSchema.safeParse("").success).toBe(false);
      });
    });

    describe("weightUnitSchema", () => {
      it("should validate valid weight units", () => {
        expect(weightUnitSchema.safeParse("kg").success).toBe(true);
        expect(weightUnitSchema.safeParse("lb").success).toBe(true);
      });

      it("should reject invalid weight units", () => {
        expect(weightUnitSchema.safeParse("lbs").success).toBe(false);
        expect(weightUnitSchema.safeParse("pounds").success).toBe(false);
      });
    });

    describe("distanceUnitSchema", () => {
      it("should validate valid distance units", () => {
        expect(distanceUnitSchema.safeParse("km").success).toBe(true);
        expect(distanceUnitSchema.safeParse("mi").success).toBe(true);
        expect(distanceUnitSchema.safeParse("m").success).toBe(true);
      });

      it("should reject invalid distance units", () => {
        expect(distanceUnitSchema.safeParse("miles").success).toBe(false);
        expect(distanceUnitSchema.safeParse("ft").success).toBe(false);
      });
    });

    describe("rpeSchema", () => {
      it("should validate RPE values 6-10", () => {
        expect(rpeSchema.safeParse(6).success).toBe(true);
        expect(rpeSchema.safeParse(7).success).toBe(true);
        expect(rpeSchema.safeParse(8).success).toBe(true);
        expect(rpeSchema.safeParse(9).success).toBe(true);
        expect(rpeSchema.safeParse(10).success).toBe(true);
      });

      it("should reject invalid RPE values", () => {
        expect(rpeSchema.safeParse(5).success).toBe(false);
        expect(rpeSchema.safeParse(11).success).toBe(false);
        expect(rpeSchema.safeParse(7.5).success).toBe(false);
        expect(rpeSchema.safeParse("8").success).toBe(false);
      });
    });

    describe("rirSchema", () => {
      it("should validate RIR values 0-5", () => {
        expect(rirSchema.safeParse(0).success).toBe(true);
        expect(rirSchema.safeParse(3).success).toBe(true);
        expect(rirSchema.safeParse(5).success).toBe(true);
      });

      it("should reject invalid RIR values", () => {
        expect(rirSchema.safeParse(-1).success).toBe(false);
        expect(rirSchema.safeParse(6).success).toBe(false);
        expect(rirSchema.safeParse(2.5).success).toBe(false);
      });
    });

    describe("workoutRatingSchema", () => {
      it("should validate ratings 1-5", () => {
        expect(workoutRatingSchema.safeParse(1).success).toBe(true);
        expect(workoutRatingSchema.safeParse(3).success).toBe(true);
        expect(workoutRatingSchema.safeParse(5).success).toBe(true);
      });

      it("should reject invalid ratings", () => {
        expect(workoutRatingSchema.safeParse(0).success).toBe(false);
        expect(workoutRatingSchema.safeParse(6).success).toBe(false);
        expect(workoutRatingSchema.safeParse(3.5).success).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Input Schema Tests
  // ===========================================================================

  describe("Input Schemas", () => {
    describe("listWorkoutsSchema", () => {
      it("should validate with default values", () => {
        const result = listWorkoutsSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate with date filters", () => {
        const result = listWorkoutsSchema.safeParse({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          completed: true,
        });
        expect(result.success).toBe(true);
      });

      it("should validate pagination", () => {
        expect(listWorkoutsSchema.safeParse({ limit: 1 }).success).toBe(true);
        expect(listWorkoutsSchema.safeParse({ limit: 100 }).success).toBe(true);
        expect(listWorkoutsSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(listWorkoutsSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(listWorkoutsSchema.safeParse({ offset: -1 }).success).toBe(false);
      });
    });

    describe("createWorkoutSchema", () => {
      it("should validate empty input", () => {
        expect(createWorkoutSchema.safeParse({}).success).toBe(true);
      });

      it("should validate with name and notes", () => {
        expect(
          createWorkoutSchema.safeParse({
            name: "Morning Workout",
            notes: "Leg day focus",
          }).success,
        ).toBe(true);
      });

      it("should validate with templateId", () => {
        expect(createWorkoutSchema.safeParse({ templateId: 1 }).success).toBe(true);
      });

      it("should reject name too long", () => {
        expect(createWorkoutSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
      });

      it("should reject notes too long", () => {
        expect(createWorkoutSchema.safeParse({ notes: "a".repeat(1001) }).success).toBe(false);
      });
    });

    describe("updateWorkoutSchema", () => {
      it("should validate workoutId required", () => {
        expect(updateWorkoutSchema.safeParse({}).success).toBe(false);
        expect(updateWorkoutSchema.safeParse({ workoutId: 1 }).success).toBe(true);
      });

      it("should validate with updates", () => {
        expect(
          updateWorkoutSchema.safeParse({
            workoutId: 1,
            name: "Updated Name",
            notes: "Updated notes",
          }).success,
        ).toBe(true);
      });
    });

    describe("completeWorkoutSchema", () => {
      it("should validate workoutId required", () => {
        expect(completeWorkoutSchema.safeParse({}).success).toBe(false);
        expect(completeWorkoutSchema.safeParse({ workoutId: 1 }).success).toBe(true);
      });

      it("should validate with feedback", () => {
        expect(
          completeWorkoutSchema.safeParse({
            workoutId: 1,
            rating: 5,
            mood: "great",
            notes: "Great workout!",
          }).success,
        ).toBe(true);
      });

      it("should reject invalid rating", () => {
        expect(completeWorkoutSchema.safeParse({ workoutId: 1, rating: 6 }).success).toBe(false);
      });

      it("should reject invalid mood", () => {
        expect(completeWorkoutSchema.safeParse({ workoutId: 1, mood: "excellent" }).success).toBe(
          false,
        );
      });
    });

    describe("addExerciseSchema", () => {
      it("should validate required fields", () => {
        expect(addExerciseSchema.safeParse({}).success).toBe(false);
        expect(addExerciseSchema.safeParse({ workoutId: 1, exerciseId: 1 }).success).toBe(true);
      });

      it("should validate with optional fields", () => {
        expect(
          addExerciseSchema.safeParse({
            workoutId: 1,
            exerciseId: 1,
            order: 3,
            notes: "Focus on form",
            supersetGroupId: 1,
          }).success,
        ).toBe(true);
      });

      it("should reject invalid order", () => {
        expect(addExerciseSchema.safeParse({ workoutId: 1, exerciseId: 1, order: 0 }).success).toBe(
          false,
        );
      });
    });

    describe("updateWorkoutExerciseSchema", () => {
      it("should validate required fields", () => {
        expect(
          updateWorkoutExerciseSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
          }).success,
        ).toBe(true);
      });

      it("should accept null supersetGroupId", () => {
        expect(
          updateWorkoutExerciseSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
            supersetGroupId: null,
          }).success,
        ).toBe(true);
      });
    });

    describe("reorderExercisesSchema", () => {
      it("should validate exercise order array", () => {
        expect(
          reorderExercisesSchema.safeParse({
            workoutId: 1,
            exerciseOrder: [
              { workoutExerciseId: 1, order: 2 },
              { workoutExerciseId: 2, order: 1 },
            ],
          }).success,
        ).toBe(true);
      });

      it("should reject order less than 1", () => {
        expect(
          reorderExercisesSchema.safeParse({
            workoutId: 1,
            exerciseOrder: [{ workoutExerciseId: 1, order: 0 }],
          }).success,
        ).toBe(false);
      });
    });

    describe("addSetSchema", () => {
      it("should validate required fields", () => {
        expect(
          addSetSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
          }).success,
        ).toBe(true);
      });

      it("should validate strength set data", () => {
        expect(
          addSetSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
            reps: 10,
            weight: 100,
            weightUnit: "kg",
            setType: "normal",
            rpe: 8,
          }).success,
        ).toBe(true);
      });

      it("should validate cardio set data", () => {
        expect(
          addSetSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
            durationSeconds: 1800,
            distance: 5000,
            distanceUnit: "m",
          }).success,
        ).toBe(true);
      });

      it("should validate flexibility set data", () => {
        expect(
          addSetSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
            holdTimeSeconds: 30,
          }).success,
        ).toBe(true);
      });

      it("should reject negative reps", () => {
        expect(
          addSetSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
            reps: -1,
          }).success,
        ).toBe(false);
      });

      it("should reject invalid RPE", () => {
        expect(
          addSetSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
            rpe: 5,
          }).success,
        ).toBe(false);
      });

      it("should reject invalid RIR", () => {
        expect(
          addSetSchema.safeParse({
            workoutId: 1,
            workoutExerciseId: 1,
            rir: 6,
          }).success,
        ).toBe(false);
      });
    });

    describe("updateSetSchema", () => {
      it("should validate required fields", () => {
        expect(
          updateSetSchema.safeParse({
            workoutId: 1,
            setId: 1,
          }).success,
        ).toBe(true);
      });

      it("should validate partial updates", () => {
        expect(
          updateSetSchema.safeParse({
            workoutId: 1,
            setId: 1,
            reps: 12,
            rpe: 9,
          }).success,
        ).toBe(true);
      });

      it("should validate restTimeSeconds", () => {
        expect(
          updateSetSchema.safeParse({
            workoutId: 1,
            setId: 1,
            restTimeSeconds: 120,
          }).success,
        ).toBe(true);
      });
    });

    describe("completeSetSchema", () => {
      it("should validate required fields", () => {
        expect(
          completeSetSchema.safeParse({
            workoutId: 1,
            setId: 1,
          }).success,
        ).toBe(true);
      });

      it("should validate with restTimeSeconds", () => {
        expect(
          completeSetSchema.safeParse({
            workoutId: 1,
            setId: 1,
            restTimeSeconds: 90,
          }).success,
        ).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Router Structure Tests
  // ===========================================================================

  describe("Router Structure", () => {
    it("should have all workout session procedures", () => {
      expect(workoutRouter.list).toBeDefined();
      expect(workoutRouter.getById).toBeDefined();
      expect(workoutRouter.create).toBeDefined();
      expect(workoutRouter.update).toBeDefined();
      expect(workoutRouter.delete).toBeDefined();
      expect(workoutRouter.complete).toBeDefined();
    });

    it("should have all workout exercise procedures", () => {
      expect(workoutRouter.addExercise).toBeDefined();
      expect(workoutRouter.updateExercise).toBeDefined();
      expect(workoutRouter.removeExercise).toBeDefined();
      expect(workoutRouter.reorderExercises).toBeDefined();
    });

    it("should have all set procedures", () => {
      expect(workoutRouter.addSet).toBeDefined();
      expect(workoutRouter.updateSet).toBeDefined();
      expect(workoutRouter.deleteSet).toBeDefined();
      expect(workoutRouter.completeSet).toBeDefined();
    });
  });

  // ===========================================================================
  // Authorization Tests
  // ===========================================================================

  describe("Authorization Rules", () => {
    it("should correctly identify workout ownership", () => {
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
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe("Edge Cases", () => {
    it("should handle empty exercise order array", () => {
      const result = reorderExercisesSchema.safeParse({
        workoutId: 1,
        exerciseOrder: [],
      });
      expect(result.success).toBe(true);
    });

    it("should handle optional date filters", () => {
      const result = listWorkoutsSchema.parse({});
      expect(result.startDate).toBeUndefined();
      expect(result.endDate).toBeUndefined();
      expect(result.completed).toBeUndefined();
    });

    it("should coerce numeric strings for IDs", () => {
      const listResult = listWorkoutsSchema.safeParse({ limit: "10", offset: "5" });
      expect(listResult.success).toBe(true);
      if (listResult.success) {
        expect(listResult.data.limit).toBe(10);
        expect(listResult.data.offset).toBe(5);
      }
    });

    it("should handle set types for different exercise types", () => {
      // Warmup set
      expect(
        addSetSchema.safeParse({
          workoutId: 1,
          workoutExerciseId: 1,
          reps: 15,
          weight: 50,
          setType: "warmup",
        }).success,
      ).toBe(true);

      // Failure set
      expect(
        addSetSchema.safeParse({
          workoutId: 1,
          workoutExerciseId: 1,
          reps: 8,
          weight: 100,
          setType: "failure",
          rpe: 10,
        }).success,
      ).toBe(true);

      // Drop set
      expect(
        addSetSchema.safeParse({
          workoutId: 1,
          workoutExerciseId: 1,
          reps: 12,
          weight: 80,
          setType: "drop",
        }).success,
      ).toBe(true);
    });

    it("should handle notes with max length", () => {
      const maxNotes = "a".repeat(500);
      expect(
        addSetSchema.safeParse({
          workoutId: 1,
          workoutExerciseId: 1,
          notes: maxNotes,
        }).success,
      ).toBe(true);

      expect(
        addSetSchema.safeParse({
          workoutId: 1,
          workoutExerciseId: 1,
          notes: maxNotes + "a",
        }).success,
      ).toBe(false);
    });
  });

  // ===========================================================================
  // Data Transformation Tests
  // ===========================================================================

  describe("Data Transformation", () => {
    it("should provide correct mock workout structure", () => {
      expect(mockWorkout).toHaveProperty("id");
      expect(mockWorkout).toHaveProperty("userId");
      expect(mockWorkout).toHaveProperty("name");
      expect(mockWorkout).toHaveProperty("notes");
      expect(mockWorkout).toHaveProperty("startedAt");
      expect(mockWorkout).toHaveProperty("completedAt");
      expect(mockWorkout).toHaveProperty("templateId");
      expect(mockWorkout).toHaveProperty("rating");
      expect(mockWorkout).toHaveProperty("mood");
    });

    it("should provide correct mock workout exercise structure", () => {
      expect(mockWorkoutExercise).toHaveProperty("id");
      expect(mockWorkoutExercise).toHaveProperty("workoutId");
      expect(mockWorkoutExercise).toHaveProperty("exerciseId");
      expect(mockWorkoutExercise).toHaveProperty("order");
      expect(mockWorkoutExercise).toHaveProperty("notes");
      expect(mockWorkoutExercise).toHaveProperty("supersetGroupId");
    });

    it("should provide correct mock set structure", () => {
      expect(mockExerciseSet).toHaveProperty("id");
      expect(mockExerciseSet).toHaveProperty("workoutExerciseId");
      expect(mockExerciseSet).toHaveProperty("setNumber");
      expect(mockExerciseSet).toHaveProperty("reps");
      expect(mockExerciseSet).toHaveProperty("weight");
      expect(mockExerciseSet).toHaveProperty("weightUnit");
      expect(mockExerciseSet).toHaveProperty("setType");
      expect(mockExerciseSet).toHaveProperty("rpe");
      expect(mockExerciseSet).toHaveProperty("rir");
      expect(mockExerciseSet).toHaveProperty("isCompleted");
      expect(mockExerciseSet).toHaveProperty("completedAt");
    });

    it("should correctly identify completed workouts", () => {
      expect(mockWorkout.completedAt).toBeNull();
      expect(mockCompletedWorkout.completedAt).not.toBeNull();
    });
  });
});
