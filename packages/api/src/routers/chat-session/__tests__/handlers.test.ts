import { beforeEach, describe, expect, it, vi } from "vitest";

import { ORPCError } from "@orpc/server";

import { createAuthenticatedContext } from "../../../test/helpers";

// Mock database
vi.mock("@fit-ai/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
    batch: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn((col, val) => ({ type: "eq", col, val })),
    and: vi.fn((...conditions) => ({ type: "and", conditions })),
  };
});

// Import after mocks
import type { ProtectedContext } from "../../../index";

import { db } from "@fit-ai/db";

import { saveMessagesHandler, updateSessionTitleHandler } from "../handlers";

// Mock data
const mockSession = {
  id: "session-1",
  userId: "test-user-id",
  title: "Old Title",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("updateSessionTitleHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Successful Update
  // ===========================================================================

  it("should successfully update title for owned session", async () => {
    const context = createAuthenticatedContext({ id: "test-user-id" }) as ProtectedContext;

    // Mock: select returns the user's session
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([mockSession])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    // Mock: update chain resolves successfully
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    } as ReturnType<typeof db.update>);

    const result = await updateSessionTitleHandler({
      input: { sessionId: "session-1", title: "New Title" },
      context,
    } as Parameters<typeof updateSessionTitleHandler>[0]);

    expect(result).toEqual({
      id: "session-1",
      title: "New Title",
    });

    expect(db.select).toHaveBeenCalledOnce();
    expect(db.update).toHaveBeenCalledOnce();
  });

  // ===========================================================================
  // NOT_FOUND for Non-Existent Session
  // ===========================================================================

  it("should return NOT_FOUND for non-existent session", async () => {
    const context = createAuthenticatedContext({ id: "test-user-id" }) as ProtectedContext;

    // Mock: select returns empty array (session not found)
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    await expect(
      updateSessionTitleHandler({
        input: { sessionId: "non-existent-id", title: "New Title" },
        context,
      } as Parameters<typeof updateSessionTitleHandler>[0]),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(ORPCError);
      expect((error as ORPCError).code).toBe("NOT_FOUND");
      return true;
    });

    expect(db.select).toHaveBeenCalledOnce();
    expect(db.update).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // NOT_FOUND for Session Owned by Different User
  // ===========================================================================

  it("should return NOT_FOUND for session owned by different user", async () => {
    const context = createAuthenticatedContext({ id: "other-user-id" }) as ProtectedContext;

    // Mock: select returns empty because the AND condition (id + userId) doesn't match
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    await expect(
      updateSessionTitleHandler({
        input: { sessionId: "session-1", title: "Hijacked Title" },
        context,
      } as Parameters<typeof updateSessionTitleHandler>[0]),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(ORPCError);
      expect((error as ORPCError).code).toBe("NOT_FOUND");
      return true;
    });

    expect(db.select).toHaveBeenCalledOnce();
    expect(db.update).not.toHaveBeenCalled();
  });
});

// =============================================================================
// saveMessagesHandler Tests
// =============================================================================

describe("saveMessagesHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMessages = [
    { id: "msg-1", role: "user" as const, content: "Hello", toolCalls: null },
    { id: "msg-2", role: "assistant" as const, content: "Hi there!", toolCalls: null },
  ];

  // ===========================================================================
  // New Session - Save Messages with D1 Batch
  // ===========================================================================

  it("should save messages via db.batch for a new session", async () => {
    const context = createAuthenticatedContext({ id: "test-user-id" }) as ProtectedContext;

    // Mock: no existing session
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    const result = await saveMessagesHandler({
      input: {
        sessionId: "new-session-1",
        title: "New Chat",
        messages: mockMessages,
      },
      context,
    } as Parameters<typeof saveMessagesHandler>[0]);

    expect(result).toEqual({
      sessionId: "new-session-1",
      savedCount: 2,
    });

    // Verify ownership check happened
    expect(db.select).toHaveBeenCalledOnce();

    // Verify batch was called (insert session + delete messages + insert messages)
    expect(db.batch).toHaveBeenCalledOnce();
  });

  // ===========================================================================
  // FORBIDDEN - Session Belongs to Different User
  // ===========================================================================

  it("should throw FORBIDDEN when session belongs to different user", async () => {
    const context = createAuthenticatedContext({ id: "test-user-id" }) as ProtectedContext;
    const otherUserSession = { ...mockSession, userId: "other-user-id" };

    // Mock: session exists but belongs to different user
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([otherUserSession])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    await expect(
      saveMessagesHandler({
        input: {
          sessionId: "session-1",
          title: "Hijacked",
          messages: mockMessages,
        },
        context,
      } as Parameters<typeof saveMessagesHandler>[0]),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(ORPCError);
      expect((error as ORPCError).code).toBe("FORBIDDEN");
      return true;
    });

    // Verify batch was NOT called (rejected before writes)
    expect(db.batch).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // Empty Messages Array
  // ===========================================================================

  it("should handle empty messages array", async () => {
    const context = createAuthenticatedContext({ id: "test-user-id" }) as ProtectedContext;

    // Mock: no existing session
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    const result = await saveMessagesHandler({
      input: {
        sessionId: "new-session-2",
        title: "Empty Chat",
        messages: [],
      },
      context,
    } as Parameters<typeof saveMessagesHandler>[0]);

    expect(result).toEqual({
      sessionId: "new-session-2",
      savedCount: 0,
    });

    // Batch should still be called (insert session + delete old messages)
    expect(db.batch).toHaveBeenCalledOnce();
  });

  // ===========================================================================
  // Update Existing Session via Batch
  // ===========================================================================

  it("should update existing session via batch", async () => {
    const context = createAuthenticatedContext({ id: "test-user-id" }) as ProtectedContext;

    // Mock: existing session with matching userId
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([mockSession])),
        })),
      })),
    } as ReturnType<typeof db.select>);

    const result = await saveMessagesHandler({
      input: {
        sessionId: "session-1",
        title: "Updated Title",
        messages: mockMessages,
      },
      context,
    } as Parameters<typeof saveMessagesHandler>[0]);

    expect(result).toEqual({
      sessionId: "session-1",
      savedCount: 2,
    });

    // Verify batch was called (update session + delete messages + insert messages)
    expect(db.batch).toHaveBeenCalledOnce();
  });
});
