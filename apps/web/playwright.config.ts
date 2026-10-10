import { defineConfig } from "@playwright/test";

/**
 * E2E suite runs against:
 *  - the built SPA served by `vite preview` on :4174 (started below)
 *  - the API on :4000 (start it yourself with `npm run dev:api`;
 *    global-setup fails fast with a clear message if it is missing).
 * Tests register their own users, so no seeded database is required.
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  // The tests share one API/database — run them serially for stability.
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4174",
    // Uses the system Chrome, so no browser download is needed.
    channel: "chrome",
    viewport: { width: 1366, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: {
    // A tiny Node static server is more reliable on Windows than
    // `vite preview`, which occasionally dies mid-suite when the SPA
    // requests several lazy chunks at once.
    command: "node e2e/static-server.mjs",
    url: "http://localhost:4174",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
