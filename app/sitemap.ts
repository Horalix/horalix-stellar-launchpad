import type { MetadataRoute } from "next";
import { resources } from "./_data/resources";
import { newsItems } from "./_data/news";

// Bump when the shared page furniture changes; per-item dates come from the content itself.
const siteUpdated = new Date("2026-08-14");

/** Parses the human-readable review date on a resource ("13 August 2026") into a Date. */
function reviewedDate(reviewed: string) {
  const parsed = new Date(reviewed);
  return Number.isNaN(parsed.valueOf()) ? siteUpdated : parsed;
}

const priorities: Record<string, number> = {
  "": 1,
  "/platform": 0.9,
  "/for-hospitals": 0.9,
  "/evidence": 0.9,
  "/for-clinicians": 0.8,
  "/resources": 0.8,
  "/security": 0.75,
  "/investors": 0.75,
};

const routes = ["", "/platform", "/for-hospitals", "/for-clinicians", "/evidence", "/security", "/investors", "/product-tour", "/resources", "/news", "/about", "/press", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://horalix.com";
  const latestNews = newsItems.reduce((latest, item) => (item.published > latest ? item.published : latest), newsItems[0].published);
  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: route === "/news" ? new Date(latestNews) : siteUpdated,
      changeFrequency: route === "" || route === "/news" ? ("weekly" as const) : ("monthly" as const),
      priority: priorities[route] ?? 0.7,
    })),
    ...resources.map((resource) => ({
      url: `${base}/resources/${resource.slug}`,
      lastModified: reviewedDate(resource.reviewed),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...newsItems.map((item) => ({
      url: `${base}/news/${item.slug}`,
      lastModified: new Date(item.published),
      changeFrequency: "yearly" as const,
      priority: 0.78,
    })),
  ];
}
