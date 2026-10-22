import type { Metadata } from "next";
import ogPages from "../../assets/source/og-pages.json";

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}`;
  index?: boolean;
};

// Cards are pre-rendered by scripts/generate-og.ps1 from the same file, so a route either
// has its own card here or falls back to the site-wide one. Nothing can point at a missing image.
const ogByPath = new Map(ogPages.map((page) => [page.path, `/og/${page.file}.jpg`]));

export function pageMetadata({ title, description, path, index = true }: PageMetadataInput): Metadata {
  const url = `https://horalix.com${path}`;
  const image = ogByPath.get(path) ?? "/og.jpg";
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "Horalix",
      locale: "en_GB",
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — Horalix` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
