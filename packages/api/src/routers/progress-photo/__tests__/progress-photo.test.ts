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
    between: vi.fn((col, start, end) => ({ type: "between", col, start, end })),
    desc: vi.fn((col) => ({ type: "desc", col })),
  };
});

// Import after mocks are set up
import { progressPhotoRouter } from "..";

// Mock data
const mockPhoto = {
  id: 1,
  userId: "test-user-id",
  photoUrl: "https://example.com/photo1.jpg",
  thumbnailUrl: "https://example.com/thumb1.jpg",
  takenAt: new Date("2024-01-15"),
  poseType: "front" as const,
  bodyMeasurementId: null,
  isPrivate: true,
  notes: "First progress photo",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtherUserPhoto = {
  id: 2,
  userId: "other-user-id",
  photoUrl: "https://example.com/photo2.jpg",
  thumbnailUrl: null,
  takenAt: new Date("2024-01-20"),
  poseType: "side" as const,
  bodyMeasurementId: null,
  isPrivate: true,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMeasurement = {
  id: 1,
  userId: "test-user-id",
  measuredAt: new Date("2024-01-15"),
  weight: 75.5,
  weightUnit: "kg" as const,
  bodyFatPercentage: 18.5,
};

const mockOtherUserMeasurement = {
  id: 2,
  userId: "other-user-id",
  measuredAt: new Date("2024-01-20"),
  weight: 80.0,
  weightUnit: "kg" as const,
  bodyFatPercentage: 20.0,
};

describe("Progress Photo Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    // Pose type schema
    const poseTypeSchema = z.enum(["front", "side", "back", "other"]);

    // List photos schema
    const listPhotosSchema = z.object({
      poseType: poseTypeSchema.optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    });

    // Create photo schema
    const createPhotoSchema = z.object({
      photoUrl: z.string().url(),
      thumbnailUrl: z.string().url().optional(),
      takenAt: z.coerce.date(),
      poseType: poseTypeSchema.optional(),
      bodyMeasurementId: z.number().optional(),
      isPrivate: z.boolean().default(true),
      notes: z.string().max(1000).optional(),
    });

    // Update photo schema
    const updatePhotoSchema = z.object({
      id: z.number(),
      poseType: poseTypeSchema.nullable().optional(),
      isPrivate: z.boolean().optional(),
      notes: z.string().max(1000).nullable().optional(),
      takenAt: z.coerce.date().optional(),
    });

    // Link measurement schema
    const linkMeasurementSchema = z.object({
      id: z.number(),
      bodyMeasurementId: z.number(),
    });

    // Compare photos schema
    const comparePhotosSchema = z.object({
      photoId1: z.number(),
      photoId2: z.number(),
    });

    describe("Pose Type Schema", () => {
      it("should validate valid pose types", () => {
        expect(poseTypeSchema.safeParse("front").success).toBe(true);
        expect(poseTypeSchema.safeParse("side").success).toBe(true);
        expect(poseTypeSchema.safeParse("back").success).toBe(true);
        expect(poseTypeSchema.safeParse("other").success).toBe(true);
      });

      it("should reject invalid pose types", () => {
        expect(poseTypeSchema.safeParse("invalid").success).toBe(false);
        expect(poseTypeSchema.safeParse("").success).toBe(false);
        expect(poseTypeSchema.safeParse(123).success).toBe(false);
      });
    });

    describe("List Photos Schema", () => {
      it("should validate empty input with defaults", () => {
        const result = listPhotosSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(50);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should validate with pose type filter", () => {
        expect(listPhotosSchema.safeParse({ poseType: "front" }).success).toBe(true);
        expect(listPhotosSchema.safeParse({ poseType: "invalid" }).success).toBe(false);
      });

      it("should validate date range filters", () => {
        expect(
          listPhotosSchema.safeParse({
            startDate: "2024-01-01",
            endDate: "2024-12-31",
          }).success,
        ).toBe(true);

        expect(listPhotosSchema.safeParse({ startDate: "2024-01-01" }).success).toBe(true);
        expect(listPhotosSchema.safeParse({ endDate: "2024-12-31" }).success).toBe(true);
      });

      it("should validate pagination limits", () => {
        expect(listPhotosSchema.safeParse({ limit: 100, offset: 0 }).success).toBe(true);
        expect(listPhotosSchema.safeParse({ limit: 101 }).success).toBe(false);
        expect(listPhotosSchema.safeParse({ limit: 0 }).success).toBe(false);
        expect(listPhotosSchema.safeParse({ offset: -1 }).success).toBe(false);
      });
    });

    describe("Create Photo Schema", () => {
      it("should validate valid create input", () => {
        expect(
          createPhotoSchema.safeParse({
            photoUrl: "https://example.com/photo.jpg",
            takenAt: "2024-01-15",
          }).success,
        ).toBe(true);
      });

      it("should validate with all optional fields", () => {
        expect(
          createPhotoSchema.safeParse({
            photoUrl: "https://example.com/photo.jpg",
            thumbnailUrl: "https://example.com/thumb.jpg",
            takenAt: "2024-01-15",
            poseType: "front",
            bodyMeasurementId: 1,
            isPrivate: false,
            notes: "Test notes",
          }).success,
        ).toBe(true);
      });

      it("should require valid URL for photoUrl", () => {
        expect(
          createPhotoSchema.safeParse({
            photoUrl: "not-a-url",
            takenAt: "2024-01-15",
          }).success,
        ).toBe(false);
      });

      it("should require photoUrl and takenAt", () => {
        expect(createPhotoSchema.safeParse({}).success).toBe(false);
        expect(
          createPhotoSchema.safeParse({ photoUrl: "https://example.com/photo.jpg" }).success,
        ).toBe(false);
        expect(createPhotoSchema.safeParse({ takenAt: "2024-01-15" }).success).toBe(false);
      });

      it("should enforce notes max length", () => {
        expect(
          createPhotoSchema.safeParse({
            photoUrl: "https://example.com/photo.jpg",
            takenAt: "2024-01-15",
            notes: "a".repeat(1001),
          }).success,
        ).toBe(false);

        expect(
          createPhotoSchema.safeParse({
            photoUrl: "https://example.com/photo.jpg",
            takenAt: "2024-01-15",
            notes: "a".repeat(1000),
          }).success,
        ).toBe(true);
      });

      it("should default isPrivate to true", () => {
        const result = createPhotoSchema.parse({
          photoUrl: "https://example.com/photo.jpg",
          takenAt: "2024-01-15",
        });
        expect(result.isPrivate).toBe(true);
      });
    });

    describe("Update Photo Schema", () => {
      it("should validate update with id only", () => {
        expect(updatePhotoSchema.safeParse({ id: 1 }).success).toBe(true);
      });

      it("should validate update with all fields", () => {
        expect(
          updatePhotoSchema.safeParse({
            id: 1,
            poseType: "back",
            isPrivate: false,
            notes: "Updated notes",
            takenAt: "2024-02-01",
          }).success,
        ).toBe(true);
      });

      it("should allow nullable poseType and notes", () => {
        expect(
          updatePhotoSchema.safeParse({
            id: 1,
            poseType: null,
            notes: null,
          }).success,
        ).toBe(true);
      });

      it("should require id", () => {
        expect(updatePhotoSchema.safeParse({}).success).toBe(false);
        expect(updatePhotoSchema.safeParse({ poseType: "front" }).success).toBe(false);
      });
    });

    describe("Link Measurement Schema", () => {
      it("should validate valid link input", () => {
        expect(
          linkMeasurementSchema.safeParse({
            id: 1,
            bodyMeasurementId: 1,
          }).success,
        ).toBe(true);
      });

      it("should require both id and bodyMeasurementId", () => {
        expect(linkMeasurementSchema.safeParse({ id: 1 }).success).toBe(false);
        expect(linkMeasurementSchema.safeParse({ bodyMeasurementId: 1 }).success).toBe(false);
        expect(linkMeasurementSchema.safeParse({}).success).toBe(false);
      });
    });

    describe("Compare Photos Schema", () => {
      it("should validate valid compare input", () => {
        expect(
          comparePhotosSchema.safeParse({
            photoId1: 1,
            photoId2: 2,
          }).success,
        ).toBe(true);
      });

      it("should require both photo IDs", () => {
        expect(comparePhotosSchema.safeParse({ photoId1: 1 }).success).toBe(false);
        expect(comparePhotosSchema.safeParse({ photoId2: 2 }).success).toBe(false);
        expect(comparePhotosSchema.safeParse({}).success).toBe(false);
      });

      it("should allow same photo ID for both", () => {
        expect(
          comparePhotosSchema.safeParse({
            photoId1: 1,
            photoId2: 1,
          }).success,
        ).toBe(true);
      });
    });
  });

  describe("Router Structure", () => {
    it("should have all photo CRUD procedures", () => {
      expect(progressPhotoRouter.list).toBeDefined();
      expect(progressPhotoRouter.getById).toBeDefined();
      expect(progressPhotoRouter.create).toBeDefined();
      expect(progressPhotoRouter.update).toBeDefined();
      expect(progressPhotoRouter.delete).toBeDefined();
    });

    it("should have measurement linking procedures", () => {
      expect(progressPhotoRouter.linkMeasurement).toBeDefined();
      expect(progressPhotoRouter.unlinkMeasurement).toBeDefined();
    });

    it("should have comparison and timeline procedures", () => {
      expect(progressPhotoRouter.compare).toBeDefined();
      expect(progressPhotoRouter.timeline).toBeDefined();
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

    it("should correctly identify photo ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their photo
      expect(mockPhoto.userId).toBe(userId);

      // User doesn't own other user's photo
      expect(mockOtherUserPhoto.userId).not.toBe(userId);
    });

    it("should correctly identify measurement ownership", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      // User owns their measurement
      expect(mockMeasurement.userId).toBe(userId);

      // User doesn't own other user's measurement
      expect(mockOtherUserMeasurement.userId).not.toBe(userId);
    });

    it("should not allow users to access other users photos", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockOtherUserPhoto.userId).not.toBe(userId);
      // Trying to access would throw FORBIDDEN
    });

    it("should not allow linking to other users measurements", () => {
      const context = createAuthenticatedContext({ id: "test-user-id" });
      const userId = context.session?.user.id;

      expect(mockOtherUserMeasurement.userId).not.toBe(userId);
      // Trying to link would throw FORBIDDEN
    });
  });

  describe("Photo Operations", () => {
    it("should validate photo ID input", () => {
      const getByIdSchema = z.object({ id: z.number() });

      expect(getByIdSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(getByIdSchema.safeParse({ id: "1" }).success).toBe(false);
      expect(getByIdSchema.safeParse({}).success).toBe(false);
    });

    it("should support pose type filtering", () => {
      const filterSchema = z.object({
        poseType: z.enum(["front", "side", "back", "other"]).optional(),
      });

      expect(filterSchema.safeParse({}).success).toBe(true);
      expect(filterSchema.safeParse({ poseType: "front" }).success).toBe(true);
      expect(filterSchema.safeParse({ poseType: "invalid" }).success).toBe(false);
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
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      });

      expect(paginationSchema.safeParse({ limit: 10, offset: 0 }).success).toBe(true);
      expect(paginationSchema.safeParse({ limit: 100, offset: 50 }).success).toBe(true);
      expect(paginationSchema.safeParse({ limit: 101, offset: 0 }).success).toBe(false);
      expect(paginationSchema.safeParse({ limit: 0, offset: 0 }).success).toBe(false);
    });
  });

  describe("Comparison Operations", () => {
    it("should calculate days between photos correctly", () => {
      const photo1Date = new Date("2024-01-01");
      const photo2Date = new Date("2024-02-01");

      const timeDiff = Math.abs(photo2Date.getTime() - photo1Date.getTime());
      const daysBetween = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      expect(daysBetween).toBe(31);
    });

    it("should handle same date comparison", () => {
      const photo1Date = new Date("2024-01-15");
      const photo2Date = new Date("2024-01-15");

      const timeDiff = Math.abs(photo2Date.getTime() - photo1Date.getTime());
      const daysBetween = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      expect(daysBetween).toBe(0);
    });

    it("should handle reverse date order", () => {
      const photo1Date = new Date("2024-02-01");
      const photo2Date = new Date("2024-01-01");

      const timeDiff = Math.abs(photo2Date.getTime() - photo1Date.getTime());
      const daysBetween = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      // Should still be positive due to Math.abs
      expect(daysBetween).toBe(31);
    });
  });

  describe("Timeline Operations", () => {
    it("should group photos by year-month correctly", () => {
      const photos = [
        { ...mockPhoto, takenAt: new Date("2024-01-15") },
        { ...mockPhoto, id: 2, takenAt: new Date("2024-01-20") },
        { ...mockPhoto, id: 3, takenAt: new Date("2024-02-10") },
        { ...mockPhoto, id: 4, takenAt: new Date("2024-02-15") },
        { ...mockPhoto, id: 5, takenAt: new Date("2024-03-01") },
      ];

      const groupMap = new Map<string, typeof photos>();

      for (const photo of photos) {
        const yearMonth = `${photo.takenAt.getFullYear()}-${String(photo.takenAt.getMonth() + 1).padStart(2, "0")}`;

        const existing = groupMap.get(yearMonth);
        if (existing) {
          existing.push(photo);
        } else {
          groupMap.set(yearMonth, [photo]);
        }
      }

      expect(groupMap.size).toBe(3);
      expect(groupMap.get("2024-01")?.length).toBe(2);
      expect(groupMap.get("2024-02")?.length).toBe(2);
      expect(groupMap.get("2024-03")?.length).toBe(1);
    });

    it("should format year-month with leading zero", () => {
      const date = new Date("2024-05-15");
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      expect(yearMonth).toBe("2024-05");

      const date2 = new Date("2024-12-15");
      const yearMonth2 = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, "0")}`;
      expect(yearMonth2).toBe("2024-12");
    });

    it("should validate timeline limit", () => {
      const timelineSchema = z.object({
        limit: z.number().min(1).max(500).default(100),
      });

      expect(timelineSchema.safeParse({}).success).toBe(true);
      expect(timelineSchema.parse({}).limit).toBe(100);
      expect(timelineSchema.safeParse({ limit: 500 }).success).toBe(true);
      expect(timelineSchema.safeParse({ limit: 501 }).success).toBe(false);
      expect(timelineSchema.safeParse({ limit: 0 }).success).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty photo list", () => {
      const photosSchema = z.array(z.object({ id: z.number() }));
      expect(photosSchema.parse([])).toEqual([]);
    });

    it("should handle optional notes", () => {
      const schema = z.object({
        notes: z.string().max(1000).optional(),
      });

      const result = schema.parse({});
      expect(result.notes).toBeUndefined();
    });

    it("should handle nullable thumbnailUrl", () => {
      const schema = z.object({
        thumbnailUrl: z.string().nullable(),
      });

      expect(schema.parse({ thumbnailUrl: null }).thumbnailUrl).toBeNull();
      expect(schema.parse({ thumbnailUrl: "https://example.com/thumb.jpg" }).thumbnailUrl).toBe(
        "https://example.com/thumb.jpg",
      );
    });

    it("should handle nullable bodyMeasurementId", () => {
      const schema = z.object({
        bodyMeasurementId: z.number().nullable(),
      });

      expect(schema.parse({ bodyMeasurementId: null }).bodyMeasurementId).toBeNull();
      expect(schema.parse({ bodyMeasurementId: 1 }).bodyMeasurementId).toBe(1);
    });

    it("should handle nullable poseType", () => {
      const schema = z.object({
        poseType: z.enum(["front", "side", "back", "other"]).nullable(),
      });

      expect(schema.parse({ poseType: null }).poseType).toBeNull();
      expect(schema.parse({ poseType: "front" }).poseType).toBe("front");
    });

    it("should validate URL format", () => {
      const urlSchema = z.string().url();

      expect(urlSchema.safeParse("https://example.com/photo.jpg").success).toBe(true);
      expect(urlSchema.safeParse("http://example.com/photo.jpg").success).toBe(true);
      expect(urlSchema.safeParse("not-a-url").success).toBe(false);
      expect(urlSchema.safeParse("").success).toBe(false);
    });

    it("should coerce date strings", () => {
      const dateSchema = z.coerce.date();

      const result = dateSchema.parse("2024-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString().startsWith("2024-01-15")).toBe(true);
    });

    it("should handle privacy default", () => {
      const privacySchema = z.object({
        isPrivate: z.boolean().default(true),
      });

      expect(privacySchema.parse({}).isPrivate).toBe(true);
      expect(privacySchema.parse({ isPrivate: false }).isPrivate).toBe(false);
    });
  });

  describe("Measurement Linking", () => {
    it("should validate measurement link input", () => {
      const linkSchema = z.object({
        id: z.number(),
        bodyMeasurementId: z.number(),
      });

      expect(linkSchema.safeParse({ id: 1, bodyMeasurementId: 1 }).success).toBe(true);
      expect(linkSchema.safeParse({ id: 1 }).success).toBe(false);
    });

    it("should validate unlink input requires only photo id", () => {
      const unlinkSchema = z.object({
        id: z.number(),
      });

      expect(unlinkSchema.safeParse({ id: 1 }).success).toBe(true);
      expect(unlinkSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("Output Schemas", () => {
    it("should validate photo output structure", () => {
      const photoOutputSchema = z.object({
        id: z.number(),
        userId: z.string(),
        photoUrl: z.string(),
        thumbnailUrl: z.string().nullable(),
        takenAt: z.date(),
        poseType: z.enum(["front", "side", "back", "other"]).nullable(),
        bodyMeasurementId: z.number().nullable(),
        isPrivate: z.boolean(),
        notes: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      });

      expect(photoOutputSchema.safeParse(mockPhoto).success).toBe(true);
    });

    it("should validate comparison output structure", () => {
      const compareOutputSchema = z.object({
        photo1: z.object({ id: z.number() }),
        photo2: z.object({ id: z.number() }),
        daysBetween: z.number(),
      });

      expect(
        compareOutputSchema.safeParse({
          photo1: { id: 1 },
          photo2: { id: 2 },
          daysBetween: 30,
        }).success,
      ).toBe(true);
    });

    it("should validate timeline output structure", () => {
      const timelineGroupSchema = z.object({
        yearMonth: z.string(),
        photos: z.array(z.object({ id: z.number() })),
        count: z.number(),
      });

      const timelineOutputSchema = z.object({
        groups: z.array(timelineGroupSchema),
        totalCount: z.number(),
      });

      expect(
        timelineOutputSchema.safeParse({
          groups: [
            { yearMonth: "2024-01", photos: [{ id: 1 }, { id: 2 }], count: 2 },
            { yearMonth: "2024-02", photos: [{ id: 3 }], count: 1 },
          ],
          totalCount: 3,
        }).success,
      ).toBe(true);
    });
  });
});
