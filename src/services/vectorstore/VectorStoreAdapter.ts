// Base interface for all vector store implementations
export abstract class VectorStoreAdapter {
  protected config: VectorStoreConfig;
  
  constructor(config: VectorStoreConfig) {
    this.config = config;
  }
  
  abstract initialize(): Promise<void>;
  abstract addDocuments(documents: VectorDocument[]): Promise<string[]>;
  abstract similaritySearch(query: number[], k: number, filter?: Record<string, any>): Promise<VectorSearchResult[]>;
  abstract deleteDocuments(ids: string[]): Promise<void>;
  abstract getCollectionStats(): Promise<CollectionStats>;
  abstract healthCheck(): Promise<boolean>;
}

// Local Browser Vector Store (IndexedDB + JavaScript)
export class LocalVectorStore extends VectorStoreAdapter {
  private db?: IDBDatabase;
  private dbName = 'local-vector-store';
  private version = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('vectors')) {
          const store = db.createObjectStore('vectors', { keyPath: 'id' });
          store.createIndex('collection', 'collection', { unique: false });
          store.createIndex('metadata', 'metadata', { unique: false });
        }
      };
    });
  }

  async addDocuments(documents: VectorDocument[]): Promise<string[]> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['vectors'], 'readwrite');
    const store = transaction.objectStore('vectors');
    
    const ids: string[] = [];
    const promises = documents.map(doc => {
      const id = doc.id || `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ids.push(id);
      
      return new Promise<void>((resolve, reject) => {
        const request = store.put({
          id,
          collection: this.config.collection || 'default',
          content: doc.content,
          embedding: doc.embedding,
          metadata: doc.metadata || {},
          created_at: new Date().toISOString()
        });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
    
    await Promise.all(promises);
    return ids;
  }

  async similaritySearch(queryVector: number[], k: number = 5, filter?: Record<string, any>): Promise<VectorSearchResult[]> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['vectors'], 'readonly');
    const store = transaction.objectStore('vectors');
    const index = store.index('collection');
    
    const vectors = await this.getAllVectors(index, this.config.collection || 'default');
    
    // Apply filters if provided
    const filteredVectors = filter 
      ? vectors.filter(vec => this.matchesFilter(vec.metadata, filter))
      : vectors;
    
    // Calculate similarities
    const similarities = filteredVectors.map(vec => ({
      ...vec,
      similarity: this.cosineSimilarity(queryVector, vec.embedding)
    }));
    
    // Sort by similarity and return top-k
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .map(vec => ({
        id: vec.id,
        content: vec.content,
        metadata: vec.metadata,
        similarity: vec.similarity
      }));
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['vectors'], 'readwrite');
    const store = transaction.objectStore('vectors');
    
    const promises = ids.map(id => 
      new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    );
    
    await Promise.all(promises);
  }

  async getCollectionStats(): Promise<CollectionStats> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['vectors'], 'readonly');
    const store = transaction.objectStore('vectors');
    const index = store.index('collection');
    
    const vectors = await this.getAllVectors(index, this.config.collection || 'default');
    
    return {
      total_vectors: vectors.length,
      dimensions: vectors.length > 0 ? vectors[0].embedding.length : 0,
      collection_name: this.config.collection || 'default',
      storage_size: vectors.reduce((sum, vec) => sum + JSON.stringify(vec).length, 0)
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) await this.initialize();
      return this.db !== undefined;
    } catch {
      return false;
    }
  }

  // Utility methods
  private async getAllVectors(index: IDBIndex, collection: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const vectors: any[] = [];
      const request = index.openCursor(IDBKeyRange.only(collection));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          vectors.push(cursor.value);
          cursor.continue();
        } else {
          resolve(vectors);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
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

  private matchesFilter(metadata: Record<string, any>, filter: Record<string, any>): boolean {
    return Object.entries(filter).every(([key, value]) => metadata[key] === value);
  }
}

// ChromaDB Adapter for cloud/server deployments
export class ChromaDBAdapter extends VectorStoreAdapter {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: VectorStoreConfig) {
    super(config);
    this.baseUrl = config.endpoint || 'http://localhost:8000';
    this.apiKey = config.apiKey;
  }

  async initialize(): Promise<void> {
    try {
      await this.makeRequest('GET', '/api/v1/heartbeat');
      
      // Create collection if it doesn't exist
      const collectionName = this.config.collection || 'default';
      try {
        await this.makeRequest('POST', '/api/v1/collections', {
          name: collectionName,
          metadata: { description: 'RAG documents collection' }
        });
      } catch (error) {
        // Collection might already exist, that's okay
        console.log('Collection might already exist:', error);
      }
    } catch (error) {
      throw new Error(`Failed to initialize ChromaDB: ${error}`);
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<string[]> {
    const collectionName = this.config.collection || 'default';
    
    const ids = documents.map(doc => doc.id || `chroma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const embeddings = documents.map(doc => doc.embedding);
    const metadatas = documents.map(doc => doc.metadata || {});
    const contents = documents.map(doc => doc.content);

    await this.makeRequest('POST', `/api/v1/collections/${collectionName}/add`, {
      ids,
      embeddings,
      metadatas,
      documents: contents
    });

    return ids;
  }

  async similaritySearch(queryVector: number[], k: number = 5, filter?: Record<string, any>): Promise<VectorSearchResult[]> {
    const collectionName = this.config.collection || 'default';
    
    const response = await this.makeRequest('POST', `/api/v1/collections/${collectionName}/query`, {
      query_embeddings: [queryVector],
      n_results: k,
      where: filter,
      include: ['documents', 'metadatas', 'distances']
    });

    const results: VectorSearchResult[] = [];
    if (response.ids && response.ids[0]) {
      for (let i = 0; i < response.ids[0].length; i++) {
        results.push({
          id: response.ids[0][i],
          content: response.documents?.[0]?.[i] || '',
          metadata: response.metadatas?.[0]?.[i] || {},
          similarity: 1 - (response.distances?.[0]?.[i] || 0) // Convert distance to similarity
        });
      }
    }

    return results;
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    const collectionName = this.config.collection || 'default';
    
    await this.makeRequest('POST', `/api/v1/collections/${collectionName}/delete`, {
      ids
    });
  }

  async getCollectionStats(): Promise<CollectionStats> {
    const collectionName = this.config.collection || 'default';
    
    const response = await this.makeRequest('GET', `/api/v1/collections/${collectionName}`);
    
    return {
      total_vectors: response.count || 0,
      dimensions: response.metadata?.dimension || 0,
      collection_name: collectionName,
      storage_size: response.count * (response.metadata?.dimension || 0) * 4 // Estimate
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('GET', '/api/v1/heartbeat');
      return true;
    } catch {
      return false;
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`ChromaDB request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Weaviate Adapter
export class WeaviateAdapter extends VectorStoreAdapter {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: VectorStoreConfig) {
    super(config);
    this.baseUrl = config.endpoint || 'http://localhost:8080';
    this.apiKey = config.apiKey;
  }

  async initialize(): Promise<void> {
    try {
      await this.makeRequest('GET', '/v1/meta');
      
      // Create schema if it doesn't exist
      const className = this.config.collection || 'Document';
      try {
        await this.makeRequest('POST', '/v1/schema', {
          class: className,
          description: 'RAG documents collection',
          properties: [
            {
              name: 'content',
              dataType: ['text'],
              description: 'Document content'
            },
            {
              name: 'metadata',
              dataType: ['object'],
              description: 'Document metadata'
            }
          ],
          vectorizer: 'none' // We'll provide our own vectors
        });
      } catch (error) {
        console.log('Schema might already exist:', error);
      }
    } catch (error) {
      throw new Error(`Failed to initialize Weaviate: ${error}`);
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<string[]> {
    const className = this.config.collection || 'Document';
    const ids: string[] = [];
    
    const objects = documents.map(doc => {
      const id = doc.id || `weaviate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ids.push(id);
      
      return {
        id,
        class: className,
        properties: {
          content: doc.content,
          metadata: doc.metadata || {}
        },
        vector: doc.embedding
      };
    });

    await this.makeRequest('POST', '/v1/batch/objects', {
      objects
    });

    return ids;
  }

  async similaritySearch(queryVector: number[], k: number = 5, filter?: Record<string, any>): Promise<VectorSearchResult[]> {
    const className = this.config.collection || 'Document';
    
    let whereClause = {};
    if (filter) {
      whereClause = {
        operator: 'And',
        operands: Object.entries(filter).map(([key, value]) => ({
          path: [`metadata.${key}`],
          operator: 'Equal',
          valueText: value.toString()
        }))
      };
    }

    const response = await this.makeRequest('POST', '/v1/graphql', {
      query: `
        {
          Get {
            ${className}(
              nearVector: {
                vector: [${queryVector.join(', ')}]
              }
              limit: ${k}
              ${Object.keys(whereClause).length > 0 ? `where: ${JSON.stringify(whereClause)}` : ''}
            ) {
              content
              metadata
              _additional {
                id
                distance
              }
            }
          }
        }
      `
    });

    const results: VectorSearchResult[] = [];
    const documents = response.data?.Get?.[className] || [];
    
    for (const doc of documents) {
      results.push({
        id: doc._additional.id,
        content: doc.content,
        metadata: doc.metadata || {},
        similarity: 1 - doc._additional.distance // Convert distance to similarity
      });
    }

    return results;
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    const className = this.config.collection || 'Document';
    
    const promises = ids.map(id =>
      this.makeRequest('DELETE', `/v1/objects/${className}/${id}`)
    );
    
    await Promise.all(promises);
  }

  async getCollectionStats(): Promise<CollectionStats> {
    const className = this.config.collection || 'Document';
    
    const response = await this.makeRequest('POST', '/v1/graphql', {
      query: `
        {
          Aggregate {
            ${className} {
              meta {
                count
              }
            }
          }
        }
      `
    });

    const count = response.data?.Aggregate?.[className]?.[0]?.meta?.count || 0;
    
    return {
      total_vectors: count,
      dimensions: 0, // Weaviate doesn't expose this easily
      collection_name: className,
      storage_size: count * 1000 // Estimate
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('GET', '/v1/meta');
      return true;
    } catch {
      return false;
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`Weaviate request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Vector Store Factory
export class VectorStoreFactory {
  static create(type: VectorStoreType, config: VectorStoreConfig): VectorStoreAdapter {
    switch (type) {
      case 'local':
        return new LocalVectorStore(config);
      case 'chroma':
        return new ChromaDBAdapter(config);
      case 'weaviate':
        return new WeaviateAdapter(config);
      default:
        throw new Error(`Unsupported vector store type: ${type}`);
    }
  }
}

// Type definitions
export type VectorStoreType = 'local' | 'chroma' | 'weaviate' | 'qdrant';

export interface VectorStoreConfig {
  type: VectorStoreType;
  collection?: string;
  endpoint?: string;
  apiKey?: string;
  dimensions?: number;
  metadata?: Record<string, any>;
}

export interface VectorDocument {
  id?: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

export interface CollectionStats {
  total_vectors: number;
  dimensions: number;
  collection_name: string;
  storage_size: number;
}
