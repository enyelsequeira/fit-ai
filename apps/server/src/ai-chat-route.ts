import type { ContentfulStatusCode } from "hono/utils/http-status";
import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { Hono } from "hono";
import { auth } from "@fit-ai/auth";
import { env } from "@fit-ai/env/server";
import { createServerTools } from "@fit-ai/api/ai-chat/server-tools";
import { getSystemPrompt } from "@fit-ai/api/ai-chat/system-prompt";

// Model exists on OpenRouter but may not be in the type definitions yet
const AI_MODEL = "deepseek/deepseek-v3.2-20251201" as Parameters<typeof createOpenRouterText>[0];

function classifyError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const statusMatch = message.match(/\b(401|403|429|500|502|503)\b/);
  const code = statusMatch ? Number(statusMatch[1]) : 500;

  if (code === 429 || message.toLowerCase().includes("rate limit")) {
    return {
      error: "Rate limit exceeded. Please wait a moment.",
      type: "rate_limit",
      retryable: true,
      status: 429 as ContentfulStatusCode,
    };
  }
  if (code === 401 || code === 403 || message.toLowerCase().includes("invalid api key")) {
    return {
      error: "AI service authentication failed.",
      type: "auth_error",
      retryable: false,
      status: 502 as ContentfulStatusCode,
    };
  }
  if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("timed out")) {
    return {
      error: "AI request timed out. Please try again.",
      type: "timeout",
      retryable: true,
      status: 504 as ContentfulStatusCode,
    };
  }
  if (code === 502 || code === 503 || message.toLowerCase().includes("model")) {
    return {
      error: "AI model is temporarily unavailable.",
      type: "model_error",
      retryable: true,
      status: 502 as ContentfulStatusCode,
    };
  }
  return {
    error: "An unexpected error occurred.",
    type: "unknown",
    retryable: false,
    status: 500 as ContentfulStatusCode,
  };
}

export const aiChatApp = new Hono();

aiChatApp.post("/api/ai/chat", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: "Unauthorized", type: "auth_error", retryable: false }, 401);
  }

  if (!env.OPENROUTER_API_KEY) {
    console.error("[ai-chat] OPENROUTER_API_KEY is not configured");
    return c.json(
      { error: "AI service is not configured.", type: "api_key_missing", retryable: false },
      503,
    );
  }

  const body = await c.req.json();
  const { messages, sessionId: _sessionId } = body;
  if (!messages || !Array.isArray(messages)) {
    return c.json({ error: "Messages array required", type: "unknown", retryable: false }, 400);
  }

  try {
    const tools = createServerTools(session.user.id);
    const systemMessage = {
      role: "system" as const,
      content: getSystemPrompt(session.user.name ?? "there"),
    };

    const stream = chat({
      adapter: createOpenRouterText(AI_MODEL, env.OPENROUTER_API_KEY),
      messages: [systemMessage, ...messages],
      tools,
    });

    return toServerSentEventsResponse(stream);
  } catch (err) {
    console.error("[ai-chat] OpenRouter error:", err);
    const { error, type, retryable, status } = classifyError(err);
    return c.json({ error, type, retryable }, status);
  }
});
