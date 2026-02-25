import { protectedProcedure } from "../../index";
import {
  chatMessagesOutputSchema,
  chatSessionListOutputSchema,
  chatSessionOutputSchema,
  createChatSessionSchema,
  deleteChatSessionOutputSchema,
  deleteChatSessionSchema,
  getChatMessagesSchema,
  listChatSessionsSchema,
  saveChatMessagesOutputSchema,
  saveChatMessagesSchema,
  updateChatSessionTitleOutputSchema,
  updateChatSessionTitleSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================

/**
 * List chat sessions
 */
export const listSessionsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/chat-sessions",
    summary: "List chat sessions",
    description: "List the user's AI chat sessions, ordered by most recent.",
    tags: ["Chat"],
  })
  .input(listChatSessionsSchema)
  .output(chatSessionListOutputSchema);

/**
 * Get chat messages for a session
 */
export const getMessagesRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/chat-sessions/{sessionId}/messages",
    summary: "Get chat messages",
    description: "Get all messages for a specific chat session.",
    tags: ["Chat"],
  })
  .input(getChatMessagesSchema)
  .output(chatMessagesOutputSchema);

/**
 * Create a chat session
 */
export const createSessionRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/chat-sessions",
    summary: "Create chat session",
    description: "Create a new chat session.",
    tags: ["Chat"],
  })
  .input(createChatSessionSchema)
  .output(chatSessionOutputSchema);

/**
 * Delete a chat session
 */
export const deleteSessionRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/chat-sessions/{sessionId}",
    summary: "Delete chat session",
    description: "Delete a chat session and all its messages.",
    tags: ["Chat"],
  })
  .input(deleteChatSessionSchema)
  .output(deleteChatSessionOutputSchema);

/**
 * Save chat messages (bulk upsert)
 */
export const saveMessagesRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/chat-sessions/save",
    summary: "Save chat messages",
    description:
      "Save or update a chat session with messages. Creates the session if it doesn't exist.",
    tags: ["Chat"],
  })
  .input(saveChatMessagesSchema)
  .output(saveChatMessagesOutputSchema);

/**
 * Update chat session title
 */
export const updateSessionTitleRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/chat-sessions/{sessionId}/title",
    summary: "Update chat session title",
    description: "Update the title of an existing chat session.",
    tags: ["Chat"],
  })
  .input(updateChatSessionTitleSchema)
  .output(updateChatSessionTitleOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================

export type ListSessionsRouteHandler = Parameters<typeof listSessionsRouteContract.handler>[0];
export type GetMessagesRouteHandler = Parameters<typeof getMessagesRouteContract.handler>[0];
export type CreateSessionRouteHandler = Parameters<typeof createSessionRouteContract.handler>[0];
export type DeleteSessionRouteHandler = Parameters<typeof deleteSessionRouteContract.handler>[0];
export type SaveMessagesRouteHandler = Parameters<typeof saveMessagesRouteContract.handler>[0];
export type UpdateSessionTitleRouteHandler = Parameters<
  typeof updateSessionTitleRouteContract.handler
>[0];
