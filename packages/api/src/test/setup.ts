import { vi } from "vitest";

// Mock environment variables if needed
process.env.DATABASE_URL = "postgres://localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret";

// Global mocks
vi.mock("@acme/db/client", () => ({
  db: {
    query: {},
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
