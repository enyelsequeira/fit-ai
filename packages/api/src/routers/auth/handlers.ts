import type { DeleteAccountInput, UpdateProfileInput } from "./schemas";

import { db } from "@fit-ai/db";
import { user } from "@fit-ai/db/schema/auth";
import { eq } from "drizzle-orm";

import { badRequest, notFound } from "../../errors";

// ============================================================================
// Types
// ============================================================================

export interface HandlerContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
      createdAt: Date;
    };
  } | null;
}

export interface AuthenticatedContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
      createdAt: Date;
    };
  };
}

// ============================================================================
// Get Session Handler
// ============================================================================

export function getSessionHandler(context: HandlerContext) {
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
}

// ============================================================================
// Get Profile Handler
// ============================================================================

export function getProfileHandler(context: AuthenticatedContext) {
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

// ============================================================================
// Update Profile Handler
// ============================================================================

export async function updateProfileHandler(
  input: UpdateProfileInput,
  context: AuthenticatedContext,
) {
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
}

// ============================================================================
// Delete Account Handler
// ============================================================================

export async function deleteAccountHandler(
  input: DeleteAccountInput,
  context: AuthenticatedContext,
) {
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
}

// ============================================================================
// Check Auth Handler
// ============================================================================

export function checkAuthHandler(context: HandlerContext) {
  return {
    authenticated: !!context.session,
    userId: context.session?.user.id ?? null,
  };
}
