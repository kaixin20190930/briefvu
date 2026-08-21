export const CANONICAL_ORIGIN = "https://briefvu.com";

export const LEGACY_HOSTS = [
  "www.briefvu.com",
  "threadline-intake.liukai19911010.workers.dev",
] as const;

export function canonicalRedirectUrl(requestUrl: string, hostname: string) {
  if (!LEGACY_HOSTS.some((host) => host === hostname.toLowerCase())) return null;
  const destination = new URL(requestUrl);
  const canonical = new URL(CANONICAL_ORIGIN);
  destination.protocol = canonical.protocol;
  destination.hostname = canonical.hostname;
  destination.port = canonical.port;
  return destination;
}
