/**
 * ArchiveNotice
 * This is the previous Horalix website, kept under /old. A small fixed notice tells
 * visitors so and links to the current site at the root of horalix.com.
 */
export const ArchiveNotice = () => (
  <aside
    aria-label="Archived website"
    className="fixed bottom-4 left-1/2 z-[100] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-background/95 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur"
  >
    <span>You are viewing the archived Horalix website.</span>
    <a href="/" className="whitespace-nowrap font-medium text-accent-strong hover:underline">
      Go to the current site →
    </a>
  </aside>
);
