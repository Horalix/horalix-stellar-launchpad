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
- `app/sitemap.ts` lists public pages, research resources, and glossary terms.
- `app/_data/glossary.ts` holds the glossary at `/glossary`: each term opens with a self-contained answer and cites its primary source. `public/llms.txt` and `public/llms-full.txt` list and define the same terms.
- `scripts/indexnow.mjs` (`npm run indexnow`) tells Bing and the other IndexNow engines to recrawl; its key is the 32-character `.txt` file in `public/`.
- Funnel analytics store only an approved event name, page path, coarse referral source, and timestamp.
- Cloudflare Web Analytics is loaded only when its token is configured.
- Thank-you routes are `noindex, nofollow`.

## Previous site archive

The previous horalix.com site (the Lovable/Vite app) lives in `legacy/` and is kept as a hidden archive under the `basePath` in `legacy/archive-routes.json`. Nothing links to it, nothing redirects into it, it is not in the sitemap, and every response there is `noindex, nofollow`. Its build output is committed under `public/`, so deploying the new site never has to build the old one.

`legacy/archive-routes.json` decides where every old URL goes:

- `redirects`: each URL the old site published redirects (308) to its closest page on the new site, so search rankings carry over. Old news with no equivalent falls through to `/news`.
- `appRoutes`: only `/unsubscribe`, because unsubscribe links in emails already sent must keep working. It redirects into the archive with its query string.

`worker/index.ts` applies those rules and serves the archive with the old site's own security policy and an app-shell fallback for client-side routes. `npm test` checks that every URL from the previous site's sitemap lands on a page of the new site, and that no public page mentions the archive path.

To rebuild the archive after changing `legacy/`, put the public Supabase URL and publishable key in `legacy/.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) and run `npm run legacy:build`.

## Deployment

The site runs on the `horalix-com` Cloudflare Worker (named in `vite.config.ts`) in the server@horalix.com Cloudflare account, which also holds the `horalix-production` D1 database. To release, run `npm test`, then `npx wrangler deploy --keep-vars` while logged in to that account, then `npm run indexnow`. The Worker's own address, `horalix-com.server-9de.workers.dev`, is noindex and is the place to check a deploy.

horalix.com reaches the Worker through Netlify:

1. horalix.com is registered at Namecheap, and its DNS runs in a different Cloudflare account, which forwards the domain to the `horalix` Netlify project.
2. The Netlify project builds this repository's `main`. `netlify.toml` publishes nothing of its own and proxies every request to the Worker with an `X-Horalix-Proxy: netlify` header.
3. `worker/index.ts` rebuilds those requests as `https://horalix.com` requests, so pages are indexable, the form and event APIs pass their same-origin check, and rate limiting sees the visitor's IP.

Changes to the site therefore go live with `wrangler deploy`; a push to `main` only redeploys the Netlify proxy. To drop the Netlify hop, the Worker has to live in the Cloudflare account that holds horalix.com's DNS, with routes for `horalix.com/*` and `www.horalix.com/*`; then disconnect Netlify and delete `netlify.toml`. That account also prepends Cloudflare's managed robots.txt and blocks GPTBot and ClaudeBot, which `app/robots.ts` allows.

A replacement zone for horalix.com is prepared, pending, in the kerim.sabic@gmail.com Cloudflare account. It mirrors the live records, with `horalix.com` and `www` as proxied CNAMEs to `horalix.netlify.app`, and allows AI crawlers. It activates when the nameservers at Namecheap change to `elias.ns.cloudflare.com` and `tara.ns.cloudflare.com`.

Before the forms are switched on, configure Turnstile, notification destinations and scheduling URLs; Cloudflare Web Analytics and Search Console verification are configured the same way (see Environment).
