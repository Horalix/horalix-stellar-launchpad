import Link from "../_components/ReliableLink";
import { LeadForm } from "../_components/LeadForm";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Request a Horalix demo", description: "Book a focused demo of the Horalix AI-assisted echocardiography workflow, or request investor materials.", path: "/contact" });

const contactGraph = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://horalix.com/contact#page",
  url: "https://horalix.com/contact",
  name: "Request a Horalix demo",
  description: "Request a demo of the Horalix echocardiography workflow, or request investor materials.",
  inLanguage: "en",
  isPartOf: { "@id": "https://horalix.com/#website" },
  about: { "@id": "https://horalix.com/#organization" },
  mainEntity: {
    "@id": "https://horalix.com/#organization",
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", email: "support@horalix.com", areaServed: "Europe", availableLanguage: ["en", "bs"] },
      { "@type": "ContactPoint", contactType: "executive", email: "kerim@horalix.com", areaServed: "Europe", availableLanguage: ["en", "bs"] },
    ],
  },
};

/**
 * One page, two intents. `?for=investor` switches the form so an investor request is still
 * recorded and routed as `investor_access` rather than logged as a hospital demo.
 */
export default async function Contact({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const investor = (await searchParams).for === "investor";

  return <>
    {/* Centred masthead over a single card — the form is the whole page. */}
    <section className="contact-hero">
      <div className="shell">
        <p className="eyebrow">{investor ? "Investor materials" : "Request a demo"}</p>
        <h1>
          {investor
            ? <>Review the company <span>behind the workflow.</span></>
            : <>Talk to us about <span>your echo workflow.</span></>}
        </h1>
        <p className="lede">
          {investor
            ? "Tell us who you are and what you would like to understand. We will send current materials and arrange a focused conversation with the team."
            : "Bring your integration, governance, and review questions. We will shape the conversation around your environment rather than a generic script."}
        </p>

        <div className="contact-tabs">
          <Link className={investor ? "contact-tab" : "contact-tab is-active"} href="/contact">Hospital demo</Link>
          <Link className={investor ? "contact-tab is-active" : "contact-tab"} href="/contact?for=investor">Investor materials</Link>
        </div>

        <div className="contact-card">
          {/* The card is the whole page, so the form starts expanded rather than behind a button. */}
          <LeadForm intent={investor ? "investor_access" : "hospital_demo"} startOpen />
        </div>

        <ul className="contact-direct">
          <li><span>General and support</span><a href="mailto:support@horalix.com">support@horalix.com</a></li>
          <li><span>Founder direct</span><a href="mailto:kerim@horalix.com">kerim@horalix.com</a></li>
        </ul>
      </div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactGraph) }} />
  </>;
}
