/**
 * Todo Router Module
 *
 * This module provides a modular structure for the todo API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import { createRoute, deleteRoute, getAllRoute, toggleRoute } from "./routes";

// ============================================================================
// Todo Router
// ============================================================================

/**
 * Complete todo router with all endpoints
 */
export const todoRouter = {
  /** Get all todos */
  getAll: getAllRoute,

  /** Create a new todo */
  create: createRoute,

  /** Toggle todo completion status */
  toggle: toggleRoute,

  /** Delete a todo */
  delete: deleteRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

// Export schemas for use in other modules or tests
export * from "./schemas";

// Export handlers for testing or custom route composition
export * from "./handlers";

// Export individual routes for custom router composition
export { createRoute, deleteRoute, getAllRoute, toggleRoute } from "./routes";
