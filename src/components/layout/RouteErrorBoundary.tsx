import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { clearChunkReloadGuard, isChunkLoadError } from "@/lib/lazyPage";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

/**
 * RouteErrorBoundary
 * Last line of defence: if a page can't be fetched or throws while rendering,
 * show a recovery panel instead of an empty white screen.
 */
export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page failed to load:", error, info.componentStack);
  }

  private handleRetry = () => {
    clearChunkReloadGuard();
    window.location.reload();
  };

  private handleHome = () => {
    clearChunkReloadGuard();
    window.location.assign("/");
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const stalePage = isChunkLoadError(error);

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-24 text-center"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 600 40"
          className="h-8 w-full max-w-xs text-accent"
          preserveAspectRatio="none"
        >
          <path
            d="M0 24 H150 l12 -7 12 7 h60 l8 -18 10 30 8 -34 10 26 6 -11 h70 l10 -6 10 6 h234"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {stalePage ? "This page has been updated" : "Something went wrong"}
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {stalePage
              ? "We released a new version while you were reading. Reload to pick it up — nothing you saved is lost."
              : "We couldn't show this page just now. Try again, or head back to the homepage."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={this.handleRetry}>Reload page</Button>
          <Button variant="outline" onClick={this.handleHome}>
            Back to homepage
          </Button>
        </div>
      </div>
    );
  }
}
