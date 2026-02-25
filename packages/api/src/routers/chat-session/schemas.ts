import z from "zod";

// ============================================================================
// List Sessions
// ============================================================================

export const listChatSessionsSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export const chatSessionListOutputSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      messageCount: z.number(),
    }),
  ),
  total: z.number(),
});

// ============================================================================
// Get Messages
// ============================================================================

export const getChatMessagesSchema = z.object({
  sessionId: z.string(),
});

export const chatMessagesOutputSchema = z.object({
  sessionId: z.string(),
  title: z.string(),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      toolCalls: z.unknown().nullable(),
      createdAt: z.string(),
    }),
  ),
});

// ============================================================================
// Create Session
// ============================================================================

export const createChatSessionSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
});

export const chatSessionOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
});

// ============================================================================
// Delete Session
// ============================================================================

export const deleteChatSessionSchema = z.object({
  sessionId: z.string(),
});

export const deleteChatSessionOutputSchema = z.object({
  success: z.boolean(),
});

// ============================================================================
// Update Session Title
// ============================================================================

export const updateChatSessionTitleSchema = z.object({
  sessionId: z.string(),
  title: z.string().min(1).max(200),
});

export const updateChatSessionTitleOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
});

// ============================================================================
// Save Messages (bulk save after stream completes)
// ============================================================================

export const saveChatMessagesSchema = z.object({
  sessionId: z.string(),
  title: z.string().min(1).max(200),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      toolCalls: z.unknown().nullable().optional(),
    }),
  ),
});

export const saveChatMessagesOutputSchema = z.object({
  sessionId: z.string(),
  savedCount: z.number(),
});
