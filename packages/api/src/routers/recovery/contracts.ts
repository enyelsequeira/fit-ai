import z from "zod";

import { protectedProcedure } from "../../index";
import {
  checkInHistoryInputSchema,
  checkInHistoryOutputSchema,
  checkInInputSchema,
  checkInOutputSchema,
  deleteCheckInSchema,
  deleteResultSchema,
  getCheckInByDateSchema,
  readinessOutputSchema,
  recoveryStatusOutputSchema,
  refreshRecoveryOutputSchema,
  trendsInputSchema,
  trendsOutputSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * Create or update daily check-in (upsert by date)
 */
export const createCheckInRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/recovery/check-in",
    summary: "Create or update daily check-in",
    description:
      "Creates a new daily check-in or updates an existing one for the specified date. If no date is provided, uses today's date.",
    tags: ["Recovery"],
  })
  .input(checkInInputSchema)
  .output(checkInOutputSchema);

/**
 * Get today's check-in
 */
export const getTodayCheckInRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/today",
    summary: "Get today's check-in",
    description: "Retrieves the check-in for today, if it exists",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(checkInOutputSchema.nullable());

/**
 * Get check-in for a specific date
 */
export const getCheckInByDateRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/{date}",
    summary: "Get check-in by date",
    description: "Retrieves the check-in for a specific date",
    tags: ["Recovery"],
  })
  .input(getCheckInByDateSchema)
  .output(checkInOutputSchema.nullable());

/**
 * Get check-in history with pagination
 */
export const getCheckInHistoryRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/history",
    summary: "Get check-in history",
    description: "Retrieves a paginated list of check-ins with optional date range filtering",
    tags: ["Recovery"],
  })
  .input(checkInHistoryInputSchema)
  .output(checkInHistoryOutputSchema);

/**
 * Get trends over time
 */
export const getTrendsRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/trends",
    summary: "Get check-in trends",
    description: "Retrieves average metrics and mood distribution over a specified time period",
    tags: ["Recovery"],
  })
  .input(trendsInputSchema)
  .output(trendsOutputSchema);

/**
 * Delete check-in for a specific date
 */
export const deleteCheckInRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/recovery/check-in/{date}",
    summary: "Delete check-in by date",
    description: "Deletes the check-in for a specific date",
    tags: ["Recovery"],
  })
  .input(deleteCheckInSchema)
  .output(deleteResultSchema);

/**
 * Get current recovery status per muscle group
 */
export const getRecoveryStatusRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/status",
    summary: "Get muscle recovery status",
    description: "Retrieves the current recovery status for each muscle group",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(recoveryStatusOutputSchema);

/**
 * Get overall training readiness score
 */
export const getReadinessRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/readiness",
    summary: "Get training readiness score",
    description:
      "Calculates an overall training readiness score (0-100) based on sleep, energy, soreness, stress, and muscle recovery",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(readinessOutputSchema);

/**
 * Recalculate muscle recovery based on recent workouts
 */
export const refreshRecoveryRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/recovery/refresh",
    summary: "Refresh muscle recovery data",
    description:
      "Recalculates muscle recovery status based on recent workout data. This updates recovery scores, fatigue levels, and training volume metrics.",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(refreshRecoveryOutputSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type CreateCheckInRouteHandler = Parameters<typeof createCheckInRouteContract.handler>[0];
export type GetTodayCheckInRouteHandler = Parameters<typeof getTodayCheckInRouteContract.handler>[0];
export type GetCheckInByDateRouteHandler = Parameters<
  typeof getCheckInByDateRouteContract.handler
>[0];
export type GetCheckInHistoryRouteHandler = Parameters<
  typeof getCheckInHistoryRouteContract.handler
>[0];
export type GetTrendsRouteHandler = Parameters<typeof getTrendsRouteContract.handler>[0];
export type DeleteCheckInRouteHandler = Parameters<typeof deleteCheckInRouteContract.handler>[0];
export type GetRecoveryStatusRouteHandler = Parameters<
  typeof getRecoveryStatusRouteContract.handler
>[0];
export type GetReadinessRouteHandler = Parameters<typeof getReadinessRouteContract.handler>[0];
export type RefreshRecoveryRouteHandler = Parameters<typeof refreshRecoveryRouteContract.handler>[0];
