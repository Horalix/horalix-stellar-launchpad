"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      ".section-heading, .workflow-step, .audience-card, .evidence-main, .evidence-side, .trust-row, .resource-card, .metricless-card, .feature-block, .timeline-row, .status-card, .source-row, .form-card, .split-cta-panel, .proof-item, .hero-visual, .pilot-card, .team-card, .news-card, .faq-list details, .program-logo-row a, .metric-tile, .pilot-note",
    ));
    const entryTargets = Array.from(document.querySelectorAll<HTMLElement>(
      ".hero-copy > *, .page-intro .intro-grid > *, .article-hero .shell > *",
    ));

    root.classList.add("motion-ready");
    targets.forEach((target, index) => {
      target.classList.add("reveal-target");
      target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));

    entryTargets.forEach((target, index) => {
      target.classList.add("page-enter-target");
      target.style.setProperty("--entry-delay", `${Math.min(index, 4) * 75}ms`);
    });
    const entryFrame = window.requestAnimationFrame(() => {
      entryTargets.forEach((target) => target.classList.add("is-entered"));
    });

    let scrollFrame = 0;
    const updateHeader = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 24);
      scrollFrame = 0;
    };
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateHeader);
    };
    updateHeader();
    window.addEventListener("scroll", onScroll, { passive: true });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const pointerTargets = reduceMotion || coarsePointer
      ? []
      : Array.from(document.querySelectorAll<HTMLElement>(".hero, .product-frame"));
    let pointerFrame = 0;
    const onPointer = (event: PointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      const clientX = event.clientX;
      const clientY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--pointer-x", `${clientX - rect.left}px`);
        target.style.setProperty("--pointer-y", `${clientY - rect.top}px`);
        pointerFrame = 0;
      });
    };
    pointerTargets.forEach((target) => target.addEventListener("pointermove", onPointer));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      pointerTargets.forEach((target) => target.removeEventListener("pointermove", onPointer));
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(entryFrame);
      root.classList.remove("motion-ready");
    };
  }, [pathname]);

  return null;
}
