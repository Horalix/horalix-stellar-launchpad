import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Layers,
  LibraryBig,
  UserRound,
  FileText,
  Mail,
  LogOut,
  Menu,
  X,
  Linkedin,
  HelpCircle,
} from "lucide-react";
import horalixLogo from "@/assets/horalix-logo.png";

/**
 * AdminLayout - Wrapper layout for admin CMS pages
 * Provides sidebar navigation and header
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "News", href: "/admin/news", icon: Newspaper },
  { label: "LinkedIn Posts", href: "/admin/linkedin", icon: Linkedin },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Solutions", href: "/admin/solutions", icon: Layers },
  { label: "Resources", href: "/admin/resources", icon: LibraryBig },
  { label: "Contributors", href: "/admin/contributors", icon: UserRound },
  { label: "Site Content", href: "/admin/content", icon: FileText },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Contact Submissions", href: "/admin/contacts", icon: Mail },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SEO
        title="Horalix Admin"
        description="Horalix internal administration interface."
        canonical={location.pathname}
        noindex
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform lg:static lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={horalixLogo} alt="Horalix" className="h-8" />
            <span className="text-xs text-muted-foreground">CMS</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded p-1 hover:bg-secondary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="mb-2 truncate text-xs text-muted-foreground">{user?.email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
          <button onClick={() => setIsSidebarOpen(true)} className="rounded p-2 hover:bg-secondary lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
            >
              View Site
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
