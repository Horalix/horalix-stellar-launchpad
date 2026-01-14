import { useState, useEffect } from "react";

/**
 * useActiveSection - Custom hook for scroll spy functionality
 * Tracks which section is currently visible in the viewport
 * Returns null when at the top of page (hero section)
 */

const SECTION_IDS = ["solutions", "news-preview", "team", "contact"] as const;
type SectionId = typeof SECTION_IDS[number];

export const useActiveSection = (): SectionId | null => {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  useEffect(() => {
    // Check if we're at the top of the page (hero section)
    const checkIfAtTop = () => {
      if (window.scrollY < 100) {
        setActiveSection(null);
        return true;
      }
      return false;
    };

    // Create intersection observer
    const observerOptions: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: "-20% 0px -70% 0px", // Trigger when section is in upper-middle of screen
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // First check if at top
      if (checkIfAtTop()) return;

      // Find the first intersecting section
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id as SectionId;
          if (SECTION_IDS.includes(sectionId)) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Also listen to scroll for top detection
    const handleScroll = () => {
      checkIfAtTop();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    checkIfAtTop();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return activeSection;
};
