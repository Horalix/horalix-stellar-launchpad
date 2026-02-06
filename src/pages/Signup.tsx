import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import horalixLogo from "@/assets/horalix-logo.png";
import SEO from "@/components/SEO";
import { authRedirectUrl } from "@/lib/canonical";

/**
 * Signup - User registration page
 * Includes password validation, terms agreement, and newsletter opt-in
 */

// Password validation rules
const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
};

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  // Password validation state - MUST be before any early returns
  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password]
  );

  const isPasswordValid =
    passwordValidation.minLength &&
    passwordValidation.hasLetter &&
    passwordValidation.hasNumber;

  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  // Redirect authenticated users immediately
  useEffect(() => {
    if (!authLoading && user) {
      navigate(returnTo || "/", { replace: true });
    }
  }, [user, authLoading, navigate, returnTo]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render form if user is authenticated (will redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms and Conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Invalid Password",
        description:
          "Password must be at least 8 characters with at least one letter and one number.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use canonical URL for email redirect - never window.location.origin
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: authRedirectUrl("/verify-email"),
          data: {
            full_name: fullName.trim(),
            newsletter_opt_in: subscribeNewsletter,
          },
        },
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Navigate to verification page
      navigate("/verify-email", { state: { email: email.trim() } });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render password requirement indicator
  const RequirementIndicator = ({
    met,
    label,
  }: {
    met: boolean;
    label: string;
  }) => (
    <div
      className={`flex items-center gap-2 text-xs ${
        met ? "text-green-600" : "text-muted-foreground"
      }`}
    >
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </div>
  );

  return (
    <>
      {/* SEO meta for signup page */}
      <SEO
        title="Sign Up | Horalix"
        description="Create your Horalix account to get started."
        canonical="/signup"
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img src={horalixLogo} alt="Horalix" className="h-12 mx-auto" />
            </Link>
            <h1 className="text-2xl font-bold font-space text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Join Horalix to get started
            </p>
          </div>
  
          {/* Signup form card */}
          <div className="bg-card border border-border shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full name field */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className="bg-secondary border-border"
                />
              </div>
  
              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="bg-secondary border-border"
                />
              </div>
  
              {/* Password field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="bg-secondary border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Password requirements */}
                {password && (
                  <div className="space-y-1 mt-2">
                    <RequirementIndicator
                      met={passwordValidation.minLength}
                      label="At least 8 characters"
                    />
                    <RequirementIndicator
                      met={passwordValidation.hasLetter}
                      label="At least one letter"
                    />
                    <RequirementIndicator
                      met={passwordValidation.hasNumber}
                      label="At least one number"
                    />
                  </div>
                )}
              </div>
  
              {/* Confirm password field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className={`bg-secondary border-border pr-10 ${
                      confirmPassword && !passwordsMatch ? "border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive">Passwords don't match</p>
                )}
              </div>

              {/* Terms and Conditions checkbox (required) */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-accent hover:text-accent/80 underline" target="_blank">
                    Terms and Conditions
                  </Link>
                  <span className="text-destructive ml-1">*</span>
                </label>
              </div>

              {/* Newsletter checkbox (optional) */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="newsletter"
                  checked={subscribeNewsletter}
                  onCheckedChange={(checked) => setSubscribeNewsletter(checked === true)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label htmlFor="newsletter" className="text-sm text-muted-foreground cursor-pointer">
                  Email me new reports and product updates
                </label>
              </div>
  
              {/* Submit button */}
              <Button
                type="submit"
                className="w-full text-xs font-bold uppercase tracking-widest"
                disabled={isLoading || !isPasswordValid || !passwordsMatch || !agreedToTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
  
            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                to={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
                className="text-accent hover:text-accent/80 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
  
          {/* Back to home link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
