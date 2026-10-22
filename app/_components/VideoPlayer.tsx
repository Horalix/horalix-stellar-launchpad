"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * The tour keeps its click-to-play facade. The film is several megabytes, and this page is
 * reached deliberately, so nothing is fetched until the visitor asks for it.
 *
 * Unlike the hero, this player has native controls. This is the page whose entire purpose is
 * watching the walkthrough, and removing pause and seek from a two-and-a-half minute video
 * would be hostile here.
 */
export function VideoPlayer() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="video-shell">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          autoPlay
          controls
          playsInline
          controlsList="nodownload"
          poster="/media/horalix-demo-poster.webp"
          aria-label="Horalix product tour"
        >
          <source src="/media/horalix-demo.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <button
      className="video-poster"
      data-track="video_play"
      onClick={() => setPlaying(true)}
      aria-label="Watch the full Horalix product tour"
    >
      <span className="product-frame compact video-tour-frame">
        <span className="product-topbar">
          <span className="product-word"><i /> HORALIX / PRODUCT TOUR</span>
          <span className="study-state"><span /> Loads after selection</span>
        </span>
        <span className="product-media">
          <Image src="/media/horalix-demo-poster.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 1200px" />
        </span>
        <span className="product-flow">
          <span><b>01</b>DICOM study</span><i aria-hidden="true">→</i>
          <span><b>02</b>AI-assisted preparation</span><i aria-hidden="true">→</i>
          <span><b>03</b>Clinician review</span>
        </span>
      </span>
      <span className="play-button" aria-hidden="true">▶</span>
      <span className="watch-label">Watch the 2:25 product tour</span>
    </button>
  );
}
