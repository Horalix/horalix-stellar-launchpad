import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";

// Wrap the application in a HelmetProvider to enable dynamic SEO tags
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
