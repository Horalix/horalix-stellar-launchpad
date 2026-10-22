/**
 * Canonical host enforcement and auth redirect helpers
 * Ensures users always interact with https://horalix.com, never preview domains
 */

// Step 1: Define canonical production URL
export const CANONICAL_SITE_URL = "https://horalix.com";

// Step 2: Define the ONLY hosts allowed to serve this app.
// Any host not in this list will be redirected to the canonical URL.
const ALLOWED_HOSTS = [
  "horalix.com",
  "www.horalix.com",
  "localhost",
  "127.0.0.1",
];

// Suffixes for development/preview environments (e.g. Lovable, Netlify deploy previews)
const ALLOWED_HOST_SUFFIXES = [
  ".lovable.app",
  ".netlify.app",
];

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_HOSTS.includes(hostname)) return true;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

/**
 * enforceCanonicalHost
 * If the current hostname is in the blocked list, redirect to the canonical URL
 * Must be called before React renders to prevent flash of content
 */
export function enforceCanonicalHost(): void {
  if (typeof window === "undefined") return;

  const currentHost = window.location.hostname;

  if (!isAllowedHost(currentHost)) {
    // Preserve the path and search params on redirect
    const targetUrl = `${CANONICAL_SITE_URL}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(targetUrl);
  }
}

/**
 * authRedirectUrl
 * Builds a full redirect URL for auth email links (e.g. verify-email)
 * Always points to the canonical domain, never window.location.origin
 */
export function authRedirectUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${CANONICAL_SITE_URL}${normalizedPath}`;
}

/**
 * toCanonicalUrl
 * Resolves relative or absolute URLs to the canonical site host.
 */
export function toCanonicalUrl(input?: string): string | undefined {
  if (!input) return undefined;

  try {
    // Resolve relative and absolute inputs against canonical host.
    const parsed = new URL(input, CANONICAL_SITE_URL);
    return `${CANONICAL_SITE_URL}${parsed.pathname}${parsed.search}`;
  } catch {
    return undefined;
  }
}
