import type { Metadata } from "next";
import ogPages from "../../assets/source/og-pages.json";

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}`;
  index?: boolean;
  /** A card for routes without their own entry in og-pages.json, e.g. a section's shared card. */
  image?: `/${string}`;
};

// Cards are pre-rendered by scripts/generate-og.ps1 from the same file, so a route either
// has its own card here or falls back to the site-wide one. Nothing can point at a missing image.
const ogByPath = new Map(ogPages.map((page) => [page.path, `/og/${page.file}.jpg`]));

const titleSuffix = " | Horalix";

/** Keeps the brand suffix only while the whole title fits a results page (about 60 characters). */
export function fittedTitle(title: string): NonNullable<Metadata["title"]> {
  return title.length + titleSuffix.length <= 60 ? title : { absolute: title };
}

/** Trims text to search-snippet length, ending on a sentence where possible, otherwise on a word. */
export function snippet(text: string, max = 158): string {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > max) break;
    out += sentence;
  }
  // A lone short sentence makes a thin snippet; a word-boundary cut keeps more of the answer.
  if (out.trim().length >= 100) return out.trim();
  return `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`;
}

export function pageMetadata({ title, description, path, index = true, image: fallbackImage }: PageMetadataInput): Metadata {
  const url = `https://horalix.com${path}`;
  const image = ogByPath.get(path) ?? fallbackImage ?? "/og.jpg";
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
