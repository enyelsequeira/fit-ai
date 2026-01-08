import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const todo = sqliteTable("todo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
});

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectTodoSchema = createSelectSchema(todo);

/**
 * Insert schema - for validating data before insertion
 * Omits auto-generated fields (id)
 */
export const insertTodoSchema = createInsertSchema(todo, {
  text: (schema) => schema.min(1),
}).omit({
  id: true,
});

/**
 * Update schema - for validating partial updates
 * All fields are optional except id
 */
export const updateTodoSchema = insertTodoSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type SelectTodo = z.infer<typeof selectTodoSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
