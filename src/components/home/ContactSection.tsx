import { useState, useEffect, forwardRef } from "react";
import horalixLogoWhite from "@/assets/horalix-logo-white.png";
import { ShieldCheck, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

// localStorage key for clearing any legacy pending-contact data
const PENDING_CONTACT_KEY = "horalix_pending_contact";

/**
 * ContactSection - "Book a Demo" form with validation
 * Submits directly to the database (no login required); the team is notified by
 * the send-contact-notification edge function. Logged-in users are pre-filled.
 */

// Form validation schema
const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactSection = forwardRef<HTMLElement>((_, ref) => {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  // Pre-fill form with user data
  useEffect(() => {
    const prefillFromProfile = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      // Pre-fill form with user profile data if logged in
      if (user) {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data) {
            setFormData((prev) => ({
              ...prev,
              name: data.full_name || prev.name,
              email: data.email || user.email || prev.email,
            }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    prefillFromProfile();
  }, [user, authLoading]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data first
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<ContactFormData> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // No login required: the origin-scoped RLS policy allows anonymous inserts
    // from horalix.com, and the notification function handles anonymous leads.
    setIsSubmitting(true);

    try {
      // Generate id client-side so we don't need SELECT permission after INSERT
      // (anon role has no SELECT policy on contact_submissions).
      const submissionId = crypto.randomUUID();
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          id: submissionId,
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
          user_id: user?.id ?? null,
        });

      if (error) throw error;

      // Invoke notification edge function and surface errors to the user
      const { data: notificationResult, error: notificationError } =
        await supabase.functions.invoke("send-contact-notification", {
          body: { submission_id: submissionId },
        });

      if (
        notificationError ||
        notificationResult?.error ||
        notificationResult?.team_notified === false ||
        notificationResult?.user_notified === false
      ) {
        console.error("Contact notification failed:", notificationError || notificationResult);
        toast({
          title: "Notification Warning",
          description:
            "Your message was saved, but one or more email notifications failed.",
          variant: "destructive",
        });
      }

      // Clear any saved form data
      localStorage.removeItem(PENDING_CONTACT_KEY);

      // Show success message
      toast({
        title: "Message Transmitted",
        description: "Your inquiry has been received. We'll respond shortly.",
      });

      // Reset form
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast({
        title: "Transmission Failed",
        description: "Unable to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      className="py-24 px-6 lg:px-12 bg-card relative z-10"
    >
      <div className="max-w-4xl mx-auto bg-card border border-border shadow-2xl relative">
        {/* Decorative paper holes */}
        <div className="absolute -top-6 left-0 w-full flex justify-between px-8">
          <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
          <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="p-8 md:p-12 border-b-4 border-primary">
          {/* Form header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold font-space text-primary">
                Book a Demo
              </h2>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                Tell us about your echo workflow — we&apos;ll set up a walkthrough.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="w-24 h-24 border border-border flex items-center justify-center bg-secondary overflow-hidden">
                <img 
                  src={horalixLogoWhite} 
                  alt="Horalix" 
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name field */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={`bg-secondary border-border focus:border-accent ${
                    errors.name ? "border-destructive" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@institution.edu"
                  className={`bg-secondary border-border focus:border-accent ${
                    errors.email ? "border-destructive" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Message field */}
            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your requirements or clinical needs..."
                className={`bg-secondary border-border focus:border-accent resize-none ${
                  errors.message ? "border-destructive" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            {/* Submit section */}
            <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" /> GDPR-aligned · EU data residency
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="text-xs font-bold uppercase tracking-widest"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";
