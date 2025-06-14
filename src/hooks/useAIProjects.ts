
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAIProjects = () => {
  return useQuery({
    queryKey: ['ai-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAIProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: {
      name: string;
      domain: string;
      subdomain?: string;
      status?: string;
      config?: Record<string, any>;
      compliance_flags?: string[];
      llm_provider?: string;
      token_budget?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_projects')
        .insert({
          name: project.name,
          domain: project.domain,
          subdomain: project.subdomain,
          status: project.status || 'draft',
          config: project.config || {},
          compliance_flags: project.compliance_flags || [],
          llm_provider: project.llm_provider || 'llama3',
          token_budget: project.token_budget || 10000,
          user_id: user.id,
          tenant_id: user.id, // Using user_id as tenant_id for now
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-projects'] });
    },
  });
};

export const useUpdateAIProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: {
        name?: string;
        domain?: string;
        subdomain?: string;
        status?: string;
        config?: Record<string, any>;
        compliance_flags?: string[];
        llm_provider?: string;
        token_budget?: number;
      };
    }) => {
      const { data, error } = await supabase
        .from('ai_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-projects'] });
    },
  });
};
