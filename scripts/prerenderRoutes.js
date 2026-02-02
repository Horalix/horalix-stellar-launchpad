import fs from "fs";
import path from "path";

const FALLBACK_ROUTES = [
  "/",
  "/news",
  "/news/demo-day",
  "/news/horalix-at-fls",
  "/news/the-beginning",
  "/solutions/cardiology-ai",
  "/solutions/pathology-ai",
  "/solutions/radiology-ai",
];

const loadDotEnv = () => {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

const normalizeRoute = (route) => {
  if (!route) {
    return "/";
  }
  const cleaned = route.trim();
  if (!cleaned) {
    return "/";
  }
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

const uniqRoutes = (routes) => {
  const seen = new Set();
  const output = [];
  routes.forEach((route) => {
    const normalized = normalizeRoute(route);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      output.push(normalized);
    }
  });
  return output;
};

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return { supabaseUrl, supabaseKey };
};

const fetchSlugs = async ({ supabaseUrl, supabaseKey, table, filter }) => {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set("select", "slug");
  if (filter) {
    filter.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key && value) {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${table} slugs: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => (item && typeof item.slug === "string" ? item.slug.trim() : ""))
    .filter(Boolean);
};

export const getPrerenderRoutes = async () => {
  loadDotEnv();

  const config = getSupabaseConfig();
  if (!config) {
    return uniqRoutes(FALLBACK_ROUTES);
  }

  try {
    const [newsSlugs, solutionSlugs] = await Promise.all([
      fetchSlugs({
        ...config,
        table: "news_articles",
        filter: "is_published=eq.true",
      }),
      fetchSlugs({
        ...config,
        table: "solutions",
        filter: "is_active=eq.true",
      }),
    ]);

    const routes = [
      "/",
      "/news",
      ...newsSlugs.map((slug) => `/news/${slug}`),
      ...solutionSlugs.map((slug) => `/solutions/${slug}`),
    ];

    return uniqRoutes(routes);
  } catch (error) {
    console.warn("[prerender] Falling back to default routes:", error);
    return uniqRoutes(FALLBACK_ROUTES);
  }
};

