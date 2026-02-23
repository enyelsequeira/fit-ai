import { db } from "@fit-ai/db";
import * as schema from "@fit-ai/db/schema/auth";
import { env } from "@fit-ai/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const isWorkersDev = env.BETTER_AUTH_URL.includes(".workers.dev");
const workersDomain = isWorkersDev
  ? new URL(env.BETTER_AUTH_URL).hostname.split(".").slice(1).join(".")
  : undefined;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    ...(isWorkersDev && workersDomain
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: `.${workersDomain}`,
          },
        }
      : {}),
  },
});
