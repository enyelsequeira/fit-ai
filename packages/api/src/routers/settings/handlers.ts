import { db } from "@fit-ai/db";
import { userSettings } from "@fit-ai/db/schema/user-settings";
import { workoutTemplate } from "@fit-ai/db/schema/workout-template";
import { ORPCError } from "@orpc/server";
import { and, eq, or } from "drizzle-orm";

import type {
  ClearActiveTemplateRouteHandler,
  GetActiveTemplateRouteHandler,
  GetRouteHandler,
  ResetRouteHandler,
  SetActiveTemplateRouteHandler,
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

// ============================================================================
// Active Template Handlers
// ============================================================================

/**
 * Get user's active template
 * Returns the full template object if set, null if not
 */
export const getActiveTemplateHandler: GetActiveTemplateRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  // Get user settings
  const settings = await getOrCreateSettings(userId);

  // If no active template is set, return null
  if (!settings.activeTemplateId) {
    return null;
  }

  // Fetch the active template
  const result = await db
    .select()
    .from(workoutTemplate)
    .where(eq(workoutTemplate.id, settings.activeTemplateId))
    .limit(1);

  const template = result[0];

  // If template doesn't exist (was deleted), clear the active template setting and return null
  if (!template) {
    await db
      .update(userSettings)
      .set({ activeTemplateId: null })
      .where(eq(userSettings.userId, userId));
    return null;
  }

  return template;
};

/**
 * Set active template
 * Validates that the template exists and belongs to the user (or is public)
 */
export const setActiveTemplateHandler: SetActiveTemplateRouteHandler = async ({
  input,
  context,
}) => {
  const userId = context.session.user.id;

  // Verify template exists and user has access (owner or public)
  const templateResult = await db
    .select()
    .from(workoutTemplate)
    .where(
      and(
        eq(workoutTemplate.id, input.templateId),
        or(eq(workoutTemplate.userId, userId), eq(workoutTemplate.isPublic, true)),
      ),
    )
    .limit(1);

  const template = templateResult[0];
  if (!template) {
    throw new ORPCError("NOT_FOUND", {
      message: "Template not found or you don't have access to it",
    });
  }

  // Ensure settings exist
  await getOrCreateSettings(userId);

  // Update the active template
  const result = await db
    .update(userSettings)
    .set({ activeTemplateId: input.templateId })
    .where(eq(userSettings.userId, userId))
    .returning();

  return result[0]!;
};

/**
 * Clear active template
 * Sets activeTemplateId to null
 */
export const clearActiveTemplateHandler: ClearActiveTemplateRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  // Ensure settings exist
  await getOrCreateSettings(userId);

  // Clear the active template
  const result = await db
    .update(userSettings)
    .set({ activeTemplateId: null })
    .where(eq(userSettings.userId, userId))
    .returning();

  return result[0]!;
};
