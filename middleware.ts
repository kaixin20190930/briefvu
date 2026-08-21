import { NextResponse, type NextRequest } from "next/server";
import { canonicalRedirectUrl } from "@/lib/domain-redirects";

export function middleware(request: NextRequest) {
  const destination = canonicalRedirectUrl(request.url, request.nextUrl.hostname);
  return destination
    ? NextResponse.redirect(destination, 308)
    : NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)",
};
