import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * useAuth - Custom hook for authentication state
 * Provides current user and role information
 */

interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Step 1: Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Step 2: Fetch user role (using setTimeout to avoid race condition)
          setTimeout(async () => {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", currentUser.id)
              .maybeSingle();
            
            setRole(roleData?.role ?? null);
            setIsLoading(false);
          }, 0);
        } else {
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    // Step 3: Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .maybeSingle()
          .then(({ data: roleData }) => {
            setRole(roleData?.role ?? null);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    isLoading,
    isAdmin: role === "admin",
    isEditor: role === "editor" || role === "admin",
  };
};
