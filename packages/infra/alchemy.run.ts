import alchemy, { Scope } from "alchemy";
import { D1Database, TanStackStart, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("fit-ai");
const isLocal = Scope.current.local;

const db = await D1Database("database", {
  migrationsDir: "../../packages/db/src/migrations",
});

// Deploy server first
export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    // Placeholder - will be updated after web is deployed
    CORS_ORIGIN: isLocal ? alchemy.env.CORS_ORIGIN! : "https://placeholder.workers.dev",
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: Worker.DevUrl,
  },
  dev: {
    port: 3000,
  },
});

// Deploy web with server URL
export const web = await TanStackStart("web", {
  cwd: "../../apps/web",
  bindings: {
    VITE_SERVER_URL: server.url!,
    DB: db,
    CORS_ORIGIN: Worker.DevUrl,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: server.url!,
  },
  dev: {
    domain: "localhost:3001",
  },
});

// Re-deploy server with actual web URL for CORS (only in production)
if (!isLocal) {
  await Worker("server", {
    cwd: "../../apps/server",
    entrypoint: "src/index.ts",
    compatibility: "node",
    bindings: {
      DB: db,
      CORS_ORIGIN: web.url!,
      BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
      BETTER_AUTH_URL: server.url!,
    },
  });
}

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
