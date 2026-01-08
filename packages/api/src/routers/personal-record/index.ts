/**
 * Personal Record Router Module
 *
 * This module provides a modular structure for the personal records API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  calculateRoute,
  createRoute,
  deleteRoute,
  getByExerciseRoute,
  getByIdRoute,
  getRecentRoute,
  getSummaryRoute,
  listRoute,
  updateRoute,
} from "./routes";

// ============================================================================
// Personal Record Router
// ============================================================================

/**
 * Complete personal record router with all endpoints
 */
export const personalRecordRouter = {
  /** List all personal records with optional filtering */
  list: listRoute,

  /** Get recently achieved personal records */
  getRecent: getRecentRoute,

  /** Get personal records for a specific exercise */
  getByExercise: getByExerciseRoute,

  /** Get personal record summary statistics */
  getSummary: getSummaryRoute,

  /** Create a new personal record manually */
  create: createRoute,

  /** Get a single personal record by ID */
  getById: getByIdRoute,

  /** Update a personal record */
  update: updateRoute,

  /** Delete a personal record */
  delete: deleteRoute,

  /** Calculate PRs from a completed workout */
  calculate: calculateRoute,
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
  calculateRoute,
  createRoute,
  deleteRoute,
  getByExerciseRoute,
  getByIdRoute,
  getRecentRoute,
  getSummaryRoute,
  listRoute,
  updateRoute,
} from "./routes";
