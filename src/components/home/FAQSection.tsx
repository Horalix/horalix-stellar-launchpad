import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";
import { Reveal } from "@/components/ui/reveal";
import { homepageFAQFallbacks } from "@/content/homepageFallbacks";
import type { HomepageFAQItem } from "@/content/homepageFallbacks";
import { buildFAQPageJsonLd } from "@/lib/structuredData";

/**
 * FAQSection - Homepage FAQ accordion with JSON-LD structured data
 * Fetches FAQ items from database and renders with SEO schema
 */

export const FAQSection = () => {
  // Step 1: Fetch FAQ items for homepage
  const { data: queriedFAQItems, isLoading } = useQuery<HomepageFAQItem[]>({
    queryKey: ["faq-items", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("id, question, answer, sort_order")
        .eq("page", "home")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseConfigured,
    retry: false,
  });

  const faqItems = queriedFAQItems && queriedFAQItems.length > 0 ? queriedFAQItems : homepageFAQFallbacks;
  const hasFaqItems = faqItems.length > 0;
  const shouldShowLoading = isSupabaseConfigured && isLoading && !queriedFAQItems;

  // Step 2: Build JSON-LD structured data for FAQPage (shared builder)
  const jsonLd = hasFaqItems ? buildFAQPageJsonLd(faqItems) : null;

  return (
    <section
      id="faq"
      className="py-24 px-6 lg:px-12 bg-secondary/30 border-t border-border relative z-10"
    >
      {/* JSON-LD Schema injection */}
      {jsonLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
      )}

      <div className="max-w-7xl mx-auto">
        {/* [UX] Editorial two-column layout: sticky context left, answers right —
            the reader keeps orientation while scanning long accordions */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-4">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-space tracking-tight text-primary">
              Questions &amp; Answers
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-xs">
              The questions hospitals, clinicians, and investors actually ask — answered plainly.
              Anything missing?{" "}
              <a href="/#contact" className="font-medium text-accent-strong hover:underline">
                Ask us directly.
              </a>
            </p>
          </Reveal>

          <div>
            {/* FAQ Accordion */}
            {shouldShowLoading && (
              <div className="py-12 text-left text-muted-foreground font-mono text-sm">
                Loading FAQs...
              </div>
            )}

            {!shouldShowLoading && !hasFaqItems && (
              <div className="py-12 text-left text-muted-foreground font-mono text-sm">
                No FAQs available.
              </div>
            )}

            {!shouldShowLoading && hasFaqItems && (
              <Reveal delay={90}>
                <Accordion type="single" collapsible className="w-full space-y-0">
                  {faqItems.map((item, index) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="border-b border-border/60 last:border-b-0 group"
                    >
                      <AccordionTrigger className="text-left text-lg md:text-xl font-semibold leading-snug hover:no-underline py-5 gap-4">
                        <span className="flex items-baseline gap-4">
                          <span
                            aria-hidden="true"
                            className="font-mono text-xs font-bold tabular-nums text-accent-strong/70 group-hover:text-accent-strong transition-colors"
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {item.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm md:text-base text-muted-foreground/90 leading-relaxed pt-1 pb-6 md:pl-10">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
