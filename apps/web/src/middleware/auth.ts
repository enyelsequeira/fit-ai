import { createMiddleware } from "@tanstack/react-start";

import { redirect } from "@tanstack/react-router";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

/**
 * In local dev, the Vite SSR context uses alchemy's production env vars
 * (BETTER_AUTH_URL points to workers.dev), so direct auth.api.getSession()
 * sets secure cookies that don't work on plain HTTP localhost.
 *
 * Instead, we proxy the session check to the Hono server which has the
 * correct local D1 bindings and env.
 *
 * In production (Cloudflare Workers), both web and server share the same
 * runtime, so we can call auth.api.getSession() directly for better perf.
 */
async function getSessionLocal(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const response = await fetch(`${SERVER_URL}/api/auth/get-session`, {
    headers: { cookie },
  });
  if (!response.ok) return null;
  return response.json();
}

async function getSessionProduction(request: Request) {
  const { auth } = await import("@fit-ai/auth");
  return auth.api.getSession({ headers: request.headers });
}

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const session = import.meta.env.DEV
    ? await getSessionLocal(request)
    : await getSessionProduction(request);

  if (!session) {
    throw redirect({ to: "/sign-in" });
  }

  return next({
    context: { session },
  });
});
