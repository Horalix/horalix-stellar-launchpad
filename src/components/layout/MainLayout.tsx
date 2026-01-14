import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundPattern } from "@/components/layout/BackgroundPattern";

/**
 * MainLayout - Primary layout wrapper for public pages
 * Includes navigation, footer, and background styling
 */
interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();

  /**
   * Handle scroll behavior on navigation
   * - With hash: scroll to target section (smooth)
   * - Without hash: scroll to top (instant)
   */
  useEffect(() => {
    if (location.hash) {
      // Hash navigation: scroll to section (only on homepage)
      if (location.pathname === "/") {
        const sectionId = location.hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } else {
      // No hash: scroll to top of page
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-accent-foreground flex flex-col relative">
      {/* Background pattern overlay */}
      <BackgroundPattern />
      
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-accent via-accent/70 to-accent w-full z-50 fixed top-0 left-0" />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main content */}
      <main className="flex-1 pt-[68px] md:pt-[84px]">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
