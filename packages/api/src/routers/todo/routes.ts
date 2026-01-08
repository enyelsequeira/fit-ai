import { publicProcedure } from "../../index";
import {
  createTodoHandler,
  deleteTodoHandler,
  getAllTodosHandler,
  toggleTodoHandler,
} from "./handlers";
import {
  createTodoSchema,
  deleteResultSchema,
  deleteTodoSchema,
  todoListOutputSchema,
  todoOutputSchema,
  toggleTodoSchema,
} from "./schemas";

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * Get all todos
 */
export const getAllRoute = publicProcedure
  .route({
    method: "GET",
    path: "/todos",
    summary: "Get all todos",
    description: "Retrieves a list of all todo items",
    tags: ["Todos"],
  })
  .output(todoListOutputSchema)
  .handler(async () => {
    return getAllTodosHandler();
  });

/**
 * Create a new todo
 */
export const createRoute = publicProcedure
  .route({
    method: "POST",
    path: "/todos",
    summary: "Create a todo",
    description: "Creates a new todo item",
    tags: ["Todos"],
  })
  .input(createTodoSchema)
  .output(todoOutputSchema.partial())
  .handler(async ({ input }) => {
    return createTodoHandler(input);
  });

/**
 * Toggle todo completion status
 */
export const toggleRoute = publicProcedure
  .route({
    method: "PATCH",
    path: "/todos/{id}",
    summary: "Toggle todo completion",
    description: "Updates the completion status of a todo item",
    tags: ["Todos"],
  })
  .input(toggleTodoSchema)
  .output(todoOutputSchema.partial())
  .handler(async ({ input }) => {
    return toggleTodoHandler(input);
  });

/**
 * Delete a todo
 */
export const deleteRoute = publicProcedure
  .route({
    method: "DELETE",
    path: "/todos/{id}",
    summary: "Delete a todo",
    description: "Permanently deletes a todo item",
    tags: ["Todos"],
  })
  .input(deleteTodoSchema)
  .output(deleteResultSchema)
  .handler(async ({ input }) => {
    return deleteTodoHandler(input);
  });
