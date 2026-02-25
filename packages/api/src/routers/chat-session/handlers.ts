import type {
  CreateSessionRouteHandler,
  DeleteSessionRouteHandler,
  GetMessagesRouteHandler,
  ListSessionsRouteHandler,
  SaveMessagesRouteHandler,
  UpdateSessionTitleRouteHandler,
} from "./contracts";

import { ORPCError } from "@orpc/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@fit-ai/db";
import { chatMessage, chatSession } from "@fit-ai/db/schema/chat";

// ============================================================================
// List Sessions Handler
// ============================================================================

export const listSessionsHandler: ListSessionsRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const sessions = await db
    .select({
      id: chatSession.id,
      title: chatSession.title,
      createdAt: chatSession.createdAt,
      updatedAt: chatSession.updatedAt,
      messageCount: sql<number>`(SELECT COUNT(*) FROM chat_message WHERE session_id = ${chatSession.id})`,
    })
    .from(chatSession)
    .where(eq(chatSession.userId, userId))
    .orderBy(desc(chatSession.updatedAt))
    .limit(input.limit)
    .offset(input.offset);

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(chatSession)
    .where(eq(chatSession.userId, userId));

  return {
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      messageCount: s.messageCount,
    })),
    total: countResult[0]?.count ?? 0,
  };
};

// ============================================================================
// Get Messages Handler
// ============================================================================

export const getMessagesHandler: GetMessagesRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Verify session belongs to user
  const session = await db
    .select()
    .from(chatSession)
    .where(and(eq(chatSession.id, input.sessionId), eq(chatSession.userId, userId)))
    .limit(1);

  const sess = session[0];
  if (!sess) {
    throw new ORPCError("NOT_FOUND", { message: "Chat session not found" });
  }

  const messages = await db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.sessionId, input.sessionId))
    .orderBy(chatMessage.createdAt);

  return {
    sessionId: sess.id,
    title: sess.title,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
  };
};

// ============================================================================
// Create Session Handler
// ============================================================================

export const createSessionHandler: CreateSessionRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const result = await db
    .insert(chatSession)
    .values({
      id: input.id,
      userId,
      title: input.title,
    })
    .returning();

  const created = result[0];
  if (!created) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create session" });
  }

  return {
    id: created.id,
    title: created.title,
    createdAt: created.createdAt.toISOString(),
  };
};

// ============================================================================
// Delete Session Handler
// ============================================================================

export const deleteSessionHandler: DeleteSessionRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Verify ownership
  const session = await db
    .select()
    .from(chatSession)
    .where(and(eq(chatSession.id, input.sessionId), eq(chatSession.userId, userId)))
    .limit(1);

  if (!session[0]) {
    throw new ORPCError("NOT_FOUND", { message: "Chat session not found" });
  }

  await db.delete(chatSession).where(eq(chatSession.id, input.sessionId));

  return { success: true };
};

// ============================================================================
// Save Messages Handler (bulk upsert)
// ============================================================================

export const saveMessagesHandler: SaveMessagesRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Filter out empty assistant messages (can happen when stream errors mid-response)
  const validMessages = input.messages.filter((m) => m.role === "user" || m.content.length > 0);

  // Check ownership before batch write (D1 batch can't read intermediate results)
  const existing = await db
    .select()
    .from(chatSession)
    .where(eq(chatSession.id, input.sessionId))
    .limit(1);

  const existingSession = existing[0];

  if (existingSession && existingSession.userId !== userId) {
    throw new ORPCError("FORBIDDEN", { message: "Not your session" });
  }

  // Build batch: upsert session + delete old messages + insert new messages
  // D1 doesn't support SQL transactions (BEGIN/COMMIT), so we use db.batch()
  // which executes all queries atomically via D1's native batch API.
  const batchQueries: Parameters<typeof db.batch>[0] = [];

  if (!existingSession) {
    batchQueries.push(
      db.insert(chatSession).values({ id: input.sessionId, userId, title: input.title }),
    );
  } else {
    batchQueries.push(
      db.update(chatSession).set({ title: input.title }).where(eq(chatSession.id, input.sessionId)),
    );
  }

  batchQueries.push(db.delete(chatMessage).where(eq(chatMessage.sessionId, input.sessionId)));

  if (validMessages.length > 0) {
    batchQueries.push(
      db.insert(chatMessage).values(
        validMessages.map((m) => ({
          id: m.id,
          sessionId: input.sessionId,
          role: m.role,
          content: m.content,
          toolCalls: (m.toolCalls as unknown[] | null | undefined) ?? null,
        })),
      ),
    );
  }

  await db.batch(batchQueries as [typeof batchQueries[0], ...typeof batchQueries]);

  return {
    sessionId: input.sessionId,
    savedCount: validMessages.length,
  };
};

// ============================================================================
// Update Session Title Handler
// ============================================================================

export const updateSessionTitleHandler: UpdateSessionTitleRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  // Verify session belongs to user
  const session = await db
    .select()
    .from(chatSession)
    .where(and(eq(chatSession.id, input.sessionId), eq(chatSession.userId, userId)))
    .limit(1);

  if (!session[0]) {
    throw new ORPCError("NOT_FOUND", { message: "Chat session not found" });
  }

  await db
    .update(chatSession)
    .set({ title: input.title })
    .where(eq(chatSession.id, input.sessionId));

  return { id: input.sessionId, title: input.title };
};
