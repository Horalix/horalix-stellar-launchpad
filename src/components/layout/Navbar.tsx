import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileDropdown } from "@/components/layout/UserProfileDropdown";
import { cn } from "@/lib/utils";
import horalixLogo from "@/assets/horalix-logo.png";

const NAV_ITEMS = [
  { label: "Time to Value", href: "/#time-to-value", sectionId: "time-to-value" },
  { label: "Solutions", href: "/#solutions", sectionId: "solutions" },
  { label: "News", href: "/#news", sectionId: "news" },
  { label: "Team", href: "/#team", sectionId: "team" },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
] as const;

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const activeSection = useActiveSection();
  const { user, isLoading } = useAuth();

  const getIsActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (location.pathname !== "/") {
      return false;
    }

    return location.hash === `#${item.sectionId}` || activeSection === item.sectionId;
  };

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith("/#") && location.pathname === "/") {
      const sectionId = href.substring(2);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed left-0 top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-stretch justify-between md:h-20">
          <Link
            to="/"
            onClick={(event) => {
              if (location.pathname === "/") {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-3 pr-6 transition-opacity hover:opacity-80"
          >
            <img src={horalixLogo} alt="Horalix" className="h-8 w-auto md:h-10" />
          </Link>

          <nav className="hidden items-center gap-8 px-8 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = getIsActive(item);

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "group relative text-xs font-bold uppercase tracking-widest transition-colors",
                    isActive ? "text-accent" : "text-muted-foreground hover:text-accent",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-7 left-0 h-0.5 w-full bg-accent transition-transform",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            {!isLoading &&
              (user ? (
                <UserProfileDropdown />
              ) : (
                <Link to="/login">
                  <Button variant="default" className="hidden text-xs font-bold uppercase tracking-widest sm:flex">
                    Login
                  </Button>
                </Link>
              ))}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 transition-colors hover:bg-secondary md:hidden"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="animate-fade-in-up border-t border-border bg-card md:hidden">
            <div className="flex flex-col py-4">
              {NAV_ITEMS.map((item) => {
                const isActive = getIsActive(item);

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors",
                      isActive
                        ? "border-l-2 border-accent bg-secondary text-accent"
                        : "text-muted-foreground hover:bg-secondary hover:text-accent",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {!user && (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="mx-4 mt-4">
                  <Button className="w-full text-xs font-bold uppercase tracking-widest">Login</Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
