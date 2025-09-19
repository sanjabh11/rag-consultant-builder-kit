import { LocalStorageManager, DocumentChunk, ChunkEmbedding } from '../storage/LocalStorageManager';
import { LLMManager, LLMResponse } from '../llm/BaseLLMClient';

// Unified RAG service that works with multiple vector stores
export class UnifiedRAGService {
  private llmManager: LLMManager;
  private localStorage: LocalStorageManager;
  private embeddingProvider: EmbeddingProvider;
  
  constructor(
    llmManager: LLMManager, 
    localStorage: LocalStorageManager,
    embeddingProvider: EmbeddingProvider
  ) {
    this.llmManager = llmManager;
    this.localStorage = localStorage;
    this.embeddingProvider = embeddingProvider;
  }

  async processDocument(
    document: {
      id: string;
      project_id: string;
      collection_id: string;
      name: string;
      content: string;
      content_type: string;
    },
    options?: ProcessingOptions
  ): Promise<void> {
    const startTime = Date.now();
    
    // 1. Store the document
    await this.localStorage.storeDocument({
      ...document,
      uploaded_at: new Date().toISOString(),
      processed: false
    });
    
    // 2. Chunk the document
    const chunks = this.chunkDocument(document.content, {
      chunk_size: options?.chunkSize || 1000,
      chunk_overlap: options?.chunkOverlap || 200,
      document_id: document.id,
      collection_id: document.collection_id
    });
    
    // 3. Store chunks
    await this.localStorage.storeDocumentChunks(chunks);
    
    // 4. Generate embeddings
    const embeddings: ChunkEmbedding[] = [];
    for (const chunk of chunks) {
      try {
        const embedding = await this.embeddingProvider.embed(chunk.content);
        embeddings.push({
          chunk_id: chunk.id,
          collection_id: chunk.collection_id,
          vector: embedding,
          model_used: this.embeddingProvider.getModelName(),
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to embed chunk ${chunk.id}:`, error);
      }
    }
    
    // 5. Store embeddings
    await this.localStorage.storeEmbeddings(embeddings);
    
    // 6. Mark document as processed
    await this.localStorage.storeDocument({
      ...document,
      uploaded_at: new Date().toISOString(),
      processed: true
    });
    
    console.log(`Document processed in ${Date.now() - startTime}ms: ${chunks.length} chunks, ${embeddings.length} embeddings`);
  }

  async queryRAG(
    query: string,
    collectionId: string,
    llmProviderId: string,
    options?: QueryOptions
  ): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.embeddingProvider.embed(query);
      
      // 2. Search for similar chunks
      const similarChunks = await this.localStorage.searchSimilarChunks(
        queryEmbedding,
        collectionId,
        options?.topK || 5
      );
      
      // 3. Build context from retrieved chunks
      const context = this.buildContext(similarChunks, options?.maxContextLength || 4000);
      
      // 4. Generate prompt
      const prompt = this.buildPrompt(query, context, options?.systemPrompt);
      
      // 5. Get LLM response
      const llmResponse = await this.llmManager.generate(
        llmProviderId,
        prompt,
        {
          max_tokens: options?.maxTokens || 500,
          temperature: options?.temperature || 0.7
        }
      );
      
      // 6. Store chat message
      await this.localStorage.storeChatMessage({
        project_id: collectionId, // Using collection_id as project_id for now
        role: 'user',
        content: query
      });
      
      await this.localStorage.storeChatMessage({
        project_id: collectionId,
        role: 'assistant',
        content: llmResponse.text,
        sources: similarChunks
      });
      
      return {
        query,
        response: llmResponse.text,
        sources: similarChunks,
        metadata: {
          chunks_retrieved: similarChunks.length,
          tokens_used: llmResponse.tokens_used,
          cost: llmResponse.cost,
          response_time_ms: Date.now() - startTime,
          model_used: llmResponse.model_used
        }
      };
      
    } catch (error) {
      console.error('RAG query failed:', error);
      throw new Error(`RAG query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getChatHistory(projectId: string, limit?: number): Promise<any[]> {
    return this.localStorage.getChatHistory(projectId, limit);
  }

  async getStorageStats(): Promise<any> {
    return this.localStorage.getStorageUsage();
  }

  // Document chunking with advanced strategies
  private chunkDocument(
    content: string, 
    options: {
      chunk_size: number;
      chunk_overlap: number;
      document_id: string;
      collection_id: string;
    }
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const sentences = this.splitIntoSentences(content);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
      // Check if adding this sentence would exceed chunk size
      if (currentChunk.length + sentence.length > options.chunk_size && currentChunk.length > 0) {
        // Create chunk
        chunks.push({
          id: `${options.document_id}-chunk-${chunkIndex}`,
          document_id: options.document_id,
          collection_id: options.collection_id,
          content: currentChunk.trim(),
          chunk_index: chunkIndex,
          token_count: this.estimateTokenCount(currentChunk)
        });
        
        // Start new chunk with overlap
        const overlapText = this.getLastNCharacters(currentChunk, options.chunk_overlap);
        currentChunk = overlapText + ' ' + sentence;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    // Add final chunk if it has content
    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `${options.document_id}-chunk-${chunkIndex}`,
        document_id: options.document_id,
        collection_id: options.collection_id,
        content: currentChunk.trim(),
        chunk_index: chunkIndex,
        token_count: this.estimateTokenCount(currentChunk)
      });
    }
    
    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - can be enhanced with NLP libraries
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private getLastNCharacters(text: string, n: number): string {
    return text.length <= n ? text : text.substring(text.length - n);
  }

  private estimateTokenCount(text: string): number {
    // Rough approximation: 4 characters per token
    return Math.ceil(text.length / 4);
  }

  private buildContext(chunks: DocumentChunk[], maxLength: number): string {
    let context = '';
    for (const chunk of chunks) {
      const addition = `\n\n--- Source ---\n${chunk.content}`;
      if (context.length + addition.length > maxLength) {
        break;
      }
      context += addition;
    }
    return context;
  }

  private buildPrompt(query: string, context: string, systemPrompt?: string): string {
    const defaultSystemPrompt = `You are a helpful AI assistant. Use the provided context to answer the user's question. If the context doesn't contain relevant information, say so clearly. Always cite your sources when possible.`;
    
    return `${systemPrompt || defaultSystemPrompt}

CONTEXT:
${context}

QUESTION: ${query}

ANSWER:`;
  }
}

// Embedding provider interface
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  getModelName(): string;
  getDimensions(): number;
}

// Simple embedding provider using browser-based transformers
export class LocalEmbeddingProvider implements EmbeddingProvider {
  private modelName = 'sentence-transformers/all-MiniLM-L6-v2';
  private dimensions = 384;
  
  async embed(text: string): Promise<number[]> {
    // For now, return a simple hash-based pseudo-embedding
    // In production, use @huggingface/transformers or similar
    const hash = this.simpleHash(text);
    const embedding: number[] = [];
    
    for (let i = 0; i < this.dimensions; i++) {
      embedding.push(Math.sin(hash + i) * Math.cos(hash * i));
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  getModelName(): string {
    return this.modelName;
  }
  
  getDimensions(): number {
    return this.dimensions;
  }
}

// Type definitions
export interface ProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface QueryOptions {
  topK?: number;
  maxTokens?: number;
  temperature?: number;
  maxContextLength?: number;
  systemPrompt?: string;
}

export interface RAGResponse {
  query: string;
  response: string;
  sources: DocumentChunk[];
  metadata: {
    chunks_retrieved: number;
    tokens_used: number;
    cost: number;
    response_time_ms: number;
    model_used: string;
  };
}
