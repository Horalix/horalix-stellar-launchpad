import { env } from "cloudflare:workers";

type RuntimeEnv = {
  DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  HOSPITAL_NOTIFICATION_EMAIL?: string;
  INVESTOR_NOTIFICATION_EMAIL?: string;
};

const limits = { name: 80, workEmail: 120, organization: 120, role: 80, country: 80, message: 800, sourcePath: 180, consentVersion: 40, utm: 80 };
const phiPattern = /\b(patient|medical\s+record|mrn|date\s+of\s+birth|\bdob\b|diagnos(?:is|ed)|symptoms?|treatment|prescription)\b/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function json(body: unknown, status: number) { return Response.json(body, { status, headers: { "Cache-Control": "no-store" } }); }

async function hashRateKey(value: string, windowStart: number) {
  const bytes = new TextEncoder().encode(`${value}:${windowStart}`);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const origin = request.headers.get("Origin");
  try {
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) return json({ error: "Invalid request origin." }, 403);
  } catch { return json({ error: "Invalid request origin." }, 403); }
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 12_000) return json({ error: "Request is too large." }, 413);
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch { return json({ error: "Invalid request." }, 400); }

  const intent = body.intent === "hospital_demo" || body.intent === "investor_access" ? body.intent : null;
  const name = clean(body.name, limits.name); const workEmail = clean(body.workEmail, limits.workEmail).toLowerCase();
  const organization = clean(body.organization, limits.organization); const role = clean(body.role, limits.role); const country = clean(body.country, limits.country);
  const message = clean(body.message, limits.message); const consentVersion = clean(body.consentVersion, limits.consentVersion); const sourcePath = clean(body.sourcePath, limits.sourcePath);
  const honeypot = clean(body.website, 120); const turnstileToken = clean(body.turnstileToken, 2048);
  if (honeypot) return json({ ok: true }, 201);
  if (!intent || !name || !emailPattern.test(workEmail) || !organization || !role || !country || !consentVersion || body.consent !== "yes") return json({ error: "Please complete every required field." }, 400);
  if (message && phiPattern.test(message)) return json({ error: "Please remove patient or clinical information. This form accepts business enquiries only." }, 400);

  const runtime = env as unknown as RuntimeEnv;
  if (!runtime.DB) return json({ error: "Secure form storage is not configured yet." }, 503);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now(); const windowStart = Math.floor(now / 900_000) * 900_000; const rateKey = await hashRateKey(ip, windowStart);

  // Any D1 failure — most commonly an unmigrated database — used to escape as an unhandled
  // rejection and return a bare 500 with no body. Surface it as a real error instead, so the
  // cause is visible in logs rather than presenting as a generic client-side failure.
  let rate: { count: number } | null;
  try {
    rate = await runtime.DB.prepare("INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count").bind(rateKey, windowStart).first<{ count: number }>();
  } catch (cause) {
    console.error("leads: rate-limit write failed", cause);
    return json({ error: "The secure request service is temporarily unavailable. Please email support@horalix.com." }, 503);
  }
  if ((rate?.count || 1) > 5) return json({ error: "Too many requests. Please try again later." }, 429);

  if (runtime.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) return json({ error: "Please complete the security verification." }, 400);
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ secret: runtime.TURNSTILE_SECRET_KEY, response: turnstileToken, remoteip: ip }) }).then((response) => response.json() as Promise<{ success?: boolean }>).catch(() => null);
    if (!verification) return json({ error: "Security verification is temporarily unavailable. Please try again." }, 503);
    if (!verification.success) return json({ error: "Security verification failed. Please try again." }, 400);
  }

  const id = crypto.randomUUID();
  try {
    await runtime.DB.prepare("DELETE FROM leads WHERE created_at < ?").bind(now - 180 * 24 * 60 * 60 * 1000).run();
    await runtime.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(now - 24 * 60 * 60 * 1000).run();
    await runtime.DB.prepare("INSERT INTO leads (id, intent, name, work_email, organization, role, country, message, consent_version, source_path, utm_source, utm_medium, utm_campaign, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, intent, name, workEmail, organization, role, country, message || null, consentVersion, sourcePath, clean(body.utm_source, limits.utm) || null, clean(body.utm_medium, limits.utm) || null, clean(body.utm_campaign, limits.utm) || null, now).run();
  } catch (cause) {
    // Never drop an enquiry silently: log the full lead so it can be recovered from logs.
    console.error("leads: write failed", { id, intent, workEmail, organization }, cause);
    return json({ error: "We could not store your request. Please email support@horalix.com and we will pick it up directly." }, 503);
  }

  const target = intent === "hospital_demo" ? runtime.HOSPITAL_NOTIFICATION_EMAIL : runtime.INVESTOR_NOTIFICATION_EMAIL;
  if (runtime.RESEND_API_KEY && runtime.RESEND_FROM_EMAIL && target) {
    const subjectOrganization = organization.replace(/[\r\n]+/g, " ");
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${runtime.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: runtime.RESEND_FROM_EMAIL, to: [target], subject: intent === "hospital_demo" ? `Hospital demo request — ${subjectOrganization}` : `Investor access request — ${subjectOrganization}`, text: `Name: ${name}\nWork email: ${workEmail}\nOrganization: ${organization}\nRole: ${role}\nCountry: ${country}\nMessage: ${message || "—"}\nSource: ${sourcePath}\nLead ID: ${id}` }) }).catch(() => undefined);
  }
  return json({ ok: true, id }, 201);
}
