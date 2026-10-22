"use client";

import { useRef, useState } from "react";

type ProductFrameProps = { compact?: boolean };

/**
 * The hero player. Deliberately has no native controls: the film is a background element,
 * not something to scrub through, so there is no pause or seek. Sound is the one thing the
 * viewer controls — and it has to start muted regardless, because every browser blocks
 * autoplay with audio until the user acts.
 */
export function ProductFrame({ compact = false }: ProductFrameProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    // Autoplay may have been blocked entirely; unmuting is a user gesture, so it is also
    // the first moment playback can legally be (re)started.
    if (!el.muted && el.paused) void el.play().catch(() => undefined);
    setMuted(el.muted);
  };

  return (
    <figure className={compact ? "product-frame compact" : "product-frame"}>
      <div className="product-topbar">
        <div className="product-word"><i /> HORALIX / ECHO WORKFLOW</div>
        <div className="study-state"><span /> Product walkthrough</div>
      </div>
      <div className="product-media brand-film-media">
        <video
          ref={video}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          poster="/media/horalix-demo-poster.webp"
          // The poster carries the first paint; the film itself must not compete with LCP.
          preload="metadata"
          width={1600}
          height={900}
          aria-label="Walkthrough of the Horalix echocardiography workflow"
          tabIndex={-1}
        >
          <source src="/media/horalix-demo.mp4" type="video/mp4" />
        </video>
        {/* Icon-only, with the action in aria-label: emoji render differently on every
            platform and read as decoration rather than a control. */}
        <button
          type="button"
          className="sound-toggle"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          title={muted ? "Turn sound on" : "Turn sound off"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" />
            {muted
              ? <><path d="m16.5 9.5 5 5" /><path d="m21.5 9.5-5 5" /></>
              : <><path d="M15.4 8.6a4.8 4.8 0 0 1 0 6.8" /><path d="M18.3 5.7a8.9 8.9 0 0 1 0 12.6" /></>}
          </svg>
          <span className="sound-toggle-label">{muted ? "Sound off" : "Sound on"}</span>
        </button>
        <div className="media-corner media-corner-top" aria-hidden="true" />
        <div className="media-corner media-corner-bottom" aria-hidden="true" />
        <div className="scan-line" aria-hidden="true" />
      </div>
      <div className="product-flow" aria-label="Horalix workflow">
        <span><b>01</b>DICOM study</span><i aria-hidden="true">→</i>
        <span><b>02</b>AI-assisted preparation</span><i aria-hidden="true">→</i>
        <span><b>03</b>Clinician review</span>
      </div>
      <figcaption>Product walkthrough · Illustrative study · Not for diagnostic use</figcaption>
    </figure>
  );
}
