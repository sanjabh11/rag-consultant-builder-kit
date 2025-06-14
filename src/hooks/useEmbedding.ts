
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useEmbedding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmbedding = async (input: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-embedding', {
        body: { input },
      });
      if (error) throw error;
      return data.embedding as number[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getEmbedding, isLoading, error };
}
