import type { CreateTodoInput, DeleteTodoInput, ToggleTodoInput } from "./schemas";

import { db } from "@fit-ai/db";
import { todo } from "@fit-ai/db/schema/todo";
import { eq } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export interface HandlerContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  } | null;
}

// ============================================================================
// Get All Todos Handler
// ============================================================================

export async function getAllTodosHandler() {
  return await db.select().from(todo);
}

// ============================================================================
// Create Todo Handler
// ============================================================================

export async function createTodoHandler(input: CreateTodoInput) {
  const result = await db
    .insert(todo)
    .values({
      text: input.text,
    })
    .returning();
  return result[0] ?? {};
}

// ============================================================================
// Toggle Todo Handler
// ============================================================================

export async function toggleTodoHandler(input: ToggleTodoInput) {
  const result = await db
    .update(todo)
    .set({ completed: input.completed })
    .where(eq(todo.id, input.id))
    .returning();
  return result[0] ?? {};
}

// ============================================================================
// Delete Todo Handler
// ============================================================================

export async function deleteTodoHandler(input: DeleteTodoInput) {
  await db.delete(todo).where(eq(todo.id, input.id));
  return { success: true };
}
