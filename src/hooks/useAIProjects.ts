
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AIProject {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  domain: string;
  subdomain?: string;
  status: 'draft' | 'generating' | 'deployed' | 'failed';
  config: Record<string, any>;
  compliance_flags: string[];
  llm_provider: string;
  token_budget: number;
  created_at: string;
  updated_at: string;
}

export const useAIProjects = () => {
  return useQuery({
    queryKey: ['ai-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIProject[];
    },
  });
};

export const useCreateAIProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: Partial<AIProject>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_projects')
        .insert({
          ...project,
          user_id: user.id,
          tenant_id: user.id, // Using user_id as tenant_id for now
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as AIProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-projects'] });
    },
  });
};

export const useUpdateAIProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AIProject> }) => {
      const { data, error } = await supabase
        .from('ai_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AIProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-projects'] });
    },
  });
};
