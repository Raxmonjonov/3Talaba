import serverless from "serverless-http";

// Lazy-import the Express app so a missing DATABASE_URL or JWT_SECRET
// doesn't crash the entire function bundle at import time. The /health
// route must always respond.
let cachedHandler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (cachedHandler) return cachedHandler;
  const { app } = await import("../../apps/api/src/app.js");
  cachedHandler = serverless(app, {
    request: (req: any) => {
      req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "/api") || "/api";
    },
  });
  return cachedHandler;
}

export const handler = async (event: any, context: any) => {
  // Always answer /health even if the app fails to load.
  const path = event.path || event.rawUrl || "";
  if (path.includes("/health") || path === "/.netlify/functions/api/health") {
    // Readiness probe: /health?db=1 also verifies the database connection.
    const url = event.rawUrl || event.headers?.["x-original-url"] || "";
    if (/[?&]db=1\b/.test(url)) {
      try {
        const { getPrisma } = await import("../../apps/api/src/config/prisma.js");
        const started = Date.now();
        await getPrisma().$queryRaw`SELECT 1`;
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ok: true,
            service: "3talab-api",
            db: "up",
            latencyMs: Date.now() - started,
          }),
        };
      } catch (err) {
        console.error("Health db check failed:", err);
        return {
          statusCode: 503,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, service: "3talab-api", db: "down" }),
        };
      }
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, service: "3talab-api" }),
    };
  }

  try {
    const h = await getHandler();
    return await h(event, context);
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Server xatosi" }),
    };
  }
};
