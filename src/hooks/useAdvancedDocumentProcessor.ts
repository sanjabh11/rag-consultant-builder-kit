
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useErrorLogging } from '@/hooks/useErrorLogging';

interface ProcessingOptions {
  chunkSize: number;
  overlap: number;
  enableOCR: boolean;
  extractMetadata: boolean;
  generateSummary: boolean;
}

interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: string;
  content: string;
  metadata: {
    wordCount: number;
    pageCount?: number;
    author?: string;
    createdDate?: string;
    language?: string;
    keywords: string[];
  };
  chunks: Array<{
    id: string;
    text: string;
    index: number;
    embedding?: number[];
    keywords: string[];
  }>;
  summary?: string;
  processingTime: number;
}

export const useAdvancedDocumentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();
  const { logError } = useErrorLogging();

  const processDocument = async (
    file: File,
    options: ProcessingOptions = {
      chunkSize: 1000,
      overlap: 100,
      enableOCR: false,
      extractMetadata: true,
      generateSummary: true
    }
  ): Promise<ProcessedDocument | null> => {
    setIsProcessing(true);
    setProcessingProgress(0);
    const startTime = Date.now();

    try {
      // Step 1: Extract content
      setProcessingProgress(20);
      const content = await extractContent(file, options.enableOCR);
      
      // Step 2: Extract metadata
      setProcessingProgress(40);
      const metadata = await extractMetadata(file, content, options.extractMetadata);
      
      // Step 3: Generate chunks
      setProcessingProgress(60);
      const chunks = await generateAdvancedChunks(content, options);
      
      // Step 4: Generate summary (optional)
      setProcessingProgress(80);
      const summary = options.generateSummary ? await generateSummary(content) : undefined;
      
      setProcessingProgress(100);
      
      const processedDoc: ProcessedDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        fileType: file.type,
        content,
        metadata,
        chunks,
        summary,
        processingTime: Date.now() - startTime
      };

      toast({
        title: "Document processed successfully",
        description: `${file.name} processed in ${processedDoc.processingTime}ms`,
      });

      return processedDoc;
    } catch (error) {
      logError(error as Error, 'document-processing');
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  return {
    processDocument,
    isProcessing,
    processingProgress
  };
};

// Helper functions
const extractContent = async (file: File, enableOCR: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.type === 'application/pdf' && enableOCR) {
      // In a real implementation, this would use PDF.js or similar
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  });
};

const extractMetadata = async (file: File, content: string, extractMetadata: boolean) => {
  const wordCount = content.split(/\s+/).length;
  const keywords = extractKeywords(content);
  
  return {
    wordCount,
    pageCount: estimatePageCount(content),
    language: detectLanguage(content),
    keywords,
    createdDate: new Date(file.lastModified).toISOString()
  };
};

const generateAdvancedChunks = async (content: string, options: ProcessingOptions) => {
  const chunks = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > options.chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        index: chunkIndex,
        keywords: extractKeywords(currentChunk)
      });
      
      // Add overlap
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-options.overlap / 10).join(' ') + ' ' + sentence;
      chunkIndex++;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  
  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `chunk_${chunkIndex}`,
      text: currentChunk.trim(),
      index: chunkIndex,
      keywords: extractKeywords(currentChunk)
    });
  }
  
  return chunks;
};

const generateSummary = async (content: string): Promise<string> => {
  // Simple extractive summarization
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const importantSentences = sentences
    .slice(0, Math.min(5, Math.floor(sentences.length * 0.3)))
    .join('. ');
  
  return importantSentences + '.';
};

const extractKeywords = (text: string): string[] => {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
  
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
    
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

const estimatePageCount = (content: string): number => {
  return Math.ceil(content.length / 2000); // Rough estimate
};

const detectLanguage = (content: string): string => {
  // Simple language detection - in reality you'd use a proper library
  const sample = content.slice(0, 1000).toLowerCase();
  if (/[äöüß]/.test(sample)) return 'de';
  if (/[àâäéèêëïîôöùûüÿ]/.test(sample)) return 'fr';
  if (/[áéíóúüñ]/.test(sample)) return 'es';
  return 'en';
};
