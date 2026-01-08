import { db } from "@fit-ai/db";
import { userSettings } from "@fit-ai/db/schema/user-settings";
import { eq } from "drizzle-orm";

import type {
  GetRouteHandler,
  ResetRouteHandler,
  UpdateDisplayPreferencesRouteHandler,
  UpdateNotificationPreferencesRouteHandler,
  UpdatePrivacyPreferencesRouteHandler,
  UpdateRouteHandler,
  UpdateUnitsRouteHandler,
  UpdateWorkoutPreferencesRouteHandler,
} from "./contracts";

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
export const getSettingsHandler: GetRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;
  return getOrCreateSettings(userId);
};

/**
 * Update any combination of settings
 */
export const updateSettingsHandler: UpdateRouteHandler = async ({ input, context }) => {
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
};

/**
 * Update unit preferences only
 */
export const updateUnitsHandler: UpdateUnitsRouteHandler = async ({ input, context }) => {
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
};

/**
 * Update workout preferences only
 */
export const updateWorkoutPreferencesHandler: UpdateWorkoutPreferencesRouteHandler = async ({
  input,
  context,
}) => {
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
};

/**
 * Update display preferences only
 */
export const updateDisplayPreferencesHandler: UpdateDisplayPreferencesRouteHandler = async ({
  input,
  context,
}) => {
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
};

/**
 * Update notification preferences only
 */
export const updateNotificationPreferencesHandler: UpdateNotificationPreferencesRouteHandler =
  async ({ input, context }) => {
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
  };

/**
 * Update privacy preferences only
 */
export const updatePrivacyPreferencesHandler: UpdatePrivacyPreferencesRouteHandler = async ({
  input,
  context,
}) => {
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
};

/**
 * Reset settings to defaults
 */
export const resetSettingsHandler: ResetRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  // Delete existing settings
  await db.delete(userSettings).where(eq(userSettings.userId, userId));

  // Create new defaults
  return getOrCreateSettings(userId);
};
