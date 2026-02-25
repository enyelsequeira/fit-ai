import type { Ratelimiter } from "@orpc/experimental-ratelimit";

import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";

export type { Ratelimiter } from "@orpc/experimental-ratelimit";

/**
 * Rate limit configuration: 200 requests per 60 seconds per IP
 */
export const RATE_LIMIT_CONFIG = {
  maxRequests: 200,
  window: 60_000,
} as const;

/**
 * Create a rate limiter instance.
 *
 * Currently uses MemoryRatelimiter (sliding window log algorithm).
 * Works per-isolate in Cloudflare Workers for basic burst protection.
 *
 * Upgrade path: When Alchemy supports Cloudflare Rate Limiter bindings,
 * pass env.RATE_LIMITER to this function and uncomment the CloudflareRatelimiter code.
 */
export function createRateLimiter(_cfRateLimiter?: unknown): Ratelimiter {
  // When Cloudflare Rate Limiter binding becomes available:
  // import { CloudflareRatelimiter } from "@orpc/experimental-ratelimit/cloudflare-ratelimit";
  // if (cfRateLimiter) {
  //   return new CloudflareRatelimiter(cfRateLimiter);
  // }
  return new MemoryRatelimiter(RATE_LIMIT_CONFIG);
}

export const globalRateLimiter: Ratelimiter = createRateLimiter();
