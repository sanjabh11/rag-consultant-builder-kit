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
      // Only run if input is valid
      if (
        !projectId ||
        !Array.isArray(queryEmbedding) ||
        queryEmbedding.length === 0
      )
        return [];

      // Find relevant chunks by cosine similarity
      // Note: Supabase support for pgvector similarity search is in `order` method
      const { data, error } = await supabase
        .from("document_chunks")
        .select(
          "id, chunk_text, file_name, file_path, chunk_index, embedding, created_at"
        )
        .eq("project_id", projectId)
        // Returns closest matches (cosine distance)
        .order("embedding", {
          ascending: true,
          // "query_embedding" is passed as "embedding", Supabase auto-converts arrays for pgvector
          // @ts-ignore - Supabase JS client types don't yet support vector ordering config
          // This cast is harmless due to missing type support in client as of now
          foreignTable: undefined,
          // @ts-ignore
          queryVector: queryEmbedding,
          // @ts-ignore
          similarity: "cosine",
        } as any)
        .limit(topK);

      if (error) throw error;
      return data;
    },
    enabled:
      !!projectId && Array.isArray(queryEmbedding) && queryEmbedding.length > 0,
  });
};
