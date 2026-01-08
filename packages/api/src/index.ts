import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

// ============================================================================
// Exported Context Types
// ============================================================================
// These types are inferred from the procedure definitions and should be used
// in handlers instead of manually defining HandlerContext/AuthenticatedContext

/**
 * Context available in public procedures (no authentication required)
 * session may be null if user is not logged in
 */
export type PublicContext = Context;

/**
 * Context available in protected procedures (authentication required)
 * session is guaranteed to be non-null after the requireAuth middleware
 */
export type ProtectedContext = {
  session: NonNullable<Context["session"]>;
};

// Re-export Context for backwards compatibility
export type { Context } from "./context";
