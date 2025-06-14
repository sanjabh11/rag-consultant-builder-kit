
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      return data;
    },
    enabled: !!projectId,
  });
};

export const useCreateRAGQuery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (query: {
      project_id: string;
      query_text: string;
      response_text?: string;
      retrieved_chunks?: any[];
      llm_provider?: string;
      tokens_used?: number;
      response_time_ms?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('rag_queries')
        .insert({
          project_id: query.project_id,
          query_text: query.query_text,
          response_text: query.response_text,
          retrieved_chunks: query.retrieved_chunks || [],
          llm_provider: query.llm_provider,
          tokens_used: query.tokens_used || 0,
          response_time_ms: query.response_time_ms,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rag-queries', data.project_id] });
    },
  });
};
