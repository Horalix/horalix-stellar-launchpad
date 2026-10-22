import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";
import { Analytics } from "./_components/Analytics";
import { MotionLayer } from "./_components/MotionLayer";
import { CursorEcho } from "./_components/CursorEcho";
import { HashNavigation } from "./_components/HashNavigation";
import { SiteFooter, SiteHeader } from "./_components/SiteChrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://horalix.com"),
  title: { default: "Horalix — AI-assisted echocardiography workflow", template: "%s | Horalix" },
  description: "Horalix is a Sarajevo medical-AI startup building an AI-assisted echocardiography workflow for structured measurements, report-ready outputs, and clinician review.",
  applicationName: "Horalix",
  alternates: { canonical: "/" },
  // Square icons only: Google's favicon crawler rejects non-square marks, and Apple
  // touch icons must be 180x180. Regenerate with scripts/generate-icons.ps1.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/brand/horalix-icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/horalix-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/brand/horalix-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/brand/horalix-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", siteName: "Horalix", locale: "en_GB", title: "Make every echo ready for review.", description: "AI-assisted echocardiography workflow, built around clinician review.", url: "https://horalix.com", images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Horalix — Make every echo ready for review" }] },
  twitter: { card: "summary_large_image", title: "Make every echo ready for review.", description: "AI-assisted echocardiography workflow, built around clinician review.", images: ["/og.jpg"] },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

const organizationGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["MedicalOrganization", "Organization"],
      "@id": "https://horalix.com/#organization",
      name: "Horalix",
      alternateName: "Horalix d.o.o.",
      url: "https://horalix.com",
      foundingDate: "2024",
      foundingLocation: { "@type": "Place", name: "Sarajevo, Bosnia and Herzegovina" },
      address: { "@type": "PostalAddress", addressLocality: "Sarajevo", addressRegion: "Federation of Bosnia and Herzegovina", addressCountry: "BA" },
      logo: { "@type": "ImageObject", url: "https://horalix.com/brand/horalix-icon-512.png", width: 512, height: 512 },
      image: "https://horalix.com/og.jpg",
      description: "Sarajevo medical-AI startup developing an AI-assisted echocardiography workflow built around clinician review.",
      email: "support@horalix.com",
      telephone: "+387 62 340 020",
      numberOfEmployees: { "@type": "QuantitativeValue", minValue: 2, maxValue: 10 },
      medicalSpecialty: "https://schema.org/Cardiovascular",
      areaServed: { "@type": "Place", name: "Europe" },
      knowsAbout: ["Artificial intelligence in echocardiography", "DICOM echocardiography workflow", "Structured echocardiography reporting", "Clinical AI human oversight", "Clinical AI evidence governance"],
      founder: [
        { "@id": "https://horalix.com/about#kerim-sabic" },
        { "@id": "https://horalix.com/about#amr-husain" },
        { "@id": "https://horalix.com/about#affan-kapidzic" },
        { "@id": "https://horalix.com/about#neuman-alkhalil" },
      ],
      sameAs: [
        "https://www.linkedin.com/company/horalix/",
        "https://www.techstars.com/blog/program-news/techstars-launches-first-startup-community-partnership-founder-catalyst",
        "https://www.nvidia.com/en-us/startups/",
        "https://www.klix.ba/biznis/startupi/dva-bh-startupa-primljena-u-prestizni-nvidia-program-za-umjetnu-inteligenciju/260716029",
        "https://profitiraj.ba/horalix-i-roboticks-u-naprestiznijem-ai-programu-na-svijetu/",
      ],
      memberOf: [
        { "@type": "Organization", name: "NVIDIA Inception", url: "https://www.nvidia.com/en-us/startups/" },
        { "@type": "Organization", name: "Techstars Sarajevo Founder Catalyst", url: "https://www.techstars.com/" },
      ],
    },
    { "@type": "WebSite", "@id": "https://horalix.com/#website", url: "https://horalix.com", name: "Horalix", publisher: { "@id": "https://horalix.com/#organization" }, inLanguage: "en" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cloudflareAnalyticsToken = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
  return (
    <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><SiteHeader /><main id="main">{children}</main><SiteFooter /><Analytics /><MotionLayer /><CursorEcho /><HashNavigation /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationGraph) }} />{cloudflareAnalyticsToken && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken, spa: true })} />}</body></html>
  );
}
