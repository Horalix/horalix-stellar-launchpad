import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * AuthenticatedRoute - Wrapper for routes requiring authentication
 * Redirects to login if user is not authenticated
 */

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export const AuthenticatedRoute = ({ children }: AuthenticatedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Step 1: Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Step 2: Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Step 3: Render protected content
  return <>{children}</>;
};
