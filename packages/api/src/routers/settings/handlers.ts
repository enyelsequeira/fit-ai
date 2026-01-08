import { db } from "@fit-ai/db";
import { userSettings } from "@fit-ai/db/schema/user-settings";
import { eq } from "drizzle-orm";

import type {
  UpdateDisplayPreferencesInput,
  UpdateNotificationPreferencesInput,
  UpdatePrivacyPreferencesInput,
  UpdateSettingsInput,
  UpdateUnitsInput,
  UpdateWorkoutPreferencesInput,
} from "./schemas";

// ============================================================================
// Types
// ============================================================================

export interface AuthenticatedContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get or create user settings
 * Creates default settings if they don't exist
 */
async function getOrCreateSettings(userId: string) {
  // Try to get existing settings
  const existing = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  // Create default settings
  const result = await db.insert(userSettings).values({ userId }).returning();

  return result[0]!;
}

// ============================================================================
// Handlers
// ============================================================================

/**
 * Get user settings (creates defaults if not exists)
 */
export async function getSettingsHandler(context: AuthenticatedContext) {
  const userId = context.session.user.id;
  return getOrCreateSettings(userId);
}

/**
 * Update any combination of settings
 */
export async function updateSettingsHandler(
  input: UpdateSettingsInput,
  context: AuthenticatedContext,
) {
  const userId = context.session.user.id;

  // Ensure settings exist
  await getOrCreateSettings(userId);

  // Update settings
  const result = await db
    .update(userSettings)
    .set(input)
    .where(eq(userSettings.userId, userId))
    .returning();

  return result[0]!;
}

/**
 * Update unit preferences only
 */
export async function updateUnitsHandler(input: UpdateUnitsInput, context: AuthenticatedContext) {
  return updateSettingsHandler(input, context);
}

/**
 * Update workout preferences only
 */
export async function updateWorkoutPreferencesHandler(
  input: UpdateWorkoutPreferencesInput,
  context: AuthenticatedContext,
) {
  return updateSettingsHandler(input, context);
}

/**
 * Update display preferences only
 */
export async function updateDisplayPreferencesHandler(
  input: UpdateDisplayPreferencesInput,
  context: AuthenticatedContext,
) {
  return updateSettingsHandler(input, context);
}

/**
 * Update notification preferences only
 */
export async function updateNotificationPreferencesHandler(
  input: UpdateNotificationPreferencesInput,
  context: AuthenticatedContext,
) {
  return updateSettingsHandler(input, context);
}

/**
 * Update privacy preferences only
 */
export async function updatePrivacyPreferencesHandler(
  input: UpdatePrivacyPreferencesInput,
  context: AuthenticatedContext,
) {
  return updateSettingsHandler(input, context);
}

/**
 * Reset settings to defaults
 */
export async function resetSettingsHandler(context: AuthenticatedContext) {
  const userId = context.session.user.id;

  // Delete existing settings
  await db.delete(userSettings).where(eq(userSettings.userId, userId));

  // Create new defaults
  return getOrCreateSettings(userId);
}
