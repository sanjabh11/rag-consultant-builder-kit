
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RAGQuery {
  id: string;
  project_id: string;
  user_id: string;
  query_text: string;
  response_text?: string;
  retrieved_chunks: any[];
  llm_provider?: string;
  tokens_used: number;
  response_time_ms?: number;
  created_at: string;
}

export const useRAGQueries = (projectId: string) => {
  return useQuery({
    queryKey: ['rag-queries', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rag_queries')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RAGQuery[];
    },
    enabled: !!projectId,
  });
};

export const useCreateRAGQuery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (query: Partial<RAGQuery>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('rag_queries')
        .insert({
          ...query,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as RAGQuery;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rag-queries', data.project_id] });
    },
  });
};
