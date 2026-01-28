import { forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import horalixLogo from "@/assets/horalix-logo.png";

/**
 * Footer - Site footer with links and branding
 */
export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  /**
   * Handle navigation click for hash links
   * Smooth scrolls to section if already on homepage
   */
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("/#") && location.pathname === "/") {
      e.preventDefault();
      const sectionId = href.substring(2);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer ref={ref} className="bg-primary text-primary-foreground border-t border-border relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="md:col-span-2">
            <img src={horalixLogo} alt="Horalix" className="h-10 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm text-primary-foreground/70 max-w-md leading-relaxed">
              We build AI‑powered software that helps clinicians make faster, more accurate diagnoses.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-accent">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/#solutions"
                  onClick={(e) => handleNavClick(e, "/#solutions")}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link
                  to="/#news"
                  onClick={(e) => handleNavClick(e, "/#news")}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  to="/#team"
                  onClick={(e) => handleNavClick(e, "/#team")}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  to="/#faq"
                  onClick={(e) => handleNavClick(e, "/#faq")}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/#contact"
                  onClick={(e) => handleNavClick(e, "/#contact")}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="font-mono text-xs">
                <a href="mailto:support@horalix.com?subject=Horalix%20Inquiry"
                  className="hover:text-primary-foreground underline underline-offset-4"
                >
                  support@horalix.com
                </a>
              </li>
              <li className="font-mono text-xs">
                <a
                  href="tel:+38762340020"
                  className="hover:text-primary-foreground underline underline-offset-4"
                >
                  +387 62 340 020
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50 font-mono">© {currentYear} Horalix. All rights reserved.</p>
          <p className="text-xs text-primary-foreground/50 font-mono">Clinical Intelligence // Medical Technology</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
