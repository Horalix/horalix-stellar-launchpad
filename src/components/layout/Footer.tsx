import { forwardRef } from "react";
import { Link } from "react-router-dom";
import horalixLogo from "@/assets/horalix-logo.png";
import { Container } from "@/components/layout/Container";

/**
 * Footer - Site footer with links and branding
 * Uses constrained container for consistent layout
 */
export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer ref={ref} className="bg-primary text-primary-foreground border-t border-border relative z-10">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="md:col-span-2">
            <img 
              src={horalixLogo} 
              alt="Horalix" 
              className="h-10 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-sm text-primary-foreground/70 max-w-md leading-relaxed">
              Precision medicine quantified. Eliminating margin of error through 
              advanced algorithmic diagnostics for clinical excellence.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-accent">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/#solutions" 
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link 
                  to="/news" 
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  News
                </Link>
              </li>
              <li>
                <Link 
                  to="/#team" 
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link 
                  to="/#contact" 
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-accent">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="font-mono text-xs">contact@horalix.com</li>
              <li className="font-mono text-xs">Techstars Accelerator</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50 font-mono">
            © {currentYear} Horalix. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/50 font-mono">
            Clinical Intelligence // Medical Technology
          </p>
        </div>
      </Container>
    </footer>
  );
});

Footer.displayName = "Footer";
