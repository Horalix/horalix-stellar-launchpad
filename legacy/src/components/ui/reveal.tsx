import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Reveal - scroll-triggered entrance wrapper (fade + rise, once)
 * Pairs with the .reveal-up / .reveal-visible classes in index.css, which also
 * handle prefers-reduced-motion (content shows immediately, no animation).
 */
interface RevealProps {
  as?: ElementType;
  /** Stagger delay in ms, applied via the --reveal-delay custom property */
  delay?: number;
  className?: string;
  children: ReactNode;
}

export const Reveal = ({ as: Tag = "div", delay = 0, className, children }: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={cn("reveal-up", visible && "reveal-visible", className)}
    >
      {children}
    </Tag>
  );
};
