import canonicalHosts from "../config/canonical-hosts.json";

export const CANONICAL_ORIGIN = canonicalHosts.canonicalOrigin;

export const LEGACY_HOSTS = canonicalHosts.legacyHosts;

export function resolveRequestHostname(
  forwardedHost: string | null,
  host: string | null,
  fallbackHostname: string,
) {
  const candidate = forwardedHost?.split(",")[0]?.trim() || host || fallbackHostname;
  return candidate.replace(/:\d+$/, "").toLowerCase();
}

export function canonicalRedirectUrl(requestUrl: string, hostname: string) {
  if (!LEGACY_HOSTS.some((host) => host === hostname.toLowerCase())) return null;
  const destination = new URL(requestUrl);
  const canonical = new URL(CANONICAL_ORIGIN);
  destination.protocol = canonical.protocol;
  destination.hostname = canonical.hostname;
  destination.port = canonical.port;
  return destination;
}
