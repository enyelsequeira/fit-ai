import { existsSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const alchemyConfigPath = path.resolve(import.meta.dirname, ".alchemy/local/wrangler.jsonc");
const hasAlchemyConfig = existsSync(alchemyConfigPath);

export default defineConfig(async () => {
  const plugins: PluginOption[] = [tsconfigPaths(), tailwindcss(), tanstackStart(), viteReact()];

  if (hasAlchemyConfig) {
    const { default: alchemy } = await import("alchemy/cloudflare/tanstack-start");
    const alchemyPlugins = alchemy();
    if (Array.isArray(alchemyPlugins)) {
      plugins.push(...alchemyPlugins);
    } else {
      plugins.push(alchemyPlugins);
    }
  } else {
    console.warn("Alchemy config not found. Run 'pnpm -F @fit-ai/infra dev' first to create it.");
  }

  return {
    plugins,
    server: {
      port: 3001,
    },
  };
});
