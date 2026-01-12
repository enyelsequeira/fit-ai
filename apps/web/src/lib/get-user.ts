import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth.ts";

export const getUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.session;
  });
