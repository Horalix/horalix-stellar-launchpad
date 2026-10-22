export type ClaimStatus = "approved" | "pending" | "blocked";

export type Claim = {
  id: string;
  claim: string;
  fallback: string;
  classification: "company" | "internal-benchmark" | "external-evidence" | "regulatory";
  status: ClaimStatus;
  source: string;
  productVersion: string;
  conditions: string;
  owner: string;
  approvedOn: string | null;
  reviewBy: string;
  allowedPages: string[];
  disclosure: string;
};

export const claims: Claim[] = [
  {
    id: "status-pilot-stage",
    claim: "Horalix is a pilot-stage, pre-clearance clinical AI product.",
    fallback: "Horalix is being developed and evaluated for pilot workflows.",
    classification: "regulatory",
    status: "approved",
    source: "Company product and regulatory status",
    productVersion: "Current pilot build",
    conditions: "Use with the pre-clearance disclosure and never imply routine clinical use.",
    owner: "Regulatory",
    approvedOn: "2026-08-13",
    reviewBy: "2026-11-13",
    allowedPages: ["all"],
    disclosure: "Pilot-stage. Pre-clearance. Not for independent diagnosis.",
  },
  {
    id: "workflow-dicom",
    claim: "Horalix accepts DICOM echocardiography studies and organizes AI-assisted measurements for clinician review.",
    fallback: "Horalix is designed around DICOM echocardiography workflows.",
    classification: "company",
    status: "approved",
    source: "Product workflow specification",
    productVersion: "Current pilot build",
    conditions: "Compatibility remains dependent on source-system configuration and pilot scope.",
    owner: "Product",
    approvedOn: "2026-08-13",
    reviewBy: "2026-11-13",
    allowedPages: ["/", "/platform", "/for-hospitals", "/for-clinicians"],
    disclosure: "Integration details are confirmed during pilot scoping.",
  },
  {
    id: "workflow-clinician-control",
    claim: "Clinicians retain final review and sign-off.",
    fallback: "Horalix is designed to support, not replace, clinician review.",
    classification: "regulatory",
    status: "approved",
    source: "Intended workflow specification",
    productVersion: "Current pilot build",
    conditions: "Always pair with human-oversight language.",
    owner: "Clinical",
    approvedOn: "2026-08-13",
    reviewBy: "2026-11-13",
    allowedPages: ["all"],
    disclosure: "Outputs require clinician review and are not an independent diagnosis.",
  },
  {
    id: "performance-processing-time",
    claim: "Horalix prepares a review-ready output in approximately 10 seconds per study.",
    fallback: "Designed to reduce manual measurement and reporting steps; timing varies by study and environment.",
    classification: "internal-benchmark",
    status: "approved",
    source: "Company-confirmed internal benchmark on the current pilot build",
    productVersion: "Current pilot build",
    conditions: "Always publish as an internal benchmark with the timing-variability disclosure attached. Never present as a clinical performance claim or as a guaranteed service level.",
    owner: "Clinical validation",
    approvedOn: "2026-08-14",
    reviewBy: "2026-11-14",
    allowedPages: ["/", "/platform", "/for-hospitals", "/for-clinicians", "/evidence", "/investors"],
    disclosure: "Internal benchmark only; not a clinical performance claim. Timing varies by study, view quality, and environment.",
  },
  {
    id: "output-count",
    claim: "Horalix prepares 50+ unique cardiac measurements and approximately 80 structured outputs per study.",
    fallback: "Horalix organizes structured measurements and report-ready outputs for review.",
    classification: "internal-benchmark",
    status: "approved",
    source: "Company-confirmed output taxonomy for the current pilot build",
    productVersion: "Current pilot build",
    conditions: "Publish as a capability count for the current build, never as a per-study guarantee. Availability depends on the views captured.",
    owner: "Product",
    approvedOn: "2026-08-14",
    reviewBy: "2026-11-14",
    allowedPages: ["/", "/platform", "/for-hospitals", "/for-clinicians", "/evidence", "/investors"],
    disclosure: "Available outputs vary by view, study quality, and product version.",
  },
  {
    id: "active-pilot-collaborations",
    claim: "Horalix has three company-confirmed active pilot collaborations: UKC Maribor, ASA Hospital, and Poliklinika Dr Nabil.",
    fallback: "Horalix is working with clinical partners in scoped evaluation settings.",
    classification: "company",
    status: "approved",
    source: "Company confirmation; Horalix public updates for UKC Maribor and Poliklinika Dr Nabil",
    productVersion: "Current pilot build",
    conditions: "Use company-confirmed language. Do not imply completed validation, routine clinical use, or results.",
    owner: "Company",
    approvedOn: "2026-08-14",
    reviewBy: "2026-11-14",
    allowedPages: ["/", "/about", "/investors", "/news", "/for-hospitals"],
    disclosure: "Pilot collaboration describes a scoped evaluation relationship; it is not completed clinical validation or regulatory clearance.",
  },
  {
    id: "program-techstars",
    claim: "Horalix was selected for the Techstars Sarajevo Founder Catalyst Fall 2025 cohort.",
    fallback: "Horalix participated in a Sarajevo founder-development program.",
    classification: "external-evidence",
    status: "approved",
    source: "Techstars program announcement, October 1, 2025",
    productVersion: "Not applicable",
    conditions: "Name the program precisely as Founder Catalyst; do not call it investment or clinical validation.",
    owner: "Company",
    approvedOn: "2026-08-14",
    reviewBy: "2027-08-14",
    allowedPages: ["/", "/about", "/investors", "/news", "/press"],
    disclosure: "Program participation does not imply product validation or regulatory endorsement.",
  },
  {
    id: "program-nvidia-inception",
    claim: "Horalix is a member of NVIDIA Inception.",
    fallback: "Horalix participates in a technology startup-support program.",
    classification: "external-evidence",
    status: "approved",
    source: "NVIDIA Inception program; Horalix announcement and Klix report, July 16, 2026",
    productVersion: "Not applicable",
    conditions: "Describe membership only; do not imply NVIDIA investment, certification, endorsement, or clinical validation.",
    owner: "Company",
    approvedOn: "2026-08-14",
    reviewBy: "2027-08-14",
    allowedPages: ["/", "/about", "/investors", "/news", "/press"],
    disclosure: "Membership is a startup-support relationship, not product or clinical validation.",
  },
];

export function approvedClaim(id: string) {
  const item = claims.find((claim) => claim.id === id);
  if (!item) throw new Error(`Unknown claim: ${id}`);
  return item.status === "approved" ? item.claim : item.fallback;
}

export type Metric = {
  id: string;
  claimId: string;
  value: string;
  label: string;
  detail: string;
};

/**
 * Display figures live here, beside the claim that authorises them, because
 * scripts/claims-audit.mjs rejects numeric performance strings everywhere else
 * under app/. A metric is only ever rendered when its claim is approved.
 */
const metricRegister: Metric[] = [
  {
    id: "measurements",
    claimId: "output-count",
    value: "50+",
    label: "Unique cardiac measurements",
    detail: "Prepared from the standard views captured in the study.",
  },
  {
    id: "outputs",
    claimId: "output-count",
    value: "~80",
    label: "Structured outputs per study",
    detail: "Measurements, derived values, and report-ready fields organised for review.",
  },
  {
    id: "time-to-review",
    claimId: "performance-processing-time",
    value: "~10s",
    label: "From study intake to review-ready",
    detail: "Internal benchmark on the current pilot build; timing varies by study and environment.",
  },
];

export const metricDisclosure =
  "Internal benchmarks measured on the current pilot build. Figures describe prepared output, not diagnostic performance, and vary by study, view quality, and environment. Every output requires clinician review.";

/** Returns the metric only when its underlying claim is approved, otherwise null. */
export function metric(id: string): Metric | null {
  const item = metricRegister.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown metric: ${id}`);
  const claim = claims.find((entry) => entry.id === item.claimId);
  if (!claim) throw new Error(`Metric ${id} references unknown claim: ${item.claimId}`);
  return claim.status === "approved" ? item : null;
}

/** Metrics for a given page path, filtered by claim approval and page allowlist. */
export function metricsFor(path: string): Metric[] {
  return metricRegister.filter((entry) => {
    const claim = claims.find((item) => item.id === entry.claimId);
    if (!claim || claim.status !== "approved") return false;
    return claim.allowedPages.includes("all") || claim.allowedPages.includes(path);
  });
}
