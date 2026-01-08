import { protectedProcedure, publicProcedure } from "../../index";
import {
  authCheckResultSchema,
  deleteAccountResultSchema,
  deleteAccountSchema,
  sessionResponseSchema,
  updateProfileSchema,
  userOutputSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * Get the current session
 * Returns user and session info if authenticated, null if not
 */
export const getSessionRouteContract = publicProcedure
  .route({
    method: "GET",
    path: "/user/session",
    summary: "Get current session",
    description:
      "Returns the current user and session information if authenticated. Returns null if not authenticated.",
    tags: ["User"],
  })
  .output(sessionResponseSchema.nullable());

/**
 * Get the current user's profile
 * Requires authentication
 */
export const getProfileRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/user/profile",
    summary: "Get user profile",
    description: "Returns the current authenticated user's profile information.",
    tags: ["User"],
  })
  .output(userOutputSchema);

/**
 * Update the current user's profile
 * Requires authentication
 */
export const updateProfileRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/user/profile",
    summary: "Update user profile",
    description:
      "Updates the current user's profile information. Only provided fields will be updated.",
    tags: ["User"],
  })
  .input(updateProfileSchema)
  .output(userOutputSchema);

/**
 * Delete the current user's account
 * Requires authentication
 * This is a destructive operation - all user data will be deleted
 */
export const deleteAccountRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/user/account",
    summary: "Delete account",
    description:
      "Permanently deletes the current user's account and all associated data. This action cannot be undone.",
    tags: ["User"],
  })
  .input(deleteAccountSchema)
  .output(deleteAccountResultSchema);

/**
 * Check if a user is authenticated
 * Lightweight endpoint for auth status checks
 */
export const checkAuthRouteContract = publicProcedure
  .route({
    method: "GET",
    path: "/user/check",
    summary: "Check authentication status",
    description:
      "Returns whether the current request is authenticated. Useful for lightweight auth checks.",
    tags: ["User"],
  })
  .output(authCheckResultSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type GetSessionRouteHandler = Parameters<typeof getSessionRouteContract.handler>[0];
export type GetProfileRouteHandler = Parameters<typeof getProfileRouteContract.handler>[0];
export type UpdateProfileRouteHandler = Parameters<typeof updateProfileRouteContract.handler>[0];
export type DeleteAccountRouteHandler = Parameters<typeof deleteAccountRouteContract.handler>[0];
export type CheckAuthRouteHandler = Parameters<typeof checkAuthRouteContract.handler>[0];
