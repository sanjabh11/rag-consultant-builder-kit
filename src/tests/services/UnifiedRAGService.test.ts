import { UnifiedRAGService, LocalEmbeddingProvider } from '../../services/rag/UnifiedRAGService';
import { LocalStorageManager } from '../../services/storage/LocalStorageManager';
import { LLMManager } from '../../services/llm/BaseLLMClient';

// Mock dependencies
jest.mock('../../services/storage/LocalStorageManager');
jest.mock('../../services/llm/BaseLLMClient');

describe('UnifiedRAGService', () => {
  let ragService: UnifiedRAGService;
  let mockLLMManager: jest.Mocked<LLMManager>;
  let mockLocalStorage: jest.Mocked<LocalStorageManager>;
  let mockEmbeddingProvider: jest.Mocked<LocalEmbeddingProvider>;

  beforeEach(() => {
    mockLLMManager = new LLMManager() as jest.Mocked<LLMManager>;
    mockLocalStorage = new LocalStorageManager() as jest.Mocked<LocalStorageManager>;
    mockEmbeddingProvider = new LocalEmbeddingProvider() as jest.Mocked<LocalEmbeddingProvider>;

    ragService = new UnifiedRAGService(
      mockLLMManager,
      mockLocalStorage,
      mockEmbeddingProvider
    );
  });

  describe('processDocument', () => {
    const mockDocument = {
      id: 'test-doc-1',
      project_id: 'test-project',
      collection_id: 'test-collection',
      name: 'test-document.txt',
      content: 'This is a test document with some content for processing.',
      content_type: 'text/plain'
    };

    beforeEach(() => {
      mockLocalStorage.storeDocument.mockResolvedValue(undefined);
      mockLocalStorage.storeDocumentChunks.mockResolvedValue(undefined);
      mockLocalStorage.storeEmbeddings.mockResolvedValue(undefined);
      mockEmbeddingProvider.embed.mockResolvedValue(new Array(384).fill(0.1));
    });

    it('should successfully process a document', async () => {
      await ragService.processDocument(mockDocument);

      expect(mockLocalStorage.storeDocument).toHaveBeenCalledTimes(2); // Initial + final
      expect(mockLocalStorage.storeDocumentChunks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            document_id: 'test-doc-1',
            collection_id: 'test-collection'
          })
        ])
      );
      expect(mockLocalStorage.storeEmbeddings).toHaveBeenCalled();
    });

    it('should handle processing errors gracefully', async () => {
      mockEmbeddingProvider.embed.mockRejectedValue(new Error('Embedding failed'));

      await ragService.processDocument(mockDocument);

      // Should still complete processing even if some embeddings fail
      expect(mockLocalStorage.storeDocument).toHaveBeenCalled();
      expect(mockLocalStorage.storeDocumentChunks).toHaveBeenCalled();
    });

    it('should create appropriate number of chunks', async () => {
      const longDocument = {
        ...mockDocument,
        content: 'a'.repeat(5000) // Long content that should create multiple chunks
      };

      await ragService.processDocument(longDocument);

      const chunksCall = mockLocalStorage.storeDocumentChunks.mock.calls[0][0];
      expect(chunksCall.length).toBeGreaterThan(1);
      expect(chunksCall.every(chunk => chunk.content.length <= 1200)).toBe(true); // Accounting for overlap
    });
  });

  describe('queryRAG', () => {
    const mockQuery = 'What is the company policy on remote work?';
    const mockCollectionId = 'test-collection';
    const mockLLMProviderId = 'test-llm';

    const mockChunks = [
      {
        id: 'chunk-1',
        document_id: 'doc-1',
        collection_id: 'test-collection',
        content: 'Remote work is allowed for eligible employees.',
        chunk_index: 0,
        token_count: 10,
        similarity: 0.85
      },
      {
        id: 'chunk-2',
        document_id: 'doc-1',
        collection_id: 'test-collection',
        content: 'Employees must maintain regular communication with their team.',
        chunk_index: 1,
        token_count: 12,
        similarity: 0.75
      }
    ];

    const mockLLMResponse = {
      text: 'Based on company policy, remote work is allowed for eligible employees.',
      tokens_used: 50,
      cost: 0.001,
      model_used: 'test-model',
      response_time_ms: 200
    };

    beforeEach(() => {
      mockEmbeddingProvider.embed.mockResolvedValue(new Array(384).fill(0.1));
      mockLocalStorage.searchSimilarChunks.mockResolvedValue(mockChunks);
      mockLLMManager.generate.mockResolvedValue(mockLLMResponse);
      mockLocalStorage.storeChatMessage.mockResolvedValue(undefined);
    });

    it('should successfully process a RAG query', async () => {
      const result = await ragService.queryRAG(
        mockQuery,
        mockCollectionId,
        mockLLMProviderId
      );

      expect(result.query).toBe(mockQuery);
      expect(result.response).toBe(mockLLMResponse.text);
      expect(result.sources).toEqual(mockChunks);
      expect(result.metadata.chunks_retrieved).toBe(2);
      expect(result.metadata.tokens_used).toBe(50);
    });

    it('should generate appropriate embeddings for queries', async () => {
      await ragService.queryRAG(mockQuery, mockCollectionId, mockLLMProviderId);

      expect(mockEmbeddingProvider.embed).toHaveBeenCalledWith(mockQuery);
    });

    it('should search for similar chunks with correct parameters', async () => {
      await ragService.queryRAG(mockQuery, mockCollectionId, mockLLMProviderId, {
        topK: 3
      });

      expect(mockLocalStorage.searchSimilarChunks).toHaveBeenCalledWith(
        expect.any(Array),
        mockCollectionId,
        3
      );
    });

    it('should generate LLM response with proper context', async () => {
      await ragService.queryRAG(mockQuery, mockCollectionId, mockLLMProviderId);

      expect(mockLLMManager.generate).toHaveBeenCalledWith(
        mockLLMProviderId,
        expect.stringContaining('Remote work is allowed'),
        expect.objectContaining({
          max_tokens: expect.any(Number),
          temperature: expect.any(Number)
        })
      );
    });

    it('should store chat messages for history', async () => {
      await ragService.queryRAG(mockQuery, mockCollectionId, mockLLMProviderId);

      expect(mockLocalStorage.storeChatMessage).toHaveBeenCalledTimes(2); // User + assistant messages
      expect(mockLocalStorage.storeChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'user',
          content: mockQuery
        })
      );
      expect(mockLocalStorage.storeChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'assistant',
          content: mockLLMResponse.text,
          sources: mockChunks
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockLLMManager.generate.mockRejectedValue(new Error('LLM service unavailable'));

      await expect(
        ragService.queryRAG(mockQuery, mockCollectionId, mockLLMProviderId)
      ).rejects.toThrow('RAG query failed');
    });

    it('should respect query options', async () => {
      const options = {
        topK: 10,
        maxTokens: 200,
        temperature: 0.5,
        maxContextLength: 2000
      };

      await ragService.queryRAG(mockQuery, mockCollectionId, mockLLMProviderId, options);

      expect(mockLocalStorage.searchSimilarChunks).toHaveBeenCalledWith(
        expect.any(Array),
        mockCollectionId,
        10
      );
      expect(mockLLMManager.generate).toHaveBeenCalledWith(
        mockLLMProviderId,
        expect.any(String),
        expect.objectContaining({
          max_tokens: 200,
          temperature: 0.5
        })
      );
    });
  });

  describe('document chunking', () => {
    it('should create overlapping chunks for long documents', () => {
      const longText = 'sentence one. sentence two. sentence three. sentence four. sentence five.'.repeat(50);
      const chunks = (ragService as any).chunkDocument(longText, {
        chunk_size: 100,
        chunk_overlap: 20,
        document_id: 'test-doc',
        collection_id: 'test-collection'
      });

      expect(chunks.length).toBeGreaterThan(1);
      
      // Check overlap
      for (let i = 1; i < chunks.length; i++) {
        const prevChunk = chunks[i - 1];
        const currentChunk = chunks[i];
        
        // Should have some overlapping content
        const prevEnd = prevChunk.content.slice(-10);
        expect(currentChunk.content).toContain(prevEnd.split(' ').slice(-1)[0]);
      }
    });

    it('should handle short documents appropriately', () => {
      const shortText = 'This is a short document.';
      const chunks = (ragService as any).chunkDocument(shortText, {
        chunk_size: 1000,
        chunk_overlap: 200,
        document_id: 'test-doc',
        collection_id: 'test-collection'
      });

      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toBe(shortText);
    });

    it('should assign proper metadata to chunks', () => {
      const text = 'Test document content.';
      const chunks = (ragService as any).chunkDocument(text, {
        chunk_size: 1000,
        chunk_overlap: 200,
        document_id: 'test-doc-id',
        collection_id: 'test-collection-id'
      });

      expect(chunks[0]).toMatchObject({
        document_id: 'test-doc-id',
        collection_id: 'test-collection-id',
        chunk_index: 0,
        token_count: expect.any(Number)
      });
    });
  });

  describe('context building', () => {
    const mockChunks = [
      { content: 'First chunk content', similarity: 0.9 },
      { content: 'Second chunk content', similarity: 0.8 },
      { content: 'Third chunk content', similarity: 0.7 }
    ];

    it('should build context from retrieved chunks', () => {
      const context = (ragService as any).buildContext(mockChunks, 1000);

      expect(context).toContain('First chunk content');
      expect(context).toContain('Second chunk content');
      expect(context).toContain('Third chunk content');
      expect(context).toContain('--- Source ---');
    });

    it('should respect max length limits', () => {
      const context = (ragService as any).buildContext(mockChunks, 50);

      expect(context.length).toBeLessThanOrEqual(100); // Some buffer for formatting
    });
  });

  describe('prompt building', () => {
    it('should create well-formed prompts', () => {
      const query = 'What is the policy?';
      const context = 'Policy context here.';
      const prompt = (ragService as any).buildPrompt(query, context);

      expect(prompt).toContain(query);
      expect(prompt).toContain(context);
      expect(prompt).toContain('CONTEXT:');
      expect(prompt).toContain('QUESTION:');
      expect(prompt).toContain('ANSWER:');
    });

    it('should use custom system prompt when provided', () => {
      const customSystemPrompt = 'You are a specialized assistant.';
      const prompt = (ragService as any).buildPrompt('query', 'context', customSystemPrompt);

      expect(prompt).toContain(customSystemPrompt);
    });
  });
});

// Integration tests
describe('UnifiedRAGService Integration', () => {
  let ragService: UnifiedRAGService;

  beforeAll(async () => {
    // Initialize with real (but local) dependencies for integration testing
    const llmManager = new LLMManager();
    const localStorage = new LocalStorageManager();
    const embeddingProvider = new LocalEmbeddingProvider();

    ragService = new UnifiedRAGService(llmManager, localStorage, embeddingProvider);
  });

  it('should handle end-to-end document processing and querying', async () => {
    const testDocument = {
      id: 'integration-test-doc',
      project_id: 'integration-test-project',
      collection_id: 'integration-test-collection',
      name: 'integration-test.txt',
      content: 'Company vacation policy allows 15 days per year. Employees must request vacation at least 2 weeks in advance.',
      content_type: 'text/plain'
    };

    // Process document
    await ragService.processDocument(testDocument);

    // Query the processed document
    const result = await ragService.queryRAG(
      'How many vacation days do employees get?',
      'integration-test-collection',
      'test-provider'
    );

    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.response).toBeDefined();
    expect(result.metadata.chunks_retrieved).toBeGreaterThan(0);

    // Verify storage stats
    const stats = await ragService.getStorageStats();
    expect(stats.documentCount).toBeGreaterThan(0);
    expect(stats.chunkCount).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for integration test
});
