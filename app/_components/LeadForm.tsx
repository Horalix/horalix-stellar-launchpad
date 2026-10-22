"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

declare global { interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string } } }

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** `startOpen` skips the collapsed "Start secure request" state — used where the form is
 *  the whole point of the page rather than one block among many. */
export function LeadForm({ intent, startOpen = false }: { intent: "hospital_demo" | "investor_access"; startOpen?: boolean }) {
  const [opened, setOpened] = useState(startOpen);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const widget = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const targetHash = intent === "hospital_demo" ? "#request" : "#access";
  const fieldId = (field: string) => `${intent}-${field}`;

  useEffect(() => {
    const openFromIntent = () => {
      if (window.location.hash === targetHash) setOpened(true);
    };
    openFromIntent();
    window.addEventListener("hashchange", openFromIntent);
    return () => window.removeEventListener("hashchange", openFromIntent);
  }, [targetHash]);

  useEffect(() => {
    if (!opened || !siteKey || !widget.current) return;
    const render = () => widget.current && window.turnstile?.render(widget.current, { sitekey: siteKey, theme: "light" });
    if (window.turnstile) { render(); return; }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [opened]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending"); setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const campaign = new URLSearchParams(window.location.search);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, intent, consentVersion: "2026-08-14", sourcePath: window.location.pathname, utm_source: campaign.get("utm_source") || "", utm_medium: campaign.get("utm_medium") || "", utm_campaign: campaign.get("utm_campaign") || "", turnstileToken: payload["cf-turnstile-response"] || "" }) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error || "We could not send your request. Please try again or email support@horalix.com."); setState("error"); requestAnimationFrame(() => errorRef.current?.focus()); return; }
      window.dispatchEvent(new CustomEvent("horalix:track", { detail: { event: intent === "hospital_demo" ? "demo_submission" : "investor_submission" } }));
      window.location.assign(intent === "hospital_demo" ? "/thank-you/hospital" : "/thank-you/investor");
    } catch {
      setError("The secure request service is temporarily unavailable. Please try again or email support@horalix.com.");
      setState("error");
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  if (!opened) return <button type="button" className="button button-dark" data-track={intent === "hospital_demo" ? "demo_start" : "investor_start"} onClick={() => setOpened(true)}>Start secure request <span>→</span></button>;

  return (
    <form aria-label={intent === "hospital_demo" ? "Hospital demo request" : "Investor materials request"} className="lead-form" onSubmit={submit}>
      <div className="form-grid"><label htmlFor={fieldId("name")}>Full name<input id={fieldId("name")} required name="name" autoComplete="name" maxLength={80} /></label><label htmlFor={fieldId("email")}>Work email<input id={fieldId("email")} required name="workEmail" type="email" autoComplete="email" maxLength={120} /></label></div>
      <div className="form-grid"><label htmlFor={fieldId("organization")}>Organization<input id={fieldId("organization")} required name="organization" autoComplete="organization" maxLength={120} /></label><label htmlFor={fieldId("role")}>Role<input id={fieldId("role")} required name="role" autoComplete="organization-title" maxLength={80} /></label></div>
      <label htmlFor={fieldId("country")}>Country<input id={fieldId("country")} required name="country" autoComplete="country-name" maxLength={80} /></label>
      <label htmlFor={fieldId("message")}>What would make this conversation useful? <span className="optional">Optional</span><textarea id={fieldId("message")} name="message" rows={4} maxLength={800} /></label>
      <label className="honeypot" aria-hidden="true" htmlFor={fieldId("website")}>Website<input id={fieldId("website")} name="website" tabIndex={-1} autoComplete="off" /></label>
      <p className="form-warning"><b>Please do not submit patient information or clinical data.</b> This form is for business enquiries only.</p>
      {siteKey ? <div ref={widget} className="turnstile" /> : <p className="form-config">Protected by same-origin validation, a honeypot, input limits, and rate limiting. Enhanced bot verification is enabled when configured.</p>}
      <div className="consent-row"><label className="consent" htmlFor={fieldId("consent")}><input id={fieldId("consent")} required type="checkbox" name="consent" value="yes" /> <span>I agree that Horalix may use these details to respond to my request.</span></label><p>Read the <a href="/privacy">privacy notice</a>.</p></div>
      <p ref={errorRef} tabIndex={-1} className="form-error" id={`${intent}-error`} role="alert">{error}</p>
      <button aria-describedby={`${intent}-error`} className="button button-dark" disabled={state === "sending"} type="submit">{state === "sending" ? "Sending…" : intent === "hospital_demo" ? "Request hospital demo" : "Request investor materials"} <span>→</span></button>
    </form>
  );
}
