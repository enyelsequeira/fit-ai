import type { Context as HonoContext } from "hono";

import { auth } from "@fit-ai/auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  const clientIp =
    context.req.header("cf-connecting-ip") ??
    context.req.header("x-forwarded-for") ??
    "unknown";

  return {
    session,
    clientIp,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
