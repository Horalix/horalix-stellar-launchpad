# Horalix website

Public website for Horalix, an echo-first, pilot-stage clinical AI company. The experience is built around a strict evidence boundary: product status, human oversight, limitations, and approved claims remain visible wherever clinical or commercial readers need them.

## Stack

- React 19 and the Next.js App Router API, compiled for Cloudflare by vinext
- Cloudflare Sites/Workers for hosting
- Cloudflare D1 for structured lead and anonymous event storage
- Drizzle schema definitions for D1
- Cloudflare Turnstile for server-verified form protection
- Resend for optional transactional lead notifications

Important content is server-rendered HTML. Motion, analytics, form expansion, and media playback are progressive enhancements; the site does not depend on a loading screen or client-side content gate.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Use these checks before release:

```bash
npm run lint
npm test
```

`npm run lint` includes the claim audit. It rejects restricted clinical language and numeric performance-style claims that are not explicitly approved. `npm test` builds the Cloudflare target and verifies priority-page HTML and legacy redirects.

## Content and claims

- `app/_data/claims.ts` is the public claim register.
- `app/_data/resources.ts` contains developer-managed research resources.
- `scripts/claims-audit.mjs` prevents unsupported performance language from entering normal page copy.
- `app/evidence/page.tsx` publishes the current evidence boundary, limitations, and selected external literature.

External research informs the product approach but is never presented as validation of Horalix. Add a product metric only after its source, version, method, conditions, owner, approval date, disclosure, and review date are documented.

## Brand and media

- `public/brand/horalix-mark-master.png` is the untouched supplied monogram master.
- Public light/dark logo variants preserve the exact monogram geometry.
- `assets/source/` holds production source artwork that should not ship as a public asset.
- `scripts/generate-og.ps1` creates the social card deterministically from the approved mark and background.
- Product media is click-to-play, silent by default, captioned, and labelled as synthetic visualization with no patient data.

Do not redraw, stretch, rotate, or generatively reinterpret the Horalix monogram.

## Environment

Copy `.env.example` and configure only the services needed in the target environment.

Public browser configuration:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_HOSPITAL_SCHEDULING_URL`
- `NEXT_PUBLIC_INVESTOR_SCHEDULING_URL`
- `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

Server-only configuration:

- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `HOSPITAL_NOTIFICATION_EMAIL`
- `INVESTOR_NOTIFICATION_EMAIL`

Never expose server-only values through a `NEXT_PUBLIC_` name.

## Lead handling

`POST /api/leads` accepts hospital-demo and investor-access enquiries only. It enforces same-origin requests, a 12 KB body limit, strict field limits, a honeypot, server-side Turnstile verification, hashed rolling rate limits, and rejection of obvious patient or clinical content. Raw IP addresses are not stored. Leads are deleted after 180 days.

The form is intentionally unavailable until D1 and Turnstile are configured. This prevents an apparently successful request from being lost.

## Search and analytics

- Route-level titles, descriptions, canonical URLs, and structured data live beside their pages.
- `app/robots.ts` allows Googlebot, Bingbot, and OAI-SearchBot while blocking GPTBot.
- `app/sitemap.ts` lists public pages and research resources.
- Funnel analytics store only an approved event name, page path, coarse referral source, and timestamp.
- Cloudflare Web Analytics is loaded only when its token is configured.
- Thank-you routes are `noindex, nofollow`.

## Deployment

`.openai/hosting.json` declares the Sites project and its D1 binding. Publish through the configured Sites workflow after `npm test` passes. Before a production-domain cutover, configure Turnstile, D1 migrations, notification destinations, scheduling URLs, Cloudflare Web Analytics, Search Console verification, and final clinical/legal approval.

Production cutover to `horalix.com` is deliberately separate from private staging publication.
