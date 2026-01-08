# AGENTS.md - AI Coding Agent Instructions

Guidelines for AI coding agents working in this TypeScript monorepo (pnpm workspaces + Turborepo).

## Tech Stack

- **Frontend**: React 19, TanStack Start/Router/Query, TailwindCSS 4
- **Backend**: Hono, oRPC (type-safe RPC), better-auth
- **Database**: Drizzle ORM with SQLite/Turso
- **Infrastructure**: Cloudflare Workers, pnpm 10, TypeScript 5

## Project Structure

```
apps/web/         # React frontend (TanStack Start + Vite)
apps/server/      # Hono + oRPC API server
packages/api/     # oRPC routers and business logic
packages/auth/    # Authentication (better-auth)
packages/db/      # Drizzle ORM schema
packages/env/     # Environment validation (@t3-oss/env)
```

## Commands

| Command            | Description                |
| ------------------ | -------------------------- |
| `pnpm dev`         | Start all apps in dev mode |
| `pnpm build`       | Build all applications     |
| `pnpm check-types` | TypeScript type checking   |
| `pnpm check`       | Run Oxlint + Oxfmt         |
| `pnpm dev:web`     | Start web app only         |
| `pnpm dev:server`  | Start server only          |
| `pnpm db:push`     | Push schema to database    |

Single package: `pnpm -F web dev` or `pnpm -F @fit-ai/db db:push`

**Testing**: No framework configured. Use Vitest when adding tests.

## Import Order

```typescript
// 1. Type-only imports
import type { QueryClient } from "@tanstack/react-query";
// 2. External packages
import { useQuery } from "@tanstack/react-query";
import z from "zod";
// 3. Workspace packages (@fit-ai/*)
import { db } from "@fit-ai/db";
// 4. Path alias imports (@/)
import { Button } from "@/components/ui/button";
// 5. Relative imports
import { publicProcedure } from "../index";
```

## Naming Conventions

| Element             | Convention | Example          |
| ------------------- | ---------- | ---------------- |
| Files               | kebab-case | `auth-client.ts` |
| Components          | PascalCase | `SignInForm`     |
| Functions/Variables | camelCase  | `handleSubmit`   |
| Types               | PascalCase | `AppRouter`      |

## TypeScript

Strict mode with: `noUncheckedIndexedAccess`, `noUnusedLocals`, `verbatimModuleSyntax`

```typescript
// Always use type imports for types
import type { Session } from "better-auth";

// Handle array access (returns T | undefined)
const item = items[0];
if (item) { /* use item */ }
```

## Component Patterns

```typescript
// Route components
export const Route = createFileRoute("/todos")({
  component: TodosRoute,
});
function TodosRoute() { /* ... */ }

// UI components: named exports
export { Button, buttonVariants };
```

## API Patterns (oRPC)

```typescript
import { ORPCError } from "@orpc/server";
import z from "zod";

export const todoRouter = {
  getAll: publicProcedure.handler(async () => {
    return await db.select().from(todo);
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input }) => {
      return await db.insert(todo).values({ text: input.text });
    }),

  // Protected route (requires auth)
  update: protectedProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => { /* context.session available */ }),
};

// Error handling
throw new ORPCError("UNAUTHORIZED");
throw new ORPCError("NOT_FOUND", { message: "Not found" });
```

## Database Schema (Drizzle)

```typescript
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todo = sqliteTable("todo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
});
```

## Data Fetching (TanStack Query + oRPC)

```typescript
const todos = useQuery(orpc.todo.getAll.queryOptions());
const mutation = useMutation(orpc.todo.create.mutationOptions({
  onSuccess: () => todos.refetch(),
}));
mutation.mutate({ text: "New todo" });
```

## Styling (TailwindCSS + CVA)

```typescript
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("base-classes", {
  variants: { variant: { default: "...", outline: "..." }, size: { default: "...", sm: "..." } },
  defaultVariants: { variant: "default", size: "default" },
});

// Conditional classes
<div className={cn("base", isActive && "active")} />
```

## Linting (Oxlint)

Plugins: `unicorn`, `typescript`, `oxc`. Key rules:

- No unused variables/parameters
- No floating promises
- Prefer `startsWith`/`endsWith` over regex

Run `pnpm check` to lint and format.

## Environment Variables

Validated via `@t3-oss/env` in `packages/env/`. Never commit `.env` files.
