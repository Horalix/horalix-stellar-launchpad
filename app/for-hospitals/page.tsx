import Link from "../_components/ReliableLink";
import { Arrow, MetricRow, PageIntro } from "../_components/SiteChrome";
import { approvedClaim } from "../_data/claims";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "AI Echocardiography for Hospitals", description: "Evaluate Horalix with a transparent pilot plan covering echo workflow fit, DICOM and PACS integration, clinician oversight, security, GDPR, evidence, and regulatory status.", path: "/for-hospitals" });

const faq = [
  {
    question: "What does Horalix actually do inside an echo lab?",
    answer: "Horalix receives DICOM echocardiography studies, prepares structured measurements and contextual overlays from the views it recognises, and presents them for clinician review. The clinician inspects, edits, accepts, or rejects each suggestion before anything becomes report-ready.",
  },
  {
    question: "Is Horalix approved for clinical use?",
    answer: "No. Horalix is pilot-stage and pre-clearance. It is not CE-marked as a medical device, is not authorised for routine clinical use, and is not presented as an independent diagnostic system. Pilots run as scoped evaluations under existing clinical governance, with the hospital's normal reporting process remaining authoritative.",
  },
  {
    question: "How does Horalix connect to our PACS?",
    answer: "Integration is scoped before any study moves. We map study intake, eligible-study routing, supported transfer syntaxes and study structures, export destinations, access control, and the behaviour when a study is unsupported or the service is unavailable. Nothing is described as universally compatible until it is confirmed against your environment.",
  },
  {
    question: "Where is patient data processed and stored?",
    answer: "Data location, processing boundaries, retention, and deletion are agreed in writing during pilot scoping and recorded in the data processing agreement. Horalix operates Europe-first and expects to act as a processor under the hospital's controllership. Deployment model and residency are confirmed per pilot rather than asserted in advance on this page.",
  },
  {
    question: "What evidence can you show us today?",
    answer: "We can show the intended workflow, the product in a working state, our internal build benchmarks with their limitations attached, and the public claim register that governs every statement on this website. We cannot show completed clinical validation, because it does not exist yet. We publish that boundary rather than blur it.",
  },
];

const hospitalGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://horalix.com/for-hospitals#service",
      name: "Horalix hospital pilot programme",
      serviceType: "AI-assisted echocardiography workflow evaluation",
      description: "A scoped evaluation of AI-assisted echocardiography workflow inside a hospital echo lab, covering integration, clinician oversight, security, and evidence.",
      provider: { "@id": "https://horalix.com/#organization" },
      areaServed: { "@type": "Place", name: "Europe" },
      audience: { "@type": "MedicalAudience", audienceType: "Hospitals, echo laboratories, and clinical operations teams" },
      url: "https://horalix.com/for-hospitals",
    },
    {
      "@type": "HowTo",
      "@id": "https://horalix.com/for-hospitals#pilot",
      name: "How a Horalix hospital pilot is structured",
      description: "The four phases of a scoped clinical-AI pilot, from workflow discovery to an evidence-based decision.",
      step: [
        { "@type": "HowToStep", position: 1, name: "Discover", text: "Map the current echo workflow: acquisition systems, routing, reporting destinations, review roles, delays, and operational constraints." },
        { "@type": "HowToStep", position: 2, name: "Scope", text: "Define the pilot boundary: eligible studies, supported views, environment, intended outputs, human oversight, data handling, and what the pilot will not establish." },
        { "@type": "HowToStep", position: 3, name: "Validate", text: "Measure workflow completion, review behaviour, integration reliability, exceptions, usability, and the agreed evidence measures." },
        { "@type": "HowToStep", position: 4, name: "Decide", text: "Review results with limitations intact and decide whether further validation or deployment work is justified." }
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://horalix.com/for-hospitals#faq",
      mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
    }
  ],
};

export default function Hospitals() {
  return <>
    <PageIntro
      breadcrumb="For hospitals" path="/for-hospitals" eyebrow="For hospitals"
      title="Answer the hard questions before the first study moves."
      copy="Horalix brings workflow, integration, oversight, security, evidence, and regulatory status into the same pilot conversation—before the first study moves, not after."
      actions={<><Link className="button button-light" href="/contact">Request a demo <Arrow /></Link><Link className="button button-ghost" href="/evidence">Review evidence posture</Link></>}
    />

    <MetricRow path="/for-hospitals" eyebrow="Current pilot build" heading="What arrives before a clinician opens the study." />

    <section className="section shell">
      <div className="section-heading">
        <div><p className="eyebrow">The operational problem</p><h2>The bottleneck is after image capture, not during it.</h2></div>
        <div>
          <p className="lede">Echo labs are usually well optimised at acquisition. The drag appears afterwards—in measurement extraction, report assembly, and the repeated validation steps that stand between a completed study and a signed report.</p>
          <p className="microcopy">This is an operational description of echo workflow, not a claim about outcomes at your site.</p>
        </div>
      </div>
      <div className="metricless-grid">
        <div className="metricless-card"><b>Repetitive preparation</b><p>Structured reporting standards create real manual work once the images already exist.</p></div>
        <div className="metricless-card"><b>Variability</b><p>Measurements assembled by hand under time pressure vary between operators and across shifts.</p></div>
        <div className="metricless-card"><b>Fragmented attention</b><p>Clerical assembly competes with the interpretive judgement that only the clinician can supply.</p></div>
      </div>
      <p className="section-note">Automation only changes the economics if it shortens that downstream work reliably and without adding review burden of its own. That is the specific thing a Horalix pilot sets out to test.</p>
    </section>

    <section className="section section-dark">
      <div className="shell">
        <div className="section-heading">
          <div><p className="eyebrow">Workflow fit</p><h2>What changes for each person it touches.</h2></div>
          <p className="lede">A pilot has to be worth the disruption for every person it touches. These are the intended changes for each role—stated as intent, because they are what the pilot is designed to test.</p>
        </div>
        <div className="trust-list">
          <div className="trust-row"><span>Sonographer</span><p>Acquisition is unchanged. Standard views are captured as they are today, with no new device, no new probe protocol, and no extra step at the bedside. The pilot is designed so scanning practice is not the variable under test.</p></div>
          <div className="trust-row"><span>Reporting cardiologist</span><p>The study arrives with measurements already organised beside the views that produced them. The work shifts from assembling numbers to checking them—inspect, adjust, accept, or reject, then sign off with full authority over the result.</p></div>
          <div className="trust-row"><span>Echo lab manager</span><p>Visibility over which studies entered the pilot, which completed, which were unsupported, and where exceptions occurred—so the operational picture is legible rather than anecdotal.</p></div>
          <div className="trust-row"><span>IT and informatics</span><p>A documented data path with named systems, defined transfer boundaries, explicit access control, and an agreed rollback. No opaque service sitting between acquisition and the reporting system.</p></div>
        </div>
      </div>
    </section>

    <section className="section shell">
      <div className="section-heading">
        <div><p className="eyebrow">Integration</p><h2>“DICOM-compatible” is a starting point, not an answer.</h2></div>
        <p className="lede">Compatibility is confirmed against your environment during scoping. Until it is, we describe it as unconfirmed—including when that is the less convenient answer.</p>
      </div>
      <div className="timeline">
        <div className="timeline-row"><b>Study intake</b><div><h3>Where studies enter.</h3><p>Modality worklist behaviour, the routing rule that selects eligible studies, and the boundary between the pilot path and your production path. Studies outside the agreed scope are not silently picked up.</p></div></div>
        <div className="timeline-row"><b>Object handling</b><div><h3>What is actually supported.</h3><p>Supported modalities, transfer syntaxes, multi-frame handling, study and series structure, and private tags. Where a construct is unsupported, the pilot surfaces it visibly rather than producing a partial result that looks complete.</p></div></div>
        <div className="timeline-row"><b>Output and export</b><div><h3>Where results go.</h3><p>The review destination, the export format, and how prepared output reaches your reporting system—including whether it enters as structured data, as a document, or stays in review only for the pilot duration.</p></div></div>
        <div className="timeline-row"><b>Failure behaviour</b><div><h3>What happens when it does not work.</h3><p>Delayed, incomplete, duplicated, and unsupported studies each need a defined, visible behaviour. Your team should know how ordinary clinical work proceeds when the service is unavailable—before go-live.</p></div></div>
      </div>
      <p className="section-note"><Link className="text-link" href="/resources/dicom-echo-integration-checklist">Read the full DICOM integration checklist <Arrow /></Link></p>
    </section>

    <section className="section section-line shell">
      <div className="section-heading">
        <div><p className="eyebrow">IT, security, and data protection</p><h2>Questions your DPO will ask first.</h2></div>
        <p className="lede">Detailed architecture and control evidence is shared privately under qualified diligence. What follows is the posture, not a certification claim—Horalix does not assert certifications it has not completed.</p>
      </div>
      <dl className="answer-grid">
        <div><dt>Who is controller and who is processor?</dt><dd>The hospital remains the data controller. Horalix expects to act as a processor under a written data processing agreement that names the purpose, the categories of data, the retention period, subprocessors, and deletion obligations. Roles are agreed in writing before any clinical data moves.</dd></div>
        <div><dt>Where does data live?</dt><dd>Horalix operates Europe-first. Processing location, storage location, and any cross-border transfer are fixed per pilot and recorded in the agreement. If your governance requires a specific residency or an on-premise deployment, that is a scoping question we answer directly rather than a limitation we discover late.</dd></div>
        <div><dt>What is minimised, and when is it deleted?</dt><dd>Pilots are scoped to the minimum data needed to answer the evaluation question, with retention and deletion agreed up front. Identifier handling—including checks for burned-in identifiers in DICOM pixel data—is part of scoping, not an afterthought.</dd></div>
        <div><dt>What is logged, and who can see it?</dt><dd>Access is role-based and least-privilege, with account lifecycle defined at the start. Which system and review events are logged, how long they are retained, and who may inspect them are agreed so an investigation is possible later without renegotiating access under pressure.</dd></div>
      </dl>
      <p className="section-note"><Link className="text-link" href="/security">Review the full security and deployment approach <Arrow /></Link></p>
    </section>

    <section className="section section-dark">
      <div className="shell grid-2">
        <div><p className="eyebrow">Clinician oversight</p><h2>Disagreement is a designed feature, not an edge case.</h2></div>
        <div>
          <p className="lede">{approvedClaim("workflow-clinician-control")} Every suggested output is traceable to the view that produced it, editable without losing context, and rejectable without penalty to the workflow.</p>
          <p className="lede">A system that is hard to disagree with invites automation bias. The review surface is built so checking a value is faster than reconstructing it, and so overriding one costs nothing.</p>
          <Link className="text-link" href="/for-clinicians">See the clinician review workflow <Arrow /></Link>
        </div>
      </div>
    </section>

    <section className="section shell">
      <div className="section-heading">
        <div><p className="eyebrow">Evidence and regulatory status</p><h2>What we have shown, and what we have not.</h2></div>
        <p className="lede">Buying committees are entitled to a plain statement of maturity. Here is ours, without softening.</p>
      </div>
      <div className="grid-2">
        <div className="timeline">
          <div className="timeline-row"><b>Established</b><div><h3>A working product and internal benchmarks.</h3><p>The workflow runs, the build benchmarks above are measured on the current version, and three named clinical collaborations are underway.</p></div></div>
          <div className="timeline-row"><b>Not established</b><div><h3>Clinical validation and clearance.</h3><p>There is no completed clinical validation study, no published performance result against a reference standard, and no regulatory clearance or CE marking for a medical device.</p></div></div>
          <div className="timeline-row"><b>Governed</b><div><h3>Every public claim has an owner.</h3><p>Claims are registered with a source, product version, conditions of use, approval date, and review date. The register is published rather than kept internal.</p></div></div>
        </div>
        <div>
          <div className="disclosure"><strong>Regulatory status:</strong> Horalix is pilot-stage and pre-clearance. It is not a cleared or CE-marked medical device, is not authorised for routine clinical use, and must not be relied upon for diagnosis. Pilots operate as scoped evaluations under your existing clinical governance, alongside—not in place of—your established reporting process.</div>
          <p className="lede">Moving beyond this status requires completed validation against a reference standard in the intended setting, a conformity assessment route, and a quality management system audited accordingly. We will say when that work is done, and not before.</p>
          <Link className="text-link" href="/evidence">Open the public claim register <Arrow /></Link>
        </div>
      </div>
    </section>

    <section className="section section-line shell">
      <div className="section-heading">
        <div><p className="eyebrow">Pilot design</p><h2>Start with a bounded clinical workflow.</h2></div>
        <p className="lede">A useful pilot defines eligibility, responsibilities, success criteria, failure paths, data handling, and review ownership before the first study moves.</p>
      </div>
      <div className="timeline">
        <div className="timeline-row">
          <b>01 · Discover</b>
          <div>
            <h3>Map the current echo workflow.</h3>
            <p>Identify acquisition systems, routing, reporting destinations, review roles, delays, and operational constraints.</p>
          </div>
        </div>
        <div className="timeline-row">
          <b>02 · Scope</b>
          <div>
            <h3>Define the pilot boundary.</h3>
            <p>Agree eligible studies, supported views, environment, intended outputs, human oversight, and what the pilot will not establish.</p>
          </div>
        </div>
        <div className="timeline-row">
          <b>03 · Validate</b>
          <div>
            <h3>Measure more than model output.</h3>
            <p>Evaluate workflow completion, review behaviour, integration reliability, exceptions, usability, and agreed evidence measures.</p>
          </div>
        </div>
        <div className="timeline-row">
          <b>04 · Decide</b>
          <div>
            <h3>Review results with limitations intact.</h3>
            <p>Connect outcomes to the tested version and setting, then decide whether further validation or deployment work is justified.</p>
          </div>
        </div>
      </div>
    </section>


    <section className="section shell">
      <div className="section-heading">
        <div><p className="eyebrow">Procurement</p><h2>The objections we expect, answered directly.</h2></div>
        <p className="lede">These are the questions a hospital committee actually raises. We would rather answer them here than have them surface late in a process.</p>
      </div>
      <dl className="answer-grid">
        <div><dt>“You are an early-stage company. What if you fail?”</dt><dd>A fair question. Pilots are scoped so your existing workflow is never dependent on us: acquisition and reporting continue independently, data handling and deletion are contractual, and the exit path is agreed before go-live. If we disappear, you lose a pilot—not a clinical service.</dd></div>
        <div><dt>“You have no regulatory clearance.”</dt><dd>Correct, and we state it on every page rather than burying it. That is precisely why the engagement is a scoped evaluation under your clinical governance and not a deployment into routine care. If pre-clearance software is outside your risk appetite today, that is a legitimate position.</dd></div>
        <div><dt>“Our clinicians will not adopt it.”</dt><dd>They should not have to adopt anything they cannot check. The review surface is designed so verifying a value is faster than producing it by hand and rejecting one is trivial. If clinicians do not use it during the pilot, that is a real result and we would report it as one.</dd></div>
        <div><dt>“Our DPO will block this.”</dt><dd>Bring them into the scoping phase rather than the approval phase. Controllership, processing location, retention, deletion, subprocessors, and logging are settled in writing before clinical data moves, and we expect a full information-governance review as normal practice.</dd></div>
      </dl>
    </section>

    <section className="section section-line shell faq-section">
      <div className="section-heading">
        <div><p className="eyebrow">Direct answers</p><h2>Hospital questions, in plain language.</h2></div>
        <p className="lede">The same answers we give in the room, written down so your team can circulate them without a meeting.</p>
      </div>
      <div className="faq-list">{faq.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
    </section>

    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalGraph) }} />
  </>;
}
