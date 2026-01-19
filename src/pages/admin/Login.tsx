import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import horalixLogo from "@/assets/horalix-logo.png";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";

/**
 * AdminLogin - Authentication page for admin portal
 * Handles email/password login for CMS access
 */

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 2: Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Step 3: Check if user has admin/editor role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData || !["admin", "editor"].includes(roleData.role)) {
        // Sign out if no admin/editor role
        await supabase.auth.signOut();
        throw new Error("You do not have permission to access the admin portal.");
      }

      // Step 4: Success - redirect to admin dashboard
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      navigate("/admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    {/* SEO meta for admin login with noindex */}
      <SEO
        title="Admin Login | Horalix"
        description="Sign in to the Horalix admin portal."
        canonical="/admin/login"
      />
      {/* Additional noindex tag to prevent indexing */}
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <img
            src={horalixLogo}
            alt="Horalix"
            className="h-12 mx-auto mb-6"
          />
          <div className="flex items-center justify-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-2">
            <Shield className="w-4 h-4" />
            <span>Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold font-space">Sign In</h1>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border p-8">
          <div className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@horalix.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full font-bold uppercase tracking-widest"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>

        {/* Back to homepage */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <a href="/" className="hover:text-accent transition-colors">
            ← Back to homepage
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
