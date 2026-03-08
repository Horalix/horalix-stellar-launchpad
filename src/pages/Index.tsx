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
} from "@/lib/structuredData";

/**
 * Index - Homepage for Horalix website
 * Combines all homepage sections in a modular structure
 */
const Index = () => {
  const title = "Horalix | AI-Powered Echocardiography Workflow";
  const description =
    "Horalix helps clinical teams move from manual echo measurement to AI-assisted reporting with faster turnaround and deeper structured outputs.";
  const canonical = "/";
  const jsonLd = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
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
      <ContactSection />
      <FAQSection />
    </MainLayout>
  );
};

export default Index;
