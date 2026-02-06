/**
 * Canonical host enforcement and auth redirect helpers
 * Ensures users always interact with https://horalix.com, never preview domains
 */

// Step 1: Define canonical production URL
export const CANONICAL_SITE_URL = "https://horalix.com";

// Step 2: Define blocked hosts that should redirect to canonical
const BLOCKED_PUBLIC_HOSTS = [
  "horalix-stellar-launchpad.lovable.app",
];
const BLOCKED_HOST_SUFFIXES = [".lovable.app"];

function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_PUBLIC_HOSTS.includes(hostname)) {
    return true;
  }

  return BLOCKED_HOST_SUFFIXES.some((suffix) =>
    hostname === suffix.slice(1) || hostname.endsWith(suffix)
  );
}

/**
 * enforceCanonicalHost
 * If the current hostname is in the blocked list, redirect to the canonical URL
 * Must be called before React renders to prevent flash of content
 */
export function enforceCanonicalHost(): void {
  if (typeof window === "undefined") return;

  const currentHost = window.location.hostname;

  if (isBlockedHost(currentHost)) {
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
