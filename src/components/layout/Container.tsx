import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Container - Apple-style constrained content wrapper
 * Provides consistent max-width and horizontal padding across the site
 */
interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Allow content to extend slightly beyond container (for hero visuals) */
  allowOverflow?: boolean;
}

export const Container = ({ 
  children, 
  className,
  allowOverflow = false 
}: ContainerProps) => {
  return (
    <div 
      className={cn(
        "w-full max-w-[1280px] mx-auto px-6 lg:px-12",
        allowOverflow && "overflow-visible",
        className
      )}
    >
      {children}
    </div>
  );
};
