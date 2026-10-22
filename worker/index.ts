/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import legacyArchive from "../legacy/archive-routes.json";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

// The previous site is kept as a hidden archive under legacyBase, built from legacy/.
// Its published URLs redirect to their equivalents on this site, never into the archive.
const legacyBase = legacyArchive.basePath;
const legacyRedirects: Record<string, string> = legacyArchive.redirects;

// The archive still talks to its Supabase project and Google Analytics, so it keeps the
// policy it shipped with on Netlify rather than the new site's stricter one.
const legacySecurityHeaders: Record<string, string> = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' data: https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://horalix.com https://*.supabase.co; connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com; frame-src https://www.linkedin.com; frame-ancestors 'none';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/** Appends the request's query string to a redirect target, keeping any #fragment last. */
function withSearch(target: string, search: string) {
  const hashIndex = target.indexOf("#");
  return hashIndex < 0 ? `${target}${search}` : `${target.slice(0, hashIndex)}${search}${target.slice(hashIndex)}`;
}

/** Where a URL from the previous site lives now, if it is one. */
function legacyTarget(path: string): string | undefined {
  if (legacyRedirects[path]) return legacyRedirects[path];
  // Unsubscribe links in emails the old site already sent must keep working.
  if (legacyArchive.appRoutes.some((route) => path === route || path.startsWith(`${route}/`))) return `${legacyBase}${path}`;
  // Old share-card images and logos were served from /assets/; the new site has no such directory.
  if (path.startsWith("/assets/")) return `${legacyBase}${path}`;
  return undefined;
}

async function serveLegacy(request: Request, env: Env, url: URL): Promise<Response> {
  let response = await env.ASSETS.fetch(request);
  // The archive is a client-routed app: a path that is not a built file (admin, account
  // pages, unknown URLs) gets the app shell.
  const isAppShell = response.status === 404 && !/\.[a-z0-9]+$/i.test(url.pathname);
  if (isAppShell) response = await env.ASSETS.fetch(new Request(new URL(`${legacyBase}/`, url), request));

  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(legacySecurityHeaders)) headers.set(name, value);
  // Nothing in the archive is ever indexed, pages and files alike.
  headers.set("X-Robots-Tag", "noindex, nofollow");
  if (response.ok && url.pathname.startsWith(`${legacyBase}/assets/`)) headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === legacyBase || url.pathname.startsWith(`${legacyBase}/`)) return serveLegacy(request, env, url);

    const publishedNews = new Set([
      "/news/maribor-hospital-pilot-ai-echocardiography-workflow",
      "/news/clinic-validation-in-sarajevo-poliklinika-dr-nabil",
      "/news/horalix-nvidia-inception",
      "/news/techstars-sarajevo-founder-catalyst",
    ]);
    const normalizedPath = url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : url.pathname;
    const legacy = legacyTarget(normalizedPath);
    const redirect = (legacy ? withSearch(legacy, url.search) : undefined)
      ?? (url.pathname.startsWith("/team/") ? "/about#team" : undefined)
      ?? (url.pathname.startsWith("/news/") && !publishedNews.has(normalizedPath) ? "/news" : undefined);
    if (redirect) return new Response(null, { status: 308, headers: { Location: redirect, "Cache-Control": "public, max-age=86400" } });

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
    headers.set("X-DNS-Prefetch-Control", "off");

    // Pages carry no per-user state, so the edge may serve them immediately while it
    // revalidates in the background. Without this every HTML request is a full origin
    // round trip, which is the largest avoidable component of LCP on repeat visits.
    if (!headers.has("Cache-Control")) {
      const contentType = headers.get("Content-Type") ?? "";
      if (contentType.includes("text/html")) {
        headers.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
      } else if (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml" || url.pathname.endsWith(".txt") || url.pathname === "/manifest.webmanifest") {
        headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
      }
    }

    // Preview deploys answer on *.workers.dev while every canonical still points at
    // horalix.com. Left crawlable, a preview competes with the real domain for the same
    // queries, so it is refused indexing at the edge rather than relying on canonicals.
    if (url.hostname.endsWith(".workers.dev")) {
      headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
      headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; font-src 'self' data:; upgrade-insecure-requests");
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};

export default worker;
