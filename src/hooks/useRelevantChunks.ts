
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
      if (
        !projectId ||
        !Array.isArray(queryEmbedding) ||
        queryEmbedding.length === 0
      )
        return [];

      // Use "as any" to sidestep Typescript types
      const { data, error } = await (supabase as any)
        .from("document_chunks")
        .select(
          "id, chunk_text, file_name, file_path, chunk_index, embedding, created_at"
        )
        .eq("project_id", projectId)
        .order("embedding", {
          ascending: true,
          // @ts-ignore
          queryVector: queryEmbedding,
          // @ts-ignore
          similarity: "cosine",
        })
        .limit(topK);

      if (error) throw error;
      return data;
    },
    enabled:
      !!projectId && Array.isArray(queryEmbedding) && queryEmbedding.length > 0,
  });
};
