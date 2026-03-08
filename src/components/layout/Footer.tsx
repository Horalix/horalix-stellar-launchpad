import { forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";

import horalixLogo from "@/assets/horalix-logo.png";

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const handleNavClick = (event: React.MouseEvent, href: string) => {
    if (href.startsWith("/#") && location.pathname === "/") {
      event.preventDefault();
      const sectionId = href.substring(2);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer ref={ref} className="relative z-10 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <img src={horalixLogo} alt="Horalix" className="mb-4 h-10 w-auto brightness-0 invert" />
            <p className="max-w-md text-sm leading-relaxed text-primary-foreground/70">
              Horalix builds clinical AI workflow software that helps care teams move from manual
              measurement toward faster, more structured reporting operations.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  About
                </Link>
              </li>
              <li>
                <Link to="/evidence" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  Evidence
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  News
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/solutions" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  Resources
                </Link>
              </li>
              {/* [SEO] Link to full team listing on About page, not a single profile */}
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  Team
                </Link>
              </li>
              <li>
                <Link
                  to="/#time-to-value"
                  onClick={(event) => handleNavClick(event, "/#time-to-value")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  Time to Value
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="font-mono text-xs">
                <a
                  href="mailto:support@horalix.com?subject=Horalix%20Inquiry"
                  className="underline underline-offset-4 hover:text-primary-foreground"
                >
                  support@horalix.com
                </a>
              </li>
              <li className="font-mono text-xs">
                <a href="tel:+38762340020" className="underline underline-offset-4 hover:text-primary-foreground">
                  +387 62 340 020
                </a>
              </li>
              <li>
                <Link
                  to="/#contact"
                  onClick={(event) => handleNavClick(event, "/#contact")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  Book a Demo
                </Link>
              </li>
              {/* [SEO][GEO] LinkedIn social link — crawlable social proof signal */}
              <li>
                <a
                  href="https://www.linkedin.com/company/horalix/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <p className="text-xs font-mono text-primary-foreground/50">(c) {currentYear} Horalix. All rights reserved.</p>
          <p className="text-xs font-mono text-primary-foreground/50">Clinical intelligence // Workflow software</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
