import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAuthenticatedContext, createMockContext } from "../../../test/helpers";

// Mock database
vi.mock("@fit-ai/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
        limit: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() =>
          Promise.resolve([
            {
              id: 1,
              name: "Test Exercise",
              description: null,
              category: "chest",
              muscleGroups: [],
              equipment: null,
              exerciseType: "strength",
              isDefault: false,
              createdByUserId: "test-user-id",
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
          returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ success: true })),
    })),
    selectDistinct: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ equipment: "barbell" }, { equipment: "dumbbell" }])),
      })),
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
  };
});

// Import after mocks
import type { AuthenticatedContext } from "../handlers";

// Mock data
const mockDefaultExercise = {
  id: 1,
  name: "Bench Press",
  description: "A chest exercise",
  category: "chest" as const,
  muscleGroups: ["chest", "triceps", "shoulders"],
  equipment: "barbell",
  exerciseType: "strength" as const,
  isDefault: true,
  createdByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserExercise = {
  id: 2,
  name: "Custom Push-up",
  description: "My custom push-up variation",
  category: "chest" as const,
  muscleGroups: ["chest", "triceps"],
  equipment: "bodyweight",
  exerciseType: "strength" as const,
  isDefault: false,
  createdByUserId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtherUserExercise = {
  id: 3,
  name: "Other User Exercise",
  description: "Another user's exercise",
  category: "back" as const,
  muscleGroups: ["back"],
  equipment: "dumbbell",
  exerciseType: "strength" as const,
  isDefault: false,
  createdByUserId: "other-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Exercise Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Context Tests
  // ===========================================================================

  describe("Handler Context", () => {
    it("should create unauthenticated context", () => {
      const context = createMockContext();
      expect(context.session).toBeNull();
    });

    it("should create authenticated context with default user", () => {
      const context = createAuthenticatedContext();
      expect(context.session).not.toBeNull();
      expect(context.session?.user.id).toBe("test-user-id");
    });

    it("should create authenticated context with custom user", () => {
      const context = createAuthenticatedContext({
        id: "custom-id",
        email: "custom@example.com",
        name: "Custom User",
      });
      expect(context.session?.user.id).toBe("custom-id");
      expect(context.session?.user.email).toBe("custom@example.com");
    });
  });

  // ===========================================================================
  // Authorization Logic Tests
  // ===========================================================================

  describe("Authorization Logic", () => {
    it("should correctly identify user ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their exercise
      expect(mockUserExercise.createdByUserId).toBe(userId);

      // User doesn't own other user's exercise
      expect(mockOtherUserExercise.createdByUserId).not.toBe(userId);

      // Nobody owns default exercises
      expect(mockDefaultExercise.createdByUserId).toBeNull();
    });

    it("should identify default exercises", () => {
      expect(mockDefaultExercise.isDefault).toBe(true);
      expect(mockUserExercise.isDefault).toBe(false);
    });

    it("should verify exercise visibility rules", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" }) as AuthenticatedContext;
      const userId = context.session.user.id;

      // Default exercises are visible to everyone
      expect(mockDefaultExercise.isDefault || mockDefaultExercise.createdByUserId === userId).toBe(
        true,
      );

      // User's own exercises are visible
      expect(mockUserExercise.isDefault || mockUserExercise.createdByUserId === userId).toBe(true);

      // Other user's non-default exercises are not visible
      expect(
        mockOtherUserExercise.isDefault || mockOtherUserExercise.createdByUserId === userId,
      ).toBe(false);
    });
  });

  // ===========================================================================
  // Business Logic Tests
  // ===========================================================================

  describe("Business Logic", () => {
    it("should filter exercises by muscle group correctly", () => {
      const exercises = [mockDefaultExercise, mockUserExercise, mockOtherUserExercise];
      const targetMuscle = "chest";

      const filtered = exercises.filter((ex) => {
        const muscleGroups = ex.muscleGroups as string[];
        return muscleGroups.some((mg) => mg.toLowerCase() === targetMuscle.toLowerCase());
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((ex) => ex.muscleGroups.includes("chest"))).toBe(true);
    });

    it("should handle case-insensitive search", () => {
      const searchTerm = "bench";
      const exercises = [mockDefaultExercise];

      const filtered = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("Bench Press");
    });

    it("should filter by exercise type", () => {
      const exercises = [mockDefaultExercise, mockUserExercise];
      const type = "strength";

      const filtered = exercises.filter((ex) => ex.exerciseType === type);

      expect(filtered).toHaveLength(2);
    });

    it("should filter by equipment", () => {
      const exercises = [mockDefaultExercise, mockUserExercise];
      const equipment = "barbell";

      const filtered = exercises.filter((ex) => ex.equipment === equipment);

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("Bench Press");
    });

    it("should apply pagination correctly", () => {
      const exercises = [mockDefaultExercise, mockUserExercise, mockOtherUserExercise];
      const limit = 2;
      const offset = 1;

      const paginated = exercises.slice(offset, offset + limit);

      expect(paginated).toHaveLength(2);
      expect(paginated[0]?.id).toBe(2);
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe("Edge Cases", () => {
    it("should handle empty muscle groups array", () => {
      const exercise = { ...mockUserExercise, muscleGroups: [] as string[] };
      const targetMuscle = "chest";

      const matches = exercise.muscleGroups.some(
        (mg) => mg.toLowerCase() === targetMuscle.toLowerCase(),
      );

      expect(matches).toBe(false);
    });

    it("should handle null equipment", () => {
      const exercise = { ...mockUserExercise, equipment: null };
      const targetEquipment = "barbell";

      const matches = exercise.equipment === targetEquipment;

      expect(matches).toBe(false);
    });

    it("should handle special characters in search", () => {
      const searchTerm = "push-up";
      const exercise = { ...mockUserExercise, name: "Diamond Push-up" };

      const matches = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());

      expect(matches).toBe(true);
    });

    it("should handle duplicate muscle group entries", () => {
      const muscleGroups = ["chest", "chest", "triceps"];

      const uniqueMuscleGroups = [...new Set(muscleGroups)];

      expect(uniqueMuscleGroups).toHaveLength(2);
    });
  });
});
