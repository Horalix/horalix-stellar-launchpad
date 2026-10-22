import Link from "../_components/ReliableLink";
import { Arrow, PageIntro } from "../_components/SiteChrome";
import { ProgramLogos } from "../_components/ProgramLogos";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Horalix Press Information", description: "Verified Horalix company information, Sarajevo roots, product status, pilots, programs, press enquiries, and approved media resources.", path: "/press" });

export default function Press() {
  return <><PageIntro breadcrumb="Press" path="/press" eyebrow="Press" title="Clear company information, without inflated claims." copy="Use the approved company description below or contact Horalix for current product, leadership, program, and pilot information." actions={<a className="button button-light" href="mailto:support@horalix.com">Contact press team <Arrow /></a>} />
    <section className="section shell"><div className="grid-2"><div><p className="eyebrow">Approved boilerplate</p><h2>About Horalix</h2></div><div><p className="lede">Horalix is a Sarajevo-based medical-AI startup developing a pilot-stage, AI-assisted echocardiography workflow that turns DICOM studies into structured measurements and report-ready outputs for clinician review. Horalix is pre-clearance; outputs require clinician review and are not an independent diagnosis.</p><p className="microcopy">Approved 14 August 2026 · Review by 14 November 2026</p></div></div></section>
    <section className="section-tight shell"><div className="metricless-grid"><div className="metricless-card"><b>Company</b><p>Sarajevo, Bosnia and Herzegovina</p></div><div className="metricless-card"><b>Category</b><p>AI-assisted echocardiography workflow</p></div><div className="metricless-card"><b>Status</b><p>Pilot-stage · Pre-clearance</p></div></div></section>
    <ProgramLogos eyebrow="Verified company milestones" heading="Programs Horalix has been selected into." />
    <section className="section-tight shell"><div className="program-proof"><p><b>Also on the record</b> · three company-confirmed active pilot collaborations: UKC Maribor, ASA Hospital, and Poliklinika Dr Nabil.</p><Link className="text-link" href="/news">Open sourced updates <Arrow /></Link></div></section>
    <section className="section shell">
      <div className="section-heading"><div><p className="eyebrow">Writing about Horalix</p><h2>Language that stays accurate.</h2></div><p className="lede">Horalix is a pre-clearance medical-AI company. These distinctions are not house style — getting them wrong makes a sentence factually incorrect.</p></div>
      <dl className="answer-grid">
        <div><dt>Say “AI-assisted”, not “AI-powered diagnosis”</dt><dd>Horalix prepares structured measurements for a clinician to inspect and approve. It does not interpret studies or produce diagnoses, and the clinician retains sign-off on every output.</dd></div>
        <div><dt>Say “pilot collaboration”, not “customer” or “deployment”</dt><dd>The three named sites are scoped evaluation relationships. None implies purchase, endorsement, completed validation, or routine clinical use.</dd></div>
        <div><dt>Say “programme member”, not “backed by”</dt><dd>Techstars Founder Catalyst is founder development and NVIDIA Inception is startup support. Neither is investment, certification, or endorsement.</dd></div>
        <div><dt>Figures need their conditions</dt><dd>The published build figures are internal engineering benchmarks describing prepared output, not diagnostic performance. Quoting one without its boundary changes what it claims.</dd></div>
      </dl>
      <p className="section-note">The full set of constraints, including an explicit “do not state” list, is published at <a className="text-link" href="/llms-full.txt">llms-full.txt</a> for both journalists and AI assistants.</p>
    </section>

    <section className="section section-dark"><div className="shell grid-2"><div><p className="eyebrow">Media assets</p><h2>Use the current Horalix identity.</h2></div><div><p className="lede">Request the current press kit to avoid outdated screenshots, unapproved partner logos, or superseded product language.</p><p className="lede">For fact-checking, the public claim register lists every published statement with its source, product version, conditions of use, and review date.</p><div className="button-row"><a className="button button-light" href="mailto:support@horalix.com?subject=Horalix%20press%20kit%20request">Request press kit <Arrow /></a><Link className="button button-ghost" href="/evidence">Review evidence</Link></div></div></div></section></>;
}
