
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
      // Filter by project, top-K cosine similarity
      const { data, error } = await supabase.rpc('match_document_chunks', {
        project_id: projectId,
        embedding: queryEmbedding,
        match_count: topK,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId && Array.isArray(queryEmbedding) && queryEmbedding.length > 0,
  });
};
