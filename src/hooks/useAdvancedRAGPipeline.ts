
import { useState, useCallback } from 'react';
import { useLocalDocuments } from '@/hooks/useLocalDocuments';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';

interface VectorStore {
  id: string;
  name: string;
  type: 'chroma' | 'pinecone' | 'weaviate' | 'local';
  status: 'active' | 'inactive';
  config: Record<string, any>;
}

interface RAGPipelineConfig {
  chunkSize: number;
  chunkOverlap: number;
  vectorStores: VectorStore[];
  hybridSearch: boolean;
  reranking: boolean;
  multiQuery: boolean;
}

interface RAGResult {
  answer: string;
  sources: Array<{
    id: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  confidence: number;
  processingTime: number;
  vectorStoreUsed: string;
}

export const useAdvancedRAGPipeline = (projectId: string) => {
  const { currentTenant } = useTenant();
  const { documents, searchDocuments } = useLocalDocuments(projectId);
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineConfig, setPipelineConfig] = useState<RAGPipelineConfig>({
    chunkSize: 1000,
    chunkOverlap: 200,
    vectorStores: [
      {
        id: 'local-store',
        name: 'Local Vector Store',
        type: 'local',
        status: 'active',
        config: {}
      }
    ],
    hybridSearch: true,
    reranking: true,
    multiQuery: false
  });

  const processQuery = useCallback(async (
    query: string,
    options?: {
      maxSources?: number;
      confidenceThreshold?: number;
      useMultipleStores?: boolean;
    }
  ): Promise<RAGResult | null> => {
    if (!currentTenant) return null;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      // Step 1: Multi-query expansion if enabled
      let queries = [query];
      if (pipelineConfig.multiQuery) {
        queries = await expandQuery(query);
      }
      
      // Step 2: Search across multiple vector stores
      const searchResults = await searchMultipleVectorStores(queries, options);
      
      // Step 3: Rerank results if enabled
      let rankedResults = searchResults;
      if (pipelineConfig.reranking) {
        rankedResults = await rerankResults(searchResults, query);
      }
      
      // Step 4: Generate answer using RAG
      const answer = await generateAnswer(query, rankedResults);
      
      const processingTime = Date.now() - startTime;
      
      return {
        answer,
        sources: rankedResults.slice(0, options?.maxSources || 5),
        confidence: calculateConfidence(rankedResults),
        processingTime,
        vectorStoreUsed: 'local-store'
      };
      
    } catch (error) {
      console.error('RAG pipeline error:', error);
      toast({
        title: "Search Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [currentTenant, pipelineConfig, documents, toast]);

  const expandQuery = async (query: string): Promise<string[]> => {
    // Simple query expansion - in production, use LLM
    const expanded = [
      query,
      query.replace(/\?$/, ''),
      `What is ${query.toLowerCase()}`,
      `Explain ${query.toLowerCase()}`
    ];
    return [...new Set(expanded)];
  };

  const searchMultipleVectorStores = async (
    queries: string[],
    options?: { maxSources?: number; confidenceThreshold?: number }
  ) => {
    const allResults = [];
    
    for (const query of queries) {
      const results = searchDocuments(query);
      
      // Convert to standardized format
      const formattedResults = results.flatMap(doc => 
        doc.chunks?.map(chunk => ({
          id: chunk.id,
          content: chunk.text,
          score: 0.8, // Mock score
          metadata: {
            fileName: doc.fileName,
            chunkIndex: chunk.index,
            documentId: doc.id
          }
        })) || []
      );
      
      allResults.push(...formattedResults);
    }
    
    // Remove duplicates and sort by score
    const uniqueResults = allResults.filter((result, index, self) =>
      index === self.findIndex(r => r.id === result.id)
    );
    
    return uniqueResults
      .filter(r => r.score >= (options?.confidenceThreshold || 0.5))
      .sort((a, b) => b.score - a.score)
      .slice(0, options?.maxSources || 10);
  };

  const rerankResults = async (results: any[], query: string) => {
    // Simple reranking based on query term frequency
    return results.map(result => ({
      ...result,
      score: result.score * calculateRelevanceScore(result.content, query)
    })).sort((a, b) => b.score - a.score);
  };

  const calculateRelevanceScore = (content: string, query: string): number => {
    const queryTerms = query.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    
    let score = 1;
    for (const term of queryTerms) {
      const termCount = (contentLower.match(new RegExp(term, 'g')) || []).length;
      score += termCount * 0.1;
    }
    
    return Math.min(score, 2); // Cap at 2x
  };

  const generateAnswer = async (query: string, sources: any[]): Promise<string> => {
    if (sources.length === 0) {
      return "I couldn't find relevant information in your documents to answer this question.";
    }
    
    const context = sources.map(s => s.content).join('\n\n');
    
    // Simple answer generation - in production, use LLM
    const firstSource = sources[0];
    const relevantText = firstSource.content.substring(0, 200);
    
    return `Based on your documents, here's what I found:\n\n${relevantText}...\n\nThis information comes from ${firstSource.metadata.fileName}.`;
  };

  const calculateConfidence = (sources: any[]): number => {
    if (sources.length === 0) return 0;
    
    const avgScore = sources.reduce((sum, s) => sum + s.score, 0) / sources.length;
    return Math.min(avgScore * 100, 95); // Cap at 95%
  };

  const updatePipelineConfig = (config: Partial<RAGPipelineConfig>) => {
    setPipelineConfig(prev => ({ ...prev, ...config }));
  };

  return {
    processQuery,
    isProcessing,
    pipelineConfig,
    updatePipelineConfig,
    vectorStores: pipelineConfig.vectorStores
  };
};
