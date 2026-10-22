"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const allowed = new Set(["demo_start", "demo_submission", "investor_start", "investor_submission", "scheduling_click", "video_play", "evidence_view"]);

function source() {
  if (!document.referrer) return "direct";
  const host = new URL(document.referrer).hostname;
  if (/google\./.test(host)) return "google";
  if (/bing\./.test(host)) return "bing";
  if (/chatgpt\.com|openai\.com/.test(host)) return "chatgpt";
  if (/linkedin\.com/.test(host)) return "linkedin";
  return "other";
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const send = (event: string) => { if (!allowed.has(event)) return; navigator.sendBeacon?.("/api/events", new Blob([JSON.stringify({ event, path: location.pathname, source: source() })], { type: "application/json" })); };
    const click = (e: MouseEvent) => { const target = (e.target as HTMLElement).closest<HTMLElement>("[data-track]"); if (target?.dataset.track) send(target.dataset.track); };
    const custom = (e: Event) => send((e as CustomEvent).detail?.event);
    document.addEventListener("click", click); window.addEventListener("horalix:track", custom);
    if (pathname === "/evidence") send("evidence_view");
    return () => { document.removeEventListener("click", click); window.removeEventListener("horalix:track", custom); };
  }, [pathname]);
  return null;
}
