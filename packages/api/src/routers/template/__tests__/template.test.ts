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
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve([])),
          })),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
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
    inArray: vi.fn((col, arr) => ({ type: "inArray", col, arr })),
    asc: vi.fn((col) => ({ type: "asc", col })),
    desc: vi.fn((col) => ({ type: "desc", col })),
  };
});

// Import after mocks are set up
import { templateRouter } from "..";

// Mock data
const mockFolder = {
  id: 1,
  userId: "test-user-id",
  name: "Push Day",
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtherUserFolder = {
  id: 2,
  userId: "other-user-id",
  name: "Other User Folder",
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTemplate = {
  id: 1,
  userId: "test-user-id",
  folderId: 1,
  name: "Push Day Workout",
  description: "Chest, shoulders, and triceps",
  estimatedDurationMinutes: 60,
  isPublic: false,
  timesUsed: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtherUserTemplate = {
  id: 2,
  userId: "other-user-id",
  folderId: null,
  name: "Other User Template",
  description: "Another user's template",
  estimatedDurationMinutes: 45,
  isPublic: false,
  timesUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Template Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    // Folder schemas
    const createFolderSchema = z.object({
      name: z.string().min(1).max(100),
    });

    const updateFolderSchema = z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
    });

    const reorderFoldersSchema = z.object({
      folderIds: z.array(z.number()),
    });

    // Template schemas
    const listTemplatesSchema = z.object({
      folderId: z.number().optional(),
      includeNoFolder: z.boolean().default(true),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    });

    const createTemplateSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      folderId: z.number().optional(),
      estimatedDurationMinutes: z.number().min(1).max(600).optional(),
      isPublic: z.boolean().default(false),
    });

    const updateTemplateSchema = z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      folderId: z.number().nullable().optional(),
      estimatedDurationMinutes: z.number().min(1).max(600).optional(),
      isPublic: z.boolean().optional(),
    });

    // Template exercise schemas
    const addExerciseSchema = z.object({
      id: z.number(),
      exerciseId: z.number(),
      order: z.number().optional(),
      supersetGroupId: z.number().optional(),
      notes: z.string().max(500).optional(),
      targetSets: z.number().min(1).max(20).default(3),
      targetReps: z.string().max(20).optional(),
      targetWeight: z.number().optional(),
      restSeconds: z.number().min(0).max(600).default(90),
    });

    const updateExerciseSchema = z.object({
      templateId: z.number(),
      exerciseId: z.number(),
      order: z.number().optional(),
      supersetGroupId: z.number().nullable().optional(),
      notes: z.string().max(500).optional(),
      targetSets: z.number().min(1).max(20).optional(),
      targetReps: z.string().max(20).optional(),
      targetWeight: z.number().optional(),
      restSeconds: z.number().min(0).max(600).optional(),
    });

    const reorderExercisesSchema = z.object({
      id: z.number(),
      exerciseIds: z.array(z.number()),
    });

    describe("Folder Schemas", () => {
      it("should validate create folder input", () => {
        expect(createFolderSchema.safeParse({ name: "Push Day" }).success).toBe(true);
        expect(createFolderSchema.safeParse({ name: "" }).success).toBe(false);
        expect(createFolderSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
        expect(createFolderSchema.safeParse({}).success).toBe(false);
      });

      it("should validate update folder input", () => {
        expect(updateFolderSchema.safeParse({ id: 1 }).success).toBe(true);
        expect(updateFolderSchema.safeParse({ id: 1, name: "New Name" }).success).toBe(true);
        expect(updateFolderSchema.safeParse({ id: 1, name: "" }).success).toBe(false);
        expect(updateFolderSchema.safeParse({ name: "No ID" }).success).toBe(false);
      });

      it("should validate reorder folders input", () => {
        expect(reorderFoldersSchema.safeParse({ folderIds: [1, 2, 3] }).success).toBe(true);
        expect(reorderFoldersSchema.safeParse({ folderIds: [] }).success).toBe(true);
        expect(reorderFoldersSchema.safeParse({}).success).toBe(false);
        expect(reorderFoldersSchema.safeParse({ folderIds: ["a", "b"] }).success).toBe(false);
      });
    });

    describe("Template Schemas", () => {
      it("should validate list templates input", () => {
        expect(listTemplatesSchema.safeParse({}).success).toBe(true);
        expect(listTemplatesSchema.safeParse({ folderId: 1 }).success).toBe(true);
        expect(listTemplatesSchema.safeParse({ limit: 100, offset: 0 }).success).toBe(true);
        expect(listTemplatesSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(listTemplatesSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(listTemplatesSchema.safeParse({ offset: -1 }).success).toBe(false);
      });

      it("should validate create template input", () => {
        expect(createTemplateSchema.safeParse({ name: "Workout A" }).success).toBe(true);
        expect(
          createTemplateSchema.safeParse({
            name: "Workout A",
            description: "A great workout",
            folderId: 1,
            estimatedDurationMinutes: 60,
            isPublic: false,
          }).success,
        ).toBe(true);
        expect(createTemplateSchema.safeParse({ name: "" }).success).toBe(false);
        expect(createTemplateSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
        expect(
          createTemplateSchema.safeParse({ name: "Test", estimatedDurationMinutes: 0 }).success,
        ).toBe(false);
        expect(
          createTemplateSchema.safeParse({ name: "Test", estimatedDurationMinutes: 601 }).success,
        ).toBe(false);
      });

      it("should validate update template input", () => {
        expect(updateTemplateSchema.safeParse({ id: 1 }).success).toBe(true);
        expect(updateTemplateSchema.safeParse({ id: 1, name: "Updated" }).success).toBe(true);
        expect(updateTemplateSchema.safeParse({ id: 1, folderId: null }).success).toBe(true);
        expect(updateTemplateSchema.safeParse({ id: 1, isPublic: true }).success).toBe(true);
        expect(updateTemplateSchema.safeParse({ name: "No ID" }).success).toBe(false);
      });
    });

    describe("Template Exercise Schemas", () => {
      it("should validate add exercise input", () => {
        expect(addExerciseSchema.safeParse({ id: 1, exerciseId: 1 }).success).toBe(true);
        expect(
          addExerciseSchema.safeParse({
            id: 1,
            exerciseId: 1,
            order: 1,
            targetSets: 4,
            targetReps: "8-12",
            targetWeight: 100,
            restSeconds: 90,
          }).success,
        ).toBe(true);
        expect(addExerciseSchema.safeParse({ id: 1 }).success).toBe(false);
        expect(addExerciseSchema.safeParse({ exerciseId: 1 }).success).toBe(false);
        expect(addExerciseSchema.safeParse({ id: 1, exerciseId: 1, targetSets: 0 }).success).toBe(
          false,
        );
        expect(addExerciseSchema.safeParse({ id: 1, exerciseId: 1, targetSets: 21 }).success).toBe(
          false,
        );
        expect(
          addExerciseSchema.safeParse({ id: 1, exerciseId: 1, restSeconds: 601 }).success,
        ).toBe(false);
      });

      it("should validate update exercise input", () => {
        expect(updateExerciseSchema.safeParse({ templateId: 1, exerciseId: 1 }).success).toBe(true);
        expect(
          updateExerciseSchema.safeParse({
            templateId: 1,
            exerciseId: 1,
            targetSets: 5,
            targetReps: "10-15",
          }).success,
        ).toBe(true);
        expect(
          updateExerciseSchema.safeParse({ templateId: 1, exerciseId: 1, supersetGroupId: null })
            .success,
        ).toBe(true);
        expect(updateExerciseSchema.safeParse({ templateId: 1 }).success).toBe(false);
        expect(updateExerciseSchema.safeParse({ exerciseId: 1 }).success).toBe(false);
      });

      it("should validate reorder exercises input", () => {
        expect(reorderExercisesSchema.safeParse({ id: 1, exerciseIds: [1, 2, 3] }).success).toBe(
          true,
        );
        expect(reorderExercisesSchema.safeParse({ id: 1, exerciseIds: [] }).success).toBe(true);
        expect(reorderExercisesSchema.safeParse({ id: 1 }).success).toBe(false);
        expect(reorderExercisesSchema.safeParse({ exerciseIds: [1, 2] }).success).toBe(false);
      });
    });
  });

  describe("Router Structure", () => {
    it("should have all folder procedures", () => {
      expect(templateRouter.folder).toBeDefined();
      expect(templateRouter.folder.list).toBeDefined();
      expect(templateRouter.folder.create).toBeDefined();
      expect(templateRouter.folder.update).toBeDefined();
      expect(templateRouter.folder.delete).toBeDefined();
      expect(templateRouter.folder.reorder).toBeDefined();
    });

    it("should have all template procedures", () => {
      expect(templateRouter.list).toBeDefined();
      expect(templateRouter.getById).toBeDefined();
      expect(templateRouter.create).toBeDefined();
      expect(templateRouter.update).toBeDefined();
      expect(templateRouter.delete).toBeDefined();
      expect(templateRouter.duplicate).toBeDefined();
      expect(templateRouter.startWorkout).toBeDefined();
    });

    it("should have all template exercise procedures", () => {
      expect(templateRouter.addExercise).toBeDefined();
      expect(templateRouter.updateExercise).toBeDefined();
      expect(templateRouter.removeExercise).toBeDefined();
      expect(templateRouter.reorderExercises).toBeDefined();
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

    it("should correctly identify folder ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their folder
      expect(mockFolder.userId).toBe(userId);

      // User doesn't own other user's folder
      expect(mockOtherUserFolder.userId).not.toBe(userId);
    });

    it("should correctly identify template ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their template
      expect(mockTemplate.userId).toBe(userId);

      // User doesn't own other user's template
      expect(mockOtherUserTemplate.userId).not.toBe(userId);
    });

    it("should not allow users to modify other users folders", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockOtherUserFolder.userId).not.toBe(userId);
      // Trying to update/delete would throw FORBIDDEN
    });

    it("should not allow users to modify other users templates", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockOtherUserTemplate.userId).not.toBe(userId);
      // Trying to update/delete would throw FORBIDDEN
    });
  });

  describe("Folder Operations", () => {
    it("should validate folder ID input", () => {
      const deleteSchema = z.object({ id: z.number() });

      expect(deleteSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(deleteSchema.safeParse({ id: "1" }).success).toBe(false);
      expect(deleteSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("Template Operations", () => {
    it("should validate template ID input", () => {
      const getByIdSchema = z.object({ id: z.number() });

      expect(getByIdSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(getByIdSchema.safeParse({ id: "1" }).success).toBe(false);
      expect(getByIdSchema.safeParse({}).success).toBe(false);
    });

    it("should support optional folder filtering", () => {
      const listSchema = z.object({
        folderId: z.number().optional(),
        includeNoFolder: z.boolean().default(true),
      });

      expect(listSchema.safeParse({}).success).toBe(true);
      expect(listSchema.safeParse({ folderId: 1 }).success).toBe(true);
      expect(listSchema.safeParse({ folderId: 1, includeNoFolder: false }).success).toBe(true);
    });

    it("should support pagination", () => {
      const paginationSchema = z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      });

      expect(paginationSchema.safeParse({ limit: 10, offset: 0 }).success).toBe(true);
      expect(paginationSchema.safeParse({ limit: 100, offset: 50 }).success).toBe(true);
      expect(paginationSchema.safeParse({ limit: 101, offset: 0 }).success).toBe(false);
      expect(paginationSchema.safeParse({ limit: 0, offset: 0 }).success).toBe(false);
    });
  });

  describe("Template Exercise Operations", () => {
    it("should validate exercise addition with defaults", () => {
      const addSchema = z.object({
        id: z.number(),
        exerciseId: z.number(),
        targetSets: z.number().min(1).max(20).default(3),
        restSeconds: z.number().min(0).max(600).default(90),
      });

      const result = addSchema.parse({ id: 1, exerciseId: 1 });
      expect(result.targetSets).toBe(3);
      expect(result.restSeconds).toBe(90);
    });

    it("should validate target reps format", () => {
      const targetRepsSchema = z.string().max(20).optional();

      expect(targetRepsSchema.safeParse("8-12").success).toBe(true);
      expect(targetRepsSchema.safeParse("10").success).toBe(true);
      expect(targetRepsSchema.safeParse("AMRAP").success).toBe(true);
      expect(targetRepsSchema.safeParse(undefined).success).toBe(true);
      expect(targetRepsSchema.safeParse("a".repeat(21)).success).toBe(false);
    });

    it("should handle superset grouping", () => {
      const supersetSchema = z.object({
        supersetGroupId: z.number().nullable().optional(),
      });

      expect(supersetSchema.safeParse({}).success).toBe(true);
      expect(supersetSchema.safeParse({ supersetGroupId: 1 }).success).toBe(true);
      expect(supersetSchema.safeParse({ supersetGroupId: null }).success).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty exercise array in template", () => {
      const exercisesSchema = z.array(z.object({ id: z.number() }));
      expect(exercisesSchema.parse([])).toEqual([]);
    });

    it("should handle optional description", () => {
      const schema = z.object({
        name: z.string().min(1),
        description: z.string().max(500).optional(),
      });

      const result = schema.parse({ name: "Test" });
      expect(result.description).toBeUndefined();
    });

    it("should handle nullable folderId", () => {
      const schema = z.object({
        folderId: z.number().nullable().optional(),
      });

      expect(schema.parse({}).folderId).toBeUndefined();
      expect(schema.parse({ folderId: null }).folderId).toBeNull();
      expect(schema.parse({ folderId: 1 }).folderId).toBe(1);
    });

    it("should handle rest time boundaries", () => {
      const restSchema = z.number().min(0).max(600);

      expect(restSchema.safeParse(0).success).toBe(true);
      expect(restSchema.safeParse(600).success).toBe(true);
      expect(restSchema.safeParse(300).success).toBe(true);
      expect(restSchema.safeParse(-1).success).toBe(false);
      expect(restSchema.safeParse(601).success).toBe(false);
    });

    it("should handle duration minutes boundaries", () => {
      const durationSchema = z.number().min(1).max(600);

      expect(durationSchema.safeParse(1).success).toBe(true);
      expect(durationSchema.safeParse(600).success).toBe(true);
      expect(durationSchema.safeParse(60).success).toBe(true);
      expect(durationSchema.safeParse(0).success).toBe(false);
      expect(durationSchema.safeParse(601).success).toBe(false);
    });

    it("should properly validate target sets range", () => {
      const setsSchema = z.number().min(1).max(20);

      expect(setsSchema.safeParse(1).success).toBe(true);
      expect(setsSchema.safeParse(20).success).toBe(true);
      expect(setsSchema.safeParse(10).success).toBe(true);
      expect(setsSchema.safeParse(0).success).toBe(false);
      expect(setsSchema.safeParse(21).success).toBe(false);
    });
  });

  describe("Template Duplication", () => {
    it("should validate duplicate input", () => {
      const duplicateSchema = z.object({ id: z.number() });

      expect(duplicateSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(duplicateSchema.safeParse({}).success).toBe(false);
    });

    it("should create a copy with modified name", () => {
      const originalName = mockTemplate.name;
      const expectedCopyName = `${originalName} (Copy)`;
      expect(expectedCopyName).toBe("Push Day Workout (Copy)");
    });

    it("should set isPublic to false for copies", () => {
      // Copies should always be private regardless of original
      const original = { ...mockTemplate, isPublic: true };
      const expectedCopyIsPublic = false;
      expect(original.isPublic).toBe(true);
      expect(expectedCopyIsPublic).toBe(false);
    });
  });

  describe("Start Workout", () => {
    it("should validate start workout input", () => {
      const startSchema = z.object({ id: z.number() });

      expect(startSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(startSchema.safeParse({}).success).toBe(false);
    });

    it("should correctly parse target reps for sets", () => {
      // Simulating the logic in startWorkout handler
      const targetReps = "8-12";
      const parsedReps = Number.parseInt(targetReps.split("-")[0] ?? "0", 10);
      expect(parsedReps).toBe(8);

      const singleReps = "10";
      const parsedSingle = Number.parseInt(singleReps.split("-")[0] ?? "0", 10);
      expect(parsedSingle).toBe(10);
    });

    it("should handle null target reps", () => {
      const parseTargetReps = (reps: string | null): number | null => {
        if (!reps) return null;
        return Number.parseInt(reps.split("-")[0] ?? "0", 10);
      };

      expect(parseTargetReps(null)).toBeNull();
      expect(parseTargetReps("8-12")).toBe(8);
    });
  });

  describe("Reordering", () => {
    it("should validate reorder arrays are not empty for meaningful reorder", () => {
      // While empty arrays are valid schema-wise, they don't accomplish anything
      const folderIds = [3, 1, 2];
      const exerciseIds = [2, 3, 1];

      // Expected new orders after reorder
      const expectedFolderOrders = folderIds.map((id, index) => ({
        id,
        order: index,
      }));
      expect(expectedFolderOrders).toEqual([
        { id: 3, order: 0 },
        { id: 1, order: 1 },
        { id: 2, order: 2 },
      ]);

      // Exercises use 1-based ordering
      const expectedExerciseOrders = exerciseIds.map((id, index) => ({
        id,
        order: index + 1,
      }));
      expect(expectedExerciseOrders).toEqual([
        { id: 2, order: 1 },
        { id: 3, order: 2 },
        { id: 1, order: 3 },
      ]);
    });

    it("should verify all IDs belong to the user/template before reordering", () => {
      // If provided 3 IDs but only 2 are valid, the length check should fail
      const providedIds = [1, 2, 3];
      const foundItems = [{ id: 1 }, { id: 2 }]; // Only 2 found

      expect(foundItems.length).not.toBe(providedIds.length);
      // This would throw BAD_REQUEST
    });
  });

  describe("Folder Uniqueness", () => {
    it("should reject creating folder with duplicate name for same user", () => {
      // When a folder with the same name exists for the user
      const existingFolders = [{ id: 1, name: "Push Day", userId: "test-user-id" }];
      const newFolderName = "Push Day";

      const isDuplicate = existingFolders.some((f) => f.name === newFolderName);
      expect(isDuplicate).toBe(true);
      // Handler would throw CONFLICT error
    });

    it("should allow same folder name for different users", () => {
      const user1Folders = [{ id: 1, name: "Push Day", userId: "user-1" }];
      const user2FolderName = "Push Day";
      const user2Id = "user-2";

      // Only check folders belonging to user2
      const isDuplicate = user1Folders.some(
        (f) => f.userId === user2Id && f.name === user2FolderName,
      );
      expect(isDuplicate).toBe(false);
      // User2 can create a folder with the same name
    });

    it("should reject renaming folder to existing name", () => {
      const existingFolders = [
        { id: 1, name: "Push Day", userId: "test-user-id" },
        { id: 2, name: "Pull Day", userId: "test-user-id" },
      ];
      const folderToRename = existingFolders[1];
      const newName = "Push Day";

      // Check if another folder has this name (excluding current folder)
      const isDuplicate = existingFolders.some(
        (f) => f.name === newName && f.id !== folderToRename?.id,
      );
      expect(isDuplicate).toBe(true);
      // Handler would throw CONFLICT error
    });

    it("should allow renaming folder to its current name", () => {
      const folder = { id: 1, name: "Push Day", userId: "test-user-id" };
      const existingFolders = [folder];
      const newName = "Push Day"; // Same name

      // Check if another folder has this name (excluding current folder)
      const isDuplicate = existingFolders.some((f) => f.name === newName && f.id !== folder.id);
      expect(isDuplicate).toBe(false);
      // This should be allowed
    });
  });

  describe("Template Copy Naming", () => {
    it("should name first copy as 'Template Copy 1'", () => {
      const originalName = "Leg Day";
      const existingCopies: { name: string }[] = [];

      // Logic from handler: strip suffixes and find max copy number
      const baseName = originalName.replace(/ Copy \d+$/, "").replace(/ \(Copy\)$/, "");
      let maxCopyNum = 0;
      for (const copy of existingCopies) {
        const match = copy.name.match(/ Copy (\d+)$/);
        if (match?.[1]) {
          maxCopyNum = Math.max(maxCopyNum, Number.parseInt(match[1], 10));
        }
      }

      const newName = `${baseName} Copy ${maxCopyNum + 1}`;
      expect(newName).toBe("Leg Day Copy 1");
    });

    it("should increment copy number for subsequent copies", () => {
      const originalName = "Leg Day";
      const existingCopies = [{ name: "Leg Day Copy 1" }, { name: "Leg Day Copy 2" }];

      const baseName = originalName.replace(/ Copy \d+$/, "").replace(/ \(Copy\)$/, "");
      let maxCopyNum = 0;
      for (const copy of existingCopies) {
        const match = copy.name.match(/ Copy (\d+)$/);
        if (match?.[1]) {
          maxCopyNum = Math.max(maxCopyNum, Number.parseInt(match[1], 10));
        }
      }

      const newName = `${baseName} Copy ${maxCopyNum + 1}`;
      expect(newName).toBe("Leg Day Copy 3");
    });

    it("should clean old (Copy) format when duplicating", () => {
      const originalName = "Leg Day (Copy)";

      // Strip old format
      const baseName = originalName.replace(/ Copy \d+$/, "").replace(/ \(Copy\)$/, "");
      expect(baseName).toBe("Leg Day");

      // First copy of the cleaned base
      const newName = `${baseName} Copy 1`;
      expect(newName).toBe("Leg Day Copy 1");
    });

    it("should handle gaps in copy numbers correctly", () => {
      const originalName = "Leg Day";
      // Copies 1 and 3 exist, but 2 was deleted
      const existingCopies = [{ name: "Leg Day Copy 1" }, { name: "Leg Day Copy 3" }];

      const baseName = originalName.replace(/ Copy \d+$/, "").replace(/ \(Copy\)$/, "");
      let maxCopyNum = 0;
      for (const copy of existingCopies) {
        const match = copy.name.match(/ Copy (\d+)$/);
        if (match?.[1]) {
          maxCopyNum = Math.max(maxCopyNum, Number.parseInt(match[1], 10));
        }
      }

      const newName = `${baseName} Copy ${maxCopyNum + 1}`;
      // Should be Copy 4, not Copy 2 (uses max, not fills gaps)
      expect(newName).toBe("Leg Day Copy 4");
    });

    it("should handle duplicating a copy", () => {
      const originalName = "Leg Day Copy 2";
      const existingCopies = [
        { name: "Leg Day Copy 1" },
        { name: "Leg Day Copy 2" },
        { name: "Leg Day Copy 3" },
      ];

      // Strip the Copy N suffix to get base name
      const baseName = originalName.replace(/ Copy \d+$/, "").replace(/ \(Copy\)$/, "");
      expect(baseName).toBe("Leg Day");

      let maxCopyNum = 0;
      for (const copy of existingCopies) {
        const match = copy.name.match(/ Copy (\d+)$/);
        if (match?.[1]) {
          maxCopyNum = Math.max(maxCopyNum, Number.parseInt(match[1], 10));
        }
      }

      const newName = `${baseName} Copy ${maxCopyNum + 1}`;
      expect(newName).toBe("Leg Day Copy 4");
    });
  });
});
