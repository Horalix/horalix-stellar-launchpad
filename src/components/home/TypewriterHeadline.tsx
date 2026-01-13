import { useState, useEffect, useCallback } from "react";

/**
 * TypewriterHeadline - Terminal-style animated headline
 * Types text character-by-character, pauses, deletes, then cycles to next
 */

// Step 1: Define headline messages
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
  typeSpeed: 50,        // ms per character when typing
  deleteSpeed: 30,      // ms per character when deleting
  pauseDuration: 1800,  // ms pause after typing complete
  cursorBlinkRate: 500, // ms cursor blink interval
};

type Phase = "typing" | "paused" | "deleting";

export const TypewriterHeadline = () => {
  // Step 3: State management
  const [displayText, setDisplayText] = useState("");
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Step 4: Get current target headline (with easter egg chance)
  const getNextHeadline = useCallback(() => {
    // Check for easter egg on each new headline
    if (Math.random() < EASTER_EGG_CHANCE) {
      return EASTER_EGG;
    }
    return HEADLINES[headlineIndex];
  }, [headlineIndex]);

  const currentTarget = getNextHeadline();

  // Step 5: Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, CONFIG.cursorBlinkRate);

    return () => clearInterval(cursorInterval);
  }, []);

  // Step 6: Main typewriter animation logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === "typing") {
      // Type next character
      if (displayText.length < currentTarget.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, CONFIG.typeSpeed);
      } else {
        // Typing complete, transition to pause
        setPhase("paused");
      }
    } else if (phase === "paused") {
      // Wait before deleting
      timeout = setTimeout(() => {
        setPhase("deleting");
      }, CONFIG.pauseDuration);
    } else if (phase === "deleting") {
      // Delete character by character
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, CONFIG.deleteSpeed);
      } else {
        // Deletion complete, move to next headline
        setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, phase, currentTarget]);

  // Step 7: Render with accessibility support
  return (
    <h1 
      className="min-h-[2.4em] overflow-hidden text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-primary mb-8 leading-[1.2] font-mono"
      aria-label={currentTarget}
    >
      {/* Visible animated text */}
      <span aria-hidden="true">
        {displayText}
        {/* Blinking cursor */}
        <span 
          className={`inline-block transition-opacity duration-100 ${
            cursorVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          _
        </span>
      </span>
      
      {/* SEO fallback - hidden but indexable */}
      <span className="sr-only">
        {HEADLINES.join(". ")}
      </span>
    </h1>
  );
};
