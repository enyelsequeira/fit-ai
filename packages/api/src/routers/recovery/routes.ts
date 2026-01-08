import z from "zod";

import { protectedProcedure } from "../../index";
import {
  createCheckInHandler,
  deleteCheckInHandler,
  getCheckInByDateHandler,
  getCheckInHistoryHandler,
  getReadinessHandler,
  getRecoveryStatusHandler,
  getTodayCheckInHandler,
  getTrendsHandler,
  refreshRecoveryHandler,
} from "./handlers";
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
// Route Definitions
// ============================================================================

/**
 * Create or update daily check-in (upsert by date)
 */
export const createCheckInRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/recovery/check-in",
    summary: "Create or update daily check-in",
    description:
      "Creates a new daily check-in or updates an existing one for the specified date. If no date is provided, uses today's date.",
    tags: ["Recovery"],
  })
  .input(checkInInputSchema)
  .output(checkInOutputSchema)
  .handler(async ({ input, context }) => {
    return createCheckInHandler(input, context);
  });

/**
 * Get today's check-in
 */
export const getTodayCheckInRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/today",
    summary: "Get today's check-in",
    description: "Retrieves the check-in for today, if it exists",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(checkInOutputSchema.nullable())
  .handler(async ({ context }) => {
    return getTodayCheckInHandler(context);
  });

/**
 * Get check-in for a specific date
 */
export const getCheckInByDateRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/{date}",
    summary: "Get check-in by date",
    description: "Retrieves the check-in for a specific date",
    tags: ["Recovery"],
  })
  .input(getCheckInByDateSchema)
  .output(checkInOutputSchema.nullable())
  .handler(async ({ input, context }) => {
    return getCheckInByDateHandler(input, context);
  });

/**
 * Get check-in history with pagination
 */
export const getCheckInHistoryRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/history",
    summary: "Get check-in history",
    description: "Retrieves a paginated list of check-ins with optional date range filtering",
    tags: ["Recovery"],
  })
  .input(checkInHistoryInputSchema)
  .output(checkInHistoryOutputSchema)
  .handler(async ({ input, context }) => {
    return getCheckInHistoryHandler(input, context);
  });

/**
 * Get trends over time
 */
export const getTrendsRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/check-in/trends",
    summary: "Get check-in trends",
    description: "Retrieves average metrics and mood distribution over a specified time period",
    tags: ["Recovery"],
  })
  .input(trendsInputSchema)
  .output(trendsOutputSchema)
  .handler(async ({ input, context }) => {
    return getTrendsHandler(input, context);
  });

/**
 * Delete check-in for a specific date
 */
export const deleteCheckInRoute = protectedProcedure
  .route({
    method: "DELETE",
    path: "/recovery/check-in/{date}",
    summary: "Delete check-in by date",
    description: "Deletes the check-in for a specific date",
    tags: ["Recovery"],
  })
  .input(deleteCheckInSchema)
  .output(deleteResultSchema)
  .handler(async ({ input, context }) => {
    return deleteCheckInHandler(input, context);
  });

/**
 * Get current recovery status per muscle group
 */
export const getRecoveryStatusRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/status",
    summary: "Get muscle recovery status",
    description: "Retrieves the current recovery status for each muscle group",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(recoveryStatusOutputSchema)
  .handler(async ({ context }) => {
    return getRecoveryStatusHandler(context);
  });

/**
 * Get overall training readiness score
 */
export const getReadinessRoute = protectedProcedure
  .route({
    method: "GET",
    path: "/recovery/readiness",
    summary: "Get training readiness score",
    description:
      "Calculates an overall training readiness score (0-100) based on sleep, energy, soreness, stress, and muscle recovery",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(readinessOutputSchema)
  .handler(async ({ context }) => {
    return getReadinessHandler(context);
  });

/**
 * Recalculate muscle recovery based on recent workouts
 */
export const refreshRecoveryRoute = protectedProcedure
  .route({
    method: "POST",
    path: "/recovery/refresh",
    summary: "Refresh muscle recovery data",
    description:
      "Recalculates muscle recovery status based on recent workout data. This updates recovery scores, fatigue levels, and training volume metrics.",
    tags: ["Recovery"],
  })
  .input(z.object({}).optional())
  .output(refreshRecoveryOutputSchema)
  .handler(async ({ context }) => {
    return refreshRecoveryHandler(context);
  });
