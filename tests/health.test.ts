import { describe, expect, it } from "vitest";
import { isPostgresConfigured } from "@/lib/env";

describe("env helpers", () => {
  it("detects PostgreSQL connection URLs", () => {
    const prev = process.env.DATABASE_URL;
    try {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/3talab";
      expect(isPostgresConfigured()).toBe(true);

      process.env.DATABASE_URL = "file:./dev.db";
      expect(isPostgresConfigured()).toBe(false);

      process.env.DATABASE_URL = "";
      expect(isPostgresConfigured()).toBe(false);
    } finally {
      process.env.DATABASE_URL = prev;
    }
  });
});
