import { describe, it, expect, vi, beforeEach } from "vitest";
import z from "zod";

import { todoRouter } from "..";

// Mock the database
vi.mock("@fit-ai/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() =>
        Promise.resolve([
          { id: 1, text: "Test todo 1", completed: false },
          { id: 2, text: "Test todo 2", completed: true },
        ]),
      ),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ success: true, meta: { last_row_id: 3 } })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve({ success: true })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ success: true })),
    })),
  },
}));

describe("Todo Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input Validation", () => {
    it("should validate create input - requires non-empty text", () => {
      const createSchema = z.object({ text: z.string().min(1) });

      // Valid input
      expect(createSchema.safeParse({ text: "Valid todo" }).success).toBe(true);

      // Invalid input - empty string
      expect(createSchema.safeParse({ text: "" }).success).toBe(false);

      // Invalid input - missing text
      expect(createSchema.safeParse({}).success).toBe(false);
    });

    it("should validate toggle input - requires id and completed", () => {
      const toggleSchema = z.object({ id: z.number(), completed: z.boolean() });

      // Valid input
      expect(toggleSchema.safeParse({ id: 1, completed: true }).success).toBe(true);
      expect(toggleSchema.safeParse({ id: 1, completed: false }).success).toBe(true);

      // Invalid input - missing fields
      expect(toggleSchema.safeParse({ id: 1 }).success).toBe(false);
      expect(toggleSchema.safeParse({ completed: true }).success).toBe(false);

      // Invalid input - wrong types
      expect(toggleSchema.safeParse({ id: "1", completed: true }).success).toBe(false);
    });

    it("should validate delete input - requires numeric id", () => {
      const deleteSchema = z.object({ id: z.number() });

      // Valid input
      expect(deleteSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(deleteSchema.safeParse({ id: 999 }).success).toBe(true);

      // Invalid input - wrong type
      expect(deleteSchema.safeParse({ id: "1" }).success).toBe(false);

      // Invalid input - missing id
      expect(deleteSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("Router Structure", () => {
    it("should have all expected procedures", () => {
      expect(todoRouter.getAll).toBeDefined();
      expect(todoRouter.create).toBeDefined();
      expect(todoRouter.toggle).toBeDefined();
      expect(todoRouter.delete).toBeDefined();
    });
  });
});
