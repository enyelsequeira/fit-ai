import { createMiddleware } from "@tanstack/react-start";

import { authClient } from "@/lib/auth-client";
import { redirect } from "@tanstack/react-router";

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: request.headers,
    },
  });
  if (!session) {
    throw redirect({ to: "/sign-in" });
  }
  return next({
    context: { session },
  });
});
