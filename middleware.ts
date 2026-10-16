import { NextResponse, type NextRequest } from "next/server";
import { canonicalRedirectUrl, resolveRequestHostname } from "./lib/domain-redirects";

// OpenNext Cloudflare 1.20 requires Edge Middleware. Next.js 16 Proxy is
// Node-only, so this deprecated filename remains intentionally until the
// adapter supports Node Proxy output.
export const runtime = "experimental-edge";

export function middleware(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostname = resolveRequestHostname(
    forwardedHost ?? null,
    request.headers.get("host"),
    request.nextUrl.hostname,
  );
  const destination = canonicalRedirectUrl(request.url, hostname);
  return destination
    ? NextResponse.redirect(destination, 308)
    : NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)",
};
