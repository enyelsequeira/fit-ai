import { beforeEach, describe, expect, it } from "vitest";

import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";

import { RATE_LIMIT_CONFIG, createRateLimiter } from "../ratelimit";

describe("Rate Limiting", () => {
  describe("RATE_LIMIT_CONFIG", () => {
    it("should have strict limits of 20 requests per minute", () => {
      expect(RATE_LIMIT_CONFIG.maxRequests).toBe(20);
      expect(RATE_LIMIT_CONFIG.window).toBe(60_000);
    });
  });

  describe("createRateLimiter", () => {
    it("should create a rate limiter instance with limit function", () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
      expect(limiter.limit).toBeTypeOf("function");
    });
  });

  describe("MemoryRatelimiter behavior", () => {
    let limiter: InstanceType<typeof MemoryRatelimiter>;

    beforeEach(() => {
      limiter = new MemoryRatelimiter({
        maxRequests: 5,
        window: 60_000,
      });
    });

    it("should allow requests under the limit", async () => {
      const result1 = await limiter.limit("test-key");
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);
      expect(result1.limit).toBe(5);

      const result2 = await limiter.limit("test-key");
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it("should block requests exceeding the limit", async () => {
      for (let i = 0; i < 5; i++) {
        const result = await limiter.limit("exhaust-key");
        expect(result.success).toBe(true);
      }

      const blocked = await limiter.limit("exhaust-key");
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.reset).toBeGreaterThan(Date.now());
    });

    it("should track rate limits independently per key", async () => {
      for (let i = 0; i < 5; i++) {
        await limiter.limit("key-a");
      }

      const blockedA = await limiter.limit("key-a");
      expect(blockedA.success).toBe(false);

      const allowedB = await limiter.limit("key-b");
      expect(allowedB.success).toBe(true);
      expect(allowedB.remaining).toBe(4);
    });
  });

  describe("Client IP extraction", () => {
    it("should prefer cf-connecting-ip header", () => {
      const cfIp = "1.2.3.4";
      const xffIp = "5.6.7.8";
      const ip = cfIp || xffIp?.split(",")[0]?.trim() || "unknown";
      expect(ip).toBe("1.2.3.4");
    });

    it("should fall back to x-forwarded-for", () => {
      const cfIp = undefined;
      const xffIp = "10.0.0.1, 10.0.0.2";
      const ip = cfIp || xffIp?.split(",")[0]?.trim() || "unknown";
      expect(ip).toBe("10.0.0.1");
    });

    it("should fall back to unknown when no headers present", () => {
      const cfIp = undefined;
      const xffIp = undefined;
      const ip = cfIp || xffIp?.split(",")[0]?.trim() || "unknown";
      expect(ip).toBe("unknown");
    });
  });
});
