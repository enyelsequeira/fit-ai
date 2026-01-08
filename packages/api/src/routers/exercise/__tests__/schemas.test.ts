import { describe, expect, it } from "vitest";

import {
  checkNameAvailabilitySchema,
  createExerciseSchema,
  deleteExerciseSchema,
  exerciseCategorySchema,
  exerciseOutputSchema,
  exerciseTypeSchema,
  getExerciseByIdSchema,
  listExercisesSchema,
  updateExerciseSchema,
} from "../schemas";

describe("Exercise Schemas", () => {
  // ===========================================================================
  // Base Schemas
  // ===========================================================================

  describe("exerciseCategorySchema", () => {
    it("should accept valid categories", () => {
      const validCategories = [
        "chest",
        "back",
        "shoulders",
        "arms",
        "legs",
        "core",
        "cardio",
        "flexibility",
        "compound",
        "other",
      ];

      for (const category of validCategories) {
        expect(exerciseCategorySchema.safeParse(category).success).toBe(true);
      }
    });

    it("should reject invalid categories", () => {
      expect(exerciseCategorySchema.safeParse("invalid").success).toBe(false);
      expect(exerciseCategorySchema.safeParse("").success).toBe(false);
      expect(exerciseCategorySchema.safeParse(123).success).toBe(false);
    });
  });

  describe("exerciseTypeSchema", () => {
    it("should accept valid types", () => {
      expect(exerciseTypeSchema.safeParse("strength").success).toBe(true);
      expect(exerciseTypeSchema.safeParse("cardio").success).toBe(true);
      expect(exerciseTypeSchema.safeParse("flexibility").success).toBe(true);
    });

    it("should reject invalid types", () => {
      expect(exerciseTypeSchema.safeParse("invalid").success).toBe(false);
      expect(exerciseTypeSchema.safeParse("power").success).toBe(false);
    });
  });

  // ===========================================================================
  // Input Schemas
  // ===========================================================================

  describe("listExercisesSchema", () => {
    it("should accept empty input with defaults", () => {
      const result = listExercisesSchema.parse({});
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(result.includeUserExercises).toBe(true);
      expect(result.onlyUserExercises).toBe(false);
    });

    it("should accept valid filters", () => {
      const result = listExercisesSchema.safeParse({
        category: "chest",
        exerciseType: "strength",
        muscleGroup: "pectorals",
        equipment: "barbell",
        search: "bench",
        limit: 10,
        offset: 5,
      });
      expect(result.success).toBe(true);
    });

    it("should coerce string limit and offset to numbers", () => {
      const result = listExercisesSchema.parse({
        limit: "24",
        offset: "48",
      });
      expect(result.limit).toBe(24);
      expect(result.offset).toBe(48);
    });

    it("should coerce string booleans for includeUserExercises and onlyUserExercises", () => {
      const result = listExercisesSchema.parse({
        includeUserExercises: "true",
        onlyUserExercises: "false",
      });
      expect(result.includeUserExercises).toBe(true);
      expect(result.onlyUserExercises).toBe(false);

      const result2 = listExercisesSchema.parse({
        includeUserExercises: "false",
        onlyUserExercises: "true",
      });
      expect(result2.includeUserExercises).toBe(false);
      expect(result2.onlyUserExercises).toBe(true);
    });

    it("should treat empty strings as undefined and use defaults", () => {
      const result = listExercisesSchema.parse({
        includeUserExercises: "",
        onlyUserExercises: "",
        muscleGroup: "",
        equipment: "",
        search: "",
      });
      // Empty strings should fall back to defaults
      expect(result.includeUserExercises).toBe(true); // default is true
      expect(result.onlyUserExercises).toBe(false); // default is false
      expect(result.muscleGroup).toBeUndefined();
      expect(result.equipment).toBeUndefined();
      expect(result.search).toBeUndefined();
    });

    it("should reject invalid pagination", () => {
      expect(listExercisesSchema.safeParse({ limit: 0 }).success).toBe(false);
      expect(listExercisesSchema.safeParse({ limit: "0" }).success).toBe(false);
      expect(listExercisesSchema.safeParse({ limit: 101 }).success).toBe(false);
      expect(listExercisesSchema.safeParse({ limit: "101" }).success).toBe(false);
      expect(listExercisesSchema.safeParse({ offset: -1 }).success).toBe(false);
      expect(listExercisesSchema.safeParse({ offset: "-1" }).success).toBe(false);
    });

    it("should reject non-numeric strings for limit and offset", () => {
      expect(listExercisesSchema.safeParse({ limit: "abc" }).success).toBe(false);
      expect(listExercisesSchema.safeParse({ offset: "xyz" }).success).toBe(false);
    });
  });

  describe("getExerciseByIdSchema", () => {
    it("should accept numeric id", () => {
      expect(getExerciseByIdSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(getExerciseByIdSchema.safeParse({ id: 999 }).success).toBe(true);
    });

    it("should coerce string id to number", () => {
      const result = getExerciseByIdSchema.parse({ id: "123" });
      expect(result.id).toBe(123);
    });

    it("should reject missing id", () => {
      expect(getExerciseByIdSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("createExerciseSchema", () => {
    it("should accept valid input", () => {
      const result = createExerciseSchema.safeParse({
        name: "Bench Press",
        category: "chest",
      });
      expect(result.success).toBe(true);
    });

    it("should accept full input", () => {
      const result = createExerciseSchema.safeParse({
        name: "Bench Press",
        description: "A chest exercise",
        category: "chest",
        muscleGroups: ["chest", "triceps"],
        equipment: "barbell",
        exerciseType: "strength",
      });
      expect(result.success).toBe(true);
    });

    it("should provide defaults", () => {
      const result = createExerciseSchema.parse({
        name: "Test",
        category: "chest",
      });
      expect(result.muscleGroups).toEqual([]);
      expect(result.exerciseType).toBe("strength");
    });

    it("should reject empty name", () => {
      expect(
        createExerciseSchema.safeParse({
          name: "",
          category: "chest",
        }).success,
      ).toBe(false);
    });

    it("should reject name too long", () => {
      expect(
        createExerciseSchema.safeParse({
          name: "a".repeat(101),
          category: "chest",
        }).success,
      ).toBe(false);
    });

    it("should reject missing category", () => {
      expect(
        createExerciseSchema.safeParse({
          name: "Test",
        }).success,
      ).toBe(false);
    });

    it("should reject invalid category", () => {
      expect(
        createExerciseSchema.safeParse({
          name: "Test",
          category: "invalid",
        }).success,
      ).toBe(false);
    });
  });

  describe("updateExerciseSchema", () => {
    it("should accept id only", () => {
      const result = updateExerciseSchema.safeParse({ id: 1 });
      expect(result.success).toBe(true);
    });

    it("should accept partial updates", () => {
      const result = updateExerciseSchema.safeParse({
        id: 1,
        name: "Updated Name",
      });
      expect(result.success).toBe(true);
    });

    it("should accept full updates", () => {
      const result = updateExerciseSchema.safeParse({
        id: 1,
        name: "Updated",
        description: "Updated description",
        category: "back",
        muscleGroups: ["lats"],
        equipment: "dumbbell",
        exerciseType: "cardio",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      expect(
        updateExerciseSchema.safeParse({
          name: "Test",
        }).success,
      ).toBe(false);
    });

    it("should reject empty name", () => {
      expect(
        updateExerciseSchema.safeParse({
          id: 1,
          name: "",
        }).success,
      ).toBe(false);
    });
  });

  describe("deleteExerciseSchema", () => {
    it("should accept numeric id", () => {
      expect(deleteExerciseSchema.safeParse({ id: 1 }).success).toBe(true);
    });

    it("should coerce string id", () => {
      const result = deleteExerciseSchema.parse({ id: "42" });
      expect(result.id).toBe(42);
    });

    it("should reject missing id", () => {
      expect(deleteExerciseSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("checkNameAvailabilitySchema", () => {
    it("should accept name only", () => {
      const result = checkNameAvailabilitySchema.safeParse({
        name: "Bench Press",
      });
      expect(result.success).toBe(true);
    });

    it("should accept name with excludeId", () => {
      const result = checkNameAvailabilitySchema.safeParse({
        name: "Bench Press",
        excludeId: 123,
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      expect(
        checkNameAvailabilitySchema.safeParse({
          name: "",
        }).success,
      ).toBe(false);
    });
  });

  // ===========================================================================
  // Output Schemas
  // ===========================================================================

  describe("exerciseOutputSchema", () => {
    it("should validate complete exercise output", () => {
      const exercise = {
        id: 1,
        name: "Bench Press",
        description: "A chest exercise",
        category: "chest",
        muscleGroups: ["chest", "triceps"],
        equipment: "barbell",
        exerciseType: "strength",
        isDefault: true,
        createdByUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        // New fields for images and metadata
        primaryImage: "https://example.com/image.jpg",
        images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        videoUrl: "https://example.com/video.mp4",
        instructions: ["Step 1", "Step 2"],
        externalId: "Barbell_Bench_Press",
        externalSource: "free-exercise-db",
        level: "intermediate",
        force: "push",
        mechanic: "compound",
      };

      expect(exerciseOutputSchema.safeParse(exercise).success).toBe(true);
    });

    it("should accept null description and optional fields", () => {
      const exercise = {
        id: 1,
        name: "Bench Press",
        description: null,
        category: "chest",
        muscleGroups: [],
        equipment: null,
        exerciseType: "strength",
        isDefault: false,
        createdByUserId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        // New fields can be null/empty
        primaryImage: null,
        images: [],
        videoUrl: null,
        instructions: [],
        externalId: null,
        externalSource: null,
        level: null,
        force: null,
        mechanic: null,
      };

      expect(exerciseOutputSchema.safeParse(exercise).success).toBe(true);
    });
  });
});
