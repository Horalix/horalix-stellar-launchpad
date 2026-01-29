import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createRequire } from "node:module";
import { getPrerenderRoutes } from "./scripts/prerenderRoutes";

const require = createRequire(import.meta.url);
const vitePrerender = require("vite-plugin-prerender");

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const routes = await getPrerenderRoutes(env);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      vitePrerender({
        staticDir: path.join(__dirname, "dist"),
        routes,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
