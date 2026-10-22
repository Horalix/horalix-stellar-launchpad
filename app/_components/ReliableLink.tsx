import type { AnchorHTMLAttributes, ReactNode } from "react";

type ReliableLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

/** Native links keep every route usable before, during, and after hydration. */
export default function ReliableLink({ href, children, ...props }: ReliableLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
