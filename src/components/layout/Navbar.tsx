import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSection } from "@/hooks/useActiveSection";
import horalixLogo from "@/assets/horalix-logo.png";

/**
 * Navbar - Main navigation component
 * Includes logo, navigation links, mobile menu, and active section highlighting
 */

// Navigation items configuration
const NAV_ITEMS = [
  { label: "Solutions", href: "/#solutions", sectionId: "solutions" },
  { label: "News", href: "/news", sectionId: null },
  { label: "Team", href: "/#team", sectionId: "team" },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const activeSection = useActiveSection();

  /**
   * Determine if a nav item should show as active
   */
  const getIsActive = (item: typeof NAV_ITEMS[number]): boolean => {
    // Handle /news route
    if (item.href === "/news") {
      return location.pathname === "/news" || location.pathname.startsWith("/news/");
    }
    
    // Handle hash links - only when on homepage
    if (item.sectionId && location.pathname === "/") {
      return activeSection === item.sectionId;
    }
    
    return false;
  };

  // Handle smooth scroll for hash links on homepage
  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    
    if (href.startsWith("/#")) {
      const sectionId = href.substring(2);
      
      // If already on homepage, scroll to section
      if (location.pathname === "/") {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
      // Otherwise let the Link handle navigation
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-stretch h-16 md:h-20">
          {/* Logo section */}
          <Link 
            to="/" 
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-3 pr-6 hover:opacity-80 transition-opacity"
          >
            <img 
              src={horalixLogo} 
              alt="Horalix" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8 px-8">
            {NAV_ITEMS.map((item) => {
              const isActive = getIsActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors relative group ${
                    isActive ? "text-accent" : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  {item.label}
                  <span 
                    className={`absolute -bottom-7 left-0 w-full h-0.5 bg-accent transition-transform ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`} 
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right section - status and CTA */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* System status indicator (desktop only) */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Sys_Status
              </span>
              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Admin login button */}
            <Link to="/admin/login">
              <Button 
                variant="default"
                className="hidden sm:flex text-xs font-bold uppercase tracking-widest"
              >
                Portal Login
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-card border-t border-border animate-fade-in-up">
            <div className="flex flex-col py-4">
              {NAV_ITEMS.map((item) => {
                const isActive = getIsActive(item);
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                      isActive 
                        ? "text-accent bg-secondary border-l-2 border-accent" 
                        : "text-muted-foreground hover:text-accent hover:bg-secondary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 mt-4"
              >
                <Button className="w-full text-xs font-bold uppercase tracking-widest">
                  Portal Login
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
