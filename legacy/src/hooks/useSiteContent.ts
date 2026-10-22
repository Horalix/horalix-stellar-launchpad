import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

/**
 * useSiteContent - Hook for fetching site content by key
 * Provides a fallback value if content is not found
 */

interface SiteContentResult {
  value: string;
  isLoading: boolean;
}

export const useSiteContent = (key: string, fallback: string = ""): SiteContentResult => {
  const { data, isLoading } = useQuery({
    queryKey: ["site-content", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      return data?.value || fallback;
    },
    enabled: isSupabaseConfigured,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    value: data ?? fallback,
    isLoading: isSupabaseConfigured && isLoading,
  };
};

/**
 * useSiteContentBatch - Fetch multiple content keys at once
 */
export const useSiteContentBatch = (keys: string[]): Record<string, string> => {
  const { data } = useQuery({
    queryKey: ["site-content-batch", keys.join(",")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .in("key", keys);

      if (error) throw error;
      
      const contentMap: Record<string, string> = {};
      data?.forEach((item) => {
        contentMap[item.key] = item.value;
      });
      return contentMap;
    },
    enabled: isSupabaseConfigured,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return data || {};
};
