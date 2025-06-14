
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LLMProvider {
  id: string;
  tenant_id: string;
  name: string;
  provider_type: string;
  endpoint_url?: string;
  status: 'online' | 'offline' | 'error';
  cost_per_token: number;
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useLLMProviders = () => {
  return useQuery({
    queryKey: ['llm-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as LLMProvider[];
    },
  });
};
