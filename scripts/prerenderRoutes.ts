type PrerenderEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const DEFAULT_ROUTES = ["/", "/news"];

const getEnvValue = (env: PrerenderEnv, key: keyof PrerenderEnv) =>
  env[key] || process.env[key];

const getSupabaseConfig = (env: PrerenderEnv) => {
  const url =
    getEnvValue(env, "SUPABASE_URL") || getEnvValue(env, "VITE_SUPABASE_URL");
  const key =
    getEnvValue(env, "SUPABASE_SERVICE_ROLE_KEY") ||
    getEnvValue(env, "SUPABASE_ANON_KEY") ||
    getEnvValue(env, "VITE_SUPABASE_PUBLISHABLE_KEY");

  return {
    url: url?.replace(/\/$/, ""),
    key,
  };
};

const fetchSlugs = async (endpoint: string, key: string, label: string) => {
  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${label} slugs (${response.status} ${response.statusText})`
    );
  }

  const data = (await response.json()) as Array<{ slug?: string | null }>;
  return data.map((item) => item.slug).filter(Boolean) as string[];
};

export const getPrerenderRoutes = async (
  env: PrerenderEnv = {}
): Promise<string[]> => {
  const { url, key } = getSupabaseConfig(env);

  if (!url || !key) {
    console.warn(
      "[prerender] Missing Supabase env vars, falling back to static routes only."
    );
    return DEFAULT_ROUTES;
  }

  const baseUrl = `${url}/rest/v1`;
  const newsUrl = `${baseUrl}/news_articles?select=slug&is_published=eq.true`;
  const solutionsUrl = `${baseUrl}/solutions?select=slug&is_active=eq.true`;

  try {
    const [newsSlugs, solutionSlugs] = await Promise.all([
      fetchSlugs(newsUrl, key, "news"),
      fetchSlugs(solutionsUrl, key, "solutions"),
    ]);

    const routes = [
      "/",
      "/news",
      ...newsSlugs.map((slug) => `/news/${slug}`),
      ...solutionSlugs.map((slug) => `/solutions/${slug}`),
    ];

    return Array.from(new Set(routes));
  } catch (error) {
    console.warn("[prerender] Failed to fetch dynamic routes:", error);
    return DEFAULT_ROUTES;
  }
};
