import { Helmet } from "react-helmet-async";
import type { FC, ReactNode } from "react";

/**
 * SEO component
 * Wraps page content with head metadata for search engines and social platforms.
 * Accepts optional structured data (jsonLd) which will be stringified and embedded.
 */
export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  /** The Open Graph type, defaults to `website` */
  type?: string;
  /** Arbitrary JSON‑LD object to embed in a script tag */
  jsonLd?: any;
  children?: ReactNode;
}

const SEO: FC<SEOProps> = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
  children,
}) => {
  // Fallback for canonical: if not provided, use current window location when running in the browser
  const canonicalUrl = canonical ?? (typeof window !== "undefined" ? window.location.href : undefined);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {/* Open Graph tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={type} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {image && <meta property="og:image" content={image} />}
        {/* Twitter tags */}
        <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={image} />}
        {/* Structured data */}
        {jsonLd && (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        )}
      </Helmet>
      {children}
    </>
  );
};

export default SEO;