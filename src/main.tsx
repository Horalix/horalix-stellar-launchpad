import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";
import { RouteErrorBoundary } from "./components/layout/RouteErrorBoundary";
import { enforceCanonicalHost } from "./lib/canonical";
import {
  isChunkLoadError,
  tryAutoReloadOnChunkError,
} from "./lib/lazyPage";
import "./index.css";

// Step 1: Redirect blocked hosts to canonical domain before rendering
enforceCanonicalHost();

// Step 2: Wrap the application in a HelmetProvider to enable dynamic SEO tags
const root = createRoot(document.getElementById("root")!);
root.render(
  <HelmetProvider>
    <RouteErrorBoundary>
      <App />
    </RouteErrorBoundary>
  </HelmetProvider>
);

// Step 3: Recover from a page file that vanished after a new deployment.
// React handles its own imports; this catches the ones that never reach a
// component, so a stale tab reloads instead of staying blank.
if (typeof window !== "undefined") {
  const recoverFromChunkError = (problem: unknown) => {
    if (isChunkLoadError(problem)) tryAutoReloadOnChunkError();
  };

  window.addEventListener("error", (event) =>
    recoverFromChunkError(event.error ?? event.message),
  );
  window.addEventListener("unhandledrejection", (event) =>
    recoverFromChunkError(event.reason),
  );

  const delay = (window as { __PRERENDER__?: boolean }).__PRERENDER__ ? 1500 : 0;
  window.setTimeout(() => {
    window.dispatchEvent(new Event("prerender-ready"));
  }, delay);
}
