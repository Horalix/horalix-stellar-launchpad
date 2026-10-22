import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * ProtectedRoute - Wrapper for admin-only routes
 * Redirects to login if user is not authenticated or lacks permissions
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, isEditor } = useAuth();

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
    return <Navigate to="/admin/login" replace />;
  }

  // Step 3: Redirect to login if not an admin/editor
  if (!isEditor) {
    return <Navigate to="/admin/login" replace />;
  }

  // Step 4: Render protected content
  return <>{children}</>;
};
