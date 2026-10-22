import Link from "../../_components/ReliableLink";
import { Arrow, PageIntro } from "../../_components/SiteChrome";
import { pageMetadata } from "../../_data/metadata";

export const metadata = pageMetadata({ title: "Hospital Request Received", description: "Confirmation that Horalix received a hospital demo request.", path: "/thank-you/hospital", index: false });

export default function HospitalThanks() { return <><PageIntro eyebrow="Request received" title="Thank you. We’ll shape the next step around your hospital." copy="Your request has been recorded. The Horalix team will follow up using the work email you provided." actions={<><a className="button button-light" data-track="scheduling_click" href={process.env.NEXT_PUBLIC_HOSPITAL_SCHEDULING_URL || "mailto:support@horalix.com?subject=Horalix%20hospital%20demo"}>Choose a meeting time <Arrow /></a><Link className="button button-ghost" href="/evidence">Review evidence</Link></>} /><section className="section narrow"><div className="note-box">Please do not send patient information or clinical data in follow-up email or scheduling notes.</div></section></>; }
