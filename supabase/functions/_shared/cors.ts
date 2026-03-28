/** Shared CORS and origin-validation helpers for Supabase Edge Functions */

const ALLOWED_ORIGINS = [
  "https://horalix.com",
  "https://www.horalix.com",
];

/** Build CORS response headers scoped to allowed origins. */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-admin-setup-key",
    "Vary": "Origin",
  };
}

/**
 * Returns a 403 Response if the request Origin is not in the allowlist.
 * Call at the top of every handler (after the OPTIONS check).
 * Returns null when the origin is valid.
 */
export function rejectUnknownOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin") ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) return null;

  return new Response(
    JSON.stringify({ error: "Forbidden: origin not allowed" }),
    {
      status: 403,
      headers: {
        ...getCorsHeaders(request),
        "Content-Type": "application/json",
      },
    },
  );
}
