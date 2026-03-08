import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title="Page Not Found | Horalix"
        description="The page you requested could not be found."
        canonical={location.pathname}
        noindex
      />
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <span className="mb-2 block font-mono text-6xl font-bold text-muted-foreground/30">404</span>
          <h1 className="mb-4 text-2xl font-bold">Page Not Found</h1>
          <p className="mb-6 text-muted-foreground">The page you requested could not be found.</p>
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/" className="text-primary underline underline-offset-4 hover:text-accent">Home</Link>
            <Link to="/solutions" className="text-primary underline underline-offset-4 hover:text-accent">Solutions</Link>
            <Link to="/resources" className="text-primary underline underline-offset-4 hover:text-accent">Resources</Link>
            <Link to="/about" className="text-primary underline underline-offset-4 hover:text-accent">About</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default NotFound;
