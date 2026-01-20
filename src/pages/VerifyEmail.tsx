import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import horalixLogo from "@/assets/horalix-logo.png";
import SEO from "@/components/SEO";

/**
 * VerifyEmail - Email verification pending page
 * Shown after successful signup, with option to resend verification email
 */

export default function VerifyEmail() {
  const location = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Get email from navigation state
  const email = location.state?.email || "";

  // Handle resend verification email
  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please go back to signup and enter your email again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    try {
      // Use production domain for magic link redirects
      const PRODUCTION_URL = "https://horalix.com";
      
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: PRODUCTION_URL,
        },
      });

      if (error) {
        toast({
          title: "Failed to Resend",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setResendSuccess(true);
      toast({
        title: "Email Sent",
        description: "A new verification email has been sent to your inbox.",
      });
    } catch (error) {
      console.error("Resend email error:", error);
      toast({
        title: "Failed to Resend",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {/* SEO meta for verify email page */}
      <SEO
        title="Verify Email | Horalix"
        description="Check your email to verify your Horalix account."
        canonical="/verify-email"
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <img src={horalixLogo} alt="Horalix" className="h-12 mx-auto" />
          </Link>
  
          {/* Verification card */}
          <div className="bg-card border border-border shadow-lg p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-accent" />
            </div>
  
            {/* Title */}
            <h1 className="text-2xl font-bold font-space text-foreground mb-4">
              Check Your Email
            </h1>
  
            {/* Description */}
            <p className="text-muted-foreground mb-2">
              We've sent a verification link to:
            </p>
            {email && (
              <p className="text-foreground font-medium mb-6">{email}</p>
            )}
  
            <p className="text-sm text-muted-foreground mb-8">
              Click the link in the email to verify your account. If you don't see
              it, check your spam folder.
            </p>
  
            {/* Resend section */}
            <div className="space-y-4">
              {resendSuccess ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Verification email sent!</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Resending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              )}
  
              <Link to="/login" className="block">
                <Button variant="default" className="w-full text-xs font-bold uppercase tracking-widest">
                  Back to Login
                </Button>
              </Link>
            </div>
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
