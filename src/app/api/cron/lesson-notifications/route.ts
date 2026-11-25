import { NextResponse } from "next/server";
import { dispatchDueLessonStartEmails } from "@/lib/applications/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const sentCount = await dispatchDueLessonStartEmails();
  return NextResponse.json({
    ok: true,
    sentCount,
    checkedAt: new Date().toISOString(),
  });
}
