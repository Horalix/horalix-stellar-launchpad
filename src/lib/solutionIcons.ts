import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bone,
  Brain,
  Dna,
  FileText,
  HeartPulse,
  Layers,
  Microscope,
  Scan,
  ScanLine,
  Stethoscope,
  Waves,
} from "lucide-react";

export const SOLUTION_ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Scan,
  ScanLine,
  Microscope,
  HeartPulse,
  FileText,
  Brain,
  Stethoscope,
  Dna,
  Layers,
  Bone,
  Waves,
};

export const getSolutionIcon = (iconName?: string): LucideIcon => {
  if (!iconName) {
    return Activity;
  }

  return SOLUTION_ICON_MAP[iconName] || Activity;
};
