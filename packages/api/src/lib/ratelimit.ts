import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";

export const ratelimiter = new MemoryRatelimiter({
  maxRequests: 100,
  window: 60_000,
});
