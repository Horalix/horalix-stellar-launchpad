import Link from "./_components/ReliableLink";
import { Arrow, PageIntro } from "./_components/SiteChrome";
import { pageMetadata } from "./_data/metadata";

// Without its own metadata this page inherits the root canonical and self-canonicalises to "/".
export const metadata = pageMetadata({ title: "Page not found", description: "The Horalix website has been rebuilt around echocardiography. The page you requested may have moved.", path: "/404", index: false });

export default function NotFound() {
  return <>
    <PageIntro eyebrow="404" title="This page is no longer here." copy="The Horalix website has been rebuilt around echocardiography. The page you requested may have moved." actions={<Link className="button button-light" href="/">Return home <Arrow /></Link>} />
    <section className="section shell">
      <div className="section-heading"><div><p className="eyebrow">Try instead</p><h2>The pages people usually want.</h2></div><p className="lede">If you arrived from an old link, these cover the same ground on the rebuilt site.</p></div>
      <dl className="answer-grid">
        <div><dt>The product</dt><dd>The echocardiography workflow, from DICOM intake to clinician sign-off. <Link className="text-link" href="/platform">Explore the platform <Arrow /></Link></dd></div>
        <div><dt>For hospitals</dt><dd>Integration, security, evidence, regulatory status, and how a pilot is scoped. <Link className="text-link" href="/for-hospitals">Plan a pilot <Arrow /></Link></dd></div>
        <div><dt>Evidence</dt><dd>The public claim register, internal benchmarks, and stated limitations. <Link className="text-link" href="/evidence">Open the evidence centre <Arrow /></Link></dd></div>
        <div><dt>Research</dt><dd>Expert-led resources on clinical AI evaluation, integration, and oversight. <Link className="text-link" href="/resources">Browse resources <Arrow /></Link></dd></div>
      </dl>
    </section>
  </>;
}
