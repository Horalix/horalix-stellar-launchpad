import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { TechstarsTicker } from "@/components/home/TechstarsTicker";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { NewsPreviewSection } from "@/components/home/NewsPreviewSection";
import { TeamSection } from "@/components/home/TeamSection";
import { ContactSection } from "@/components/home/ContactSection";

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
      <TeamSection />
      <ContactSection />
    </MainLayout>
  );
};

export default Index;
