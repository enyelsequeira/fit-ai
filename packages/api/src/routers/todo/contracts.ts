import { protectedProcedure } from "../../index";
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
// All routes use protectedProcedure to ensure user authentication and data isolation

/**
 * Get all todos for the authenticated user
 */
export const getAllRouteContract = protectedProcedure
  .route({
    method: "GET",
    path: "/todos",
    summary: "Get all todos",
    description: "Retrieves a list of all todo items for the authenticated user",
    tags: ["Todos"],
  })
  .output(todoListOutputSchema);

/**
 * Create a new todo for the authenticated user
 */
export const createRouteContract = protectedProcedure
  .route({
    method: "POST",
    path: "/todos",
    summary: "Create a todo",
    description: "Creates a new todo item for the authenticated user",
    tags: ["Todos"],
  })
  .input(createTodoSchema)
  .output(todoOutputSchema.partial());

/**
 * Toggle todo completion status (must own the todo)
 */
export const toggleRouteContract = protectedProcedure
  .route({
    method: "PATCH",
    path: "/todos/{id}",
    summary: "Toggle todo completion",
    description: "Updates the completion status of a todo item owned by the authenticated user",
    tags: ["Todos"],
  })
  .input(toggleTodoSchema)
  .output(todoOutputSchema.partial());

/**
 * Delete a todo (must own the todo)
 */
export const deleteRouteContract = protectedProcedure
  .route({
    method: "DELETE",
    path: "/todos/{id}",
    summary: "Delete a todo",
    description: "Permanently deletes a todo item owned by the authenticated user",
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
