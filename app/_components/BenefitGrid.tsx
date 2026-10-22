type Benefit = { title: string; body: string };

const benefits: Benefit[] = [
  {
    title: "Shorter time to report-ready",
    body: "Measurement extraction and report assembly are prepared before the clinician opens the study.",
  },
  {
    title: "Consistent structured output",
    body: "The same fields, in the same order, on every study — so a follow-up is comparable with the baseline.",
  },
  {
    title: "Vendor-neutral across the fleet",
    body: "Works downstream of acquisition on DICOM, so a mixed scanner estate behaves the same way.",
  },
  {
    title: "The clinician keeps control",
    body: "Every suggestion is traceable to its source view, editable in place, and rejectable without penalty.",
  },
  {
    title: "Fits the existing workflow",
    body: "Acquisition is unchanged and the hospital's reporting path stays authoritative throughout a pilot.",
  },
  {
    title: "Evidence you can inspect",
    body: "Every public claim carries a source, product version, and review date in a register anyone can read.",
  },
];

export function BenefitGrid({ heading, lede }: { heading: string; lede?: string }) {
  return (
    <section className="section-tight shell benefit-section">
      <div className="benefit-head"><h2>{heading}</h2>{lede && <p className="lede">{lede}</p>}</div>
      <div className="benefit-grid">
        {benefits.map((benefit) => (
          <article className="benefit-card" key={benefit.title}>
            <h3>{benefit.title}</h3>
            <p>{benefit.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
