
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLLMProviders = () => {
  return useQuery({
    queryKey: ['llm-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};
