import { ORPCError } from "@orpc/server";
import z from "zod";

// ============================================================================
// Error Data Schemas (for typed error data)
// ============================================================================

/**
 * Validation error details
 */
export const validationErrorDataSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
  code: z.string().optional(),
});

export type ValidationErrorData = z.infer<typeof validationErrorDataSchema>;

/**
 * Resource not found error details
 */
export const notFoundErrorDataSchema = z.object({
  resource: z.string(),
  id: z.union([z.string(), z.number()]).optional(),
});

export type NotFoundErrorData = z.infer<typeof notFoundErrorDataSchema>;

/**
 * Conflict error details (e.g., duplicate resource)
 */
export const conflictErrorDataSchema = z.object({
  resource: z.string(),
  field: z.string().optional(),
  value: z.string().optional(),
  message: z.string().optional(),
});

export type ConflictErrorData = z.infer<typeof conflictErrorDataSchema>;

/**
 * Rate limit error details
 */
export const rateLimitErrorDataSchema = z.object({
  retryAfter: z.number(), // seconds
  limit: z.number(),
  remaining: z.number(),
});

export type RateLimitErrorData = z.infer<typeof rateLimitErrorDataSchema>;

/**
 * Business logic error details
 */
export const businessErrorDataSchema = z.object({
  code: z.string(),
  reason: z.string(),
  suggestion: z.string().optional(),
});

export type BusinessErrorData = z.infer<typeof businessErrorDataSchema>;

// ============================================================================
// Custom Error Codes (extending oRPC's common codes)
// ============================================================================

/**
 * Application-specific error codes
 */
export const APP_ERROR_CODES = {
  // Resource errors
  EXERCISE_NOT_FOUND: "EXERCISE_NOT_FOUND",
  WORKOUT_NOT_FOUND: "WORKOUT_NOT_FOUND",
  TEMPLATE_NOT_FOUND: "TEMPLATE_NOT_FOUND",
  SET_NOT_FOUND: "SET_NOT_FOUND",
  MEASUREMENT_NOT_FOUND: "MEASUREMENT_NOT_FOUND",
  PHOTO_NOT_FOUND: "PHOTO_NOT_FOUND",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  CHECK_IN_NOT_FOUND: "CHECK_IN_NOT_FOUND",

  // Permission errors
  NOT_OWNER: "NOT_OWNER",
  CANNOT_MODIFY_DEFAULT: "CANNOT_MODIFY_DEFAULT",
  WORKOUT_ALREADY_COMPLETED: "WORKOUT_ALREADY_COMPLETED",

  // Business logic errors
  EXERCISE_IN_USE: "EXERCISE_IN_USE",
  DUPLICATE_EXERCISE_NAME: "DUPLICATE_EXERCISE_NAME",
  DUPLICATE_EXERCISE_IN_WORKOUT: "DUPLICATE_EXERCISE_IN_WORKOUT",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
  RECOVERY_DATA_STALE: "RECOVERY_DATA_STALE",

  // AI errors
  AI_GENERATION_FAILED: "AI_GENERATION_FAILED",
  NO_EXERCISES_AVAILABLE: "NO_EXERCISES_AVAILABLE",
  PREFERENCES_NOT_SET: "PREFERENCES_NOT_SET",

  // Limits
  MAX_EXERCISES_PER_WORKOUT: "MAX_EXERCISES_PER_WORKOUT",
  MAX_SETS_PER_EXERCISE: "MAX_SETS_PER_EXERCISE",
  DAILY_WORKOUT_LIMIT: "DAILY_WORKOUT_LIMIT",
} as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * Create a NOT_FOUND error with structured data
 */
export function notFound(resource: string, id?: string | number): never {
  throw new ORPCError("NOT_FOUND", {
    message: id ? `${resource} with ID ${id} not found` : `${resource} not found`,
    data: { resource, id } satisfies NotFoundErrorData,
  });
}

/**
 * Create a FORBIDDEN error for ownership issues
 */
export function notOwner(resource: string): never {
  throw new ORPCError("FORBIDDEN", {
    message: `You don't have permission to access this ${resource}`,
    data: {
      code: APP_ERROR_CODES.NOT_OWNER,
      reason: "You are not the owner of this resource",
    } satisfies BusinessErrorData,
  });
}

/**
 * Create a FORBIDDEN error for default resource modification
 */
export function cannotModifyDefault(resource: string): never {
  throw new ORPCError("FORBIDDEN", {
    message: `Cannot modify default ${resource}`,
    data: {
      code: APP_ERROR_CODES.CANNOT_MODIFY_DEFAULT,
      reason: `Default ${resource}s are read-only`,
      suggestion: `Create a custom ${resource} instead`,
    } satisfies BusinessErrorData,
  });
}

/**
 * Create a CONFLICT error for duplicate resources
 */
export function duplicate(resource: string, field: string, value: string): never {
  throw new ORPCError("CONFLICT", {
    message: `A ${resource} with this ${field} already exists`,
    data: { resource, field, value } satisfies ConflictErrorData,
  });
}

/**
 * Create a CONFLICT error for resource in use
 */
export function resourceInUse(resource: string, usedBy: string): never {
  throw new ORPCError("CONFLICT", {
    message: `Cannot delete ${resource} because it is used in ${usedBy}`,
    data: {
      code: APP_ERROR_CODES.EXERCISE_IN_USE,
      reason: `This ${resource} is referenced by ${usedBy}`,
      suggestion: `Remove the ${resource} from all ${usedBy} first`,
    } satisfies BusinessErrorData,
  });
}

/**
 * Create a BAD_REQUEST error for invalid input
 */
export function badRequest(message: string, field?: string): never {
  throw new ORPCError("BAD_REQUEST", {
    message,
    data: { field, message } satisfies ValidationErrorData,
  });
}

/**
 * Create a CONFLICT error for business rule violations
 */
export function businessRuleViolation(
  code: AppErrorCode,
  reason: string,
  suggestion?: string,
): never {
  throw new ORPCError("CONFLICT", {
    message: reason,
    data: { code, reason, suggestion } satisfies BusinessErrorData,
  });
}

/**
 * Create a TOO_MANY_REQUESTS error
 */
export function rateLimited(retryAfter: number, limit: number, remaining: number): never {
  throw new ORPCError("TOO_MANY_REQUESTS", {
    message: `Rate limit exceeded. Try again in ${retryAfter} seconds`,
    data: { retryAfter, limit, remaining } satisfies RateLimitErrorData,
  });
}

/**
 * Create a PRECONDITION_FAILED error for stale data
 */
export function staleData(resource: string, suggestion: string): never {
  throw new ORPCError("PRECONDITION_FAILED", {
    message: `${resource} data is stale`,
    data: {
      code: APP_ERROR_CODES.RECOVERY_DATA_STALE,
      reason: `The ${resource} data needs to be refreshed`,
      suggestion,
    } satisfies BusinessErrorData,
  });
}

// ============================================================================
// Error Type Guards (for frontend use)
// ============================================================================

/**
 * Check if error is a specific app error code
 */
export function isAppError(error: unknown, code: AppErrorCode): boolean {
  if (error instanceof ORPCError) {
    const data = error.data as BusinessErrorData | undefined;
    return data?.code === code;
  }
  return false;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(
  error: unknown,
): error is ORPCError<"NOT_FOUND", NotFoundErrorData> {
  return error instanceof ORPCError && error.code === "NOT_FOUND";
}

/**
 * Check if error is a permission error
 */
export function isForbiddenError(
  error: unknown,
): error is ORPCError<"FORBIDDEN", BusinessErrorData> {
  return error instanceof ORPCError && error.code === "FORBIDDEN";
}

/**
 * Check if error is a conflict error
 */
export function isConflictError(
  error: unknown,
): error is ORPCError<"CONFLICT", ConflictErrorData | BusinessErrorData> {
  return error instanceof ORPCError && error.code === "CONFLICT";
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ORPCError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Extract error suggestion if available
 */
export function getErrorSuggestion(error: unknown): string | undefined {
  if (error instanceof ORPCError) {
    const data = error.data as BusinessErrorData | undefined;
    return data?.suggestion;
  }
  return undefined;
}
