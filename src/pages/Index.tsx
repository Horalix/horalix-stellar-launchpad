import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { TechstarsTicker } from "@/components/home/TechstarsTicker";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { NewsPreviewSection } from "@/components/home/NewsPreviewSection";
import { LinkedInSection } from "@/components/home/LinkedInSection";
import { TeamSection } from "@/components/home/TeamSection";
import { ContactSection } from "@/components/home/ContactSection";
import { FAQSection } from "@/components/home/FAQSection";

/**
 * Index - Homepage for Horalix website
 * Combines all homepage sections in a modular structure
 */
const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
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
