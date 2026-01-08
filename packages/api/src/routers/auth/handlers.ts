import { db } from "@fit-ai/db";
import { user } from "@fit-ai/db/schema/auth";
import { eq } from "drizzle-orm";

import { badRequest, notFound } from "../../errors";

import type {
  CheckAuthRouteHandler,
  DeleteAccountRouteHandler,
  GetProfileRouteHandler,
  GetSessionRouteHandler,
  UpdateProfileRouteHandler,
} from "./contracts";

// ============================================================================
// Get Session Handler
// ============================================================================

export const getSessionHandler: GetSessionRouteHandler = async ({ context }) => {
  if (!context.session) {
    return null;
  }

  return {
    user: {
      id: context.session.user.id,
      name: context.session.user.name,
      email: context.session.user.email,
      emailVerified: context.session.user.emailVerified,
      image: context.session.user.image,
      createdAt: context.session.user.createdAt,
      updatedAt: context.session.user.updatedAt,
    },
    session: {
      id: context.session.session.id,
      userId: context.session.session.userId,
      expiresAt: context.session.session.expiresAt,
      createdAt: context.session.session.createdAt,
    },
  };
};

// ============================================================================
// Get Profile Handler
// ============================================================================

export const getProfileHandler: GetProfileRouteHandler = async ({ context }) => {
  return {
    id: context.session.user.id,
    name: context.session.user.name,
    email: context.session.user.email,
    emailVerified: context.session.user.emailVerified,
    image: context.session.user.image,
    createdAt: context.session.user.createdAt,
    updatedAt: context.session.user.updatedAt,
  };
};

// ============================================================================
// Update Profile Handler
// ============================================================================

export const updateProfileHandler: UpdateProfileRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Build update object with only provided fields
  const updateData: Partial<typeof user.$inferInsert> = {};
  if (input.name !== undefined) {
    updateData.name = input.name;
  }
  if (input.image !== undefined) {
    updateData.image = input.image;
  }

  // If no fields to update, just return current user
  if (Object.keys(updateData).length === 0) {
    return {
      id: context.session.user.id,
      name: context.session.user.name,
      email: context.session.user.email,
      emailVerified: context.session.user.emailVerified,
      image: context.session.user.image,
      createdAt: context.session.user.createdAt,
      updatedAt: context.session.user.updatedAt,
    };
  }

  // Update the user
  const result = await db.update(user).set(updateData).where(eq(user.id, userId)).returning();

  const updatedUser = result[0];
  if (!updatedUser) {
    notFound("User", userId);
  }

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    emailVerified: updatedUser.emailVerified,
    image: updatedUser.image,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
};

// ============================================================================
// Delete Account Handler
// ============================================================================

export const deleteAccountHandler: DeleteAccountRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;
  const userEmail = context.session.user.email;

  // Verify email confirmation
  if (input.confirmEmail !== userEmail) {
    badRequest("Email confirmation does not match your account email", "confirmEmail");
  }

  // Delete the user (cascades to all related data due to FK constraints)
  await db.delete(user).where(eq(user.id, userId));

  return {
    success: true,
    message: "Account deleted successfully",
  };
};

// ============================================================================
// Check Auth Handler
// ============================================================================

export const checkAuthHandler: CheckAuthRouteHandler = async ({ context }) => {
  return {
    authenticated: !!context.session,
    userId: context.session?.user.id ?? null,
  };
};
