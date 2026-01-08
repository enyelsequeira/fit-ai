import z from "zod";

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * User output schema
 */
export const userOutputSchema = z.object({
  id: z.string().describe("Unique user identifier"),
  name: z.string().describe("User's display name"),
  email: z.string().email().describe("User's email address"),
  emailVerified: z.boolean().describe("Whether the email has been verified"),
  image: z.string().nullish().describe("User's profile image URL"),
  createdAt: z.date().describe("When the user account was created"),
  updatedAt: z.date().describe("When the user account was last updated"),
});

export type UserOutput = z.infer<typeof userOutputSchema>;

/**
 * Session output schema
 */
export const sessionOutputSchema = z.object({
  id: z.string().describe("Session identifier"),
  userId: z.string().describe("User ID this session belongs to"),
  expiresAt: z.date().describe("When the session expires"),
  createdAt: z.date().describe("When the session was created"),
});

export type SessionOutput = z.infer<typeof sessionOutputSchema>;

/**
 * Session response schema (user + session)
 */
export const sessionResponseSchema = z.object({
  user: userOutputSchema.describe("The authenticated user"),
  session: sessionOutputSchema.describe("The current session"),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

/**
 * Auth check result schema
 */
export const authCheckResultSchema = z.object({
  authenticated: z.boolean().describe("Whether the user is authenticated"),
  userId: z.string().nullable().describe("The user ID if authenticated"),
});

export type AuthCheckResult = z.infer<typeof authCheckResultSchema>;

/**
 * Delete account result schema
 */
export const deleteAccountResultSchema = z.object({
  success: z.boolean().describe("Whether deletion was successful"),
  message: z.string().describe("Result message"),
});

export type DeleteAccountResult = z.infer<typeof deleteAccountResultSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Update profile input schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional().describe("New display name"),
  image: z.string().url().nullable().optional().describe("New profile image URL"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Delete account input schema
 */
export const deleteAccountSchema = z.object({
  confirmEmail: z.string().email().describe("Must match the user's email to confirm deletion"),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
