"use client";

import Link from "./ReliableLink";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/platform", label: "Platform" },
  { href: "/for-hospitals", label: "Hospitals" },
  { href: "/for-clinicians", label: "Clinicians" },
  { href: "/evidence", label: "Evidence" },
  { href: "/security", label: "Security" },
  { href: "/resources", label: "Resources" },
  { href: "/investors", label: "Investors" },
];

export function PrimaryNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="desktop-nav">
      {navigation.map((item) => (
        <Link href={item.href} key={item.href} aria-current={pathname === item.href || (item.href === "/resources" && pathname.startsWith("/resources/")) ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
