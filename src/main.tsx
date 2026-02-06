import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";
import { enforceCanonicalHost } from "./lib/canonical";
import "./index.css";

// Step 1: Redirect blocked hosts to canonical domain before rendering
enforceCanonicalHost();

// Step 2: Wrap the application in a HelmetProvider to enable dynamic SEO tags
const root = createRoot(document.getElementById("root")!);
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

if (typeof window !== "undefined") {
  const delay = (window as { __PRERENDER__?: boolean }).__PRERENDER__ ? 1500 : 0;
  window.setTimeout(() => {
    window.dispatchEvent(new Event("prerender-ready"));
  }, delay);
}
