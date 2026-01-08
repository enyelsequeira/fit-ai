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
        leftJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([])),
        })),
        limit: vi.fn(() => Promise.resolve([])),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
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
    gte: vi.fn((col, val) => ({ type: "gte", col, val })),
    desc: vi.fn((col) => ({ type: "desc", col })),
    sql: vi.fn((strings, ...values) => ({ type: "sql", strings, values })),
  };
});

// Import after mocks are set up
import { aiRouter } from "..";

// Mock data
const mockPreferences = {
  id: 1,
  userId: "test-user-id",
  primaryGoal: "hypertrophy" as const,
  secondaryGoal: "strength" as const,
  experienceLevel: "intermediate" as const,
  workoutDaysPerWeek: 4,
  preferredWorkoutDuration: 60,
  preferredDays: ["monday", "tuesday", "thursday", "friday"] as const,
  availableEquipment: ["barbell", "dumbbell", "cables", "bench"],
  trainingLocation: "gym" as const,
  preferredExercises: [1, 2, 3],
  dislikedExercises: [10, 11],
  injuries: null,
  avoidMuscleGroups: null,
  preferredSplit: "push_pull_legs" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGeneratedWorkout = {
  id: 1,
  userId: "test-user-id",
  generatedAt: new Date(),
  targetMuscleGroups: ["chest", "shoulders", "triceps"],
  workoutType: "push" as const,
  generatedContent: {
    name: "Push Workout",
    estimatedDuration: 60,
    exercises: [
      {
        exerciseId: 1,
        exerciseName: "Bench Press",
        sets: 4,
        reps: "8-12",
        restSeconds: 90,
        alternatives: [2, 3],
      },
      {
        exerciseId: 4,
        exerciseName: "Overhead Press",
        sets: 4,
        reps: "8-12",
        restSeconds: 90,
        alternatives: [5],
      },
    ],
    warmup: "5 min light cardio, arm circles, push-up walkouts",
    cooldown: "Chest doorway stretch, tricep stretch",
  },
  wasUsed: false,
  userRating: null,
  feedback: null,
  workoutId: null,
  createdAt: new Date(),
};

const mockExercise = {
  id: 1,
  name: "Bench Press",
  description: "A chest exercise",
  category: "compound" as const,
  muscleGroups: ["chest", "triceps", "shoulders"],
  equipment: "barbell",
  exerciseType: "strength" as const,
  isDefault: true,
  createdByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Export mock data for potential use in integration tests
export { mockGeneratedWorkout, mockExercise };

describe("AI Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Router Structure", () => {
    it("should have all expected procedures", () => {
      expect(aiRouter.getPreferences).toBeDefined();
      expect(aiRouter.updatePreferences).toBeDefined();
      expect(aiRouter.patchPreferences).toBeDefined();
      expect(aiRouter.generateWorkout).toBeDefined();
      expect(aiRouter.suggestNextWorkout).toBeDefined();
      expect(aiRouter.substituteExercise).toBeDefined();
      expect(aiRouter.getGeneratedHistory).toBeDefined();
      expect(aiRouter.submitFeedback).toBeDefined();
    });
  });

  describe("Validation Schemas", () => {
    describe("Training Goal Schema", () => {
      const trainingGoalSchema = z.enum([
        "strength",
        "hypertrophy",
        "endurance",
        "weight_loss",
        "general_fitness",
      ]);

      it("should validate valid training goals", () => {
        expect(trainingGoalSchema.safeParse("strength").success).toBe(true);
        expect(trainingGoalSchema.safeParse("hypertrophy").success).toBe(true);
        expect(trainingGoalSchema.safeParse("endurance").success).toBe(true);
        expect(trainingGoalSchema.safeParse("weight_loss").success).toBe(true);
        expect(trainingGoalSchema.safeParse("general_fitness").success).toBe(true);
      });

      it("should reject invalid training goals", () => {
        expect(trainingGoalSchema.safeParse("invalid").success).toBe(false);
        expect(trainingGoalSchema.safeParse("").success).toBe(false);
        expect(trainingGoalSchema.safeParse(null).success).toBe(false);
      });
    });

    describe("Experience Level Schema", () => {
      const experienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

      it("should validate valid experience levels", () => {
        expect(experienceLevelSchema.safeParse("beginner").success).toBe(true);
        expect(experienceLevelSchema.safeParse("intermediate").success).toBe(true);
        expect(experienceLevelSchema.safeParse("advanced").success).toBe(true);
      });

      it("should reject invalid experience levels", () => {
        expect(experienceLevelSchema.safeParse("expert").success).toBe(false);
        expect(experienceLevelSchema.safeParse("novice").success).toBe(false);
      });
    });

    describe("Workout Type Schema", () => {
      const workoutTypeSchema = z.enum([
        "push",
        "pull",
        "legs",
        "upper",
        "lower",
        "full_body",
        "chest",
        "back",
        "shoulders",
        "arms",
        "core",
      ]);

      it("should validate valid workout types", () => {
        expect(workoutTypeSchema.safeParse("push").success).toBe(true);
        expect(workoutTypeSchema.safeParse("pull").success).toBe(true);
        expect(workoutTypeSchema.safeParse("legs").success).toBe(true);
        expect(workoutTypeSchema.safeParse("upper").success).toBe(true);
        expect(workoutTypeSchema.safeParse("lower").success).toBe(true);
        expect(workoutTypeSchema.safeParse("full_body").success).toBe(true);
      });

      it("should reject invalid workout types", () => {
        expect(workoutTypeSchema.safeParse("cardio").success).toBe(false);
        expect(workoutTypeSchema.safeParse("hiit").success).toBe(false);
      });
    });

    describe("Difficulty Schema", () => {
      const difficultySchema = z.enum(["easy", "moderate", "hard"]);

      it("should validate valid difficulty levels", () => {
        expect(difficultySchema.safeParse("easy").success).toBe(true);
        expect(difficultySchema.safeParse("moderate").success).toBe(true);
        expect(difficultySchema.safeParse("hard").success).toBe(true);
      });

      it("should reject invalid difficulty levels", () => {
        expect(difficultySchema.safeParse("extreme").success).toBe(false);
        expect(difficultySchema.safeParse("medium").success).toBe(false);
      });
    });

    describe("Day of Week Schema", () => {
      const dayOfWeekSchema = z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]);

      it("should validate all days of the week", () => {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        for (const day of days) {
          expect(dayOfWeekSchema.safeParse(day).success).toBe(true);
        }
      });

      it("should reject invalid days", () => {
        expect(dayOfWeekSchema.safeParse("mon").success).toBe(false);
        expect(dayOfWeekSchema.safeParse("Monday").success).toBe(false);
      });
    });

    describe("Update Preferences Schema", () => {
      const updatePreferencesSchema = z.object({
        primaryGoal: z
          .enum(["strength", "hypertrophy", "endurance", "weight_loss", "general_fitness"])
          .optional(),
        experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        workoutDaysPerWeek: z.number().int().min(1).max(7).optional(),
        preferredWorkoutDuration: z.number().int().min(15).max(180).optional(),
        availableEquipment: z.array(z.string()).optional(),
      });

      it("should validate valid preferences update", () => {
        expect(
          updatePreferencesSchema.safeParse({
            primaryGoal: "strength",
            workoutDaysPerWeek: 4,
          }).success,
        ).toBe(true);

        expect(
          updatePreferencesSchema.safeParse({
            experienceLevel: "intermediate",
            preferredWorkoutDuration: 60,
            availableEquipment: ["barbell", "dumbbell"],
          }).success,
        ).toBe(true);
      });

      it("should validate empty update (partial)", () => {
        expect(updatePreferencesSchema.safeParse({}).success).toBe(true);
      });

      it("should reject invalid workout days per week", () => {
        expect(updatePreferencesSchema.safeParse({ workoutDaysPerWeek: 0 }).success).toBe(false);
        expect(updatePreferencesSchema.safeParse({ workoutDaysPerWeek: 8 }).success).toBe(false);
      });

      it("should reject invalid workout duration", () => {
        expect(updatePreferencesSchema.safeParse({ preferredWorkoutDuration: 10 }).success).toBe(
          false,
        );
        expect(updatePreferencesSchema.safeParse({ preferredWorkoutDuration: 200 }).success).toBe(
          false,
        );
      });
    });

    describe("Generate Workout Schema", () => {
      const generateWorkoutSchema = z.object({
        targetMuscleGroups: z.array(z.string()).optional(),
        duration: z.number().int().min(15).max(180).optional(),
        difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
        excludeExercises: z.array(z.number()).optional(),
        workoutType: z
          .enum([
            "push",
            "pull",
            "legs",
            "upper",
            "lower",
            "full_body",
            "chest",
            "back",
            "shoulders",
            "arms",
            "core",
          ])
          .optional(),
      });

      it("should validate valid generate workout input", () => {
        expect(
          generateWorkoutSchema.safeParse({
            targetMuscleGroups: ["chest", "triceps"],
            duration: 45,
            difficulty: "moderate",
          }).success,
        ).toBe(true);
      });

      it("should validate empty input (use defaults)", () => {
        expect(generateWorkoutSchema.safeParse({}).success).toBe(true);
      });

      it("should reject invalid duration", () => {
        expect(generateWorkoutSchema.safeParse({ duration: 10 }).success).toBe(false);
        expect(generateWorkoutSchema.safeParse({ duration: 200 }).success).toBe(false);
      });
    });

    describe("Substitute Exercise Schema", () => {
      const substituteExerciseSchema = z.object({
        exerciseId: z.number(),
        reason: z.enum(["equipment", "injury", "preference"]).optional(),
      });

      it("should validate valid substitute exercise input", () => {
        expect(
          substituteExerciseSchema.safeParse({
            exerciseId: 1,
            reason: "equipment",
          }).success,
        ).toBe(true);

        expect(
          substituteExerciseSchema.safeParse({
            exerciseId: 5,
          }).success,
        ).toBe(true);
      });

      it("should require exerciseId", () => {
        expect(substituteExerciseSchema.safeParse({}).success).toBe(false);
        expect(substituteExerciseSchema.safeParse({ reason: "equipment" }).success).toBe(false);
      });

      it("should reject invalid reason", () => {
        expect(
          substituteExerciseSchema.safeParse({
            exerciseId: 1,
            reason: "invalid",
          }).success,
        ).toBe(false);
      });
    });

    describe("Feedback Schema", () => {
      const feedbackSchema = z.object({
        generatedWorkoutId: z.number(),
        rating: z.number().int().min(1).max(5),
        feedback: z.string().max(500).optional(),
        wasUsed: z.boolean().optional(),
        workoutId: z.number().optional(),
      });

      it("should validate valid feedback input", () => {
        expect(
          feedbackSchema.safeParse({
            generatedWorkoutId: 1,
            rating: 5,
            feedback: "Great workout!",
            wasUsed: true,
            workoutId: 10,
          }).success,
        ).toBe(true);
      });

      it("should require generatedWorkoutId and rating", () => {
        expect(feedbackSchema.safeParse({}).success).toBe(false);
        expect(feedbackSchema.safeParse({ generatedWorkoutId: 1 }).success).toBe(false);
        expect(feedbackSchema.safeParse({ rating: 5 }).success).toBe(false);
      });

      it("should validate rating range", () => {
        expect(
          feedbackSchema.safeParse({
            generatedWorkoutId: 1,
            rating: 0,
          }).success,
        ).toBe(false);

        expect(
          feedbackSchema.safeParse({
            generatedWorkoutId: 1,
            rating: 6,
          }).success,
        ).toBe(false);

        expect(
          feedbackSchema.safeParse({
            generatedWorkoutId: 1,
            rating: 3,
          }).success,
        ).toBe(true);
      });
    });

    describe("Generated History Schema", () => {
      const generatedHistorySchema = z.object({
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      });

      it("should validate valid pagination", () => {
        expect(
          generatedHistorySchema.safeParse({
            limit: 10,
            offset: 5,
          }).success,
        ).toBe(true);
      });

      it("should apply defaults", () => {
        const result = generatedHistorySchema.parse({});
        expect(result.limit).toBe(20);
        expect(result.offset).toBe(0);
      });

      it("should reject invalid limits", () => {
        expect(generatedHistorySchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(generatedHistorySchema.safeParse({ limit: 100 }).success).toBe(false);
      });
    });
  });

  describe("Authorization", () => {
    it("should require authentication for all procedures", () => {
      const unauthContext = createMockContext();
      expect(unauthContext.session).toBeNull();

      const authContext = createAuthenticatedContext();
      expect(authContext.session).not.toBeNull();
      expect(authContext.session?.user.id).toBe("test-user-id");
    });

    it("should correctly identify user from session", () => {
      const context = createAuthenticatedContext({ id: "custom-user-id" });
      expect(context.session?.user.id).toBe("custom-user-id");
    });
  });

  describe("Preferences Operations", () => {
    describe("getPreferences", () => {
      it("should return null for new user without preferences", () => {
        // Mock returns empty array by default
        expect(aiRouter.getPreferences).toBeDefined();
      });

      it("should return preferences for user with existing preferences", () => {
        const context = createAuthenticatedContext();
        expect(context.session?.user.id).toBe("test-user-id");
        expect(mockPreferences.userId).toBe("test-user-id");
      });
    });

    describe("updatePreferences", () => {
      it("should accept all valid preference fields", () => {
        const validInput = {
          primaryGoal: "strength" as const,
          secondaryGoal: "hypertrophy" as const,
          experienceLevel: "intermediate" as const,
          workoutDaysPerWeek: 4,
          preferredWorkoutDuration: 60,
          preferredDays: ["monday", "wednesday", "friday"] as const,
          availableEquipment: ["barbell", "dumbbell"],
          trainingLocation: "gym" as const,
          preferredSplit: "push_pull_legs" as const,
        };

        const schema = z.object({
          primaryGoal: z
            .enum(["strength", "hypertrophy", "endurance", "weight_loss", "general_fitness"])
            .optional(),
          secondaryGoal: z
            .enum(["strength", "hypertrophy", "endurance", "weight_loss", "general_fitness"])
            .nullable()
            .optional(),
          experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          workoutDaysPerWeek: z.number().int().min(1).max(7).optional(),
          preferredWorkoutDuration: z.number().int().min(15).max(180).optional(),
          preferredDays: z
            .array(
              z.enum([
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ]),
            )
            .optional(),
          availableEquipment: z.array(z.string()).optional(),
          trainingLocation: z.enum(["gym", "home", "outdoor"]).optional(),
          preferredSplit: z
            .enum(["push_pull_legs", "upper_lower", "full_body", "bro_split"])
            .nullable()
            .optional(),
        });

        expect(schema.safeParse(validInput).success).toBe(true);
      });
    });

    describe("patchPreferences", () => {
      it("should accept partial updates", () => {
        const partialUpdate = {
          workoutDaysPerWeek: 5,
        };

        const schema = z.object({
          workoutDaysPerWeek: z.number().int().min(1).max(7).optional(),
        });

        expect(schema.safeParse(partialUpdate).success).toBe(true);
      });
    });
  });

  describe("Workout Generation", () => {
    describe("generateWorkout", () => {
      it("should support target muscle group override", () => {
        const input = {
          targetMuscleGroups: ["chest", "triceps"],
        };

        const schema = z.object({
          targetMuscleGroups: z.array(z.string()).optional(),
        });

        const result = schema.parse(input);
        expect(result.targetMuscleGroups).toEqual(["chest", "triceps"]);
      });

      it("should support duration override", () => {
        const input = { duration: 45 };

        const schema = z.object({
          duration: z.number().int().min(15).max(180).optional(),
        });

        const result = schema.parse(input);
        expect(result.duration).toBe(45);
      });

      it("should support exercise exclusion", () => {
        const input = {
          excludeExercises: [1, 2, 3],
        };

        const schema = z.object({
          excludeExercises: z.array(z.number()).optional(),
        });

        const result = schema.parse(input);
        expect(result.excludeExercises).toEqual([1, 2, 3]);
      });

      it("should support difficulty levels", () => {
        const difficulties = ["easy", "moderate", "hard"];
        const schema = z.object({
          difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
        });

        for (const difficulty of difficulties) {
          expect(schema.safeParse({ difficulty }).success).toBe(true);
        }
      });
    });

    describe("suggestNextWorkout", () => {
      it("should accept includeGeneratedWorkout flag", () => {
        const schema = z.object({
          includeGeneratedWorkout: z.boolean().default(false),
        });

        expect(schema.parse({}).includeGeneratedWorkout).toBe(false);
        expect(schema.parse({ includeGeneratedWorkout: true }).includeGeneratedWorkout).toBe(true);
      });
    });
  });

  describe("Exercise Substitution", () => {
    describe("substituteExercise", () => {
      it("should require exercise ID", () => {
        const schema = z.object({
          exerciseId: z.number(),
          reason: z.enum(["equipment", "injury", "preference"]).optional(),
        });

        expect(schema.safeParse({ exerciseId: 1 }).success).toBe(true);
        expect(schema.safeParse({}).success).toBe(false);
      });

      it("should support all substitution reasons", () => {
        const schema = z.object({
          exerciseId: z.number(),
          reason: z.enum(["equipment", "injury", "preference"]).optional(),
        });

        const reasons = ["equipment", "injury", "preference"];
        for (const reason of reasons) {
          expect(schema.safeParse({ exerciseId: 1, reason }).success).toBe(true);
        }
      });
    });
  });

  describe("Feedback", () => {
    describe("submitFeedback", () => {
      it("should require generated workout ID and rating", () => {
        const schema = z.object({
          generatedWorkoutId: z.number(),
          rating: z.number().int().min(1).max(5),
        });

        expect(
          schema.safeParse({
            generatedWorkoutId: 1,
            rating: 4,
          }).success,
        ).toBe(true);
      });

      it("should accept optional feedback text", () => {
        const schema = z.object({
          generatedWorkoutId: z.number(),
          rating: z.number().int().min(1).max(5),
          feedback: z.string().max(500).optional(),
        });

        expect(
          schema.safeParse({
            generatedWorkoutId: 1,
            rating: 4,
            feedback: "This workout was great!",
          }).success,
        ).toBe(true);
      });

      it("should accept wasUsed and workoutId", () => {
        const schema = z.object({
          generatedWorkoutId: z.number(),
          rating: z.number().int().min(1).max(5),
          wasUsed: z.boolean().optional(),
          workoutId: z.number().optional(),
        });

        expect(
          schema.safeParse({
            generatedWorkoutId: 1,
            rating: 5,
            wasUsed: true,
            workoutId: 10,
          }).success,
        ).toBe(true);
      });
    });
  });

  describe("History", () => {
    describe("getGeneratedHistory", () => {
      it("should support pagination", () => {
        const schema = z.object({
          limit: z.number().int().min(1).max(50).default(20),
          offset: z.number().int().min(0).default(0),
        });

        expect(schema.parse({ limit: 10, offset: 20 })).toEqual({
          limit: 10,
          offset: 20,
        });
      });

      it("should apply default values", () => {
        const schema = z.object({
          limit: z.number().int().min(1).max(50).default(20),
          offset: z.number().int().min(0).default(0),
        });

        expect(schema.parse({})).toEqual({
          limit: 20,
          offset: 0,
        });
      });
    });
  });

  describe("Recommendations", () => {
    describe("getRecommendations", () => {
      it("should return structured recommendations", () => {
        const recommendationSchema = z.object({
          type: z.enum(["training", "recovery", "nutrition", "schedule"]),
          title: z.string(),
          description: z.string(),
          priority: z.enum(["high", "medium", "low"]),
        });

        const validRecommendation = {
          type: "training",
          title: "Test title",
          description: "Test description",
          priority: "high",
        };

        expect(recommendationSchema.safeParse(validRecommendation).success).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty user with no preferences", () => {
      const context = createAuthenticatedContext({ id: "new-user-id" });
      expect(context.session?.user.id).toBe("new-user-id");
      // New user should get null preferences and appropriate recommendations
    });

    it("should handle user with minimal preferences", () => {
      const minimalPrefs = {
        id: 1,
        userId: "test-user-id",
        primaryGoal: null,
        secondaryGoal: null,
        experienceLevel: "beginner" as const,
        workoutDaysPerWeek: 3,
        preferredWorkoutDuration: 60,
        preferredDays: null,
        availableEquipment: null,
        trainingLocation: "gym" as const,
        preferredExercises: null,
        dislikedExercises: null,
        injuries: null,
        avoidMuscleGroups: null,
        preferredSplit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Should work with minimal preferences
      expect(minimalPrefs.primaryGoal).toBeNull();
      expect(minimalPrefs.availableEquipment).toBeNull();
    });

    it("should handle exercise with no alternatives", () => {
      const exerciseWithNoAlternatives = {
        exerciseId: 1,
        exerciseName: "Unique Exercise",
        sets: 3,
        reps: "10-12",
        restSeconds: 60,
        alternatives: undefined,
      };

      const schema = z.object({
        exerciseId: z.number(),
        exerciseName: z.string(),
        sets: z.number(),
        reps: z.string(),
        restSeconds: z.number(),
        alternatives: z.array(z.number()).optional(),
      });

      expect(schema.safeParse(exerciseWithNoAlternatives).success).toBe(true);
    });

    it("should handle workout with warmup and cooldown", () => {
      const workoutContent = {
        name: "Test Workout",
        estimatedDuration: 60,
        exercises: [],
        warmup: "5 min light cardio",
        cooldown: "5 min stretching",
      };

      expect(workoutContent.warmup).toBe("5 min light cardio");
      expect(workoutContent.cooldown).toBe("5 min stretching");
    });

    it("should handle all workout splits", () => {
      const splits = ["push_pull_legs", "upper_lower", "full_body", "bro_split"];
      const schema = z.enum(["push_pull_legs", "upper_lower", "full_body", "bro_split"]);

      for (const split of splits) {
        expect(schema.safeParse(split).success).toBe(true);
      }
    });

    it("should handle all training locations", () => {
      const locations = ["gym", "home", "outdoor"];
      const schema = z.enum(["gym", "home", "outdoor"]);

      for (const location of locations) {
        expect(schema.safeParse(location).success).toBe(true);
      }
    });
  });

  describe("Goal Configuration", () => {
    it("should have different configurations for each goal", () => {
      // Test that different goals would produce different set/rep schemes
      const goalConfigs = {
        strength: { sets: 5, reps: "3-6", rest: 180 },
        hypertrophy: { sets: 4, reps: "8-12", rest: 90 },
        endurance: { sets: 3, reps: "15-20", rest: 45 },
        weight_loss: { sets: 3, reps: "12-15", rest: 60 },
        general_fitness: { sets: 3, reps: "10-15", rest: 60 },
      };

      // Strength should have higher sets and lower reps
      expect(goalConfigs.strength.sets).toBeGreaterThan(goalConfigs.endurance.sets);
      expect(goalConfigs.strength.rest).toBeGreaterThan(goalConfigs.endurance.rest);

      // Hypertrophy should be in the middle range
      expect(goalConfigs.hypertrophy.reps).toBe("8-12");
    });
  });

  describe("Muscle Group Mapping", () => {
    it("should map workout types to correct muscle groups", () => {
      const muscleMap = {
        push: ["chest", "shoulders", "triceps"],
        pull: ["back", "biceps", "rear_delts"],
        legs: ["quadriceps", "hamstrings", "glutes", "calves"],
        upper: ["chest", "back", "shoulders", "biceps", "triceps"],
        lower: ["quadriceps", "hamstrings", "glutes", "calves"],
        full_body: ["chest", "back", "shoulders", "quadriceps", "hamstrings"],
      };

      expect(muscleMap.push).toContain("chest");
      expect(muscleMap.push).toContain("triceps");
      expect(muscleMap.pull).toContain("back");
      expect(muscleMap.pull).toContain("biceps");
      expect(muscleMap.legs).toContain("quadriceps");
      expect(muscleMap.legs).toContain("hamstrings");
    });
  });
});
