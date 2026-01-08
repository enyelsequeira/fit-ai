import { protectedProcedure, publicProcedure } from "../../index";
import {
  checkAuthHandler,
  deleteAccountHandler,
  getProfileHandler,
  getSessionHandler,
  updateProfileHandler,
} from "./handlers";
import {
  authCheckResultSchema,
  deleteAccountResultSchema,
  deleteAccountSchema,
  sessionResponseSchema,
  updateProfileSchema,
  userOutputSchema,
} from "./schemas";

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * Get the current session
 * Returns user and session info if authenticated, null if not
 */
export const getSessionRoute = publicProcedure
  .route({
    method: "GET",
    path: "/user/session",
    summary: "Get current session",
    description:
      "Returns the current user and session information if authenticated. Returns null if not authenticated.",
    tags: ["User"],
  })
  .output(sessionResponseSchema.nullable())
  .handler(async ({ context }) => {
    return getSessionHandler(context);
  });

/**
 * Get the current user's profile
 * Requires authentication
 */
export const getProfileRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/user/profile",
    summary: "Get user profile",
    description: "Returns the current authenticated user's profile information.",
    tags: ["User"],
  })
  .output(userOutputSchema)
  .handler(async ({ context }) => {
    return getProfileHandler(context);
  });

/**
 * Update the current user's profile
 * Requires authentication
 */
export const updateProfileRoute = protectedProcedure
  .route({
    method: "PATCH",
    path: "/user/profile",
    summary: "Update user profile",
    description:
      "Updates the current user's profile information. Only provided fields will be updated.",
    tags: ["User"],
  })
  .input(updateProfileSchema)
  .output(userOutputSchema)
  .handler(async ({ input, context }) => {
    return updateProfileHandler(input, context);
  });

/**
 * Delete the current user's account
 * Requires authentication
 * This is a destructive operation - all user data will be deleted
 */
export const deleteAccountRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/user/account",
    summary: "Delete account",
    description:
      "Permanently deletes the current user's account and all associated data. This action cannot be undone.",
    tags: ["User"],
  })
  .input(deleteAccountSchema)
  .output(deleteAccountResultSchema)
  .handler(async ({ input, context }) => {
    return deleteAccountHandler(input, context);
  });

/**
 * Check if a user is authenticated
 * Lightweight endpoint for auth status checks
 */
export const checkAuthRoute = publicProcedure
  .route({
    method: "GET",
    path: "/user/check",
    summary: "Check authentication status",
    description:
      "Returns whether the current request is authenticated. Useful for lightweight auth checks.",
    tags: ["User"],
  })
  .output(authCheckResultSchema)
  .handler(async ({ context }) => {
    return checkAuthHandler(context);
  });
