import Link from "../../_components/ReliableLink";
import { Arrow, PageIntro } from "../../_components/SiteChrome";
import { pageMetadata } from "../../_data/metadata";

export const metadata = pageMetadata({ title: "Investor Request Received", description: "Confirmation that Horalix received an investor materials request.", path: "/thank-you/investor", index: false });

export default function InvestorThanks() { return <><PageIntro eyebrow="Request received" title="Thank you. We’ll follow up with the right investor context." copy="Your request has been recorded. The Horalix team will respond using the work email you provided." actions={<><a className="button button-light" data-track="scheduling_click" href={process.env.NEXT_PUBLIC_INVESTOR_SCHEDULING_URL || "mailto:support@horalix.com?subject=Horalix%20investor%20conversation"}>Choose a meeting time <Arrow /></a><Link className="button button-ghost" href="/platform">Review the product</Link></>} /></>; }
