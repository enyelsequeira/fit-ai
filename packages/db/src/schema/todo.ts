import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";

export const todo = sqliteTable(
  "todo",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("todo_user_id_idx").on(table.userId)]
);

// ============================================================================
// Zod Schemas (generated from Drizzle schema)
// ============================================================================

/**
 * Select schema - for validating data returned from the database
 */
export const selectTodoSchema = createSelectSchema(todo);

/**
 * Insert schema - for validating data before insertion
 * Omits auto-generated fields (id, createdAt, updatedAt) and userId (set from session)
 */
export const insertTodoSchema = createInsertSchema(todo, {
  text: (schema) => schema.min(1).max(500),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
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
