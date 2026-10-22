import Image from "next/image";
/**
 * The integration map: what the hospital already owns, what Horalix adds between it, and
 * where the output goes back. The scanner and the hospital's PACS/EMR sit outside the
 * bracket on purpose — Horalix works downstream of acquisition and hands results back,
 * it does not replace either system.
 *
 * Illustrations are inline SVG rather than assets: the rail has to stay self-contained,
 * and no third-party scanner marks are used because we hold no permission for them.
 */

type Stage = {
  id: string;
  label: string;
  title: string;
  copy: string;
  icon: React.ReactNode;
  /** Vector fallback, used until the rendered art is dropped in. */
  art: React.ReactNode;
  /** Rendered art. `tint` hue-shifts a blue accent onto the Horalix teal. */
  photo?: { src: string; width: number; height: number; tint?: boolean };
  /** Stages the hospital already owns sit outside the Horalix bracket. */
  external?: boolean;
};

/**
 * Flip to true once all five files exist under public/workflow/. Kept behind a switch so a
 * missing export renders the vector fallback rather than five broken images.
 */
const USE_RENDERED_ART = true;

const IconWave = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12h4l2-5 3 10 3-8 2 3h6" />
  </svg>
);
const IconCloud = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.5 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z" /><path d="M12 15V9" /><path d="m9.5 11.5 2.5-2.5 2.5 2.5" />
  </svg>
);
const IconSparkle = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z" /><path d="M18.5 16.5v3M20 18h-3" />
  </svg>
);
const IconReview = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 6h10M4 12h7M4 18h10" /><path d="m15 15.5 2 2 4.5-4.5" />
  </svg>
);
const IconReport = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3H7a1.8 1.8 0 0 0-1.8 1.8v14.4A1.8 1.8 0 0 0 7 21h10a1.8 1.8 0 0 0 1.8-1.8V8z" /><path d="M14 3v5h4.8" /><path d="M9 13h6M9 17h4" />
  </svg>
);

/**
 * Shared paint. One <defs> for the whole rail rather than five copies, and every drawing
 * uses the same 240×180 frame so the five scale to identical visual weight in the band.
 */
export function WorkflowRailDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="hx-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,.085)" /><stop offset="1" stopColor="rgba(255,255,255,.025)" />
        </linearGradient>
        <linearGradient id="hx-shell" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#f2f7f6" /><stop offset="1" stopColor="#a8b8b6" />
        </linearGradient>
        <radialGradient id="hx-sphere" cx=".36" cy=".3" r=".8">
          <stop offset="0" stopColor="rgba(255,255,255,.13)" /><stop offset="1" stopColor="rgba(255,255,255,.02)" />
        </radialGradient>
        <linearGradient id="hx-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(var(--accent-rgb),.42)" /><stop offset="1" stopColor="rgba(var(--accent-rgb),0)" />
        </linearGradient>
        <clipPath id="hx-globe-clip"><circle cx="120" cy="90" r="57" /></clipPath>
      </defs>
    </svg>
  );
}

const PLATE = { fill: "url(#hx-plate)", stroke: "rgba(255,255,255,.11)" };

/** Three transducer bays. Neutral silhouettes — the point is "any of them", not a vendor. */
const ArtProbes = (
  <svg viewBox="0 0 240 180" fill="none" aria-hidden="true">
    {[10, 88, 166].map((x, i) => {
      const cx = x + 32;
      const live = i === 1;
      return (
        <g key={x}>
          <rect x={x} y="18" width="64" height="144" rx="18" {...PLATE} stroke={live ? "rgba(var(--accent-rgb),.4)" : PLATE.stroke} />
          {live && <path d={`M${cx - 9} 120 L${cx - 21} 154 Q${cx} 161 ${cx + 21} 154 L${cx + 9} 120 Z`} fill="url(#hx-beam)" />}
          {/* Handle, then the footprint that touches the patient — phased, linear, curved. */}
          <rect x={cx - 10} y="46" width="20" height="60" rx="10" fill="url(#hx-shell)" />
          {i === 0 && <rect x={cx - 8} y="102" width="16" height="14" rx="4" fill="url(#hx-shell)" />}
          {i === 1 && <rect x={cx - 16} y="102" width="32" height="14" rx="4" fill="url(#hx-shell)" />}
          {i === 2 && <path d={`M${cx - 15} 102 h30 a15 15 0 0 1 -30 0 z`} fill="url(#hx-shell)" />}
          <rect x={cx - 4} y="56" width="9" height="3" rx="1.5" fill="rgba(0,0,0,.3)" />
          <path d={`M${cx} 46 v-16`} stroke="rgba(255,255,255,.16)" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      );
    })}
  </svg>
);

/** Data residency: one sphere, a few sites, no claim about which regions are live. */
const ArtGlobe = (
  <svg viewBox="0 0 240 180" fill="none" aria-hidden="true">
    <ellipse cx="120" cy="90" rx="94" ry="37" stroke="rgba(255,255,255,.09)" transform="rotate(-22 120 90)" />
    <circle cx="120" cy="90" r="70" fill="url(#hx-sphere)" stroke="rgba(255,255,255,.14)" />
    <g clipPath="url(#hx-globe-clip)" stroke="rgba(255,255,255,.1)">
      <ellipse cx="120" cy="90" rx="70" ry="70" /><ellipse cx="120" cy="90" rx="43" ry="70" /><ellipse cx="120" cy="90" rx="16" ry="70" />
      <path d="M50 90h140" /><ellipse cx="120" cy="90" rx="65" ry="12" transform="translate(0 -33)" /><ellipse cx="120" cy="90" rx="65" ry="12" transform="translate(0 33)" />
    </g>
    {/* Suggestive landmasses, scaled with the sphere rather than redrawn. */}
    <g clipPath="url(#hx-globe-clip)" fill="rgba(255,255,255,.07)" transform="translate(120 90) scale(1.228) translate(-120 -90)">
      <path d="M78 58c12-5 24 1 30 8s-2 13-11 15-16-3-22-9-5-11 3-14z" />
      <path d="M126 74c14-4 27 3 30 14s-8 22-20 22-19-8-19-18 3-16 9-18z" />
      <path d="M96 112c9-3 18 2 19 9s-7 12-15 10-11-16-4-19z" />
    </g>
    {/* Sites and one link, drawn generically: no named region is claimed. */}
    <path d="M84 60q34-16 66 12" stroke="rgba(var(--accent-rgb),.55)" strokeWidth="1.4" strokeDasharray="3 4" />
    <g><circle cx="84" cy="60" r="12" fill="rgba(var(--accent-rgb),.14)" /><circle cx="84" cy="60" r="4.6" fill="var(--accent)" /></g>
    <g><circle cx="156" cy="74" r="12" fill="rgba(var(--accent-rgb),.14)" /><circle cx="156" cy="74" r="4.6" fill="var(--accent)" /></g>
    <g><circle cx="108" cy="132" r="10" fill="rgba(var(--accent-rgb),.12)" /><circle cx="108" cy="132" r="4" fill="var(--accent)" /></g>
  </svg>
);

/** A study frame with a segmentation contour and two calipers across it. */
const ArtMeasure = (
  <svg viewBox="0 0 240 180" fill="none" aria-hidden="true">
    <rect x="20" y="16" width="200" height="148" rx="16" {...PLATE} />
    <path d="M20 40h200" stroke="rgba(255,255,255,.08)" />
    <g fill="rgba(255,255,255,.2)"><circle cx="36" cy="28" r="3" /><circle cx="46" cy="28" r="3" /><circle cx="56" cy="28" r="3" /></g>
    <rect x="168" y="23" width="36" height="10" rx="5" fill="rgba(var(--accent-rgb),.22)" />
    <path d="M120 138C96 118 74 104 74 84c0-16 12-26 25-26 9 0 17 5 21 13 4-8 12-13 21-13 13 0 25 10 25 26 0 20-22 34-46 54z" fill="rgba(var(--accent-rgb),.07)" stroke="rgba(var(--accent-rgb),.75)" strokeWidth="1.7" />
    <path d="M120 132C99 114 80 102 80 85c0-13 10-21 21-21 8 0 15 4 19 11 4-7 11-11 19-11 11 0 21 8 21 21 0 17-19 29-40 47z" stroke="rgba(var(--accent-rgb),.3)" strokeWidth="1" strokeDasharray="3 4" />
    <g stroke="var(--accent)" strokeWidth="1.2">
      <path d="M74 82h92" strokeDasharray="4 4" /><path d="M92 110h56" strokeDasharray="4 4" />
      <path d="M74 76v12M166 76v12M92 104v12M148 104v12" />
    </g>
  </svg>
);

/** Review states: accepted, being edited, accepted. Disagreement is a first-class state. */
const ArtReview = (
  <svg viewBox="0 0 240 180" fill="none" aria-hidden="true">
    {[0, 1, 2].map((i) => {
      const y = 26 + i * 46;
      const live = i === 1;
      return (
        <g key={i}>
          <rect x="18" y={y} width="204" height="36" rx="12" {...PLATE} stroke={live ? "rgba(var(--accent-rgb),.45)" : PLATE.stroke} />
          <rect x="34" y={y + 12} width={[62, 84, 48][i]} height="7" rx="3.5" fill="rgba(255,255,255,.3)" />
          <rect x={[108, 130, 94][i]} y={y + 12} width="34" height="7" rx="3.5" fill="rgba(255,255,255,.14)" />
          {live
            ? <g stroke="var(--accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={`M186 ${y + 24} l14-14 5 5 -14 14 -6 1 1-6z`} fill="none" /></g>
            : <path d={`M188 ${y + 18} l5 5 10-11`} stroke="var(--accent)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        </g>
      );
    })}
  </svg>
);

/** Handback: a structured report leaving for the hospital's own systems. */
const ArtHandback = (
  <svg viewBox="0 0 240 180" fill="none" aria-hidden="true">
    <rect x="66" y="6" width="150" height="110" rx="14" fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.07)" />
    <rect x="38" y="22" width="150" height="110" rx="14" {...PLATE} />
    <rect x="54" y="38" width="52" height="9" rx="4.5" fill="rgba(var(--accent-rgb),.5)" />
    <g fill="rgba(255,255,255,.22)">
      <rect x="54" y="60" width="108" height="7" rx="3.5" /><rect x="54" y="76" width="80" height="7" rx="3.5" />
      <rect x="54" y="92" width="96" height="7" rx="3.5" /><rect x="54" y="108" width="58" height="7" rx="3.5" />
    </g>
    {/* Out of Horalix, into the hospital's record. */}
    <path d="M113 132v16" stroke="rgba(var(--accent-rgb),.5)" strokeWidth="1.4" strokeDasharray="3 4" />
    <rect x="53" y="148" width="120" height="26" rx="13" fill="rgba(var(--accent-rgb),.12)" stroke="rgba(var(--accent-rgb),.42)" />
    <rect x="68" y="157" width="9" height="9" rx="2.5" fill="var(--accent)" />
    <rect x="86" y="158" width="42" height="7" rx="3.5" fill="rgba(255,255,255,.28)" />
    <path d="M140 161h14M149 156l5 5-5 5" stroke="var(--accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Two lines of copy per card, deliberately. The detail lives in the sections below. */
const stages: Stage[] = [
  {
    id: "scanner",
    label: "Echo",
    title: "Any echo scanner",
    copy: "Works downstream of acquisition on standard DICOM. No new hardware.",
    icon: IconWave,
    art: ArtProbes,
    photo: { src: "/workflow/echo-scanners.webp", width: 1100, height: 619 },
    external: true,
  },
  {
    id: "intake",
    label: "Intake",
    title: "Study intake",
    copy: "Eligible studies arrive with identifier, date, and processing state visible.",
    icon: IconCloud,
    art: ArtGlobe,
    photo: { src: "/workflow/study-intake.webp", width: 1100, height: 1100 },
  },
  {
    id: "ai",
    label: "AI results",
    title: "AI results",
    copy: "Measurements drawn on the study itself, each one toggled and traceable.",
    icon: IconSparkle,
    art: ArtMeasure,
    photo: { src: "/workflow/ai-results.webp", width: 1100, height: 733, tint: true },
  },
  {
    id: "review",
    label: "Review",
    title: "Clinician review",
    // Non-breaking hyphen: "sign-off" split across lines reads as a typo.
    copy: "Edit, accept, or reject any suggestion before sign‑off.",
    icon: IconReview,
    art: ArtReview,
    photo: { src: "/workflow/clinician-review.webp", width: 1100, height: 733, tint: true },
  },
  {
    id: "report",
    label: "Report",
    title: "Report handback",
    copy: "Structured output returns to the hospital's own reporting path.",
    icon: IconReport,
    art: ArtHandback,
    photo: { src: "/workflow/report-handback.webp", width: 880, height: 1100, tint: true },
    external: true,
  },
];

export function WorkflowRail({
  eyebrow = "How it fits",
  heading = "Between the scanner you own and the report you sign.",
  lede = "Horalix sits in the gap after acquisition and before sign-off. The scanner and the reporting record stay yours.",
}: { eyebrow?: string; heading?: string; lede?: string }) {
  const owned = stages.filter((stage) => !stage.external);

  return (
    <section className="section-tight shell workflow-rail" aria-labelledby="workflow-rail-heading">
      <WorkflowRailDefs />
      <div className="section-heading">
        <div><p className="eyebrow">{eyebrow}</p><h2 id="workflow-rail-heading">{heading}</h2></div>
        <p className="lede">{lede}</p>
      </div>

      {/* The bracket is decorative: the same boundary is stated in each card's copy. */}
      <div className="workflow-hub" aria-hidden="true">
        <div className="workflow-hub-inner">
          <span className="workflow-hub-name">Horalix</span>
          <div className="workflow-hub-stages">
            <span className="workflow-hub-stage is-external">{IconWave}<b>Echo</b></span>
            <span className="workflow-hub-arrow">→</span>
            <span className="workflow-hub-owned">
              {owned.map((stage) => <span className="workflow-hub-stage" key={stage.id}>{stage.icon}<b>{stage.label}</b></span>)}
            </span>
            <span className="workflow-hub-arrow">→</span>
            <span className="workflow-hub-stage is-external">{IconReport}<b>Report</b></span>
          </div>
        </div>
      </div>

      {/* Horizontal rail: readable at any width without stacking five tall cards. A scrolling
          region has to be reachable by keyboard (WCAG 2.1.1), which needs an explicit
          tabIndex here — the named region is what makes that focus stop meaningful. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <ol className="workflow-cards" role="region" tabIndex={0} aria-label="Workflow stages, scrollable">
        {stages.map((stage, index) => (
          <li className={stage.external ? "workflow-card is-external" : "workflow-card"} key={stage.id} id={`stage-${stage.id}`}>
            <header>
              <span className="workflow-card-no">{index + 1}</span>
              {/* The dashed border carries the same meaning; the chip names it once. */}
              {stage.external && <span className="workflow-card-tag">Yours</span>}
              <span className="workflow-card-icon">{stage.icon}</span>
            </header>
            <h3>{stage.title}</h3>
            <p>{stage.copy}</p>
            <div className="workflow-card-art">
              {USE_RENDERED_ART && stage.photo
                ? <Image className={stage.photo.tint ? "workflow-art-img is-tinted" : "workflow-art-img"} src={stage.photo.src} alt="" aria-hidden="true" width={stage.photo.width} height={stage.photo.height} sizes="(max-width: 1240px) 262px, 220px" />
                : stage.art}
            </div>
          </li>
        ))}
      </ol>
      <p className="microcopy workflow-rail-note">Pilot-stage and pre-clearance. Deployment shape and export destinations are scoped per site.</p>
    </section>
  );
}
