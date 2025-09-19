// Local browser storage manager for offline RAG capabilities
export class LocalStorageManager {
  private dbName = 'rag-consultant-db';
  private version = 1;
  private db?: IDBDatabase;

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
        
        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const documentStore = db.createObjectStore('documents', { keyPath: 'id' });
          documentStore.createIndex('project_id', 'project_id', { unique: false });
          documentStore.createIndex('collection_id', 'collection_id', { unique: false });
        }
        
        // Document chunks store for RAG
        if (!db.objectStoreNames.contains('document_chunks')) {
          const chunkStore = db.createObjectStore('document_chunks', { keyPath: 'id' });
          chunkStore.createIndex('document_id', 'document_id', { unique: false });
          chunkStore.createIndex('collection_id', 'collection_id', { unique: false });
        }
        
        // Vector embeddings store (simplified)
        if (!db.objectStoreNames.contains('embeddings')) {
          const embeddingStore = db.createObjectStore('embeddings', { keyPath: 'chunk_id' });
          embeddingStore.createIndex('collection_id', 'collection_id', { unique: false });
        }
        
        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('user_id', 'user_id', { unique: false });
        }
        
        // Chat history store
        if (!db.objectStoreNames.contains('chat_history')) {
          const chatStore = db.createObjectStore('chat_history', { keyPath: 'id' });
          chatStore.createIndex('project_id', 'project_id', { unique: false });
        }
      };
    });
  }

  async storeDocument(document: LocalDocument): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...document,
        stored_at: new Date().toISOString(),
        size: new Blob([document.content]).size
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async storeDocumentChunks(chunks: DocumentChunk[]): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['document_chunks'], 'readwrite');
    const store = transaction.objectStore('document_chunks');
    
    const promises = chunks.map(chunk => 
      new Promise<void>((resolve, reject) => {
        const request = store.put(chunk);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    );
    
    await Promise.all(promises);
  }

  async storeEmbeddings(embeddings: ChunkEmbedding[]): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['embeddings'], 'readwrite');
    const store = transaction.objectStore('embeddings');
    
    const promises = embeddings.map(embedding => 
      new Promise<void>((resolve, reject) => {
        const request = store.put(embedding);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    );
    
    await Promise.all(promises);
  }

  async searchSimilarChunks(
    queryEmbedding: number[], 
    collectionId: string, 
    topK: number = 5
  ): Promise<DocumentChunk[]> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['embeddings', 'document_chunks'], 'readonly');
    const embeddingStore = transaction.objectStore('embeddings');
    const chunkStore = transaction.objectStore('document_chunks');
    
    // Get embeddings for this collection
    const embeddingIndex = embeddingStore.index('collection_id');
    const embeddings = await this.getAllFromIndex(embeddingIndex, collectionId);
    
    // Calculate cosine similarity
    const similarities = embeddings.map(embedding => ({
      chunk_id: embedding.chunk_id,
      similarity: this.cosineSimilarity(queryEmbedding, embedding.vector)
    }));
    
    // Sort by similarity and take top K
    const topMatches = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
    
    // Get the actual chunks
    const chunks: DocumentChunk[] = [];
    for (const match of topMatches) {
      const chunk = await this.getFromStore(chunkStore, match.chunk_id);
      if (chunk) {
        chunks.push({ ...chunk, similarity: match.similarity });
      }
    }
    
    return chunks;
  }

  async storeChatMessage(message: ChatMessage): Promise<void> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['chat_history'], 'readwrite');
    const store = transaction.objectStore('chat_history');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...message,
        id: message.id || Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getChatHistory(projectId: string, limit: number = 50): Promise<ChatMessage[]> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['chat_history'], 'readonly');
    const store = transaction.objectStore('chat_history');
    const index = store.index('project_id');
    
    return new Promise((resolve, reject) => {
      const messages: ChatMessage[] = [];
      const request = index.openCursor(IDBKeyRange.only(projectId), 'prev');
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && messages.length < limit) {
          messages.push(cursor.value);
          cursor.continue();
        } else {
          resolve(messages);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageUsage(): Promise<StorageUsage> {
    if (!this.db) await this.initialize();
    
    const transaction = this.db!.transaction(['documents', 'document_chunks', 'embeddings'], 'readonly');
    
    let totalSize = 0;
    let documentCount = 0;
    let chunkCount = 0;
    let embeddingCount = 0;
    
    const promises = [
      this.countStore(transaction.objectStore('documents')),
      this.countStore(transaction.objectStore('document_chunks')),
      this.countStore(transaction.objectStore('embeddings'))
    ];
    
    const [docCount, chunkCnt, embCnt] = await Promise.all(promises);
    
    return {
      totalSize: totalSize,
      documentCount: docCount,
      chunkCount: chunkCnt,
      embeddingCount: embCnt
    };
  }

  // Utility methods
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

  private async getAllFromIndex(index: IDBIndex, key: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const request = index.openCursor(IDBKeyRange.only(key));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromStore(store: IDBObjectStore, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async countStore(store: IDBObjectStore): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Type definitions
export interface LocalDocument {
  id: string;
  project_id: string;
  collection_id: string;
  name: string;
  content: string;
  content_type: string;
  uploaded_at: string;
  processed: boolean;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  collection_id: string;
  content: string;
  chunk_index: number;
  token_count: number;
  similarity?: number;
}

export interface ChunkEmbedding {
  chunk_id: string;
  collection_id: string;
  vector: number[];
  model_used: string;
  created_at: string;
}

export interface ChatMessage {
  id?: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  sources?: DocumentChunk[];
}

export interface StorageUsage {
  totalSize: number;
  documentCount: number;
  chunkCount: number;
  embeddingCount: number;
}

// Singleton instance
export const localStorageManager = new LocalStorageManager();
