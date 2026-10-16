export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/placement/:path*",
    "/roadmap/:path*",
    "/dashboard/:path*",
    "/learn/:path*",
    "/practice/:path*",
    "/coach/:path*",
    "/progress/:path*",
    "/admin/:path*",
  ],
};
