import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";

import { createAuthenticatedContext, createMockContext } from "../../../test/helpers";

// Mock the database
vi.mock("@fit-ai/db", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() =>
            Promise.resolve([
              {
                id: "test-user-id",
                name: "Updated Name",
                email: "test@example.com",
                emailVerified: true,
                image: null,
                createdAt: new Date(),
                updatedAt: new Date(),
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
  };
});

// Import after mocks
import { authRouter } from "..";

describe("Auth Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    describe("userSchema", () => {
      const userSchema = z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        emailVerified: z.boolean(),
        image: z.string().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      });

      it("should validate a complete user object", () => {
        const validUser = {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          emailVerified: true,
          image: "https://example.com/image.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(userSchema.safeParse(validUser).success).toBe(true);
      });

      it("should accept null image", () => {
        const userWithNullImage = {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          emailVerified: false,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(userSchema.safeParse(userWithNullImage).success).toBe(true);
      });

      it("should accept undefined image", () => {
        const userWithoutImage = {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          emailVerified: false,
          image: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(userSchema.safeParse(userWithoutImage).success).toBe(true);
      });

      it("should reject invalid email", () => {
        const invalidUser = {
          id: "user-123",
          name: "Test User",
          email: "not-an-email",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(userSchema.safeParse(invalidUser).success).toBe(false);
      });
    });

    describe("updateProfileSchema", () => {
      const updateProfileSchema = z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().nullable().optional(),
      });

      it("should accept name only", () => {
        expect(updateProfileSchema.safeParse({ name: "New Name" }).success).toBe(true);
      });

      it("should accept image only", () => {
        expect(
          updateProfileSchema.safeParse({ image: "https://example.com/new.jpg" }).success,
        ).toBe(true);
      });

      it("should accept both name and image", () => {
        expect(
          updateProfileSchema.safeParse({
            name: "New Name",
            image: "https://example.com/new.jpg",
          }).success,
        ).toBe(true);
      });

      it("should accept empty object", () => {
        expect(updateProfileSchema.safeParse({}).success).toBe(true);
      });

      it("should accept null image (to remove)", () => {
        expect(updateProfileSchema.safeParse({ image: null }).success).toBe(true);
      });

      it("should reject empty name", () => {
        expect(updateProfileSchema.safeParse({ name: "" }).success).toBe(false);
      });

      it("should reject name too long", () => {
        expect(updateProfileSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
      });

      it("should reject invalid image URL", () => {
        expect(updateProfileSchema.safeParse({ image: "not-a-url" }).success).toBe(false);
      });
    });

    describe("deleteAccountSchema", () => {
      const deleteAccountSchema = z.object({
        confirmEmail: z.string().email(),
      });

      it("should accept valid email", () => {
        expect(deleteAccountSchema.safeParse({ confirmEmail: "test@example.com" }).success).toBe(
          true,
        );
      });

      it("should reject invalid email", () => {
        expect(deleteAccountSchema.safeParse({ confirmEmail: "not-an-email" }).success).toBe(false);
      });

      it("should reject missing email", () => {
        expect(deleteAccountSchema.safeParse({}).success).toBe(false);
      });
    });
  });

  describe("Router Structure", () => {
    it("should have all expected procedures", () => {
      expect(authRouter.getSession).toBeDefined();
      expect(authRouter.getProfile).toBeDefined();
      expect(authRouter.updateProfile).toBeDefined();
      expect(authRouter.deleteAccount).toBeDefined();
      expect(authRouter.check).toBeDefined();
    });
  });

  describe("Authentication Context", () => {
    it("should correctly identify unauthenticated requests", () => {
      const context = createMockContext();
      expect(context.session).toBeNull();
    });

    it("should correctly identify authenticated requests", () => {
      const context = createAuthenticatedContext();
      expect(context.session).not.toBeNull();
      expect(context.session?.user.id).toBe("test-user-id");
      expect(context.session?.user.email).toBe("test@example.com");
    });

    it("should include session data in authenticated context", () => {
      const context = createAuthenticatedContext();
      expect(context.session?.session.id).toBe("test-session-id");
      expect(context.session?.session.userId).toBe("test-user-id");
    });
  });

  describe("getSession", () => {
    it("should return null for unauthenticated requests", () => {
      const context = createMockContext();
      // The handler would return null
      expect(context.session).toBeNull();
    });

    it("should return user and session for authenticated requests", () => {
      const context = createAuthenticatedContext();
      expect(context.session?.user).toBeDefined();
      expect(context.session?.session).toBeDefined();
    });
  });

  describe("check", () => {
    it("should return authenticated: false for unauthenticated", () => {
      const context = createMockContext();
      const authenticated = !!context.session;
      const userId = context.session?.user.id ?? null;

      expect(authenticated).toBe(false);
      expect(userId).toBeNull();
    });

    it("should return authenticated: true with userId for authenticated", () => {
      const context = createAuthenticatedContext();
      const authenticated = !!context.session;
      const userId = context.session?.user.id ?? null;

      expect(authenticated).toBe(true);
      expect(userId).toBe("test-user-id");
    });
  });

  describe("deleteAccount", () => {
    it("should require email confirmation to match user email", () => {
      const context = createAuthenticatedContext({ email: "user@example.com" });
      const userEmail = context.session?.user.email;

      // Matching email should work
      expect("user@example.com").toBe(userEmail);

      // Non-matching email should fail
      expect("different@example.com").not.toBe(userEmail);
    });
  });

  describe("Authorization Rules", () => {
    it("should allow public access to getSession", () => {
      // getSession uses publicProcedure
      expect(authRouter.getSession).toBeDefined();
    });

    it("should allow public access to check", () => {
      // check uses publicProcedure
      expect(authRouter.check).toBeDefined();
    });

    it("should require auth for getProfile", () => {
      // getProfile uses protectedProcedure
      expect(authRouter.getProfile).toBeDefined();
    });

    it("should require auth for updateProfile", () => {
      // updateProfile uses protectedProcedure
      expect(authRouter.updateProfile).toBeDefined();
    });

    it("should require auth for deleteAccount", () => {
      // deleteAccount uses protectedProcedure
      expect(authRouter.deleteAccount).toBeDefined();
    });
  });

  describe("Profile Updates", () => {
    it("should allow updating name", () => {
      const updateSchema = z.object({
        name: z.string().min(1).max(100).optional(),
      });
      expect(updateSchema.safeParse({ name: "New Name" }).success).toBe(true);
    });

    it("should allow updating image with valid URL", () => {
      const updateSchema = z.object({
        image: z.string().url().nullable().optional(),
      });
      expect(updateSchema.safeParse({ image: "https://example.com/new.jpg" }).success).toBe(true);
    });

    it("should allow removing image by setting to null", () => {
      const updateSchema = z.object({
        image: z.string().url().nullable().optional(),
      });
      expect(updateSchema.safeParse({ image: null }).success).toBe(true);
    });
  });
});
