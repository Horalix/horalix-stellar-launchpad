import { lazy, type ComponentType } from "react";

/**
 * lazyPage
 * Loads a route component on demand, and recovers when the browser asks for a
 * page file that no longer exists (a tab left open across a new deployment).
 * Without this, one vanished file leaves the visitor staring at a blank screen.
 */

const CHUNK_RELOAD_KEY = "horalix:chunk-reload-at";

// Step 1: Recognise the "that page file is gone" failures browsers report for dynamic imports
export function isChunkLoadError(problem: unknown): boolean {
  const message =
    problem instanceof Error
      ? problem.message
      : typeof problem === "string"
        ? problem
        : String(problem ?? "");

  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk \S+ failed/i.test(
    message,
  );
}

// Step 2: Session storage helpers that never throw (private browsing, quota, prerender)
function readLastReload(): number {
  try {
    return Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function writeLastReload(): void {
  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable — the reload guard simply becomes best-effort.
  }
}

export function clearChunkReloadGuard(): void {
  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

// Step 3: Reload at most once per burst so a genuine outage can't loop forever
export function tryAutoReloadOnChunkError(): boolean {
  if (typeof window === "undefined") return false;

  const last = readLastReload();
  const reloadedRecently = last > 0 && Date.now() - last < 30_000;
  if (reloadedRecently) return false;

  writeLastReload();
  window.location.reload();
  return true;
}

// Step 4: The lazy() wrapper used by every route in App.tsx
export function lazyPage<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const module = await factory();
      // A page that loads cleanly resets the guard for the next deployment.
      clearChunkReloadGuard();
      return module;
    } catch (error) {
      if (isChunkLoadError(error) && tryAutoReloadOnChunkError()) {
        // Hold the loader on screen while the browser restarts the page.
        return new Promise<{ default: T }>(() => undefined);
      }
      throw error;
    }
  });
}
