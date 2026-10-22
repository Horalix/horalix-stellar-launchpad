import { getPublicRoutes } from "./routeData.js";

/**
 * Routes to prerender for SEO/GEO optimization.
 * Shares the same source as sitemap generation.
 */
export const getPrerenderRoutes = async () => getPublicRoutes();
