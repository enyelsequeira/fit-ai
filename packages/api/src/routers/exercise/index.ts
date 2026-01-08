/**
 * Exercise Router Module
 *
 * This module provides a modular structure for the exercise API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  checkNameAvailabilityRoute,
  createRoute,
  deleteRoute,
  getByIdRoute,
  getEquipmentListRoute,
  getMuscleGroupsRoute,
  listRoute,
  updateRoute,
} from "./routes";

// ============================================================================
// Exercise Router
// ============================================================================

/**
 * Complete exercise router with all endpoints
 */
export const exerciseRouter = {
  /** List all exercises with optional filtering */
  list: listRoute,

  /** Get a single exercise by ID */
  getById: getByIdRoute,

  /** Create a new custom exercise */
  create: createRoute,

  /** Update a custom exercise */
  update: updateRoute,

  /** Delete a custom exercise */
  delete: deleteRoute,

  /** Get all unique equipment types */
  getEquipmentList: getEquipmentListRoute,

  /** Get all unique muscle groups */
  getMuscleGroups: getMuscleGroupsRoute,

  /** Check if an exercise name is available */
  checkNameAvailability: checkNameAvailabilityRoute,
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
  checkNameAvailabilityRoute,
  createRoute,
  deleteRoute,
  getByIdRoute,
  getEquipmentListRoute,
  getMuscleGroupsRoute,
  listRoute,
  updateRoute,
} from "./routes";
