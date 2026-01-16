import { useState, useEffect, forwardRef, useRef } from "react";
import { useNavigate } from "react-router-dom";
import horalixLogoGradient from "@/assets/horalix-logo-gradient.jpg";
import { ShieldCheck, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// localStorage key for saving pending contact form data
const PENDING_CONTACT_KEY = "horalix_pending_contact";

/**
 * ContactSection - Contact form with validation
 * Stores submissions to database (email notification handled by edge function)
 * If user is not logged in, shows dialog and auto-submits after authentication
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
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  // Track if we've already auto-submitted to prevent duplicate submissions
  const hasAutoSubmitted = useRef(false);

  // Pre-fill form with user data and auto-submit if pending data exists
  useEffect(() => {
    const handlePendingSubmission = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      // Check for pending form data
      const savedData = localStorage.getItem(PENDING_CONTACT_KEY);

      // User just logged in with pending form data - auto submit
      if (user && savedData && !hasAutoSubmitted.current) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.name && parsed.email && parsed.message) {
            hasAutoSubmitted.current = true;
            setIsSubmitting(true);

            const { error } = await supabase.from("contact_submissions").insert({
              name: parsed.name,
              email: parsed.email,
              message: parsed.message,
              user_id: user.id,
            });

            if (error) throw error;

            // Clear saved form data
            localStorage.removeItem(PENDING_CONTACT_KEY);

            // Show success message
            toast({
              title: "Message Transmitted",
              description:
                "Your inquiry has been automatically submitted. We'll respond shortly.",
            });

            // Reset form
            setFormData({ name: "", email: "", message: "" });
            setIsSubmitting(false);
            return; // Don't pre-fill form since we auto-submitted
          }
        } catch (error) {
          console.error("Auto-submit error:", error);
          hasAutoSubmitted.current = false;
          setIsSubmitting(false);
          toast({
            title: "Transmission Failed",
            description: "Unable to send message. Please try submitting again.",
            variant: "destructive",
          });
          localStorage.removeItem(PENDING_CONTACT_KEY);
        }
      }

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

    handlePendingSubmission();
  }, [user, authLoading, toast]);

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

  // Handle dialog continue to login
  const handleContinueToLogin = () => {
    setShowLoginDialog(false);
    navigate("/login?returnTo=/#contact");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data first (so we save valid data)
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

    // Check if user is logged in - require login to submit
    if (!user) {
      // Save complete form data to localStorage for auto-submit after login
      localStorage.setItem(
        PENDING_CONTACT_KEY,
        JSON.stringify({
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
          savedAt: new Date().toISOString(),
        })
      );
      // Show dialog instead of immediate redirect
      setShowLoginDialog(true);
      return;
    }

    // Form data already validated above

    setIsSubmitting(true);

    try {
      // Store submission in database (user is required now)
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
          user_id: user.id,
        });

      if (error) throw error;

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
      className="py-24 px-6 lg:px-12 bg-muted relative z-10"
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
                Inquiry Form
              </h2>
              <p className="text-sm font-mono text-muted-foreground mt-1 uppercase">
                Transmission Secure // Encrypted
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="w-24 h-24 border border-border flex items-center justify-center bg-secondary overflow-hidden">
                <img 
                  src={horalixLogoGradient} 
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
                  Subject Name
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
                  Contact Vector
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
                Inquiry Data
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
                <ShieldCheck className="w-4 h-4" /> HIPAA Compliant
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
                    Transmitting...
                  </>
                ) : (
                  <>
                    Transmit Data
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Login required dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign In Required</AlertDialogTitle>
            <AlertDialogDescription>
              Your message has been saved. Please sign in or create an account
              to submit your inquiry. Once you're signed in, your form will be
              automatically submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <AlertDialogAction onClick={handleContinueToLogin}>
              Continue to Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
});

ContactSection.displayName = "ContactSection";
