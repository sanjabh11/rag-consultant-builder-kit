
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  documentTypes?: string[];
  dateRange?: { start: Date; end: Date };
  authors?: string[];
  confidence?: number;
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    snippet: string;
    confidence: number;
    page?: number;
  }>;
  confidence: number;
  processingTime: number;
}

export const useAdvancedRAG = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const advancedSearch = async (
    query: string,
    projectId: string,
    filters?: SearchFilters
  ): Promise<RAGResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('advanced-rag-search', {
        body: {
          query,
          projectId,
          filters,
          enableHybridSearch: true,
          includeSourceCitations: true,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to search documents",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async (documentId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-document-summary', {
        body: { documentId },
      });

      if (error) throw error;
      return data.summary;
    } catch (error) {
      toast({
        title: "Summary Error",
        description: "Failed to generate document summary",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    advancedSearch,
    generateSummary,
    isLoading,
  };
};
