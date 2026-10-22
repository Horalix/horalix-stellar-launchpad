import { env } from "cloudflare:workers";

const events = new Set(["demo_start", "demo_submission", "investor_start", "investor_submission", "scheduling_click", "video_play", "evidence_view"]);
const sources = new Set(["direct", "google", "bing", "chatgpt", "linkedin", "other"]);

export async function POST(request: Request) {
  const origin = request.headers.get("Origin");
  try {
    if (origin && new URL(origin).origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  } catch { return new Response(null, { status: 403 }); }
  let body: { event?: string; path?: string; source?: string };
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  if (!body.event || !events.has(body.event) || !body.path || body.path.length > 180 || !body.source || !sources.has(body.source)) return new Response(null, { status: 400 });
  const runtime = env as unknown as { DB?: D1Database };
  if (!runtime.DB) return new Response(null, { status: 204 });
  const now = Date.now();
  // Analytics must never break a page. A failed write is logged and swallowed.
  try {
    await runtime.DB.prepare("INSERT INTO anonymous_events (id, event, path, source, created_at) VALUES (?, ?, ?, ?, ?)").bind(crypto.randomUUID(), body.event, body.path, body.source, now).run();
    await runtime.DB.prepare("DELETE FROM anonymous_events WHERE created_at < ?").bind(now - 400 * 24 * 60 * 60 * 1000).run();
  } catch (cause) {
    console.error("events: write failed", cause);
  }
  return new Response(null, { status: 204 });
}
