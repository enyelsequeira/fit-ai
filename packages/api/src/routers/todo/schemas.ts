import {
  insertTodoSchema,
  selectTodoSchema,
  updateTodoSchema as dbUpdateTodoSchema,
} from "@fit-ai/db/schema/todo";
import z from "zod";

// ============================================================================
// Re-export base schemas from DB package
// ============================================================================

// ============================================================================
// Output Schemas (from DB select schema)
// ============================================================================

/**
 * Single todo output schema (from drizzle-zod)
 */
export const todoOutputSchema = selectTodoSchema;

export type TodoOutput = z.infer<typeof todoOutputSchema>;

/**
 * List of todos output schema
 */
export const todoListOutputSchema = z.array(todoOutputSchema);

export type TodoListOutput = z.infer<typeof todoListOutputSchema>;

/**
 * Delete operation result
 */
export const deleteResultSchema = z.object({
  success: z.boolean().describe("Whether the deletion was successful"),
});

export type DeleteResult = z.infer<typeof deleteResultSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Create todo input schema (from drizzle-zod insert schema)
 */
export const createTodoSchema = insertTodoSchema;

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

/**
 * Toggle todo input schema
 */
export const toggleTodoSchema = z.object({
  id: z.coerce.number().describe("The ID of the todo to update"),
  completed: z.boolean().describe("The new completion status"),
});

export type ToggleTodoInput = z.infer<typeof toggleTodoSchema>;

/**
 * Update todo input schema (from drizzle-zod update schema)
 */
export const updateTodoSchema = dbUpdateTodoSchema;

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

/**
 * Delete todo input schema
 */
export const deleteTodoSchema = z.object({
  id: z.coerce.number().describe("The ID of the todo to delete"),
});

export type DeleteTodoInput = z.infer<typeof deleteTodoSchema>;
