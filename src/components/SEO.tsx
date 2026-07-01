import { Helmet } from "react-helmet-async";
import type { FC, ReactNode } from "react";
import { toCanonicalUrl } from "@/lib/canonical";

/**
 * SEO component
 * Wraps page content with metadata for search engines and social platforms.
 */
export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  /** The Open Graph type, defaults to `website` */
  type?: string;
  /** Arbitrary JSON-LD object(s) to embed in script tags */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Convenience flag for noindex,nofollow */
  noindex?: boolean;
  /** Explicit robots directive override */
  robots?: string;
  children?: ReactNode;
}

// [SEO] Default OG image — designed 1200×630 share card (regenerate via
// scripts/generate-og-image.mjs when the design or entity facts change)
const DEFAULT_OG_IMAGE = "https://horalix.com/assets/og/horalix-og.png";

const SEO: FC<SEOProps> = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
  noindex = false,
  robots,
  children,
}) => {
  // Always resolve canonicals to the canonical domain.
  const canonicalInput = canonical ?? (typeof window !== "undefined" ? window.location.href : undefined);
  const canonicalUrl = canonicalInput ? toCanonicalUrl(canonicalInput) : undefined;
  const robotsContent =
    robots ??
    (noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  // [SEO] Always provide og:image — the default is a designed 1200×630 card,
  // so every page qualifies for the large share preview
  const resolvedImage = image ?? DEFAULT_OG_IMAGE;
  const twitterCard = "summary_large_image";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={robotsContent} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        {/* [SEO] og:site_name ensures social cards always show the brand */}
        <meta property="og:site_name" content="Horalix" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={type} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:image" content={resolvedImage} />

        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={resolvedImage} />

        {jsonLdArray.map((entry, index) => (
          <script key={`json-ld-${index}`} type="application/ld+json">
            {JSON.stringify(entry)}
          </script>
        ))}
      </Helmet>
      {children}
    </>
  );
};

export default SEO;
