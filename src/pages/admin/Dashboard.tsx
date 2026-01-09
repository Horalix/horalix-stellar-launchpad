import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Users, Layers, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

/**
 * AdminDashboard - Main admin overview page
 * Displays quick stats and recent activity
 */

const AdminDashboard = () => {
  // Fetch counts for dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [articles, team, solutions, contacts] = await Promise.all([
        supabase.from("news_articles").select("id", { count: "exact", head: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }),
        supabase.from("solutions").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);

      return {
        articles: articles.count || 0,
        team: team.count || 0,
        solutions: solutions.count || 0,
        newContacts: contacts.count || 0,
      };
    },
  });

  // Fetch recent contact submissions
  const { data: recentContacts } = useQuery({
    queryKey: ["recent-contacts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statCards = [
    { label: "News Articles", value: stats?.articles || 0, icon: Newspaper, href: "/admin/news" },
    { label: "Team Members", value: stats?.team || 0, icon: Users, href: "/admin/team" },
    { label: "Solutions", value: stats?.solutions || 0, icon: Layers, href: "/admin/solutions" },
    { label: "New Messages", value: stats?.newContacts || 0, icon: Mail, href: "/admin/contacts" },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-8">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-bold font-space">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome to the Horalix CMS. Manage your website content from here.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} to={stat.href}>
                  <Card className="hover:border-accent transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Recent contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Contact Submissions</CardTitle>
              <Link
                to="/admin/contacts"
                className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentContacts && recentContacts.length > 0 ? (
                <div className="space-y-4">
                  {recentContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start justify-between border-b border-border pb-4 last:border-0"
                    >
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.email}</div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {contact.message}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(contact.created_at), "MMM d")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No contact submissions yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
