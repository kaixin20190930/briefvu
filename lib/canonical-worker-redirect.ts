import { canonicalRedirectUrl, resolveRequestHostname } from "./domain-redirects";

export function canonicalWorkerRedirect(request: Request) {
  const hostname = resolveRequestHostname(
    request.headers.get("x-forwarded-host"),
    request.headers.get("host"),
    new URL(request.url).hostname,
  );
  const destination = canonicalRedirectUrl(request.url, hostname);

  return destination
    ? new Response(null, {
        status: 308,
        headers: { location: destination.toString() },
      })
    : null;
}
