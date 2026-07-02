import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { TimeToValueComparisonSection } from "@/components/sections/TimeToValueComparisonSection";
import { TechstarsTicker } from "@/components/home/TechstarsTicker";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { NewsPreviewSection } from "@/components/home/NewsPreviewSection";
import { LinkedInSection } from "@/components/home/LinkedInSection";
import { TeamSection } from "@/components/home/TeamSection";
import { ContactSection } from "@/components/home/ContactSection";
import { FAQSection } from "@/components/home/FAQSection";
import SEO from "@/components/SEO";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildBreadcrumbJsonLd,
  buildSpeakableJsonLd,
} from "@/lib/structuredData";
import { CANONICAL_SITE_URL } from "@/lib/canonical";

/**
 * Index - Homepage for Horalix website
 * Combines all homepage sections in a modular structure
 */
const Index = () => {
  const title = "Horalix | AI-Powered Echocardiography Workflow";
  const description =
    "Horalix — Sarajevo-based medical AI automating echocardiography analysis: structured measurements from cardiac ultrasound for faster clinician review.";
  const canonical = "/";
  const jsonLd = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
    // [AEO] Parity with the prerendered static homepage (generate-static-pages.mjs)
    buildSpeakableJsonLd(`${CANONICAL_SITE_URL}/`, ["h1", "h2", "[data-speakable]"]),
  ];

  return (
    <MainLayout>
      <SEO title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <HeroSection />
      <TimeToValueComparisonSection />
      <TechstarsTicker />
      <SolutionsSection />
      <NewsPreviewSection />
      <LinkedInSection />
      <TeamSection />
      {/* FAQ before the contact form: answer objections at peak motivation, then ask */}
      <FAQSection />
      <ContactSection />
    </MainLayout>
  );
};

export default Index;
