type Benefit = { title: string; body: string; icon: React.ReactNode };

/* Line icons at a single 1.5px weight so the row reads as one set, not six illustrations. */
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const benefits: Benefit[] = [
  {
    title: "Shorter time to report-ready",
    body: "Measurement extraction and report assembly are prepared before the clinician opens the study.",
    icon: <svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></svg>,
  },
  {
    title: "Consistent structured output",
    body: "The same fields, in the same order, on every study — so a follow-up is comparable with the baseline.",
    icon: <svg viewBox="0 0 24 24" {...stroke}><path d="M4 6h16M4 12h16M4 18h10" /><circle cx="19" cy="18" r="2" /></svg>,
  },
  {
    title: "Vendor-neutral across the fleet",
    body: "Works downstream of acquisition on DICOM, so a mixed scanner estate behaves the same way.",
    icon: <svg viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="5" rx="1.5" /><rect x="14" y="15" width="7" height="5" rx="1.5" /></svg>,
  },
  {
    title: "The clinician keeps control",
    body: "Every suggestion is traceable to its source view, editable in place, and rejectable without penalty.",
    icon: <svg viewBox="0 0 24 24" {...stroke}><path d="M12 3l7.5 3v5.5c0 4.4-3.1 8.2-7.5 9.5-4.4-1.3-7.5-5.1-7.5-9.5V6z" /><path d="M9.2 12.2l2 2 3.6-3.8" /></svg>,
  },
  {
    title: "Fits the existing workflow",
    body: "Acquisition is unchanged and the hospital's reporting path stays authoritative throughout a pilot.",
    icon: <svg viewBox="0 0 24 24" {...stroke}><path d="M3 12h5l2.5-6 3 12 2.5-6h5" /></svg>,
  },
  {
    title: "Evidence you can inspect",
    body: "Every public claim carries a source, product version, and review date in a register anyone can read.",
    icon: <svg viewBox="0 0 24 24" {...stroke}><path d="M5 3h9l5 5v13H5z" /><path d="M14 3v5h5" /><path d="M8.5 13.5l2 2 4-4.5" /></svg>,
  },
];

export function BenefitGrid({ eyebrow = "Why this shape", heading, lede }: { eyebrow?: string; heading: string; lede?: string }) {
  return (
    <section className="section-tight shell benefit-section">
      <div className="benefit-head"><p className="eyebrow">{eyebrow}</p><h2>{heading}</h2>{lede && <p className="lede">{lede}</p>}</div>
      <div className="benefit-grid">
        {benefits.map((benefit) => (
          <article className="benefit-card" key={benefit.title}>
            <span className="benefit-icon" aria-hidden="true">{benefit.icon}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
