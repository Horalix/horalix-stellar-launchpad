import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";

/**
 * FAQSection - Homepage FAQ accordion with JSON-LD structured data
 * Fetches FAQ items from database and renders with SEO schema
 */

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export const FAQSection = () => {
  // Step 1: Fetch FAQ items for homepage
  const { data: faqItems, isLoading } = useQuery({
    queryKey: ["faq-items", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("id, question, answer, sort_order")
        .eq("page", "home")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as FAQItem[];
    },
  });

  // Step 2: Don't render anything if no items or still loading
  if (isLoading || !faqItems || faqItems.length === 0) {
    return null;
  }

  // Step 3: Build JSON-LD structured data for FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="py-24 px-6 lg:px-12 border-t border-border">
      {/* JSON-LD Schema injection */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-space tracking-tight">
            Questions & Answers
          </h2>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border border-border rounded-lg px-4 data-[state=open]:bg-secondary/30"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
