import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Check, Clock, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  evidenceSourceOrder,
  evidenceSources,
  hospitalValuePoints,
  investorSignalPoints,
} from "@/content/authorityData";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceId = "S1" | "S2" | "S3";

type Source = {
  id: SourceId;
  shortLabel: string;
  fullLabel: string;
  url: string;
};

type WorkflowLane = {
  title: string;
  badge: string;
  sourceId?: SourceId;
  time: string;
  summary: string;
  detail: string;
  stages: string[];
  progressPercent: number;
  variant: "winner" | "baseline";
};

type ComparisonRow = {
  metric: string;
  advantage: string;
  sourceIds?: SourceId[];
  horalix: string;
  traditional: string;
};

type OutcomeCell = {
  title: string;
  eyebrow: string;
  points: string[];
  sourceId?: SourceId;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const SOURCES = evidenceSources as Record<SourceId, Source>;
const SOURCE_ORDER = evidenceSourceOrder as SourceId[];

const WORKFLOW_LANES: WorkflowLane[] = [
  {
    title: "Horalix AI",
    badge: "Internal benchmark",
    time: "~10s",
    summary: "Full measurement output after acquisition.",
    detail: "Measurements are generated first, then clinically reviewed.",
    stages: ["Acquisition complete", "AI measures", "Clinical review"],
    progressPercent: 14,
    variant: "winner",
  },
  {
    title: "Traditional Workflow",
    badge: "S1",
    sourceId: "S1",
    time: "45–90 min",
    summary: "Manual measurement and reporting loop.",
    detail: "Measurement, entry, and reporting stay manual and sequential.",
    stages: ["Acquisition complete", "Manual measure", "Manual report"],
    progressPercent: 100,
    variant: "baseline",
  },
];

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    metric: "Analysis Time",
    advantage: "Faster",
    sourceIds: ["S1"],
    horalix: "~10s to full measurement output after capture.",
    traditional: "Manual post-scan work extends reporting by 45–90 min.",
  },
  {
    metric: "Diagnostic Consistency",
    advantage: "More standardized",
    sourceIds: ["S2"],
    horalix: "94%+ benchmark context in AI-assisted FoCUS.",
    traditional: "Greater non-AI variability and heavier operator dependence.",
  },
  {
    metric: "Measurement Coverage",
    advantage: "More comprehensive",
    sourceIds: ["S3"],
    horalix: "50+ unique measurements and ~80 total structured outputs.",
    traditional: "Fewer parameters with a higher manual interaction burden.",
  },
  {
    metric: "Workflow Burden",
    advantage: "Lower repetitive load",
    sourceIds: ["S1", "S3"],
    horalix: "Structured output arrives without repetitive manual assembly.",
    traditional: "Repeated measurement and reporting steps strain throughput.",
  },
];

// [UX][PSYCH] Full bullet points from authorityData — richer than previous 2-point lists
const OUTCOME_CELLS: OutcomeCell[] = [
  {
    title: "Hospital Value",
    eyebrow: "Operational impact",
    sourceId: "S3",
    points: hospitalValuePoints as string[],
  },
  {
    title: "Investor Signal",
    eyebrow: "Business signal",
    points: investorSignalPoints as string[],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SourceChip = ({ sourceId }: { sourceId: SourceId }) => {
  const source = SOURCES[sourceId];
  // [FIX] Null-guard for missing source data
  if (!source) return null;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${source.id}: ${source.fullLabel}`}
      className="inline-flex items-center rounded-full border border-accent/18 bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent transition-colors hover:border-accent/30 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {source.id}
    </a>
  );
};

const SourceLegendLink = ({ sourceId }: { sourceId: SourceId }) => {
  const source = SOURCES[sourceId];
  // [FIX] Null-guard for missing source data
  if (!source) return null;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${source.id}: ${source.fullLabel}`}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
        {source.id}
      </span>
      <span>{source.shortLabel}</span>
    </a>
  );
};

const ProofBadge = ({
  label,
  sourceId,
  tone = "neutral",
}: {
  label: string;
  sourceId?: SourceId;
  tone?: "accent" | "neutral";
}) =>
  sourceId ? (
    <SourceChip sourceId={sourceId} />
  ) : (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
        tone === "accent"
          ? "border-accent/18 bg-accent/[0.07] text-accent"
          : "border-border bg-background/88 text-muted-foreground",
      )}
    >
      {label}
    </span>
  );

// ─── Main export ──────────────────────────────────────────────────────────────

export const TimeToValueComparisonSection = () => {
  const location = useLocation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // [FIX] Smooth scroll for same-page anchor links
  const handleAnchorClick = (event: MouseEvent, href: string) => {
    if (href.startsWith("/#") && location.pathname === "/") {
      event.preventDefault();
      const sectionId = href.substring(2);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // [A11Y] Respect prefers-reduced-motion OS setting
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);
    sync();

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", sync);
      return () => mediaQuery.removeEventListener("change", sync);
    }

    // [FIX] Legacy browser fallback for matchMedia event listener
    mediaQuery.addListener(sync);
    return () => mediaQuery.removeListener(sync);
  }, []);

  // [PERF] IntersectionObserver for lazy reveal — disconnects after first trigger
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const target = sectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const revealStyle = (stage: number): CSSProperties =>
    ({ ["--ttv-delay" as string]: `${stage * 90}ms` }) as CSSProperties;

  return (
    <section
      ref={sectionRef}
      id="time-to-value"
      aria-labelledby="time-to-value-heading"
      className="relative scroll-mt-24 overflow-hidden border-b border-border bg-card px-5 py-20 sm:px-6 md:scroll-mt-28 lg:px-12 lg:py-24 lg:scroll-mt-32"
    >
      {/* [ART] Depth background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.07),transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.88))]"
      />
      {/* [ART] Vertical rule lines — clinical grid feel */}
      <div
        aria-hidden="true"
        className="absolute left-5 top-0 hidden h-full w-px bg-border/60 sm:left-6 lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute right-5 top-0 hidden h-full w-px bg-border/60 sm:right-6 lg:block"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 lg:gap-6">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <header
          style={revealStyle(0)}
          className={cn(
            "ttv-reveal grid gap-6 border-b border-border/70 pb-7 lg:grid-cols-[minmax(0,1fr)_280px]",
            isVisible && "ttv-reveal-visible",
          )}
        >
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-accent">
              Time To Value
            </p>
            <h2
              id="time-to-value-heading"
              className="mt-4 max-w-3xl font-space text-4xl font-bold tracking-tight text-primary md:text-5xl"
            >
              From manual echo measurement to report-ready output in seconds.
            </h2>
            <p className="mt-5 max-w-2xl border-l-2 border-accent pl-5 text-[15px] leading-7 text-muted-foreground md:pl-6 md:text-lg">
              Horalix compresses the post-acquisition workflow into a faster, more standardized
              review step.
            </p>
            {/* [PSYCH][ART] Anchors the core time claim visually before the user scrolls to the comparison */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                ~10s vs up to 90 min — compressed
              </span>
            </div>
          </div>

          <aside
            aria-label="Why time-to-value matters"
            className="border border-border/80 bg-background/85 px-5 py-5"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Why it matters
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-primary">Operationally</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Less time spent on repetitive measurement and manual report assembly.
                </p>
              </div>
              <div className="border-t border-border/70 pt-4">
                <p className="text-sm font-semibold text-primary">Commercially</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  A more standardized workflow is easier to deploy, justify, and scale.
                </p>
              </div>
            </div>
          </aside>
        </header>

        {/* ── Workflow comparison ───────────────────────────────────────────── */}
        <article
          style={revealStyle(1)}
          aria-label="Workflow difference after image acquisition"
          className={cn(
            "ttv-reveal overflow-hidden border border-border/80 bg-background/92 shadow-[0_28px_80px_rgba(15,23,42,0.08)]",
            isVisible && "ttv-reveal-visible",
          )}
        >
          {/* ── Lanes ─────────────────────────────────────────────────────── */}
          <div className="relative grid lg:grid-cols-2">
            {WORKFLOW_LANES.map((lane, index) => {
              const isWinner = lane.variant === "winner";

              return (
                <div
                  key={lane.title}
                  className={cn(
                    "relative px-5 py-5 sm:px-6 sm:py-6",
                    index === 0 && "border-b border-border/70 lg:border-b-0 lg:border-r",
                    isWinner
                      ? "bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_42%),linear-gradient(180deg,rgba(239,246,255,0.88),rgba(255,255,255,0.98))]"
                      : "bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.10),transparent_42%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.98))]",
                  )}
                >
                  {/* [ART] Top accent line — 2px for winner, 1px for baseline */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 top-0",
                      isWinner
                        ? "h-[2px] bg-[linear-gradient(90deg,rgba(37,99,235,0),rgba(37,99,235,0.85),rgba(37,99,235,0))]"
                        : "h-px bg-[linear-gradient(90deg,rgba(100,116,139,0),rgba(100,116,139,0.35),rgba(100,116,139,0))]",
                    )}
                  />

                  <div className="flex items-start justify-between gap-4">
                    {/* [ART][UX] Lane icon gives instant visual identity before reading the title */}
                    <div className="flex items-start gap-3">
                      <div
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                          isWinner
                            ? "border-accent/25 bg-accent/10 text-accent"
                            : "border-border bg-secondary/80 text-muted-foreground",
                        )}
                      >
                        {isWinner ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          After image acquisition
                        </p>
                        <h3 className="mt-1.5 font-space text-[26px] font-bold leading-none text-primary sm:text-[30px]">
                          {lane.title}
                        </h3>
                      </div>
                    </div>
                    <ProofBadge
                      label={lane.badge}
                      sourceId={lane.sourceId}
                      tone={isWinner ? "accent" : "neutral"}
                    />
                  </div>

                  <div className="mt-7 space-y-4">
                    <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-4">
                      <div>
                        {/* [PSYCH][ART] Winner time in accent blue — makes the gap visceral */}
                        <p
                          className={cn(
                            "font-space text-4xl font-bold tracking-tight sm:text-5xl",
                            isWinner ? "text-accent" : "text-primary",
                          )}
                        >
                          {lane.time}
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                          {lane.summary}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "hidden shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] sm:inline-flex",
                          isWinner ? "text-accent" : "text-muted-foreground",
                        )}
                      >
                        {isWinner ? "Compressed cycle" : "Manual loop"}
                      </span>
                    </div>

                    <p
                      className={cn(
                        "max-w-md text-sm leading-relaxed",
                        isWinner ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {lane.detail}
                    </p>

                    <div className="space-y-3">
                      {/* [PERF][ART] GPU-accelerated scaleX animation for progress bar */}
                      <div className="h-2 overflow-hidden rounded-full bg-border/55">
                        <div
                          aria-hidden="true"
                          className={cn(
                            "ttv-progress-bar h-full rounded-full",
                            isVisible && "ttv-progress-bar-visible",
                            isWinner
                              ? "bg-[linear-gradient(90deg,rgba(37,99,235,0.98),rgba(14,165,233,0.82))]"
                              : "bg-[linear-gradient(90deg,rgba(148,163,184,0.8),rgba(71,85,105,0.7))]",
                          )}
                          style={{ width: `${lane.progressPercent}%` } as CSSProperties}
                        />
                      </div>

                      {/* [UX][ART] Stage pipeline — numbered indicators convey ordered sequence */}
                      <div className="grid grid-cols-3 gap-2">
                        {lane.stages.map((stage, stageIdx) => (
                          <div key={stage} className="flex flex-col items-center gap-1.5">
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold tabular-nums",
                                isWinner
                                  ? "bg-accent/15 text-accent"
                                  : "bg-border/70 text-muted-foreground",
                              )}
                            >
                              {stageIdx + 1}
                            </span>
                            <span
                              className={cn(
                                "min-h-[44px] w-full border px-2 py-2 text-center text-[10px] font-medium leading-tight sm:text-[11px]",
                                isWinner
                                  ? "border-accent/18 bg-background/88 text-foreground"
                                  : "border-border bg-background/85 text-muted-foreground",
                              )}
                            >
                              {stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* [ART][PSYCH] "VS" badge straddles the dividing line — frames this as a competition */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background font-mono text-[10px] font-bold text-muted-foreground shadow-sm">
                VS
              </span>
            </div>
          </div>

          {/* ── Comparison table ───────────────────────────────────────────── */}
          <div className="border-t border-border/70 bg-secondary/35">
            {/* Desktop column header row */}
            <div className="hidden lg:grid lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] lg:border-b lg:border-border/70">
              <div className="px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Comparison
              </div>
              <div className="border-l border-border/70 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Horalix AI
              </div>
              <div className="border-l border-border/70 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Traditional
              </div>
            </div>

            <div
              aria-label="Feature comparison between Horalix AI and Traditional Workflow"
              className="grid gap-px bg-border/70"
            >
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.metric}
                  className="grid gap-px bg-border/70 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]"
                >
                  {/* Metric label */}
                  <div className="bg-secondary/55 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-primary">{row.metric}</h3>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                          {row.advantage}
                        </p>
                      </div>
                      {row.sourceIds && (
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {row.sourceIds.map((sourceId) => (
                            <SourceChip key={sourceId} sourceId={sourceId} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horalix value — [PSYCH] checkmark reinforces the winner narrative */}
                  <div className="bg-background px-5 py-4">
                    <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent lg:hidden">
                      Horalix AI
                    </p>
                    <div className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <p className="text-sm leading-relaxed text-foreground">{row.horalix}</p>
                    </div>
                  </div>

                  {/* Traditional value */}
                  <div className="bg-background/88 px-5 py-4">
                    <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:hidden">
                      Traditional
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {row.traditional}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* ── Outcomes + footer ─────────────────────────────────────────────── */}
        <div
          style={revealStyle(3)}
          className={cn("ttv-reveal space-y-3", isVisible && "ttv-reveal-visible")}
        >
          <article
            aria-label="Business and operational outcomes"
            className="overflow-hidden border border-border/80 bg-background/92"
          >
            <div className="grid gap-px bg-border/70 md:grid-cols-2">
              {OUTCOME_CELLS.map((cell) => (
                <div key={cell.title} className="bg-background/96 px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {cell.eyebrow}
                      </p>
                      <h3 className="mt-1 font-space text-lg font-bold text-primary">
                        {cell.title}
                      </h3>
                    </div>
                    {cell.sourceId && <SourceChip sourceId={cell.sourceId} />}
                  </div>

                  {/* [UX] Full 4-point lists from authorityData — richer than previous 2-point version */}
                  <ul className="mt-4 grid gap-2.5" aria-label={`${cell.title} points`}>
                    {cell.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          {/* Sources footer + CTA */}
          <footer className="overflow-hidden border border-border/80 bg-secondary/35">
            <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_auto] lg:items-center lg:gap-5">
              <div className="flex flex-wrap items-center gap-2">
                {SOURCE_ORDER.map((sourceId) => (
                  <SourceLegendLink key={sourceId} sourceId={sourceId} />
                ))}
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Internal benchmark = measured Horalix product performance.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                <Link
                  to="/evidence"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View evidence page
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>

                <Button
                  asChild
                  className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/92 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Link
                    to="/#contact"
                    onClick={(event) => handleAnchorClick(event, "/#contact")}
                  >
                    Book a Demo
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
};
