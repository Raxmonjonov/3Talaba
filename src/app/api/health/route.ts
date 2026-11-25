import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isPostgresConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbConfigured = isPostgresConfigured();
  let database: "connected" | "unconfigured" | "error" = dbConfigured
    ? "connected"
    : "unconfigured";

  if (dbConfigured) {
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      database = "error";
    }
  }

  return NextResponse.json(
    {
      status: database === "error" ? "degraded" : "ok",
      service: "flux",
      database,
      timestamp: new Date().toISOString(),
    },
    { status: database === "error" ? 503 : 200 }
  );
}
