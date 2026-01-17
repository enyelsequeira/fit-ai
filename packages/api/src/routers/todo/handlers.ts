import { db } from "@fit-ai/db";
import { todo } from "@fit-ai/db/schema/todo";
import { and, eq } from "drizzle-orm";

import { notFound, notOwner } from "../../errors";

import type {
  CreateRouteHandler,
  DeleteRouteHandler,
  GetAllRouteHandler,
  ToggleRouteHandler,
} from "./contracts";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a todo by ID and verify ownership.
 * Throws NOT_FOUND if todo doesn't exist.
 * Throws FORBIDDEN if user doesn't own the todo.
 */
async function getTodoWithOwnershipCheck(todoId: number, userId: string) {
  const result = await db.select().from(todo).where(eq(todo.id, todoId)).limit(1);

  const t = result[0];
  if (!t) {
    notFound("Todo", todoId);
  }

  if (t.userId !== userId) {
    notOwner("todo");
  }

  return t;
}

// ============================================================================
// Get All Todos Handler
// ============================================================================

export const getAllTodosHandler: GetAllRouteHandler = async ({ context }) => {
  const userId = context.session.user.id;

  return await db.select().from(todo).where(eq(todo.userId, userId)).orderBy(todo.createdAt);
};

// ============================================================================
// Create Todo Handler
// ============================================================================

export const createTodoHandler: CreateRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  const result = await db
    .insert(todo)
    .values({
      userId,
      text: input.text,
    })
    .returning();

  return result[0] ?? {};
};

// ============================================================================
// Toggle Todo Handler
// ============================================================================

export const toggleTodoHandler: ToggleRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Verify ownership before updating
  await getTodoWithOwnershipCheck(input.id, userId);

  const result = await db
    .update(todo)
    .set({ completed: input.completed })
    .where(and(eq(todo.id, input.id), eq(todo.userId, userId)))
    .returning();

  return result[0] ?? {};
};

// ============================================================================
// Delete Todo Handler
// ============================================================================

export const deleteTodoHandler: DeleteRouteHandler = async ({ input, context }) => {
  const userId = context.session.user.id;

  // Verify ownership before deleting
  await getTodoWithOwnershipCheck(input.id, userId);

  await db.delete(todo).where(and(eq(todo.id, input.id), eq(todo.userId, userId)));

  return { success: true };
};
