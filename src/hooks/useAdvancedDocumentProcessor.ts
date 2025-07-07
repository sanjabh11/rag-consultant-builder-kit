import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePDFProcessor } from './usePDFProcessor';

interface ProcessedDocument {
  id: string;
  fileName: string;
  content: string;
  chunks: DocumentChunk[];
  metadata: Record<string, any>;
  processingTime: number;
}

interface DocumentChunk {
  id: string;
  text: string;
  index: number;
  metadata: {
    page?: number;
    section?: string;
    keywords?: string[];
    entities?: string[];
  };
}

interface ProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  extractKeywords?: boolean;
  extractEntities?: boolean;
}

export const useAdvancedDocumentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { processPDF } = usePDFProcessor();
  const { toast } = useToast();

  const processDocument = async (
    file: File,
    options: ProcessingOptions = {}
  ): Promise<ProcessedDocument | null> => {
    const startTime = Date.now();
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      let content = '';
      let metadata: Record<string, any> = {};

      // Extract text based on file type
      if (file.type === 'application/pdf') {
        setProcessingProgress(20);
        const pdfResult = await processPDF(file);
        if (!pdfResult) throw new Error('Failed to process PDF');
        content = pdfResult.text;
        metadata = { ...pdfResult.metadata, pageCount: pdfResult.pageCount };
      } else if (file.type === 'text/plain') {
        setProcessingProgress(20);
        content = await file.text();
      } else if (file.name.endsWith('.txt')) {
        setProcessingProgress(20);
        content = await file.text();
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      if (!content.trim()) {
        throw new Error('No text content found in document');
      }

      setProcessingProgress(40);

      // Enhanced chunking with semantic awareness
      const chunks = await createSemanticChunks(content, options);
      setProcessingProgress(70);

      // Extract keywords and entities if requested
      if (options.extractKeywords || options.extractEntities) {
        await enhanceChunksWithNLP(chunks, options);
      }

      setProcessingProgress(90);

      const processedDoc: ProcessedDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        content,
        chunks,
        metadata: {
          ...metadata,
          fileSize: file.size,
          fileType: file.type,
          chunkCount: chunks.length,
        },
        processingTime: Date.now() - startTime,
      };

      setProcessingProgress(100);

      toast({
        title: "Document processed successfully",
        description: `Generated ${chunks.length} chunks in ${Math.round(processedDoc.processingTime / 1000)}s`,
      });

      return processedDoc;
    } catch (error) {
      console.error('Document processing error:', error);
      toast({
        title: "Document processing failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const createSemanticChunks = async (
    content: string,
    options: ProcessingOptions
  ): Promise<DocumentChunk[]> => {
    const chunkSize = options.chunkSize || 1000;
    const overlap = options.chunkOverlap || 200;
    const chunks: DocumentChunk[] = [];

    // Split by logical sections first (paragraphs, then sentences)
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    
    let currentChunk = '';
    let chunkIndex = 0;
    let currentPage = 1;

    for (const paragraph of paragraphs) {
      // Track page numbers from PDF markers
      const pageMatch = paragraph.match(/--- Page (\d+) ---/);
      if (pageMatch) {
        currentPage = parseInt(pageMatch[1]);
        continue;
      }

      // If adding this paragraph would exceed chunk size, finalize current chunk
      if (currentChunk.length + paragraph.length > chunkSize && currentChunk.trim()) {
        chunks.push({
          id: `chunk_${chunkIndex}`,
          text: currentChunk.trim(),
          index: chunkIndex,
          metadata: { page: currentPage }
        });
        
        // Start new chunk with overlap
        const sentences = currentChunk.split(/[.!?]+/).filter(s => s.trim());
        const overlapText = sentences.slice(-Math.ceil(sentences.length * 0.2)).join('. ');
        currentChunk = overlapText + (overlapText ? '. ' : '') + paragraph;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        index: chunkIndex,
        metadata: { page: currentPage }
      });
    }

    return chunks;
  };

  const enhanceChunksWithNLP = async (
    chunks: DocumentChunk[],
    options: ProcessingOptions
  ): Promise<void> => {
    // Simple keyword extraction (can be enhanced with NLP libraries)
    for (const chunk of chunks) {
      if (options.extractKeywords) {
        chunk.metadata.keywords = extractKeywords(chunk.text);
      }
      
      if (options.extractEntities) {
        chunk.metadata.entities = extractNamedEntities(chunk.text);
      }
    }
  };

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction - can be enhanced with TF-IDF or NLP libraries
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  };

  const extractNamedEntities = (text: string): string[] => {
    // Simple named entity extraction - can be enhanced with NLP libraries
    const entities: string[] = [];
    
    // Extract capitalized words/phrases (potential names, places, organizations)
    const capitalizedMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    entities.push(...capitalizedMatches);

    // Extract potential email addresses
    const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    entities.push(...emailMatches);

    // Extract potential phone numbers
    const phoneMatches = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];
    entities.push(...phoneMatches);

    return [...new Set(entities)]; // Remove duplicates
  };

  return {
    processDocument,
    isProcessing,
    processingProgress,
  };
};