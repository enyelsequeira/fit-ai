/**
 * Chat Session Router Module
 *
 * Provides chat history persistence including:
 * - Listing chat sessions for the current user
 * - Retrieving messages for a specific session
 * - Creating new chat sessions
 * - Updating chat session titles
 * - Deleting chat sessions (cascade deletes messages)
 * - Bulk saving/upserting messages after a stream completes
 */

import {
  createSessionRoute,
  deleteSessionRoute,
  getMessagesRoute,
  listSessionsRoute,
  saveMessagesRoute,
  updateSessionTitleRoute,
} from "./routes";

// ============================================================================
// Chat Session Router
// ============================================================================

export const chatSessionRouter = {
  /** List chat sessions for the current user */
  list: listSessionsRoute,
  /** Get all messages for a specific session */
  getMessages: getMessagesRoute,
  /** Create a new chat session */
  create: createSessionRoute,
  /** Delete a chat session and its messages */
  delete: deleteSessionRoute,
  /** Save or update a session with messages (bulk upsert) */
  save: saveMessagesRoute,
  /** Update a chat session title */
  updateTitle: updateSessionTitleRoute,
};

// ============================================================================
// Re-exports
// ============================================================================

export * from "./schemas";
export * from "./handlers";
export {
  createSessionRoute,
  deleteSessionRoute,
  getMessagesRoute,
  listSessionsRoute,
  saveMessagesRoute,
  updateSessionTitleRoute,
} from "./routes";
