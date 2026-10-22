"use client";

import Link from "./ReliableLink";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const mobileNav = [
  { href: "/platform", label: "Platform" },
  { href: "/for-hospitals", label: "Hospitals" },
  { href: "/for-clinicians", label: "Clinicians" },
  { href: "/evidence", label: "Evidence" },
  { href: "/security", label: "Security" },
  { href: "/investors", label: "Investors" },
  { href: "/product-tour", label: "Product tour" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function MobileNavigation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  return (
    <div className={`mobile-nav${open ? " is-open" : ""}`} ref={containerRef}>
      <button
        className="mobile-nav-trigger"
        type="button"
        ref={triggerRef}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        <span /><span />
      </button>
      {open ? (
        <nav id="mobile-navigation" aria-label="Mobile">
          {mobileNav.map((item) => {
            const current = pathname === item.href || (item.href === "/resources" && pathname.startsWith("/resources/"));
            return <Link href={item.href} key={item.href} onClick={close} aria-current={current ? "page" : undefined}>{item.label}</Link>;
          })}
          <Link className="button button-light" href="/for-hospitals#request" onClick={close}>Request demo</Link>
        </nav>
      ) : null}
    </div>
  );
}
