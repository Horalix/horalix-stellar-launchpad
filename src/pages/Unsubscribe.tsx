import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import horalixLogo from "@/assets/horalix-logo.png";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

/**
 * Unsubscribe - Newsletter unsubscribe page
 * Allows users to unsubscribe from newsletter via email link
 */

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [message, setMessage] = useState("");

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    if (email && token) {
      handleUnsubscribe();
    }
  }, [email, token]);

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Invalid unsubscribe link.");
      return;
    }

    setStatus("loading");

    try {
      // Call edge function to handle unsubscribe
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, token }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("You have been successfully unsubscribed from our newsletter.");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to unsubscribe. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <SEO
        title="Unsubscribe | Horalix"
        description="Unsubscribe from Horalix newsletter."
        canonical="/unsubscribe"
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <img src={horalixLogo} alt="Horalix" className="h-12 mx-auto" />
          </Link>

          {/* Content card */}
          <div className="bg-card border border-border shadow-lg p-8">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
                <h1 className="text-xl font-bold font-space text-foreground mb-2">
                  Processing...
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we process your request.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-xl font-bold font-space text-foreground mb-2">
                  Unsubscribed
                </h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-xl font-bold font-space text-foreground mb-2">
                  Error
                </h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </>
            )}

            {status === "idle" && !email && (
              <>
                <h1 className="text-xl font-bold font-space text-foreground mb-2">
                  Unsubscribe
                </h1>
                <p className="text-muted-foreground mb-6">
                  This link appears to be invalid. Please use the unsubscribe link from your
                  newsletter email.
                </p>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
