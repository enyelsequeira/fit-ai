import type { Context } from "../context";

type TestUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type TestSession = {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Create a mock context for testing public procedures
 */
export function createMockContext(overrides?: Partial<Context>): Context {
  return {
    session: null,
    ...overrides,
  };
}

/**
 * Create a mock authenticated context for testing protected procedures
 */
export function createAuthenticatedContext(
  user?: Partial<TestUser>,
  sessionOverrides?: Partial<TestSession>,
): Context {
  const now = new Date();
  const testUser: TestUser = {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
    ...user,
  };

  const testSession: TestSession = {
    id: "test-session-id",
    userId: testUser.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    token: "test-token",
    createdAt: now,
    updatedAt: now,
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
    ...sessionOverrides,
  };

  return {
    session: {
      user: testUser,
      session: testSession,
    },
  };
}

/**
 * Create a test user for authenticated tests
 */
export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  const now = new Date();
  return {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
