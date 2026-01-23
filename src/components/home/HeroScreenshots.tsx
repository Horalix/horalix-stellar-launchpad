import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots
 * - Desktop/tablet: stacked collage with click-to-front + shuffle (position + tilt)
 * - Mobile: stacked collage with 3 screenshots; tap ANY screenshot cycles to next card
 */

type ShotId = "dashboard" | "analysis" | "segmentation";
type RefMode = "desktop" | "mobile";

const capabilities = ["DICOM Upload", "Viewer Overlays", "Audit-ready Export"];

// Match your real screenshot aspect (~1920x1042-1045) to avoid crop/bars.
const IMAGE_ASPECT = "aspect-[1920/1045]";

// Fade collage using a mask (avoids "white slab" overlay div)
const fadeMaskStyle: React.CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
  maskImage:
    "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
};

const SHUFFLE_TIMING = {
  lift: 160,
  move: 320,
  drop: 180,
};

const LIFT_CLASS = "-translate-y-4 scale-[1.03]";
const LIFT_SHADOW =
  "shadow-[0_28px_56px_-14px_rgba(0,0,0,0.32),0_14px_26px_-12px_rgba(0,0,0,0.24)]";
const POSITION_TRANSITION_CLASS =
  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";
const LIFT_TRANSITION_CLASS =
  "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]";

export const HeroScreenshots = () => {
  /**
   * Order maps 1:1 to slots:
   * idx 0 -> back slot
   * idx 1 -> mid slot
   * idx 2 -> front slot
   *
   * Default front: segmentation
   */
  const [order, setOrder] = useState<ShotId[]>([
    "dashboard",
    "analysis",
    "segmentation",
  ]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [liftedId, setLiftedId] = useState<ShotId | null>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const cardRefs = useRef<{
    desktop: Record<ShotId, HTMLDivElement | null>;
    mobile: Record<ShotId, HTMLDivElement | null>;
  }>({
    desktop: {
      dashboard: null,
      analysis: null,
      segmentation: null,
    },
    mobile: {
      dashboard: null,
      analysis: null,
      segmentation: null,
    },
  });
  const prevRectsRef = useRef<{
    mode: RefMode;
    rects: Partial<Record<ShotId, DOMRect>>;
  } | null>(null);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const schedule = (cb: () => void, delay: number) => {
    const id = setTimeout(cb, delay);
    timersRef.current.push(id);
  };

  const setCardRef =
    (mode: RefMode, id: ShotId) => (node: HTMLDivElement | null) => {
      cardRefs.current[mode][id] = node;
    };

  const isVisible = (node: HTMLDivElement | null) =>
    !!node && node.getClientRects().length > 0;

  const getActiveMode = (): RefMode => {
    const desktopVisible = (Object.values(
      cardRefs.current.desktop
    ) as Array<HTMLDivElement | null>).some(isVisible);
    return desktopVisible ? "desktop" : "mobile";
  };

  const capturePositions = () => {
    const mode = getActiveMode();
    const refs = cardRefs.current[mode];
    const rects: Partial<Record<ShotId, DOMRect>> = {};
    (Object.keys(refs) as ShotId[]).forEach((id) => {
      const node = refs[id];
      if (node) {
        rects[id] = node.getBoundingClientRect();
      }
    });
    prevRectsRef.current = { mode, rects };
  };

  useLayoutEffect(() => {
    const prevSnapshot = prevRectsRef.current;
    if (!prevSnapshot) return;
    const { mode, rects: prevRects } = prevSnapshot;
    const refs = cardRefs.current[mode];

    const nodes: HTMLDivElement[] = [];

    order.forEach((id) => {
      const node = refs[id];
      const prev = prevRects[id];
      if (!node || !prev) return;

      const next = node.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      const scaleX = prev.width / next.width;
      const scaleY = prev.height / next.height;

      if (dx || dy || scaleX !== 1 || scaleY !== 1) {
        node.style.transition = "none";
        node.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
        nodes.push(node);
      }
    });

    if (nodes.length === 0) {
      prevRectsRef.current = null;
      return;
    }

    // Force reflow before playing the transition.
    nodes[0].getBoundingClientRect();

    requestAnimationFrame(() => {
      nodes.forEach((node) => {
        node.style.transition = "";
        node.style.transform = "";
      });
    });

    prevRectsRef.current = null;
  }, [order]);

  const startShuffle = (liftId: ShotId, reorder: () => void) => {
    if (isShuffling) return;
    setIsShuffling(true);
    setLiftedId(liftId);

    schedule(() => {
      reorder();
    }, SHUFFLE_TIMING.lift);

    schedule(() => {
      setLiftedId(null);
    }, SHUFFLE_TIMING.lift + SHUFFLE_TIMING.move);

    schedule(() => {
      setIsShuffling(false);
    }, SHUFFLE_TIMING.lift + SHUFFLE_TIMING.move + SHUFFLE_TIMING.drop);
  };

  // Desktop behavior: bring the clicked card to the front (end of array)
  const bringToFront = (id: ShotId) => {
    startShuffle(id, () => {
      capturePositions();
      setOrder((prev) => {
        const next = prev.filter((x) => x !== id);
        next.push(id);
        return next;
      });
    });
  };

  /**
   * Mobile behavior: cycle to the "next" card (like revealing the next card under the top).
   * With our mapping (front = last element), we want:
   * [A, B, C(front)] -> next front should be B
   * Achieved by: move last to front => [C, A, B(front)]
   */
  const cycleNext = () => {
    if (order.length < 2) return;
    const frontId = order[order.length - 1];
    if (!frontId) return;

    startShuffle(frontId, () => {
      capturePositions();
      setOrder((prev) => {
        if (prev.length < 2) return prev;
        const next = [...prev];
        const last = next.pop()!;
        next.unshift(last);
        return next;
      });
    });
  };

  const makeKeyHandlersDesktop =
    (id: ShotId) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isShuffling) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        bringToFront(id);
      }
    };

  // For mobile: key activation just cycles (doesn't depend on which card)
  const makeKeyHandlersMobile =
    () => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isShuffling) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cycleNext();
      }
    };

  const shots: Record<ShotId, { src: string; alt: string }> = {
    dashboard: { src: screenshotDashboard, alt: "Patient Studies Dashboard" },
    analysis: { src: screenshotAnalysis, alt: "AI Measurements Analysis" },
    segmentation: { src: screenshotSegmentation, alt: "AI Segmentations View" },
  };

  // Desktop slot geometry (triangular collage)
  const desktopSlots = useMemo(
    () => [
      {
        positionClass: "top-[8%] left-[5%] w-[68%] z-10",
        rotateClass: "rotate-[-2.5deg]",
        shadow:
          "shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18),0_4px_10px_-4px_rgba(0,0,0,0.10)]",
        border: "border-border/30",
      },
      {
        positionClass: "top-[22%] left-[26%] w-[72%] z-20",
        rotateClass: "rotate-[2deg]",
        shadow:
          "shadow-[0_18px_36px_-10px_rgba(0,0,0,0.22),0_6px_14px_-6px_rgba(0,0,0,0.15)]",
        border: "border-border/40",
      },
      {
        positionClass: "top-[42%] left-[8%] w-[65%] z-30",
        rotateClass: "rotate-[-1.5deg]",
        shadow:
          "shadow-[0_22px_44px_-12px_rgba(0,0,0,0.26),0_10px_20px_-8px_rgba(0,0,0,0.18)]",
        border: "border-border/60",
      },
    ],
    []
  );

  // Mobile slot geometry (tight deck)
  const mobileSlots = useMemo(
    () => [
      {
        positionClass: "top-[0%] left-[2%] w-[92%] z-10",
        rotateClass: "rotate-[-2deg]",
        shadow:
          "shadow-[0_10px_22px_-10px_rgba(0,0,0,0.18),0_4px_10px_-6px_rgba(0,0,0,0.10)]",
        border: "border-border/30",
      },
      {
        positionClass: "top-[10%] left-[4%] w-[96%] z-20",
        rotateClass: "rotate-[2deg]",
        shadow:
          "shadow-[0_14px_28px_-12px_rgba(0,0,0,0.22),0_6px_14px_-8px_rgba(0,0,0,0.14)]",
        border: "border-border/40",
      },
      {
        positionClass: "top-[22%] left-[4%] w-[94%] z-30",
        rotateClass: "rotate-[-1deg]",
        shadow:
          "shadow-[0_18px_36px_-14px_rgba(0,0,0,0.26),0_10px_18px_-10px_rgba(0,0,0,0.18)]",
        border: "border-border/60",
      },
    ],
    []
  );

  const DesktopCard = ({ id, idx }: { id: ShotId; idx: number }) => {
    const slot = desktopSlots[idx];
    const isFront = idx === 2;
    const isLifted = liftedId === id;

    return (
      <div
        ref={setCardRef("desktop", id)}
        key={id}
        role="button"
        tabIndex={0}
        aria-label={`Bring ${shots[id].alt} to front`}
        aria-disabled={isShuffling}
        onClick={() => {
          if (isShuffling) return;
          bringToFront(id);
        }}
        onKeyDown={makeKeyHandlersDesktop(id)}
        className={[
          "absolute rounded-lg cursor-pointer select-none",
          IMAGE_ASPECT,
          POSITION_TRANSITION_CLASS,
          "transform-gpu will-change-transform origin-top-left",
          "focus:outline-none focus:ring-2 focus:ring-accent/40",
          slot.positionClass,
          isShuffling ? "pointer-events-none" : "",
        ].join(" ")}
      >
        <div
          className={[
            "relative w-full h-full rounded-lg overflow-hidden bg-card border",
            LIFT_TRANSITION_CLASS,
            "transform-gpu",
            !isShuffling ? "hover:-translate-y-1 hover:scale-[1.01]" : "",
            slot.rotateClass,
            isLifted ? LIFT_CLASS : "",
            isLifted ? LIFT_SHADOW : slot.shadow,
            slot.border,
            isFront ? "opacity-100" : "opacity-95",
          ].join(" ")}
        >
          <img
            src={shots[id].src}
            alt={shots[id].alt}
            className="w-full h-full object-cover object-top block"
            loading="eager"
          />
        </div>
      </div>
    );
  };

  const MobileCard = ({ id, idx }: { id: ShotId; idx: number }) => {
    const slot = mobileSlots[idx];
    const isFront = idx === 2;
    const isLifted = liftedId === id;

    return (
      <div
        ref={setCardRef("mobile", id)}
        key={id}
        role="button"
        tabIndex={0}
        aria-label="Shuffle screenshots"
        aria-disabled={isShuffling}
        onClick={() => {
          if (isShuffling) return;
          cycleNext();
        }}
        onKeyDown={makeKeyHandlersMobile()}
        className={[
          "absolute rounded-lg cursor-pointer select-none",
          IMAGE_ASPECT,
          POSITION_TRANSITION_CLASS,
          "transform-gpu will-change-transform origin-top-left",
          slot.positionClass,
          isShuffling ? "pointer-events-none" : "",
        ].join(" ")}
      >
        <div
          className={[
            "relative w-full h-full rounded-lg overflow-hidden bg-card border",
            LIFT_TRANSITION_CLASS,
            "transform-gpu",
            !isShuffling ? "active:scale-[0.995]" : "",
            slot.rotateClass,
            isLifted ? LIFT_CLASS : "",
            isLifted ? LIFT_SHADOW : slot.shadow,
            slot.border,
            isFront ? "opacity-100" : "opacity-95",
          ].join(" ")}
        >
          <img
            src={shots[id].src}
            alt={shots[id].alt}
            className="w-full h-full object-cover object-top block"
            loading="eager"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col lg:justify-center">
      {/* ========== COLLAGE SECTION ========== */}
      <div className="relative w-full flex items-center justify-center overflow-hidden md:overflow-visible pt-5 pb-0 md:py-0 min-h-[320px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[520px]">
        {/* Desktop/Tablet collage */}
        <div
          className="hidden md:block relative w-full max-w-[720px] mx-auto aspect-[16/11]"
          style={fadeMaskStyle}
        >
          {order.map((id, idx) => (
            <DesktopCard key={id} id={id} idx={idx} />
          ))}
        </div>

        {/* Mobile collage (3 screenshots) */}
        <div className="block md:hidden relative w-full max-w-[92%] mx-auto px-4">
          <div
            className="relative w-full h-[clamp(280px,70vw,380px)]"
            style={fadeMaskStyle}
          >
            {order.map((id, idx) => (
              <MobileCard key={id} id={id} idx={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* ========== TEXT SECTION ========== */}
      <div className="relative z-50 w-full flex flex-col items-center justify-start pt-2 md:pt-6 lg:pt-8 px-4 pb-6">
        <div className="w-10 h-px bg-border mb-4" />

        <h3 className="text-lg font-semibold text-foreground tracking-tight text-center">
          Clinical review, built into the workflow
        </h3>

        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm text-center">
          Designed for real deployments, with clear overlays and audit-friendly
          outputs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {capabilities.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50 border border-border/60 rounded-full"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
