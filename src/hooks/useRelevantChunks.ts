
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Takes: queryEmbedding (number[]), projectId, limit
export const useRelevantChunks = ({
  queryEmbedding,
  projectId,
  topK = 5,
}: {
  queryEmbedding: number[];
  projectId: string;
  topK?: number;
}) => {
  return useQuery({
    queryKey: ["relevant-chunks", projectId, queryEmbedding],
    queryFn: async () => {
      // Disabled for local storage mode - return empty array
      return [];
    },
    enabled: false, // Disable query for local storage mode
  });
};
