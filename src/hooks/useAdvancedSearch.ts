
import { useState } from 'react';
import { useLocalDocuments } from '@/hooks/useLocalDocuments';

interface SearchResult {
  documentId: string;
  fileName: string;
  chunkId: string;
  content: string;
  score: number;
  keywords: string[];
}

interface SearchOptions {
  algorithm: 'keyword' | 'semantic' | 'hybrid';
  threshold: number;
  maxResults: number;
  boostRecent: boolean;
}

export const useAdvancedSearch = (projectId: string) => {
  const [isSearching, setIsSearching] = useState(false);
  const { documents } = useLocalDocuments(projectId);

  const search = async (
    query: string,
    options: SearchOptions = {
      algorithm: 'hybrid',
      threshold: 0.3,
      maxResults: 10,
      boostRecent: true
    }
  ): Promise<SearchResult[]> => {
    setIsSearching(true);
    
    try {
      const queryTerms = query.toLowerCase().split(/\s+/);
      const results: SearchResult[] = [];

      for (const doc of documents) {
        for (const chunk of doc.chunks || []) {
          const score = calculateSimilarityScore(
            chunk.text,
            queryTerms,
            chunk.keywords || [],
            options
          );

          if (score >= options.threshold) {
            results.push({
              documentId: doc.id,
              fileName: doc.fileName,
              chunkId: chunk.id,
              content: chunk.text,
              score,
              keywords: chunk.keywords || []
            });
          }
        }
      }

      // Sort by score and apply boost for recent documents
      results.sort((a, b) => {
        let scoreA = a.score;
        let scoreB = b.score;

        if (options.boostRecent) {
          const docA = documents.find(d => d.id === a.documentId);
          const docB = documents.find(d => d.id === b.documentId);
          
          if (docA && docB) {
            const ageFactorA = getAgeFactor(docA.uploadedAt);
            const ageFactorB = getAgeFactor(docB.uploadedAt);
            scoreA *= ageFactorA;
            scoreB *= ageFactorB;
          }
        }

        return scoreB - scoreA;
      });

      return results.slice(0, options.maxResults);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateSimilarityScore = (
    text: string,
    queryTerms: string[],
    keywords: string[],
    options: SearchOptions
  ): number => {
    const textLower = text.toLowerCase();
    let score = 0;

    // Keyword matching
    const keywordScore = calculateKeywordScore(textLower, queryTerms);
    
    // Semantic similarity (simplified TF-IDF approach)
    const semanticScore = calculateSemanticScore(textLower, queryTerms, keywords);
    
    // Combine scores based on algorithm
    switch (options.algorithm) {
      case 'keyword':
        score = keywordScore;
        break;
      case 'semantic':
        score = semanticScore;
        break;
      case 'hybrid':
        score = (keywordScore * 0.6) + (semanticScore * 0.4);
        break;
    }

    return Math.min(score, 1.0);
  };

  const calculateKeywordScore = (text: string, queryTerms: string[]): number => {
    let matches = 0;
    let totalTerms = queryTerms.length;

    for (const term of queryTerms) {
      if (text.includes(term)) {
        matches++;
      }
    }

    return matches / totalTerms;
  };

  const calculateSemanticScore = (
    text: string,
    queryTerms: string[],
    keywords: string[]
  ): number => {
    const textWords = text.split(/\s+/);
    const queryWords = queryTerms;
    
    // Calculate TF-IDF-like score
    let score = 0;
    
    for (const queryWord of queryWords) {
      // Term frequency in document
      const tf = textWords.filter(word => word.includes(queryWord)).length / textWords.length;
      
      // Boost if word appears in keywords
      const keywordBoost = keywords.some(keyword => keyword.includes(queryWord)) ? 1.5 : 1.0;
      
      score += tf * keywordBoost;
    }

    return Math.min(score, 1.0);
  };

  const getAgeFactor = (uploadedAt: string): number => {
    const now = new Date();
    const uploadDate = new Date(uploadedAt);
    const daysDiff = (now.getTime() - uploadDate.getTime()) / (1000 * 3600 * 24);
    
    // Documents uploaded within last 7 days get a boost
    if (daysDiff <= 7) return 1.2;
    if (daysDiff <= 30) return 1.1;
    return 1.0;
  };

  return {
    search,
    isSearching
  };
};
