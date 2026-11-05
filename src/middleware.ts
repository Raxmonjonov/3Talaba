import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit } from "@/lib/rate-limit";

const BLOCKED_PATH_PREFIXES = [
  "/.env",
  "/.git",
  "/wp-admin",
  "/wp-login",
  "/phpinfo",
  "/phpmyadmin",
  "/cgi-bin",
  "/.aws",
];

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "local";
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), payment=()",
  );
  res.headers.set("X-DNS-Prefetch-Control", "on");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lowerPath = pathname.toLowerCase();

  // 1. Zararli bot va skanerlarni darhol bloklash (0ms javob)
  for (const blocked of BLOCKED_PATH_PREFIXES) {
    if (lowerPath.startsWith(blocked)) {
      return applySecurityHeaders(
        new NextResponse("Forbidden", { status: 403 }),
      );
    }
  }

  // 2. Production muhitda faqat shifrlangan HTTPS (443/tcp) trafigiga ruxsat berish
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const rawHost =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const primaryHost = rawHost.split(",")[0]?.trim() || "";
  const isLocal =
    !primaryHost ||
    primaryHost.startsWith("localhost") ||
    primaryHost.startsWith("127.0.0.1") ||
    primaryHost.endsWith(".local");

  if (process.env.NODE_ENV === "production" && !isLocal && proto === "http") {
    const cleanHost = primaryHost.replace(/:\d+$/, "");
    const httpsUrl = new URL(
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
      `https://${cleanHost}`,
    );
    return applySecurityHeaders(NextResponse.redirect(httpsUrl, 308));
  }

  // 3. Yuqori yuklama va DDoS himoyasi: API yo'nalishlari uchun Edge Rate-Limit
  if (pathname.startsWith("/api/") && pathname !== "/api/health") {
    const ip = getClientIp(req);
    const isSensitive =
      pathname.startsWith("/api/auth/") || pathname.startsWith("/api/ai/");
    const maxPerMinute = isSensitive ? 30 : 120;
    const rate = checkRateLimit(
      `edge:${isSensitive ? "sens" : "api"}:${ip}`,
      maxPerMinute,
      60_000,
    );

    if (!rate.allowed) {
      return applySecurityHeaders(
        NextResponse.json(
          {
            error:
              "So'rovlar oqimi juda yuqori. Iltimos, bir necha soniyadan so'ng qayta urinib ko'ring.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(rate.retryAfterSec),
            },
          },
        ),
      );
    }
  }

  // 4. Admin panel uchun qat'iy JWT tekshiruvi
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
