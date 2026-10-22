/**
 * URL rewriting shared by the archive build (scripts/build-archive.mjs) and the running
 * app (src/components/SEO.tsx). This site used to own the root of horalix.com; it is now
 * a hidden archive under ARCHIVE_BASE, while the new site owns the root.
 */
import archive from "./archive-routes.json" with { type: "json" };

export const ARCHIVE_BASE = archive.basePath;

const SITE_ORIGIN = "https://horalix.com";
const baseSegment = ARCHIVE_BASE.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Absolute horalix.com URLs that carry a path. The bare origin and its #entity ids
// (the organisation, the website) still describe horalix.com itself, so they stay.
const absolutePathPattern = new RegExp(`https://horalix\\.com/(?!${baseSegment}(?:/|\\b)|#|["'\\s<)\\\\])`, "g");

// Root-relative href/src/content attributes, skipping protocol-relative URLs and
// anything already under the archive.
const rootRelativeAttributePattern = new RegExp(`\\b(href|src|content|action)="/(?!/|${baseSegment}/)`, "g");

/** Points absolute horalix.com page and asset URLs at their place in the archive. */
export function rebaseAbsoluteUrls(text) {
  return text.replace(absolutePathPattern, `${SITE_ORIGIN}${ARCHIVE_BASE}/`);
}

/** Prefixes root-relative attribute values in an HTML document with the archive path. */
export function rebaseRootRelativeAttributes(html) {
  return html.replace(rootRelativeAttributePattern, `$1="${ARCHIVE_BASE}/`);
}
