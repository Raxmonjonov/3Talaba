import "dotenv/config";

const required = ["JWT_SECRET"] as const;
const forbidden = ["dev-secret-change-me", "change-this-to-a-long-random-string"];

/** Validates required env vars at boot so a bad deploy fails fast. */
export function validateEnv(): void {
  const missing: string[] = [];
  for (const key of required) {
    const value = process.env[key];
    if (!value) missing.push(key);
    else if (forbidden.includes(value)) missing.push(`${key} (still the placeholder)`);
  }
  if (missing.length) {
    console.error(
      `[env] Missing or invalid: ${missing.join(", ")}. Set them in .env before starting.`
    );
    // In serverless (Netlify Functions) don't kill the process — individual
    // routes will 500 but /health stays reachable.
    if (process.env.NETLIFY !== "true") process.exit(1);
  }
}
