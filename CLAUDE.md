# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start all apps (web + server)
pnpm dev:web          # Frontend only (http://localhost:3001)
pnpm dev:server       # API only (http://localhost:3000)

# Testing
pnpm test             # Run all tests
pnpm -F @fit-ai/api test        # Run API tests only
pnpm -F @fit-ai/api test:watch  # Watch mode for API tests

# Type checking and linting
pnpm check-types      # TypeScript checking
pnpm check            # Oxlint + Oxfmt

# Database
pnpm db:push          # Push schema to local D1
pnpm db:generate      # Generate migrations
pnpm -F @fit-ai/db db:seed:free-exercise-db  # Seed exercise library
```

## Architecture

### Monorepo Structure (pnpm workspaces + Turborepo)

```
apps/
├── web/          # React frontend (TanStack Start + Vite)
│                 # Uses TanStack Router for file-based routing
│                 # Routes in src/routes/, generated tree in routeTree.gen.ts
├── server/       # Hono server (Cloudflare Workers)
│                 # Entry: src/index.ts

packages/
├── api/          # oRPC routers and business logic
│                 # Main router: src/routers/index.ts (appRouter)
│                 # Each router in src/routers/<name>/
├── auth/         # better-auth configuration
├── db/           # Drizzle ORM schema and migrations
│                 # Schema files: src/schema/*.ts
├── env/          # Environment validation (@t3-oss/env)
├── config/       # Shared TypeScript config
```

### API Router Pattern (oRPC)

Each router follows a contract-based pattern with 4 files:

```
packages/api/src/routers/<name>/
├── contracts.ts   # Route contracts (procedure + route config + input/output schemas)
├── schemas.ts     # Zod validation schemas
├── handlers.ts    # Business logic (database operations)
├── routes.ts      # Connect contracts to handlers
├── index.ts       # Export router and re-exports
└── __tests__/     # Vitest tests (mock db with vi.mock)
```

**Procedure types:**

- `publicProcedure` - No auth required
- `protectedProcedure` - Auth required (context.session guaranteed)

**Handler type inference:**

```typescript
// In contracts.ts - define contract
export const listRouteContract = publicProcedure
  .route({ method: "GET", path: "/exercises", ... })
  .input(listExercisesSchema)
  .output(paginatedExerciseListOutputSchema);

// Infer handler type from contract
export type ListRouteHandler = Parameters<typeof listRouteContract.handler>[0];

// In handlers.ts - use inferred type
export async function listHandler({ input, context }: ListRouteHandler) { ... }

// In routes.ts - connect
export const listRoute = listRouteContract.handler(listHandler);
```

### Frontend Data Fetching (TanStack Query + oRPC)

```typescript
const todos = useQuery(orpc.todo.getAll.queryOptions());
const mutation = useMutation(orpc.todo.create.mutationOptions({
  onSuccess: () => todos.refetch(),
}));
```

### Database (Drizzle ORM)

Schema in `packages/db/src/schema/`. Uses SQLite/D1.

```typescript
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const exercise = sqliteTable("exercise", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // ...
});
```

## TypeScript Configuration

Strict mode with notable settings:

- `noUncheckedIndexedAccess` - Array access returns `T | undefined`
- `noUnusedLocals`, `noUnusedParameters`
- `verbatimModuleSyntax` - Use `import type` for type-only imports

```typescript
// Handle array access
const item = items[0];
if (item) { /* use item */ }
```

## Conventions

**Import order:**

1. Type-only imports (`import type`)
2. External packages
3. Workspace packages (`@fit-ai/*`)
4. Path aliases (`@/`)
5. Relative imports

**Naming:**

- Files: kebab-case (`auth-client.ts`)
- Components/Types: PascalCase
- Functions/Variables: camelCase

**Error handling (oRPC):**

```typescript
import { ORPCError } from "@orpc/server";
throw new ORPCError("UNAUTHORIZED");
throw new ORPCError("NOT_FOUND", { message: "Resource not found" });
```

## Testing

Tests use Vitest with mocked database. Test files in `__tests__/` directories.

```typescript
import { describe, expect, it, vi } from "vitest";

vi.mock("@fit-ai/db", () => ({
  db: { select: vi.fn(() => ({ from: vi.fn(() => ... })), ... }
}));
```

Setup file: `packages/api/src/test/setup.ts`
