import { Link } from "react-router-dom";
import { Layers, Waves, ScanLine, Microscope, ArrowRight } from "lucide-react";

/**
 * SolutionsSection - Displays the three main product offerings
 * Links to individual solution detail pages
 */

// Solution card data - matches database structure
const SOLUTIONS = [
  {
    slug: "echo",
    name: "Horalix Echo",
    shortDescription:
      "Automated echocardiogram analysis measuring ejection fraction and wall motion with sub-pixel accuracy.",
    icon: Waves,
    specs: {
      MODEL: "CV-ResNet50",
      ACCURACY: "99.4%",
    },
    badge: null,
  },
  {
    slug: "radiology",
    name: "Horalix Radiology",
    shortDescription:
      "Bone fracture detection and organ segmentation. Enhances contrast for micro-fracture visibility.",
    icon: ScanLine,
    specs: {
      INPUT: "DICOM / X-Ray",
      SPEED: "<400ms",
    },
    badge: null,
  },
  {
    slug: "pathology",
    name: "Horalix Pathology",
    shortDescription:
      "Digital histology analysis. Identifies cellular irregularities and mitotic counts in H&E stained slides.",
    icon: Microscope,
    specs: {
      ZOOM: "40x - 100x",
      STATUS: "BETA",
    },
    badge: "New",
  },
];

export const SolutionsSection = () => {
  return (
    <section
      id="solutions"
      className="py-24 px-6 lg:px-12 bg-secondary border-b border-border relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
              <Layers className="w-4 h-4" />
              <span>Product Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-space">
              Clinical Solutions
            </h2>
          </div>
          <div className="text-right hidden md:block">
            <p className="font-mono text-xs text-muted-foreground max-w-xs">
              Deployed across 40+ institutions.
              <br />
              Select a module for specification details.
            </p>
          </div>
        </div>

        {/* Solution cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SOLUTIONS.map((solution) => {
            const IconComponent = solution.icon;
            
            return (
              <Link
                key={solution.slug}
                to={`/solutions/${solution.slug}`}
                className="group bg-card border border-border p-8 hover:border-accent hover:shadow-lg transition-all relative overflow-hidden"
              >
                {/* Background icon */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconComponent className="w-24 h-24 text-primary" />
                </div>

                {/* Badge if present */}
                {solution.badge && (
                  <div className="absolute top-4 right-4 text-[10px] font-bold bg-accent text-accent-foreground px-2 py-0.5 uppercase">
                    {solution.badge}
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center mb-6 text-accent">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold font-space mb-2 group-hover:text-accent transition-colors">
                  {solution.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {solution.shortDescription}
                </p>

                {/* Specs */}
                <div className="border-t border-border pt-4 space-y-2 font-mono text-xs text-muted-foreground">
                  {Object.entries(solution.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className="text-primary">{value}</span>
                    </div>
                  ))}
                </div>

                {/* View more indicator */}
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
