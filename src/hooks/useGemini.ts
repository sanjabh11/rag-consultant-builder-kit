
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseGeminiOptions {
  temperature?: number;
  maxTokens?: number;
}

interface GeminiResponse {
  text: string;
  tokensUsed: number;
}

export const useGemini = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = async (
    prompt: string, 
    options: UseGeminiOptions = {}
  ): Promise<GeminiResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-llm', {
        body: {
          prompt,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 1000,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate text');
      }

      return data as GeminiResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateText,
    isLoading,
    error,
  };
};
