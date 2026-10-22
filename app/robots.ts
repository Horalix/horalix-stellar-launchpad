import type { MetadataRoute } from "next";

/**
 * Horalix wants to be found *and* cited. public/llms.txt is written for AI assistants,
 * so every major answer engine is allowed explicitly rather than left to fall through
 * the wildcard. The only blocked paths are the post-submission confirmations, which
 * carry no public content.
 */
const answerEngines = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
  "meta-externalagent",
  "Amazonbot",
  "DuckDuckBot",
  "YandexBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/thank-you/"] },
      ...answerEngines.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/thank-you/"] })),
    ],
    sitemap: "https://horalix.com/sitemap.xml",
    host: "https://horalix.com",
  };
}
