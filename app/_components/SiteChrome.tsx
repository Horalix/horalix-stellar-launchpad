import Link from "./ReliableLink";
import Image from "next/image";
import { MobileNavigation } from "./MobileNavigation";
import { PrimaryNavigation } from "./PrimaryNavigation";
import { metricDisclosure, metricsFor } from "../_data/claims";

export function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Image unoptimized src="/brand/horalix-mark-white.png" alt="" width={653} height={863} sizes="38px" />
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Horalix home">
          <Mark />
          <span className="brand-word">HORALIX</span>
        </Link>
        <PrimaryNavigation />
        <div className="header-actions">
          <a className="utility-link" href="https://app.horalix.com" rel="noreferrer">Product login</a>
          <Link className="button button-small button-light" href="/contact">Request demo</Link>
        </div>
        <MobileNavigation />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/"><Mark /><span className="brand-word">HORALIX</span></Link>
          <p>Sarajevo-built AI-assisted echocardiography workflow, designed around clinician review.</p>
          <div className="status-note"><span /> Pilot-stage · Pre-clearance</div>
        </div>
        <div>
          <p className="footer-label">Explore</p>
          <Link href="/platform">Platform</Link><Link href="/for-hospitals">For hospitals</Link>
          <Link href="/for-clinicians">For clinicians</Link><Link href="/product-tour">Product tour</Link>
        </div>
        <div>
          <p className="footer-label">Trust</p>
          <Link href="/evidence">Evidence</Link><Link href="/security">Security</Link>
          <Link href="/resources">Resources</Link><Link href="/press">Press</Link>
          {/* Linked so crawlers and assistants can discover the citation guidance files. */}
          <a href="/llms.txt">AI citation guide</a><a href="/llms-full.txt">Full reference</a>
        </div>
        <div>
          <p className="footer-label">Company</p>
          <Link href="/about">About</Link><Link href="/news">News</Link><Link href="/investors">Investors</Link>
          <Link href="/press">Press</Link>
        </div>
        <div className="footer-contact">
          <p className="footer-label">Get in touch</p>
          <a href="mailto:support@horalix.com">support@horalix.com</a>
          <a href="https://www.linkedin.com/company/horalix/" rel="noreferrer">LinkedIn</a>
          <div className="footer-actions">
            <Link className="button button-small button-light" href="/contact">Request a demo <Arrow /></Link>
            <Link className="button button-small button-ghost" href="/contact?for=investor">Investor overview</Link>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© 2026 Horalix. All rights reserved.</p>
        <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
      <div className="footer-watermark" aria-hidden="true">HORALIX</div>
    </footer>
  );
}

export function Arrow({ reverse = false }: { reverse?: boolean }) {
  return <span aria-hidden="true" className={reverse ? "arrow reverse" : "arrow"}>→</span>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((item, index) => (
        <span key={item.label}>{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}{index < items.length - 1 && <b>/</b>}</span>
      ))}
    </nav>
  );
}

/**
 * Interior page header. Passing `breadcrumb` + `path` renders the visible trail and emits
 * the matching BreadcrumbList, so the two can never drift apart — a page either has both
 * or neither.
 */
export function PageIntro({ eyebrow, title, copy, actions, breadcrumb, path }: { eyebrow: string; title: string; copy: string; actions?: React.ReactNode; breadcrumb?: string; path?: `/${string}` }) {
  const schema = breadcrumb && path
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": `https://horalix.com${path}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Horalix", item: "https://horalix.com/" },
          { "@type": "ListItem", position: 2, name: breadcrumb, item: `https://horalix.com${path}` },
        ],
      }
    : null;
  return (
    <section className="page-intro">
      <div className="shell intro-grid">
        <div>
          {breadcrumb && <Breadcrumbs items={[{ label: "Horalix", href: "/" }, { label: breadcrumb }]} />}
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <div><p className="lede">{copy}</p>{actions && <div className="button-row">{actions}</div>}</div>
      </div>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
    </section>
  );
}

export function MetricRow({ path, eyebrow = "Current build", heading }: { path: string; eyebrow?: string; heading: string }) {
  const metrics = metricsFor(path);
  if (!metrics.length) return null;
  return (
    <section className="metric-band" aria-label="Internal product benchmarks">
      <div className="shell">
        <div className="metric-band-head"><p className="eyebrow">{eyebrow}</p><h2>{heading}</h2></div>
        <dl className="metric-row">
          {metrics.map((item) => (
            <div className="metric-tile" key={item.id}>
              <dt>{item.label}</dt>
              <dd><b>{item.value}</b><span>{item.detail}</span></dd>
            </div>
          ))}
        </dl>
        <p className="metric-disclosure">{metricDisclosure}</p>
      </div>
    </section>
  );
}

export function SplitCta() {
  return (
    <section className="split-cta shell">
      <div className="split-cta-panel hospital-panel"><p className="eyebrow">For clinical teams</p><h2>See the workflow with your environment in mind.</h2><p>Bring your integration, governance, and review questions to a focused hospital demo.</p><Link className="text-link" href="/contact">Request a hospital demo <Arrow /></Link></div>
      <div className="split-cta-panel investor-panel"><p className="eyebrow">For investors</p><h2>Review the company behind the clinical workflow.</h2><p>Request a private overview of milestones, defensibility, and the path ahead.</p><Link className="text-link" href="/contact?for=investor">Request investor materials <Arrow /></Link></div>
    </section>
  );
}
