import techstarsLogo from "@/assets/Techstars_Logo_Primary_Black.png";

/**
 * TechstarsTicker - Smooth infinite scrolling banner showing Techstars accelerator badge
 * Uses CSS transform with will-change for GPU acceleration without performance impact
 */
export const TechstarsTicker = () => {
  // Single ticker item component for cleaner rendering
  const TickerItem = () => (
    <div className="flex items-center gap-4 opacity-90 flex-shrink-0 px-6">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Accelerated By
      </span>
      <img 
        src={techstarsLogo} 
        alt="Techstars" 
        className="h-12 w-auto brightness-0 invert"
      />
      <div className="w-1 h-8 bg-primary-foreground/20 rotate-12 ml-4" />
    </div>
  );

  return (
    <section className="bg-primary text-primary-foreground py-4 border-y border-accent relative z-20 overflow-hidden">
      {/* Double the content: first half + second half (identical) creates seamless loop */}
      <div className="animate-marquee">
        {/* First set of items */}
        {[...Array(8)].map((_, i) => (
          <TickerItem key={`a-${i}`} />
        ))}
        {/* Second set (duplicate) for seamless loop - when first set scrolls out, second appears identical */}
        {[...Array(8)].map((_, i) => (
          <TickerItem key={`b-${i}`} />
        ))}
      </div>
    </section>
  );
};
