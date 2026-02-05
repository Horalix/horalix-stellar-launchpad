import { Link } from "react-router-dom";
import horalixLogo from "@/assets/horalix-logo.png";
import SEO from "@/components/SEO";

/**
 * Terms - Terms and Conditions page
 * Simple legal page for user agreement
 */

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms and Conditions | Horalix"
        description="Read the Horalix terms and conditions for using our services."
        canonical="/terms"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="inline-block">
              <img src={horalixLogo} alt="Horalix" className="h-10" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold font-space text-foreground mb-8">
            Terms and Conditions
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: February 2025</p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Horalix website and services, you agree to be bound by
                these Terms and Conditions. If you do not agree to these terms, please do not use
                our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Description of Services</h2>
              <p>
                Horalix provides AI-powered medical imaging analysis solutions for healthcare
                professionals. Our services include cardiology AI, pathology AI, and radiology AI
                tools designed to assist medical professionals in their diagnostic workflows.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate and complete
                information. You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Medical Disclaimer</h2>
              <p>
                Horalix AI tools are intended to assist healthcare professionals and should not
                replace professional medical judgment. All diagnostic decisions should be made by
                qualified healthcare providers. Horalix is not responsible for any clinical
                decisions made based on our AI analysis.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Privacy</h2>
              <p>
                Your use of our services is also governed by our privacy practices. We are
                committed to protecting your personal information and any medical data processed
                through our platform in accordance with applicable healthcare data protection
                regulations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of the Horalix platform are owned by
                Horalix and are protected by international copyright, trademark, and other
                intellectual property laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Horalix shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from your
                use of our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of
                significant changes via email or through the platform. Continued use of our
                services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact us through our{" "}
                <Link to="/#contact" className="text-accent hover:text-accent/80">
                  contact form
                </Link>{" "}
                or email us at support@horalix.com.
              </p>
            </section>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/" className="text-accent hover:text-accent/80 text-sm">
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
