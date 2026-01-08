import { db } from "@fit-ai/db";
import { todo } from "@fit-ai/db/schema/todo";
import { eq } from "drizzle-orm";

import type {
  CreateRouteHandler,
  DeleteRouteHandler,
  GetAllRouteHandler,
  ToggleRouteHandler,
} from "./contracts";

// ============================================================================
// Get All Todos Handler
// ============================================================================

export const getAllTodosHandler: GetAllRouteHandler = async () => {
  return await db.select().from(todo);
};

// ============================================================================
// Create Todo Handler
// ============================================================================

export const createTodoHandler: CreateRouteHandler = async ({ input }) => {
  const result = await db
    .insert(todo)
    .values({
      text: input.text,
    })
    .returning();
  return result[0] ?? {};
};

// ============================================================================
// Toggle Todo Handler
// ============================================================================

export const toggleTodoHandler: ToggleRouteHandler = async ({ input }) => {
  const result = await db
    .update(todo)
    .set({ completed: input.completed })
    .where(eq(todo.id, input.id))
    .returning();
  return result[0] ?? {};
};

// ============================================================================
// Delete Todo Handler
// ============================================================================

export const deleteTodoHandler: DeleteRouteHandler = async ({ input }) => {
  await db.delete(todo).where(eq(todo.id, input.id));
  return { success: true };
};
