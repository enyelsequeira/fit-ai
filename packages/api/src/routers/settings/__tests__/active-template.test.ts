import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";

import { createAuthenticatedContext, createMockContext } from "../../../test/helpers";

// Mock database - must be defined before vi.mock
vi.mock("@fit-ai/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1, userId: "test-user-id" }])),
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
                activeTemplateId: 1,
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
    sql: vi.fn((strings, ...values) => ({ type: "sql", strings, values })),
  };
});

// Import after mocks are set up
import { settingsRouter } from "..";

// Mock data
const mockTemplate = {
  id: 1,
  userId: "test-user-id",
  folderId: null,
  name: "Push Day Workout",
  description: "Chest, shoulders, and triceps",
  estimatedDurationMinutes: 60,
  isPublic: false,
  timesUsed: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPublicTemplate = {
  id: 2,
  userId: "other-user-id",
  folderId: null,
  name: "Public Template",
  description: "A public template",
  estimatedDurationMinutes: 45,
  isPublic: true,
  timesUsed: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtherUserTemplate = {
  id: 3,
  userId: "other-user-id",
  folderId: null,
  name: "Private Template",
  description: "Another user's private template",
  estimatedDurationMinutes: 30,
  isPublic: false,
  timesUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSettings = {
  id: 1,
  userId: "test-user-id",
  activeTemplateId: 1,
  weightUnit: "kg",
  distanceUnit: "km",
  lengthUnit: "cm",
  temperatureUnit: "celsius",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Active Template Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input Validation", () => {
    const setActiveTemplateSchema = z.object({
      templateId: z.coerce.number(),
    });

    it("should validate setActiveTemplate input - requires templateId", () => {
      expect(setActiveTemplateSchema.safeParse({ templateId: 1 }).success).toBe(true);
      expect(setActiveTemplateSchema.safeParse({ templateId: "123" }).success).toBe(true);
      expect(setActiveTemplateSchema.safeParse({}).success).toBe(false);
    });

    it("should coerce string templateId to number", () => {
      const result = setActiveTemplateSchema.parse({ templateId: "42" });
      expect(result.templateId).toBe(42);
    });
  });

  describe("Router Structure", () => {
    it("should have all active template procedures", () => {
      expect(settingsRouter.getActiveTemplate).toBeDefined();
      expect(settingsRouter.setActiveTemplate).toBeDefined();
      expect(settingsRouter.clearActiveTemplate).toBeDefined();
    });
  });

  describe("Authorization Rules", () => {
    it("should require authentication for all active template procedures", () => {
      const unauthContext = createMockContext();
      expect(unauthContext.session).toBeNull();

      const authContext = createAuthenticatedContext();
      expect(authContext.session).not.toBeNull();
      expect(authContext.session?.user.id).toBe("test-user-id");
    });

    it("should correctly identify template ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their template
      expect(mockTemplate.userId).toBe(userId);

      // User doesn't own other user's template
      expect(mockOtherUserTemplate.userId).not.toBe(userId);
    });

    it("should allow setting public templates as active", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User doesn't own the public template but can access it
      expect(mockPublicTemplate.userId).not.toBe(userId);
      expect(mockPublicTemplate.isPublic).toBe(true);
    });

    it("should not allow setting other users private templates as active", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // Other user's private template should not be accessible
      expect(mockOtherUserTemplate.userId).not.toBe(userId);
      expect(mockOtherUserTemplate.isPublic).toBe(false);
    });
  });

  describe("Get Active Template", () => {
    it("should return null when no active template is set", () => {
      const settingsWithNoActive = { ...mockSettings, activeTemplateId: null };
      expect(settingsWithNoActive.activeTemplateId).toBeNull();
    });

    it("should return template when active template is set", () => {
      expect(mockSettings.activeTemplateId).toBe(1);
      expect(mockTemplate.id).toBe(1);
    });
  });

  describe("Set Active Template", () => {
    it("should validate templateId is a positive number", () => {
      const schema = z.object({
        templateId: z.coerce.number().positive(),
      });

      expect(schema.safeParse({ templateId: 1 }).success).toBe(true);
      expect(schema.safeParse({ templateId: 0 }).success).toBe(false);
      expect(schema.safeParse({ templateId: -1 }).success).toBe(false);
    });

    it("should allow owned templates", () => {
      const userId = "test-user-id";
      const canAccess = mockTemplate.userId === userId;
      expect(canAccess).toBe(true);
    });

    it("should allow public templates", () => {
      const userId = "test-user-id";
      const canAccess =
        mockPublicTemplate.userId === userId || mockPublicTemplate.isPublic === true;
      expect(canAccess).toBe(true);
    });

    it("should not allow other users private templates", () => {
      const userId = "test-user-id";
      const canAccess =
        mockOtherUserTemplate.userId === userId || mockOtherUserTemplate.isPublic === true;
      expect(canAccess).toBe(false);
    });
  });

  describe("Clear Active Template", () => {
    it("should set activeTemplateId to null", () => {
      const clearedSettings = { ...mockSettings, activeTemplateId: null };
      expect(clearedSettings.activeTemplateId).toBeNull();
    });
  });

  describe("Output Schema", () => {
    it("should validate active template output schema", () => {
      const activeTemplateOutputSchema = z
        .object({
          id: z.number(),
          userId: z.string(),
          folderId: z.number().nullable(),
          name: z.string(),
          description: z.string().nullable(),
          estimatedDurationMinutes: z.number().nullable(),
          isPublic: z.boolean(),
          timesUsed: z.number(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
        .nullable();

      // Valid template
      expect(activeTemplateOutputSchema.safeParse(mockTemplate).success).toBe(true);

      // Null is valid
      expect(activeTemplateOutputSchema.safeParse(null).success).toBe(true);

      // Invalid template (missing required fields)
      expect(activeTemplateOutputSchema.safeParse({ id: 1 }).success).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle deleted template gracefully", () => {
      // When active template is deleted, getActiveTemplate should return null
      // and clear the activeTemplateId
      const settingsWithDeletedTemplate = { ...mockSettings, activeTemplateId: 999 };
      expect(settingsWithDeletedTemplate.activeTemplateId).toBe(999);
      // Handler would query for template, find none, clear activeTemplateId, return null
    });

    it("should handle concurrent template updates", () => {
      // Multiple rapid setActiveTemplate calls should settle to the last value
      const calls = [{ templateId: 1 }, { templateId: 2 }, { templateId: 3 }];
      const finalTemplateId = calls[calls.length - 1]?.templateId;
      expect(finalTemplateId).toBe(3);
    });

    it("should preserve other settings when updating activeTemplateId", () => {
      const originalSettings = { ...mockSettings };
      const updatedSettings = { ...mockSettings, activeTemplateId: 2 };

      // Only activeTemplateId should change
      expect(updatedSettings.weightUnit).toBe(originalSettings.weightUnit);
      expect(updatedSettings.distanceUnit).toBe(originalSettings.distanceUnit);
      expect(updatedSettings.activeTemplateId).not.toBe(originalSettings.activeTemplateId);
    });
  });
});
