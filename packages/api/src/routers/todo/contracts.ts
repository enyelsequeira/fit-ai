import { publicProcedure } from "../../index";
import {
  createTodoSchema,
  deleteResultSchema,
  deleteTodoSchema,
  todoListOutputSchema,
  todoOutputSchema,
  toggleTodoSchema,
} from "./schemas";

// ============================================================================
// Route Contracts
// ============================================================================
// Define route contracts (procedure + route config + input/output schemas)
// Handler types are inferred from these contracts

/**
 * Get all todos
 */
export const getAllRouteContract = publicProcedure
  .route({
    method: "GET",
    path: "/todos",
    summary: "Get all todos",
    description: "Retrieves a list of all todo items",
    tags: ["Todos"],
  })
  .output(todoListOutputSchema);

/**
 * Create a new todo
 */
export const createRouteContract = publicProcedure
  .route({
    method: "POST",
    path: "/todos",
    summary: "Create a todo",
    description: "Creates a new todo item",
    tags: ["Todos"],
  })
  .input(createTodoSchema)
  .output(todoOutputSchema.partial());

/**
 * Toggle todo completion status
 */
export const toggleRouteContract = publicProcedure
  .route({
    method: "PATCH",
    path: "/todos/{id}",
    summary: "Toggle todo completion",
    description: "Updates the completion status of a todo item",
    tags: ["Todos"],
  })
  .input(toggleTodoSchema)
  .output(todoOutputSchema.partial());

/**
 * Delete a todo
 */
export const deleteRouteContract = publicProcedure
  .route({
    method: "DELETE",
    path: "/todos/{id}",
    summary: "Delete a todo",
    description: "Permanently deletes a todo item",
    tags: ["Todos"],
  })
  .input(deleteTodoSchema)
  .output(deleteResultSchema);

// ============================================================================
// Handler Types (inferred from contracts)
// ============================================================================
// These types can be used in handlers.ts for full type inference

export type GetAllRouteHandler = Parameters<typeof getAllRouteContract.handler>[0];
export type CreateRouteHandler = Parameters<typeof createRouteContract.handler>[0];
export type ToggleRouteHandler = Parameters<typeof toggleRouteContract.handler>[0];
export type DeleteRouteHandler = Parameters<typeof deleteRouteContract.handler>[0];
