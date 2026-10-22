export type ResourceCluster = "Buyer guides" | "Clinical workflow" | "Integration and deployment" | "Governance and evidence";

export type Resource = {
  slug: string;
  label: string;
  cluster: ResourceCluster;
  title: string;
  description: string;
  reviewed: string;
  readTime: string;
  author: { name: string; role: string; id: string };
  reviewer: { name: string; role: string; id: string };
  answer: string;
  sections: { title: string; body: string[] }[];
  sources: { title: string; href: string }[];
  related: { title: string; href: string }[];
};

export const clusters: { name: ResourceCluster; blurb: string }[] = [
  { name: "Buyer guides", blurb: "How to judge a clinical-AI product before it reaches a committee." },
  { name: "Clinical workflow", blurb: "Where echo reporting time goes, and what changes when it is assisted." },
  { name: "Integration and deployment", blurb: "The technical questions that decide whether a pilot ever starts." },
  { name: "Governance and evidence", blurb: "Regulation, data protection, and reading the literature honestly." },
];

export const resources: Resource[] = [
  {
    slug: "ai-echocardiography-software-guide",
    label: "Field guide",
    cluster: "Buyer guides",
    title: "What AI echocardiography software actually does",
    description: "A plain description of where AI sits in the echo lab, what it prepares, what it cannot decide, and how to read vendor claims.",
    reviewed: "14 August 2026",
    readTime: "9 min",
    author: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    reviewer: { name: "Neuman Alkhalil", role: "Chief Science Officer", id: "neuman-alkhalil" },
    answer: "AI echocardiography software analyses acquired cardiac ultrasound images to recognise views, delineate structures, and prepare structured measurements for a clinician to inspect and approve. It sits between image acquisition and the signed report. It does not acquire the study, does not decide the diagnosis, and does not remove the clinician from the reporting path.",
    sections: [
      {
        title: "Where it sits in the lab",
        body: [
          "An echocardiogram becomes a report through a sequence of steps: the sonographer acquires standard views, someone extracts the quantitative values that reporting standards expect, those values are assembled into a structured report, and a clinician interprets the whole picture and signs it.",
          "AI echocardiography software targets the middle of that sequence. It takes the acquired study and prepares the quantitative layer—view recognition, structure delineation, and derived values—so that the clinician begins from organised material rather than an empty template.",
          "This is a narrower role than the marketing around clinical AI usually suggests. The interesting question is not whether a model can identify a chamber. It is whether the prepared result is accurate enough, fast enough, and legible enough that checking it is genuinely quicker than producing it by hand.",
        ],
      },
      {
        title: "What it prepares",
        body: [
          "Chamber quantification is the largest category. The ASE and EACVI recommendations define how dimensions, volumes, and derived functional values should be obtained, and the number of individual values a complete study is expected to carry is substantial.",
          "Beyond quantification, software may prepare view classification, image-quality flags, structure contours shown as overlays, and report-ready fields mapped to the destination reporting system. Each of these is a preparation task with a checkable output, which is exactly why they suit automation.",
          "What software does not prepare is context. Prior studies, clinical history, the reason for referral, and the questions the referring physician actually asked all sit outside the pixel data and remain the clinician's to weigh.",
        ],
      },
      {
        title: "Reading vendor claims",
        body: [
          "Treat every performance figure as incomplete until you know four things: which product version produced it, on which dataset, under what reference standard, and in what environment. A figure without those four is a marketing artefact, not evidence.",
          "Distinguish claims about the model from claims about the workflow. A model can perform well in isolation and still fail to reduce anyone's work, because the reduction depends on review ergonomics, integration reliability, and how failures are surfaced.",
          "Ask directly what the software has not established. A vendor that cannot answer that question has either not looked or would rather you did not.",
        ],
      },
      {
        title: "Where Horalix sits",
        body: [
          "Horalix is pilot-stage and pre-clearance. It prepares structured measurements and overlays from DICOM echocardiography studies and presents them inside a clinician review path, with the clinician retaining final review and sign-off.",
          "It is not cleared or CE-marked as a medical device, has no completed clinical validation study, and is not authorised for routine clinical use. Those boundaries are published in the claim register rather than left to inference.",
        ],
      },
    ],
    sources: [
      { title: "ASE/EACVI recommendations for cardiac chamber quantification in adults", href: "https://pubmed.ncbi.nlm.nih.gov/25559473/" },
      { title: "Guidelines for the standardization of adult echocardiography reporting (ASE)", href: "https://pubmed.ncbi.nlm.nih.gov/40912865/" },
      { title: "FUTURE-AI international consensus guideline", href: "https://www.bmj.com/content/388/bmj-2024-081554" },
    ],
    related: [
      { title: "Explore the Horalix platform", href: "/platform" },
      { title: "Review the Horalix evidence boundary", href: "/evidence" },
    ],
  },
  {
    slug: "evaluating-pilot-stage-clinical-ai",
    label: "Buyer guide",
    cluster: "Buyer guides",
    title: "How to evaluate pilot-stage clinical AI",
    description: "A practical framework for separating a compelling demo from a responsible, testable clinical workflow.",
    reviewed: "13 August 2026",
    readTime: "7 min",
    author: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    reviewer: { name: "Affan Kapidzic", role: "Chief Technology Officer", id: "affan-kapidzic" },
    answer: "A strong pilot should define the intended workflow, the clinician’s decision rights, the validation boundary, failure handling, data governance, integration assumptions, and measurable success criteria before deployment begins.",
    sections: [
      {
        title: "Start with the decision, not the model",
        body: [
          "Document exactly where the software enters the echo workflow, what it produces, who reviews it, and what happens when the output is incomplete or implausible.",
          "This keeps a pilot focused on clinical utility and operational fit instead of a single headline metric.",
        ],
      },
      {
        title: "Demand a bounded evidence statement",
        body: [
          "Every result should identify the dataset, sample size, inclusion and exclusion criteria, reference standard, product version, environment, limitations, and review date.",
          "External literature can explain the field, but it cannot substitute for validation of a specific product version in its intended setting.",
        ],
      },
      {
        title: "Protect clinician agency",
        body: [
          "Reviewers need to see, adjust, accept, or reject outputs without being pushed toward automation bias. Clear uncertainty and traceability are workflow features, not decorative explainability.",
        ],
      },
    ],
    sources: [
      { title: "FUTURE-AI international consensus guideline", href: "https://www.bmj.com/content/388/bmj-2024-081554" },
      { title: "Clinician trust in healthcare AI — systematic review", href: "https://pubmed.ncbi.nlm.nih.gov/40772775/" },
    ],
    related: [
      { title: "Review the Horalix evidence boundary", href: "/evidence" },
      { title: "Plan a hospital evaluation", href: "/for-hospitals" },
    ],
  },
  {
    slug: "clinical-ai-procurement-checklist",
    label: "Procurement",
    cluster: "Buyer guides",
    title: "A procurement checklist for hospital clinical AI",
    description: "The questions clinical, IT, information governance, and finance each need answered before a clinical-AI purchase moves forward.",
    reviewed: "14 August 2026",
    readTime: "8 min",
    author: { name: "Amr Husain", role: "CFO & Co-Founder", id: "amr-husain" },
    reviewer: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    answer: "A clinical-AI purchase needs four separate reviews that rarely agree by default: clinical (does it fit the workflow and preserve decision rights), IT (does it integrate and fail safely), information governance (is the legal basis and data path defensible), and finance (is the value real and the exit clean). Run them in parallel with a shared document, not sequentially with hearsay.",
    sections: [
      {
        title: "The clinical review",
        body: [
          "The clinical question is not whether the software is impressive but whether it changes work for the better. Ask which role it affects, what that person stops doing, what they start doing, and how long the new task takes compared with the old one.",
          "Establish decision rights explicitly. Who may accept an output, who may override it, what is recorded when they do, and whether the record is available later. A system that makes overriding awkward will produce agreement that looks like validation and is not.",
          "Ask what happens on a bad day: a poor-quality study, an unusual anatomy, a view the software does not recognise. The answer should be a visible, defined behaviour, not silence.",
        ],
      },
      {
        title: "The IT review",
        body: [
          "Trace the study end to end and name the owner at every handoff: acquisition, routing, processing, review, export, and archive. Any handoff without a named owner is where a pilot stalls.",
          "Confirm compatibility against your actual environment rather than a specification sheet. Modalities, transfer syntaxes, study structure, network rules, and private tags all vary more than vendors expect.",
          "Require a rollback path in writing. If the service is unavailable on a Monday morning, ordinary clinical work must continue without anyone improvising.",
        ],
      },
      {
        title: "The information-governance review",
        body: [
          "Settle controllership and processorship before clinical data moves, not at contract signature. Under the GDPR the hospital is almost always controller and the vendor a processor, and the processing agreement must name purpose, categories, retention, subprocessors, and deletion.",
          "Confirm the processing and storage locations, any cross-border transfer, and the safeguards applied. Ask specifically about burned-in identifiers in DICOM pixel data, which pseudonymisation of headers alone does not address.",
          "Agree logging and access before you need it. Reconstructing who saw what, months later, is materially harder if nobody specified it at the start.",
        ],
      },
      {
        title: "The finance review",
        body: [
          "Value in a clinical-AI pilot rarely appears as a line item. It appears as reduced rework, more consistent reporting, and time returned to people who are scarce. Decide in advance which of those you will measure, and how.",
          "Price the exit as carefully as the entry. Data deletion, contract termination, and the cost of unwinding an integration are all cheaper to negotiate before deployment than after.",
          "For an early-stage vendor, ask what happens to your data and your workflow if the company does not survive. A good answer exists and is contractual.",
        ],
      },
    ],
    sources: [
      { title: "Regulation (EU) 2016/679 — General Data Protection Regulation", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" },
      { title: "European Data Protection Board", href: "https://www.edpb.europa.eu/edpb_en" },
      { title: "FUTURE-AI international consensus guideline", href: "https://www.bmj.com/content/388/bmj-2024-081554" },
    ],
    related: [
      { title: "Plan a hospital evaluation", href: "/for-hospitals" },
      { title: "Review security and deployment", href: "/security" },
    ],
  },
  {
    slug: "echo-reporting-burden",
    label: "Clinical workflow",
    cluster: "Clinical workflow",
    title: "Where echo reporting time actually goes",
    description: "The work between a completed scan and a signed report, why it is heavier than it looks, and what that means for automation.",
    reviewed: "14 August 2026",
    readTime: "8 min",
    author: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    reviewer: { name: "Neuman Alkhalil", role: "Chief Science Officer", id: "neuman-alkhalil" },
    answer: "Most of the effort in echocardiography reporting sits after image acquisition: extracting quantitative values, assembling them into a structured report, and cross-checking them. Automation changes the economics of an echo lab only if it shortens that downstream work reliably, without adding a review burden of its own.",
    sections: [
      {
        title: "Acquisition is usually the optimised part",
        body: [
          "Echo labs tend to be well drilled at scanning. Protocols are established, sonographers are experienced, and the time a study takes at the bedside is reasonably predictable.",
          "The variable part comes afterwards. Reporting standards ask for a substantial set of quantitative values per study, and each one has to be obtained, recorded, and checked. That work is real, repetitive, and largely invisible in throughput statistics that count studies rather than reports.",
          "This is why scan-time improvements often fail to show up as capacity. If the queue is downstream, making acquisition faster simply moves the bottleneck.",
        ],
      },
      {
        title: "Repetition has a physical cost",
        body: [
          "The manual interaction involved in measurement is not neutral. Longitudinal work on sonographer musculoskeletal pain has documented how repetitive scanning and system interaction contribute to neck and upper-extremity symptoms in this workforce.",
          "Reducing repeated interaction with the ultrasound system is therefore not only an efficiency question. Recent work has examined explicitly whether automation and AI can reduce echocardiography scan time and system interaction, which is the correct framing: interaction count, not just wall-clock time.",
          "A workforce that is scarce and experiencing physical strain is a poor place to add another interface unless that interface removes more interactions than it introduces.",
        ],
      },
      {
        title: "Variability is the second cost",
        body: [
          "Values assembled by hand under time pressure vary between operators and across shifts. That variability is not a criticism of anyone; it is a predictable property of manual work performed at volume.",
          "Standardised reporting guidance exists precisely because consistency matters for comparison over time. A patient's follow-up study is only interpretable against the earlier one if both were produced the same way.",
          "Automation's most defensible contribution here is consistency of preparation, with the clinician still deciding what the values mean.",
        ],
      },
      {
        title: "What this implies for evaluating automation",
        body: [
          "Measure the right thing. Time to a signed report, number of manual interactions, and rework rate are better pilot measures than a model accuracy figure taken in isolation.",
          "Watch for burden transfer. If the clinician now spends longer checking than they previously spent producing, the workflow got worse even though a metric improved.",
          "Insist that the evaluation covers the studies that go wrong, not only the ones that go right. The exception path is where operational value is won or lost.",
        ],
      },
    ],
    sources: [
      { title: "Can automation and artificial intelligence reduce echocardiography scan time and ultrasound system interaction?", href: "https://pubmed.ncbi.nlm.nih.gov/40518515/" },
      { title: "Neck and upper extremity pain in sonographers — a longitudinal study", href: "https://pubmed.ncbi.nlm.nih.gov/32164619/" },
      { title: "Guidelines for the standardization of adult echocardiography reporting (ASE)", href: "https://pubmed.ncbi.nlm.nih.gov/40912865/" },
    ],
    related: [
      { title: "See the clinician review workflow", href: "/for-clinicians" },
      { title: "Plan a hospital evaluation", href: "/for-hospitals" },
    ],
  },
  {
    slug: "automated-vs-manual-echo-measurement",
    label: "Clinical workflow",
    cluster: "Clinical workflow",
    title: "Automated versus manual echo measurement: what actually changes",
    description: "What shifts for the sonographer and the reporting cardiologist when quantification is prepared automatically, and what does not shift at all.",
    reviewed: "14 August 2026",
    readTime: "7 min",
    author: { name: "Neuman Alkhalil", role: "Chief Science Officer", id: "neuman-alkhalil" },
    reviewer: { name: "Affan Kapidzic", role: "Chief Technology Officer", id: "affan-kapidzic" },
    answer: "Automating quantification changes the task from production to verification. The clinician stops placing calipers and starts checking a prepared value against its source image. Interpretation, clinical context, and responsibility for the report do not change at all.",
    sections: [
      {
        title: "Production becomes verification",
        body: [
          "In a manual workflow the operator identifies the view, positions the caliper, records the value, and repeats. In an assisted workflow the software proposes the view and the delineation, and the operator's task becomes judging whether the proposal is right.",
          "Verification is a genuinely different cognitive activity. It is faster when the evidence for the proposal is visible and slower when it is not, which is why presentation matters as much as the underlying model.",
          "Deep-learning segmentation and quantification of the left ventricle is an active research area with published results on specific views. Those results describe what is technically achievable; they do not describe what any particular product does in any particular lab.",
        ],
      },
      {
        title: "The automation-bias problem",
        body: [
          "The risk of verification workflows is that agreement becomes the path of least resistance. If accepting is one click and disagreeing is five, the interface has expressed a preference and the data will reflect it.",
          "Systematic reviews of clinician trust in AI-based decision support, and of how explainability affects that trust, converge on an uncomfortable finding: explanation can increase trust whether or not the underlying output deserves it.",
          "The practical mitigation is not more explanation. It is making the source image available beside the value, making correction cheap, and recording disagreement so recurring failure modes become visible.",
        ],
      },
      {
        title: "What does not change",
        body: [
          "The clinician still decides what the numbers mean. Quantification is an input to interpretation, not a substitute for it, and no amount of automation alters who is responsible for the signed report.",
          "Clinical context stays outside the image. Referral question, history, prior studies, and the patient in front of you are not in the pixel data.",
          "Acquisition quality still governs everything downstream. A poorly captured view produces a poor measurement whether a person or a model derives it, which is why image-quality handling belongs in any honest evaluation.",
        ],
      },
    ],
    sources: [
      { title: "Deep learning segmentation and quantification of the left ventricle from the parasternal short-axis view", href: "https://pubmed.ncbi.nlm.nih.gov/41188093/" },
      { title: "How explainable AI can increase or decrease clinicians’ trust — systematic review", href: "https://pubmed.ncbi.nlm.nih.gov/39476365/" },
      { title: "ASE/EACVI recommendations for cardiac chamber quantification in adults", href: "https://pubmed.ncbi.nlm.nih.gov/25559473/" },
    ],
    related: [
      { title: "Human oversight in AI-assisted echocardiography", href: "/resources/human-oversight-in-echo-ai" },
      { title: "See the clinician review workflow", href: "/for-clinicians" },
    ],
  },
  {
    slug: "human-oversight-in-echo-ai",
    label: "Clinical workflow",
    cluster: "Clinical workflow",
    title: "Human oversight in AI-assisted echocardiography",
    description: "What meaningful clinician control should look like before, during, and after an AI-assisted review.",
    reviewed: "13 August 2026",
    readTime: "6 min",
    author: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    reviewer: { name: "Neuman Alkhalil", role: "Chief Science Officer", id: "neuman-alkhalil" },
    answer: "Meaningful oversight means the clinician can understand the source view, inspect the measurement or overlay, edit or reject the result, and retain final responsibility for the signed report.",
    sections: [
      {
        title: "Oversight must be actionable",
        body: [
          "A confidence badge alone is not enough. The interface should connect every output to the relevant image or loop and make correction straightforward.",
        ],
      },
      {
        title: "Design for disagreement",
        body: [
          "Safe systems make it easy to disagree with automation. Teams should be able to record corrections, identify recurring failure modes, and review them without turning ordinary workflow into a research project.",
        ],
      },
      {
        title: "Communicate limitations at the moment they matter",
        body: [
          "Limitations are most useful beside the relevant output and in pilot documentation. They should state what the software has not established, not merely repeat a general disclaimer.",
        ],
      },
    ],
    sources: [
      { title: "Explainable AI and trust in medical AI — systematic review", href: "https://pubmed.ncbi.nlm.nih.gov/39476365/" },
      { title: "FUTURE-AI international consensus guideline", href: "https://www.bmj.com/content/388/bmj-2024-081554" },
    ],
    related: [
      { title: "See the clinician review workflow", href: "/for-clinicians" },
      { title: "Explore the Horalix platform", href: "/platform" },
    ],
  },
  {
    slug: "dicom-echo-integration-checklist",
    label: "Integration guide",
    cluster: "Integration and deployment",
    title: "DICOM echo workflow integration checklist",
    description: "The technical and operational questions to resolve before an echo-lab AI pilot begins.",
    reviewed: "13 August 2026",
    readTime: "8 min",
    author: { name: "Affan Kapidzic", role: "Chief Technology Officer", id: "affan-kapidzic" },
    reviewer: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    answer: "A credible integration plan covers study routing, supported objects, metadata handling, failure recovery, review ownership, export destinations, access control, auditability, and a rollback path.",
    sections: [
      {
        title: "Map the full study path",
        body: [
          "Trace the study from acquisition through PACS or VNA, routing, processing, review, and export. Name the owner and expected behavior at every handoff.",
        ],
      },
      {
        title: "Define compatibility precisely",
        body: [
          "DICOM-compatible should never mean universally compatible. Confirm modalities, transfer syntaxes, study structures, network rules, supported views, and the exact pilot environment.",
        ],
      },
      {
        title: "Plan for failure before go-live",
        body: [
          "The team should know how delayed, incomplete, duplicated, or unsupported studies are surfaced and how ordinary clinical work proceeds when the AI service is unavailable.",
        ],
      },
    ],
    sources: [
      { title: "DICOM standard", href: "https://www.dicomstandard.org/current" },
      { title: "FUTURE-AI international consensus guideline", href: "https://www.bmj.com/content/388/bmj-2024-081554" },
    ],
    related: [
      { title: "Review security and deployment", href: "/security" },
      { title: "Explore the Horalix platform", href: "/platform" },
    ],
  },
  {
    slug: "on-prem-vs-cloud-clinical-ai",
    label: "Deployment",
    cluster: "Integration and deployment",
    title: "On-premise or cloud: choosing a deployment model for hospital AI",
    description: "How deployment choice affects data protection, latency, maintenance, and the questions your IT and governance teams will ask.",
    reviewed: "14 August 2026",
    readTime: "8 min",
    author: { name: "Affan Kapidzic", role: "Chief Technology Officer", id: "affan-kapidzic" },
    reviewer: { name: "Amr Husain", role: "CFO & Co-Founder", id: "amr-husain" },
    answer: "There is no universally correct deployment model. On-premise keeps clinical data inside the hospital boundary and simplifies some governance questions at the cost of maintenance and update speed. Cloud simplifies operations and updates but moves the data-protection conversation to transfer, residency, and subprocessor terms. Choose based on your governance constraints, then hold the vendor to that choice in writing.",
    sections: [
      {
        title: "What each model actually changes",
        body: [
          "On-premise deployment means processing happens inside infrastructure the hospital controls. The data-protection story is simpler because clinical data does not leave the boundary, but the hospital inherits responsibility for capacity, availability, and patching.",
          "Cloud deployment moves processing to infrastructure the vendor or a hyperscaler operates. Operations and updates get easier; the governance conversation shifts to where data resides, who may access it, which subprocessors are involved, and what happens on termination.",
          "A hybrid arrangement—where identifiable data stays local and only derived, non-identifying material leaves—is often the practical answer. It is also the hardest to specify vaguely, which is a point in its favour.",
        ],
      },
      {
        title: "The questions that decide it",
        body: [
          "Does your information-governance policy permit clinical data to leave the hospital boundary at all? If not, the decision is already made and the remaining question is whether the vendor supports it.",
          "What is your tolerance for update latency? On-premise deployments tend to lag, which matters for a product still maturing. A pilot on a version you cannot update is a pilot on a version you cannot fix.",
          "Who operates the deployment during the pilot, and who is called at two in the morning? Deployment model is an operational commitment, not only an architectural one.",
        ],
      },
      {
        title: "Getting it into the contract",
        body: [
          "Whatever model you choose, fix the specifics in the processing agreement: processing location, storage location, cross-border transfer and its safeguards, retention, deletion on termination, and the named subprocessors.",
          "Require notice for subprocessor changes. A cloud arrangement that can silently add a new processor is a governance gap regardless of how good the technology is.",
          "Specify the exit. Data deletion, export of anything you are entitled to keep, and the timeline for both should be written down before go-live rather than negotiated during a wind-down.",
        ],
      },
    ],
    sources: [
      { title: "Regulation (EU) 2016/679 — General Data Protection Regulation", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" },
      { title: "European Data Protection Board", href: "https://www.edpb.europa.eu/edpb_en" },
      { title: "DICOM standard", href: "https://www.dicomstandard.org/current" },
    ],
    related: [
      { title: "DICOM echo workflow integration checklist", href: "/resources/dicom-echo-integration-checklist" },
      { title: "Review security and deployment", href: "/security" },
    ],
  },
  {
    slug: "gdpr-clinical-ai-hospital-pilots",
    label: "Data protection",
    cluster: "Governance and evidence",
    title: "GDPR and clinical AI: getting a hospital pilot right",
    description: "Controllership, legal basis, minimisation, and the DICOM-specific problems that generic data-protection advice misses.",
    reviewed: "14 August 2026",
    readTime: "9 min",
    author: { name: "Amr Husain", role: "CFO & Co-Founder", id: "amr-husain" },
    reviewer: { name: "Affan Kapidzic", role: "Chief Technology Officer", id: "affan-kapidzic" },
    answer: "In a clinical-AI pilot the hospital is normally the data controller and the vendor a processor acting under a written agreement. Health data is a special category under the GDPR, so the pilot needs a lawful basis and an Article 9 condition, a data protection impact assessment in most cases, genuine minimisation, and specific attention to identifiers embedded in DICOM images rather than only in headers.",
    sections: [
      {
        title: "Establish the roles first",
        body: [
          "Controllership determines who decides purposes and means, and it is not a matter of preference. In a hospital pilot the hospital almost always determines why the processing happens and therefore acts as controller, with the vendor processing on documented instructions.",
          "Article 28 of the GDPR sets out what the processing agreement must contain: subject matter, duration, nature and purpose, categories of data and data subjects, and the obligations of both parties. Treat it as a design document, not a formality appended at signature.",
          "Where a vendor wants to use pilot data to improve its own product, that is usually a separate purpose with a separate basis, and it should be negotiated explicitly rather than absorbed into a general clause.",
        ],
      },
      {
        title: "Legal basis and impact assessment",
        body: [
          "Health data is a special category under Article 9, so the pilot needs both a lawful basis under Article 6 and a condition under Article 9. Which combination applies depends on national implementation as much as the Regulation itself, so involve your DPO early rather than presenting them with a decision.",
          "New technology processing special-category data at scale will generally trigger a data protection impact assessment under Article 35. Doing it properly is also the fastest way to surface the technical questions the IT review needs answered anyway.",
          "Minimisation is a design constraint, not a statement of intent. Scope the pilot to the studies genuinely needed to answer the evaluation question, and agree retention and deletion at the same time.",
        ],
      },
      {
        title: "The DICOM-specific problem",
        body: [
          "Pseudonymising DICOM headers is necessary and not sufficient. Identifiers are routinely burned into the pixel data itself, and a workflow that strips tags while leaving the image untouched has not de-identified anything.",
          "Private tags and structured report objects can also carry identifying material, and their content varies by manufacturer and configuration. This is a place where a specification sheet is no substitute for inspecting your own studies.",
          "Any de-identification approach should be tested against real studies from your own scanners before the pilot begins, and the test should be documented.",
        ],
      },
      {
        title: "What to write down",
        body: [
          "Processing and storage location, any cross-border transfer and its safeguards, named subprocessors and notice for changes, retention period, deletion on termination, access control and logging, and incident notification timelines.",
          "Each of these is cheap to agree before a pilot and expensive to renegotiate during one. A vendor that resists specificity here is telling you something useful.",
        ],
      },
    ],
    sources: [
      { title: "Regulation (EU) 2016/679 — General Data Protection Regulation", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" },
      { title: "European Data Protection Board", href: "https://www.edpb.europa.eu/edpb_en" },
      { title: "DICOM standard", href: "https://www.dicomstandard.org/current" },
    ],
    related: [
      { title: "Review security and deployment", href: "/security" },
      { title: "A procurement checklist for hospital clinical AI", href: "/resources/clinical-ai-procurement-checklist" },
    ],
  },
  {
    slug: "eu-mdr-clinical-ai-pathway",
    label: "Regulation",
    cluster: "Governance and evidence",
    title: "EU MDR and the AI Act: what pre-clearance really means",
    description: "How medical device software is classified in Europe, what the AI Act adds, and how to read a vendor that has not been through it yet.",
    reviewed: "14 August 2026",
    readTime: "9 min",
    author: { name: "Neuman Alkhalil", role: "Chief Science Officer", id: "neuman-alkhalil" },
    reviewer: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    answer: "Software intended for a medical purpose is a medical device under Regulation (EU) 2017/745 and needs conformity assessment and CE marking before it can be placed on the market for that purpose. The AI Act adds a parallel set of obligations for high-risk AI systems. A product described as pre-clearance has not completed that route, which constrains how it may be described, sold, and used.",
    sections: [
      {
        title: "Intended purpose drives everything",
        body: [
          "Under the MDR, whether software is a medical device depends on the manufacturer's stated intended purpose, not on the underlying technology. Software intended for diagnosis, prevention, monitoring, prediction, or treatment falls in scope.",
          "This is why intended-purpose language is not marketing copy. It is a regulatory statement, and changing it can change the classification and the conformity assessment route.",
          "Classification then determines the assessment path, including whether a notified body must be involved. For diagnostic decision-support software the classification is rarely the lowest class.",
        ],
      },
      {
        title: "What the AI Act adds",
        body: [
          "Regulation (EU) 2024/1689 introduces obligations for AI systems by risk category. Where an AI system is a safety component of a product already covered by sectoral legislation such as the MDR, the two regimes interact rather than replace one another.",
          "Published analysis of how AI-enabled medical products are classified under the AI Act alongside the MDR and IVDR makes clear that the interaction is not always intuitive, and that manufacturers need to plan for both rather than assuming one absorbs the other.",
          "For a buyer, the practical consequence is that a vendor should be able to describe both their device pathway and their AI Act position. Vagueness on either is a signal.",
        ],
      },
      {
        title: "Reading a pre-clearance vendor",
        body: [
          "Pre-clearance means the conformity assessment is not complete. That is a legitimate stage for a company to be in, and it is not a licence to deploy into routine clinical care.",
          "What it permits is scoped evaluation under the hospital's own clinical governance, alongside the established process rather than in place of it. What it does not permit is reliance on the software for clinical decisions.",
          "Ask the vendor three things: what intended purpose they will declare, which route they expect to follow, and what evidence they still need to generate. A company with a credible plan can answer all three; a company without one will change the subject to technology.",
        ],
      },
      {
        title: "Where Horalix stands",
        body: [
          "Horalix is pilot-stage and pre-clearance. It is not CE-marked as a medical device and is not authorised for routine clinical use, and this website does not present it as either.",
          "Pilots run as scoped evaluations under existing clinical governance, with clinician review on every output and the hospital's normal reporting process remaining authoritative.",
        ],
      },
    ],
    sources: [
      { title: "Regulation (EU) 2017/745 — Medical Device Regulation", href: "https://eur-lex.europa.eu/eli/reg/2017/745/oj" },
      { title: "Regulation (EU) 2024/1689 — Artificial Intelligence Act", href: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" },
      { title: "Regulatory classification of AI-enabled products under the EU AI Act and MDR/IVDR", href: "https://pubmed.ncbi.nlm.nih.gov/40643665/" },
    ],
    related: [
      { title: "Review the Horalix evidence boundary", href: "/evidence" },
      { title: "Plan a hospital evaluation", href: "/for-hospitals" },
    ],
  },
  {
    slug: "focused-cardiac-ultrasound-ai-evidence",
    label: "Evidence",
    cluster: "Governance and evidence",
    title: "Reading the focused cardiac ultrasound evidence honestly",
    description: "Why FoCUS literature is frequently cited in AI marketing, what it does and does not support, and how to tell the difference.",
    reviewed: "14 August 2026",
    readTime: "7 min",
    author: { name: "Neuman Alkhalil", role: "Chief Science Officer", id: "neuman-alkhalil" },
    reviewer: { name: "Kerim Sabic", role: "CEO & Co-Founder", id: "kerim-sabic" },
    answer: "Focused cardiac ultrasound literature describes how well abbreviated cardiac ultrasound performs in defined clinical questions, often when performed by non-cardiologists. It is useful context for the field. It is not evidence about any specific AI product, and citing it as though it were is the most common form of evidence laundering in clinical-AI marketing.",
    sections: [
      {
        title: "What the FoCUS literature is about",
        body: [
          "Focused cardiac ultrasound describes an abbreviated, goal-directed examination answering specific clinical questions rather than producing a comprehensive study. Systematic reviews have examined its diagnostic and prognostic role in defined settings, including when performed by non-cardiologist specialists.",
          "That body of work is genuinely informative about the value of getting cardiac imaging information earlier and closer to the patient. It says nothing about automated measurement, because the examinations in those studies were performed and interpreted by people.",
        ],
      },
      {
        title: "How it gets misused",
        body: [
          "The pattern is familiar: a vendor cites a strong performance figure from FoCUS or general echo literature, places it near a description of their product, and lets the reader draw a connection that the citation does not support.",
          "The figure may be entirely accurate about the study it came from. The problem is the adjacency, which implies transfer of evidence from a published population to an unpublished product.",
          "A related move is citing model-development papers as though they were clinical validation of a marketed product. Development results on a research dataset and prospective performance in a specific lab are different claims with different evidentiary weight.",
        ],
      },
      {
        title: "How to test a citation",
        body: [
          "Ask whether the cited study evaluated the vendor's named product version. If it did not, the citation is context and should be labelled as such.",
          "Ask what population, what reference standard, and what setting. Evidence generated in one care setting frequently does not transfer to another, and echo is no exception.",
          "Ask what the vendor's own evidence says. If the answer is that they have not generated any yet, that is an acceptable answer from an early-stage company and an unacceptable one from a company implying clinical performance.",
        ],
      },
      {
        title: "The standard we hold ourselves to",
        body: [
          "Horalix separates external literature from product claims on principle. External research informs how we build; it does not validate what we have built.",
          "Only a study evaluating a named Horalix version, in defined conditions, can support a Horalix performance claim. Until such a study exists we say so, and the claim register records it.",
        ],
      },
    ],
    sources: [
      { title: "Diagnostic and prognostic role of focused cardiac ultrasound by non-cardiologist specialists — systematic review", href: "https://pubmed.ncbi.nlm.nih.gov/42309622/" },
      { title: "FUTURE-AI international consensus guideline", href: "https://www.bmj.com/content/388/bmj-2024-081554" },
      { title: "ASE/EACVI recommendations for cardiac chamber quantification in adults", href: "https://pubmed.ncbi.nlm.nih.gov/25559473/" },
    ],
    related: [
      { title: "Review the Horalix evidence boundary", href: "/evidence" },
      { title: "How to evaluate pilot-stage clinical AI", href: "/resources/evaluating-pilot-stage-clinical-ai" },
    ],
  },
];

export function getResource(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}

export function resourcesByCluster() {
  return clusters
    .map((cluster) => ({ ...cluster, items: resources.filter((resource) => resource.cluster === cluster.name) }))
    .filter((cluster) => cluster.items.length > 0);
}
