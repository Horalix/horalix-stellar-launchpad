import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <MainLayout>
      <SEO
        title="Page Not Found | Horalix"
        description="The page you requested could not be found."
        canonical={location.pathname}
        noindex
      />
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-24">
        <div className="w-full max-w-xl text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
            Signal lost
          </p>
          <h1 className="mt-4 font-space text-7xl font-bold tracking-tight text-primary md:text-8xl">
            4
            <span className="bg-gradient-to-r from-accent-strong via-accent to-sky-500 bg-clip-text text-transparent">
              0
            </span>
            4
          </h1>

          {/* The brand's ECG trace, searching for a signal */}
          <svg
            aria-hidden="true"
            viewBox="0 0 600 40"
            className="mx-auto mt-8 h-8 w-full max-w-sm text-accent/70"
            preserveAspectRatio="none"
          >
            <path
              className="ecg-path"
              d="M0 24 H150 l12 -7 12 7 h60 l8 -18 10 30 8 -34 10 26 6 -11 h70 l10 -6 10 6 h234"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-8 text-base leading-relaxed text-muted-foreground">
            This page doesn&apos;t exist — the address may have changed or was mistyped.
            Everything important is one step away.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="text-xs font-bold uppercase tracking-widest">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-xs font-bold uppercase tracking-widest">
              <Link to="/solutions">Solutions</Link>
            </Button>
            <Button asChild variant="outline" className="text-xs font-bold uppercase tracking-widest">
              <Link to="/resources">Resources</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
