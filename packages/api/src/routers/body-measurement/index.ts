/**
 * Body Measurement Router Module
 *
 * This module provides a modular structure for the body measurement API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  createRoute,
  deleteRoute,
  getByIdRoute,
  getLatestRoute,
  getTrendsRoute,
  listRoute,
  updateRoute,
} from "./routes";

// ============================================================================
// Body Measurement Router
// ============================================================================

/**
 * Complete body measurement router with all endpoints
 */
export const bodyMeasurementRouter = {
  /** List all body measurements with filtering */
  list: listRoute,

  /** Get a body measurement by ID */
  getById: getByIdRoute,

  /** Get the most recent body measurement */
  getLatest: getLatestRoute,

  /** Get weight and body fat trends */
  getTrends: getTrendsRoute,

  /** Create a new body measurement */
  create: createRoute,

  /** Update a body measurement */
  update: updateRoute,

  /** Delete a body measurement */
  delete: deleteRoute,
};

// ============================================================================
// Re-exports for external use
// ============================================================================

export * from "./schemas";
export * from "./handlers";

export {
  createRoute,
  deleteRoute,
  getByIdRoute,
  getLatestRoute,
  getTrendsRoute,
  listRoute,
  updateRoute,
} from "./routes";
