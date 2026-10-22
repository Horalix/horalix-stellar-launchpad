import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Horalix — AI-assisted echocardiography workflow",
    short_name: "Horalix",
    description: "AI-assisted echocardiography workflow for structured measurements, report-ready outputs, and clinician review.",
    start_url: "/",
    display: "standalone",
    background_color: "#07141d",
    theme_color: "#07141d",
    lang: "en",
    icons: [
      { src: "/brand/horalix-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/horalix-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
