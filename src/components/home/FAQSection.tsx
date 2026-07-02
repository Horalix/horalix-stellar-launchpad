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
        {/* Section header */}
        <Reveal className="flex flex-col items-start text-left mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-4">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-space tracking-tight text-primary">
            Questions & Answers
          </h2>
        </Reveal>

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
          <Reveal delay={90} className="max-w-7xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-0">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <AccordionTrigger className="text-left text-lg md:text-xl lg:text-2xl font-semibold leading-snug hover:no-underline py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base lg:text-lg text-muted-foreground/80 leading-relaxed pt-2 pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        )}
      </div>
    </section>
  );
};
