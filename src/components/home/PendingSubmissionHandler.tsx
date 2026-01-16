import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

// localStorage key for pending contact form data
const PENDING_CONTACT_KEY = "horalix_pending_contact";

/**
 * PendingSubmissionHandler - App-level component for auto-submitting contact forms
 * Handles the case where a user fills out the contact form, signs up via magic link,
 * and returns to the site. This component catches the auth state change and auto-submits.
 */
export const PendingSubmissionHandler = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const hasSubmitted = useRef(false);

  useEffect(() => {
    const handlePendingSubmission = async () => {
      // Step 1: Wait for auth to finish loading
      if (authLoading) return;

      // Step 2: Check if user is logged in
      if (!user) return;

      // Step 3: Check for pending contact form data
      const savedData = localStorage.getItem(PENDING_CONTACT_KEY);
      if (!savedData) return;

      // Step 4: Prevent duplicate submissions
      if (hasSubmitted.current) return;

      // Step 5: Parse and validate saved data
      try {
        const parsed = JSON.parse(savedData);
        if (!parsed.name || !parsed.email || !parsed.message) {
          // Invalid data, remove it
          localStorage.removeItem(PENDING_CONTACT_KEY);
          return;
        }

        // Step 6: Mark as submitted to prevent duplicates
        hasSubmitted.current = true;

        // Step 7: Submit the form data
        const { error } = await supabase.from("contact_submissions").insert({
          name: parsed.name,
          email: parsed.email,
          message: parsed.message,
          user_id: user.id,
        });

        if (error) throw error;

        // Step 8: Clear saved form data
        localStorage.removeItem(PENDING_CONTACT_KEY);

        // Step 9: Show success notification
        toast({
          title: "Message Transmitted",
          description:
            "Your inquiry has been automatically submitted. We'll respond shortly.",
        });
      } catch (error) {
        console.error("PendingSubmissionHandler: Auto-submit error:", error);
        // Reset flag so ContactSection can try again if needed
        hasSubmitted.current = false;
        toast({
          title: "Transmission Failed",
          description: "Unable to send your saved message. Please try submitting again.",
          variant: "destructive",
        });
      }
    };

    handlePendingSubmission();
  }, [user, authLoading, toast]);

  // This component doesn't render anything
  return null;
};
