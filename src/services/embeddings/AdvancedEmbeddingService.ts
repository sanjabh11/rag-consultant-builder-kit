// Advanced embedding service with browser-based transformers
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for browser environment
env.allowRemoteModels = true;
env.allowLocalModels = true;

export class AdvancedEmbeddingService {
  private pipeline: any = null;
  private modelName: string;
  private dimensions: number;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(modelName: string = 'Xenova/all-MiniLM-L6-v2') {
    this.modelName = modelName;
    this.dimensions = this.getModelDimensions(modelName);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log(`Initializing embedding model: ${this.modelName}`);
      
      // Initialize the feature extraction pipeline
      this.pipeline = await pipeline('feature-extraction', this.modelName, {
        quantized: true, // Use quantized model for faster loading
      });
      
      this.isInitialized = true;
      console.log(`Embedding model initialized successfully: ${this.modelName}`);
    } catch (error) {
      console.error('Failed to initialize embedding model:', error);
      // Fallback to simple hash-based embeddings
      this.pipeline = null;
      this.isInitialized = true;
    }
  }

  async embed(text: string): Promise<number[]> {
    await this.initialize();
    
    if (!this.pipeline) {
      // Fallback to hash-based embedding
      return this.generateHashBasedEmbedding(text);
    }

    try {
      const result = await this.pipeline(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert tensor to array
      let embedding: number[];
      if (result.data) {
        embedding = Array.from(result.data);
      } else if (Array.isArray(result)) {
        embedding = result.flat();
      } else {
        embedding = Array.from(result);
      }

      // Ensure consistent dimensions
      if (embedding.length !== this.dimensions) {
        embedding = this.normalizeEmbeddingDimensions(embedding, this.dimensions);
      }

      return embedding;
    } catch (error) {
      console.warn('Transformer embedding failed, using fallback:', error);
      return this.generateHashBasedEmbedding(text);
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // Process in batches to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.embed(text));
      const batchEmbeddings = await Promise.all(batchPromises);
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  getModelName(): string {
    return this.modelName;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  // Similarity calculation methods
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    
    return Math.sqrt(sum);
  }

  dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    
    return sum;
  }

  // Private helper methods
  private getModelDimensions(modelName: string): number {
    const dimensionMap: Record<string, number> = {
      'Xenova/all-MiniLM-L6-v2': 384,
      'Xenova/all-MiniLM-L12-v2': 384,
      'Xenova/all-distilroberta-v1': 768,
      'Xenova/all-mpnet-base-v2': 768,
      'Xenova/sentence-transformers-all-MiniLM-L6-v2': 384,
      'Xenova/bge-small-en-v1.5': 384,
      'Xenova/bge-base-en-v1.5': 768,
    };
    
    return dimensionMap[modelName] || 384; // Default to 384 dimensions
  }

  private normalizeEmbeddingDimensions(embedding: number[], targetDimensions: number): number[] {
    if (embedding.length === targetDimensions) {
      return embedding;
    }
    
    if (embedding.length > targetDimensions) {
      // Truncate
      return embedding.slice(0, targetDimensions);
    } else {
      // Pad with zeros
      const padded = [...embedding];
      while (padded.length < targetDimensions) {
        padded.push(0);
      }
      return padded;
    }
  }

  private generateHashBasedEmbedding(text: string): number[] {
    // Fallback hash-based embedding for when transformers fail
    const hash = this.simpleHash(text);
    const embedding: number[] = [];
    
    for (let i = 0; i < this.dimensions; i++) {
      const value = Math.sin(hash + i) * Math.cos(hash * (i + 1));
      embedding.push(value);
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
}

// Multi-model embedding manager
export class EmbeddingModelManager {
  private models: Map<string, AdvancedEmbeddingService> = new Map();
  private defaultModel = 'Xenova/all-MiniLM-L6-v2';

  async getModel(modelName?: string): Promise<AdvancedEmbeddingService> {
    const model = modelName || this.defaultModel;
    
    if (!this.models.has(model)) {
      const service = new AdvancedEmbeddingService(model);
      this.models.set(model, service);
    }
    
    const service = this.models.get(model)!;
    await service.initialize();
    return service;
  }

  async embed(text: string, modelName?: string): Promise<number[]> {
    const service = await this.getModel(modelName);
    return service.embed(text);
  }

  async embedBatch(texts: string[], modelName?: string): Promise<number[][]> {
    const service = await this.getModel(modelName);
    return service.embedBatch(texts);
  }

  getAvailableModels(): string[] {
    return [
      'Xenova/all-MiniLM-L6-v2',
      'Xenova/all-MiniLM-L12-v2',
      'Xenova/all-distilroberta-v1',
      'Xenova/all-mpnet-base-v2',
      'Xenova/bge-small-en-v1.5',
      'Xenova/bge-base-en-v1.5',
    ];
  }

  async benchmarkModels(testText: string = "This is a test sentence for benchmarking embedding models."): Promise<BenchmarkResult[]> {
    const models = this.getAvailableModels().slice(0, 3); // Test first 3 models
    const results: BenchmarkResult[] = [];
    
    for (const modelName of models) {
      const startTime = Date.now();
      
      try {
        const service = await this.getModel(modelName);
        const embedding = await service.embed(testText);
        const endTime = Date.now();
        
        results.push({
          modelName,
          dimensions: service.getDimensions(),
          processingTime: endTime - startTime,
          success: true,
          embeddingNorm: Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
        });
      } catch (error) {
        results.push({
          modelName,
          dimensions: 0,
          processingTime: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  clearCache(): void {
    this.models.clear();
  }
}

// Specialized embedding service for different domains
export class DomainSpecificEmbeddingService {
  private baseManager: EmbeddingModelManager;
  private domainModels: Record<string, string> = {
    'legal': 'Xenova/all-mpnet-base-v2',
    'medical': 'Xenova/all-distilroberta-v1',
    'financial': 'Xenova/all-MiniLM-L12-v2',
    'technical': 'Xenova/bge-base-en-v1.5',
    'general': 'Xenova/all-MiniLM-L6-v2'
  };

  constructor() {
    this.baseManager = new EmbeddingModelManager();
  }

  async embedForDomain(text: string, domain: string): Promise<number[]> {
    const modelName = this.domainModels[domain.toLowerCase()] || this.domainModels['general'];
    return this.baseManager.embed(text, modelName);
  }

  async embedBatchForDomain(texts: string[], domain: string): Promise<number[][]> {
    const modelName = this.domainModels[domain.toLowerCase()] || this.domainModels['general'];
    return this.baseManager.embedBatch(texts, modelName);
  }

  getSupportedDomains(): string[] {
    return Object.keys(this.domainModels);
  }

  getModelForDomain(domain: string): string {
    return this.domainModels[domain.toLowerCase()] || this.domainModels['general'];
  }
}

// Type definitions
export interface BenchmarkResult {
  modelName: string;
  dimensions: number;
  processingTime: number;
  success: boolean;
  embeddingNorm?: number;
  error?: string;
}

// Singleton instances
export const embeddingModelManager = new EmbeddingModelManager();
export const domainSpecificEmbedding = new DomainSpecificEmbeddingService();
