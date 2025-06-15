
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RAGResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    fileName: string;
    chunkText: string;
    similarity: number;
    pageNumber?: number;
  }>;
  tokensUsed: number;
}

export const useCloudRAG = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const queryRAG = async (
    query: string,
    projectId: string,
    options?: {
      maxSources?: number;
      similarityThreshold?: number;
    }
  ): Promise<RAGResponse | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('query-rag', {
        body: {
          query,
          projectId,
          userId: user.id,
          maxSources: options?.maxSources || 5,
          similarityThreshold: options?.similarityThreshold || 0.7,
        },
      });

      if (error) throw error;
      return data as RAGResponse;
    } catch (error) {
      console.error('RAG query error:', error);
      toast({
        title: "Query Error",
        description: "Failed to process your question. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (documentId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { documentId, userId: user.id },
      });

      if (error) throw error;
      return data.summary;
    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        title: "Summary Error",
        description: "Failed to generate document summary.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    queryRAG,
    generateSummary,
    loading,
  };
};
