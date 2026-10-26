import { NextResponse } from "next/server";
import { WINDOWS_EXE_BASE64 } from "@/lib/windows-exe-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "windows";

  if (platform === "windows" || platform === "exe") {
    const buffer = Buffer.from(WINDOWS_EXE_BASE64, "base64");
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.microsoft.portable-executable",
        "Content-Disposition": 'attachment; filename="3Talab-Setup.exe"',
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  if (platform === "mac" || platform === "zip") {
    const script = `#!/bin/bash
APP_URL="https://3talaba.netlify.app"
echo "3Talab ishga tushmoqda..."
if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "Google Chrome" --args --app="$APP_URL"
else
    open "$APP_URL"
fi
`;
    return new Response(script, {
      status: 200,
      headers: {
        "Content-Type": "application/x-sh",
        "Content-Disposition": 'attachment; filename="3Talab-mac.command"',
        "Cache-Control": "no-cache",
      },
    });
  }

  if (platform === "linux" || platform === "appimage") {
    const script = `#!/bin/bash
APP_URL="https://3talaba.netlify.app"
echo "3Talab Desktop Launcher (Kali Linux / Ubuntu)"
if command -v google-chrome &> /dev/null; then
    google-chrome --app="$APP_URL"
elif command -v chromium &> /dev/null; then
    chromium --app="$APP_URL"
else
    xdg-open "$APP_URL"
fi
`;
    return new Response(script, {
      status: 200,
      headers: {
        "Content-Type": "application/x-sh",
        "Content-Disposition": 'attachment; filename="3Talab.AppImage"',
        "Cache-Control": "no-cache",
      },
    });
  }

  return NextResponse.json({ error: "Noma'lum platforma" }, { status: 400 });
}
