import techstarsLogo from "@/assets/Techstars_Logo_Primary_Black.png";

/**
 * TechstarsTicker - Scrolling banner showing Techstars accelerator badge
 */
export const TechstarsTicker = () => {
  return (
    <section className="bg-primary text-primary-foreground py-4 border-y border-accent relative z-20 overflow-hidden">
      <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
        {/* Repeat the content for seamless scrolling */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 opacity-90">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Accelerated By
            </span>
            <img 
              src={techstarsLogo} 
              alt="Techstars" 
              className="h-6 w-auto brightness-0 invert"
            />
            <span className="font-bold font-space text-lg tracking-tight">
              TECHSTARS
            </span>
            <div className="w-1 h-8 bg-primary-foreground/20 rotate-12 mx-4" />
          </div>
        ))}
      </div>
    </section>
  );
};
