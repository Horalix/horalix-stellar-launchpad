import { useState, useEffect, useCallback } from "react";

/**
 * TypewriterHeadline - Terminal-style animated tagline (kinetic brand flavor)
 *
 * NOTE: This is intentionally NOT the page <h1>. The hero renders a fixed,
 * scannable value headline; this component is a secondary rotating tagline.
 * It respects `prefers-reduced-motion` (renders a static line, no typing/cursor).
 */

// Step 1: Define tagline messages
const HEADLINES = [
  "AI That Thinks Like a Clinician",
  "From Data to Decisions",
  "Decision Support at Lightning Speed",
  "Real-Time Analysis for Real Patients",
  "Built for Doctors, By Doctors",
  "AI You Can Trust in Practice",
  "Powering the Future of Medicine",
  "Where Medicine meets Technology",
];

// Easter egg with 1 in 1 billion chance
const EASTER_EGG = "July? Yes they do.";
const EASTER_EGG_CHANCE = 1 / 1_000_000_000;

// Step 2: Animation timing configuration
const CONFIG = {
  typeSpeed: 50, // ms per character when typing
  deleteSpeed: 30, // ms per character when deleting
  pauseDuration: 1800, // ms pause after typing complete
  cursorBlinkRate: 500, // ms cursor blink interval
};

type Phase = "typing" | "paused" | "deleting";

const WRAPPER_CLASS =
  "block min-h-[1.8em] font-mono text-base sm:text-lg font-semibold tracking-tight text-accent-strong";

export const TypewriterHeadline = () => {
  // Step 3: State management
  const [displayText, setDisplayText] = useState("");
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  // [A11Y] Track reduced-motion preference reactively
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Step 4: Get current target headline (with easter egg chance)
  const getNextHeadline = useCallback(() => {
    if (Math.random() < EASTER_EGG_CHANCE) {
      return EASTER_EGG;
    }
    return HEADLINES[headlineIndex];
  }, [headlineIndex]);

  const currentTarget = getNextHeadline();

  // Step 5: Cursor blinking effect (skipped under reduced motion)
  useEffect(() => {
    if (reduceMotion) return;
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, CONFIG.cursorBlinkRate);

    return () => clearInterval(cursorInterval);
  }, [reduceMotion]);

  // Step 6: Main typewriter animation logic (disabled under reduced motion)
  useEffect(() => {
    if (reduceMotion) return;
    let timeout: NodeJS.Timeout;

    if (phase === "typing") {
      if (displayText.length < currentTarget.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, CONFIG.typeSpeed);
      } else {
        setPhase("paused");
      }
    } else if (phase === "paused") {
      timeout = setTimeout(() => {
        setPhase("deleting");
      }, CONFIG.pauseDuration);
    } else if (phase === "deleting") {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, CONFIG.deleteSpeed);
      } else {
        setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, phase, currentTarget, reduceMotion]);

  // Step 7a: Reduced-motion render — static line, no animation or cursor
  if (reduceMotion) {
    return <span className={WRAPPER_CLASS}>{HEADLINES[0]}</span>;
  }

  // Step 7b: Animated render (decorative — hidden from assistive tech to avoid churn)
  return (
    <span className={WRAPPER_CLASS}>
      <span aria-hidden="true">
        {displayText}
        <span
          className={`inline-block transition-opacity duration-100 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
        >
          _
        </span>
      </span>
      <span className="sr-only">Clinical AI for echocardiography workflows.</span>
    </span>
  );
};
