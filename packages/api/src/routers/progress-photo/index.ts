/**
 * Progress Photo Router Module
 *
 * This module provides a modular structure for the progress photos API:
 * - schemas.ts: Zod validation schemas for input/output
 * - handlers.ts: Business logic handlers (database operations)
 * - routes.ts: Route definitions connecting schemas to handlers
 * - index.ts: Main export assembling the complete router
 */

import {
  compareRoute,
  createRoute,
  deleteRoute,
  getByIdRoute,
  linkMeasurementRoute,
  listRoute,
  timelineRoute,
  unlinkMeasurementRoute,
  updateRoute,
} from "./routes";

// ============================================================================
// Progress Photo Router
// ============================================================================

/**
 * Complete progress photo router with all endpoints
 */
export const progressPhotoRouter = {
  /** List all progress photos with optional filtering */
  list: listRoute,

  /** Get a single progress photo by ID */
  getById: getByIdRoute,

  /** Create a new progress photo record */
  create: createRoute,

  /** Update a progress photo's metadata */
  update: updateRoute,

  /** Delete a progress photo */
  delete: deleteRoute,

  /** Link a progress photo to a body measurement */
  linkMeasurement: linkMeasurementRoute,

  /** Remove the body measurement link from a progress photo */
  unlinkMeasurement: unlinkMeasurementRoute,

  /** Compare two progress photos side by side */
  compare: compareRoute,

  /** Get photos grouped by month for timeline view */
  timeline: timelineRoute,
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
  compareRoute,
  createRoute,
  deleteRoute,
  getByIdRoute,
  linkMeasurementRoute,
  listRoute,
  timelineRoute,
  unlinkMeasurementRoute,
  updateRoute,
} from "./routes";
