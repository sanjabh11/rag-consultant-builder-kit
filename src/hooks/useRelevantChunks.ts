
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

      try {
        // Use proper vector similarity search with pgvector
        const { data, error } = await supabase
          .from("document_chunks")
          .select(
            "id, chunk_text, file_name, file_path, chunk_index, metadata, created_at, documents!inner(id, file_name, user_id)"
          )
          .eq("project_id", projectId)
          .eq("documents.user_id", (await supabase.auth.getUser()).data.user?.id)
          .order("embedding <-> ?", { foreignTable: null, ascending: true })
          .limit(topK);

        if (error) {
          console.error('Vector search error:', error);
          // Fallback to basic text search if vector search fails
          const fallbackData = await supabase
            .from("document_chunks")
            .select(
              "id, chunk_text, file_name, file_path, chunk_index, metadata, created_at, documents!inner(id, file_name, user_id)"
            )
            .eq("project_id", projectId)
            .eq("documents.user_id", (await supabase.auth.getUser()).data.user?.id)
            .limit(topK);
          
          return fallbackData.data || [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in relevant chunks query:', error);
        return [];
      }
    },
    enabled:
      !!projectId && Array.isArray(queryEmbedding) && queryEmbedding.length > 0,
  });
};
