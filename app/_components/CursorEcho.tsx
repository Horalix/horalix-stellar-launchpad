"use client";

import { useEffect, useRef } from "react";

const FOLLOW = 0.22;

/**
 * A single quiet ring that trails the pointer.
 *
 * Deliberately has no pulse, no emitted rings, and no idle animation — the only motion is
 * the easing as it catches up with the cursor. An effect that animates on its own competes
 * with the page for attention every time the pointer moves.
 */
export function CursorEcho() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ring.current;
    if (!element) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let started = false;
    let groundCheck = 0;

    /* The ring floats above both grounds, so sample what is underneath to pick the
       light-on-dark or dark-on-light variant. Throttled — it only matters on section
       boundaries, not every frame. */
    const syncGround = () => {
      element.style.visibility = "hidden";
      const under = document.elementFromPoint(currentX, currentY);
      element.style.visibility = "";
      const onDark = !!under?.closest(".section-dark, .hero, .page-intro, .article-hero, .site-footer, .metric-band, .program-logos-dark, .pilot-card-asa, .section-blue, .audience-card, .split-cta-panel");
      element.classList.toggle("on-dark", onDark);
    };

    const tick = (now: number) => {
      currentX += (pointerX - currentX) * FOLLOW;
      currentY += (pointerY - currentY) * FOLLOW;
      element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      if (now - groundCheck > 220) {
        groundCheck = now;
        syncGround();
      }
      frame = window.requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!started) {
        started = true;
        currentX = pointerX;
        currentY = pointerY;
        element.classList.add("is-active");
        frame = window.requestAnimationFrame(tick);
      }
    };

    const leave = () => element.classList.remove("is-active");
    const enter = () => started && element.classList.add("is-active");

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ring} className="cursor-echo" aria-hidden="true" />;
}
