/**
 * Auth Router Module
 *
 * This module provides a modular structure for the auth/user API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  checkAuthRoute,
  deleteAccountRoute,
  getProfileRoute,
  getSessionRoute,
  updateProfileRoute,
} from "./routes";

// ============================================================================
// Auth Router
// ============================================================================

/**
 * Complete auth router with all endpoints
 */
export const authRouter = {
  /** Get current session */
  getSession: getSessionRoute,

  /** Get user profile */
  getProfile: getProfileRoute,

  /** Update user profile */
  updateProfile: updateProfileRoute,

  /** Delete user account */
  deleteAccount: deleteAccountRoute,

  /** Check authentication status */
  check: checkAuthRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

// Export schemas for use in other modules or tests
export * from "./schemas";

// Export handlers for testing or custom route composition
export * from "./handlers";

// Export individual routes for custom router composition
export {
  checkAuthRoute,
  deleteAccountRoute,
  getProfileRoute,
  getSessionRoute,
  updateProfileRoute,
} from "./routes";
