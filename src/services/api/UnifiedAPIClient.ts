// Unified API client that works with both local storage and cloud services
export class UnifiedAPIClient {
  private baseUrl: string;
  private isOfflineMode: boolean;
  private authToken?: string;
  
  constructor(config: {
    baseUrl?: string;
    offlineMode?: boolean;
    authToken?: string;
  } = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.isOfflineMode = config.offlineMode ?? !navigator.onLine;
    this.authToken = config.authToken;
    
    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.isOfflineMode = false;
    });
    
    window.addEventListener('offline', () => {
      this.isOfflineMode = true;
    });
  }

  // Project Management API
  async createProject(project: CreateProjectRequest): Promise<Project> {
    if (this.isOfflineMode) {
      return this.createProjectLocal(project);
    } else {
      return this.createProjectCloud(project);
    }
  }

  async getProjects(): Promise<Project[]> {
    if (this.isOfflineMode) {
      return this.getProjectsLocal();
    } else {
      return this.getProjectsCloud();
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    if (this.isOfflineMode) {
      return this.updateProjectLocal(id, updates);
    } else {
      return this.updateProjectCloud(id, updates);
    }
  }

  // Document Management API
  async uploadDocument(projectId: string, file: File, metadata?: DocumentMetadata): Promise<Document> {
    if (this.isOfflineMode) {
      return this.uploadDocumentLocal(projectId, file, metadata);
    } else {
      return this.uploadDocumentCloud(projectId, file, metadata);
    }
  }

  async getDocuments(projectId: string): Promise<Document[]> {
    if (this.isOfflineMode) {
      return this.getDocumentsLocal(projectId);
    } else {
      return this.getDocumentsCloud(projectId);
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    if (this.isOfflineMode) {
      return this.deleteDocumentLocal(documentId);
    } else {
      return this.deleteDocumentCloud(documentId);
    }
  }

  // RAG Query API
  async queryRAG(request: RAGQueryRequest): Promise<RAGQueryResponse> {
    if (this.isOfflineMode) {
      return this.queryRAGLocal(request);
    } else {
      return this.queryRAGCloud(request);
    }
  }

  // LLM Configuration API
  async getLLMProviders(): Promise<LLMProvider[]> {
    if (this.isOfflineMode) {
      return this.getLLMProvidersLocal();
    } else {
      return this.getLLMProvidersCloud();
    }
  }

  async testLLMProvider(providerId: string): Promise<LLMTestResult> {
    if (this.isOfflineMode) {
      return this.testLLMProviderLocal(providerId);
    } else {
      return this.testLLMProviderCloud(providerId);
    }
  }

  // Analytics API
  async getAnalytics(projectId: string, timeRange: string): Promise<AnalyticsData> {
    if (this.isOfflineMode) {
      return this.getAnalyticsLocal(projectId, timeRange);
    } else {
      return this.getAnalyticsCloud(projectId, timeRange);
    }
  }

  // ========== LOCAL IMPLEMENTATIONS ==========

  private async createProjectLocal(project: CreateProjectRequest): Promise<Project> {
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: project.name,
      domain: project.domain,
      subdomain: project.subdomain,
      status: 'draft',
      config: project.config || {},
      compliance_flags: project.compliance_flags || [],
      llm_provider: project.llm_provider || 'local',
      token_budget: project.token_budget || 10000,
      user_id: 'local_user',
      tenant_id: 'local_tenant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const projects = this.getStoredData('projects') || [];
    projects.push(newProject);
    this.setStoredData('projects', projects);

    return newProject;
  }

  private async getProjectsLocal(): Promise<Project[]> {
    return this.getStoredData('projects') || [];
  }

  private async updateProjectLocal(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = this.getStoredData('projects') || [];
    const projectIndex = projects.findIndex((p: Project) => p.id === id);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    projects[projectIndex] = updatedProject;
    this.setStoredData('projects', projects);

    return updatedProject;
  }

  private async uploadDocumentLocal(projectId: string, file: File, metadata?: DocumentMetadata): Promise<Document> {
    const document: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      project_id: projectId,
      name: file.name,
      content_type: file.type,
      size: file.size,
      status: 'processing',
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const documents = this.getStoredData('documents') || [];
    documents.push(document);
    this.setStoredData('documents', documents);

    // Simulate processing
    setTimeout(() => {
      const updatedDocs = this.getStoredData('documents') || [];
      const docIndex = updatedDocs.findIndex((d: Document) => d.id === document.id);
      if (docIndex !== -1) {
        updatedDocs[docIndex].status = 'completed';
        this.setStoredData('documents', updatedDocs);
      }
    }, 2000);

    return document;
  }

  private async getDocumentsLocal(projectId: string): Promise<Document[]> {
    const documents = this.getStoredData('documents') || [];
    return documents.filter((doc: Document) => doc.project_id === projectId);
  }

  private async deleteDocumentLocal(documentId: string): Promise<void> {
    const documents = this.getStoredData('documents') || [];
    const filteredDocs = documents.filter((doc: Document) => doc.id !== documentId);
    this.setStoredData('documents', filteredDocs);
  }

  private async queryRAGLocal(request: RAGQueryRequest): Promise<RAGQueryResponse> {
    // This would integrate with the UnifiedRAGService
    return {
      query: request.query,
      response: "This is a local RAG response. In a real implementation, this would use the UnifiedRAGService.",
      sources: [],
      metadata: {
        tokens_used: 50,
        cost: 0,
        response_time_ms: 150,
        model_used: 'local'
      }
    };
  }

  private async getLLMProvidersLocal(): Promise<LLMProvider[]> {
    return this.getStoredData('llm_providers') || [
      {
        id: 'local-1',
        name: 'Local Browser LLM',
        provider_type: 'local',
        endpoint_url: 'browser://local',
        status: 'online',
        cost_per_token: 0,
        enabled: true
      }
    ];
  }

  private async testLLMProviderLocal(providerId: string): Promise<LLMTestResult> {
    return {
      provider_id: providerId,
      status: 'success',
      response_time_ms: 100,
      test_response: 'Local LLM test successful'
    };
  }

  private async getAnalyticsLocal(projectId: string, timeRange: string): Promise<AnalyticsData> {
    return {
      project_id: projectId,
      time_range: timeRange,
      total_queries: 0,
      total_tokens: 0,
      total_cost: 0,
      avg_response_time: 0,
      query_trend: [],
      cost_breakdown: []
    };
  }

  // ========== CLOUD IMPLEMENTATIONS ==========

  private async createProjectCloud(project: CreateProjectRequest): Promise<Project> {
    const response = await this.makeRequest('POST', '/projects', project);
    return response.data;
  }

  private async getProjectsCloud(): Promise<Project[]> {
    const response = await this.makeRequest('GET', '/projects');
    return response.data;
  }

  private async updateProjectCloud(id: string, updates: Partial<Project>): Promise<Project> {
    const response = await this.makeRequest('PUT', `/projects/${id}`, updates);
    return response.data;
  }

  private async uploadDocumentCloud(projectId: string, file: File, metadata?: DocumentMetadata): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await this.makeRequest('POST', '/documents/upload', formData, {
      'Content-Type': 'multipart/form-data'
    });
    return response.data;
  }

  private async getDocumentsCloud(projectId: string): Promise<Document[]> {
    const response = await this.makeRequest('GET', `/projects/${projectId}/documents`);
    return response.data;
  }

  private async deleteDocumentCloud(documentId: string): Promise<void> {
    await this.makeRequest('DELETE', `/documents/${documentId}`);
  }

  private async queryRAGCloud(request: RAGQueryRequest): Promise<RAGQueryResponse> {
    const response = await this.makeRequest('POST', '/rag/query', request);
    return response.data;
  }

  private async getLLMProvidersCloud(): Promise<LLMProvider[]> {
    const response = await this.makeRequest('GET', '/llm-providers');
    return response.data;
  }

  private async testLLMProviderCloud(providerId: string): Promise<LLMTestResult> {
    const response = await this.makeRequest('POST', `/llm-providers/${providerId}/test`);
    return response.data;
  }

  private async getAnalyticsCloud(projectId: string, timeRange: string): Promise<AnalyticsData> {
    const response = await this.makeRequest('GET', `/projects/${projectId}/analytics?time_range=${timeRange}`);
    return response.data;
  }

  // ========== UTILITY METHODS ==========

  private async makeRequest(
    method: string, 
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...headers
      }
    };

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        delete config.headers!['Content-Type']; // Let browser set it
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private getStoredData(key: string): any {
    try {
      const data = localStorage.getItem(`unified_api_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setStoredData(key: string, data: any): void {
    localStorage.setItem(`unified_api_${key}`, JSON.stringify(data));
  }

  // Public methods for mode switching
  setOfflineMode(offline: boolean): void {
    this.isOfflineMode = offline;
  }

  isOffline(): boolean {
    return this.isOfflineMode;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }
}

// Type definitions
export interface CreateProjectRequest {
  name: string;
  domain: string;
  subdomain?: string;
  config?: Record<string, any>;
  compliance_flags?: string[];
  llm_provider?: string;
  token_budget?: number;
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  subdomain?: string;
  status: 'draft' | 'generating' | 'deployed' | 'failed';
  config: Record<string, any>;
  compliance_flags: string[];
  llm_provider: string;
  token_budget: number;
  user_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  content_type: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  description?: string;
  tags?: string[];
  category?: string;
}

export interface RAGQueryRequest {
  query: string;
  project_id: string;
  options?: {
    top_k?: number;
    temperature?: number;
    max_tokens?: number;
  };
}

export interface RAGQueryResponse {
  query: string;
  response: string;
  sources: any[];
  metadata: {
    tokens_used: number;
    cost: number;
    response_time_ms: number;
    model_used: string;
  };
}

export interface LLMProvider {
  id: string;
  name: string;
  provider_type: string;
  endpoint_url?: string;
  status: 'online' | 'offline' | 'error';
  cost_per_token: number;
  enabled: boolean;
}

export interface LLMTestResult {
  provider_id: string;
  status: 'success' | 'error';
  response_time_ms: number;
  test_response?: string;
  error?: string;
}

export interface AnalyticsData {
  project_id: string;
  time_range: string;
  total_queries: number;
  total_tokens: number;
  total_cost: number;
  avg_response_time: number;
  query_trend: Array<{ date: string; count: number }>;
  cost_breakdown: Array<{ category: string; cost: number }>;
}

// Singleton instance
export const unifiedAPIClient = new UnifiedAPIClient();
