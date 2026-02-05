/**
 * Routes to prerender for SEO/GEO optimization
 * These routes will have static HTML generated at build time
 */

export const getPrerenderRoutes = async () => {
  return [
    "/",
    "/news",
    "/news/horalix-at-fls",
    "/news/demo-day",
    "/news/the-beginning",
    "/solutions/cardiology-ai",
    "/solutions/pathology-ai",
    "/solutions/radiology-ai",
    "/terms",
  ];
};
