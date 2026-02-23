import { createMiddleware } from "@tanstack/react-start";

import { auth } from "@fit-ai/auth";
import { redirect } from "@tanstack/react-router";

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect({ to: "/sign-in" });
  }
  return next({
    context: { session },
  });
});
