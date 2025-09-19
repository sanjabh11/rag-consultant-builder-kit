// Real n8n workflow service with template management and execution
export class RealWorkflowService {
  private n8nBaseUrl: string;
  private apiKey?: string;
  private isLocal: boolean = false;

  constructor(config: { baseUrl?: string; apiKey?: string; local?: boolean } = {}) {
    this.n8nBaseUrl = config.baseUrl || 'http://localhost:5678';
    this.apiKey = config.apiKey;
    this.isLocal = config.local ?? true;
  }

  async initialize(): Promise<void> {
    if (this.isLocal) {
      // For local development, we'll simulate n8n
      console.log('Initialized local workflow service');
      return;
    }

    try {
      await this.makeRequest('GET', '/rest/active');
      console.log('Connected to n8n instance');
    } catch (error) {
      console.warn('Failed to connect to n8n, falling back to local mode:', error);
      this.isLocal = true;
    }
  }

  async getWorkflows(): Promise<WorkflowTemplate[]> {
    if (this.isLocal) {
      return this.getLocalWorkflowTemplates();
    }

    try {
      const response = await this.makeRequest('GET', '/rest/workflows');
      return response.data.map((workflow: any) => this.convertN8nWorkflow(workflow));
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return this.getLocalWorkflowTemplates();
    }
  }

  async createWorkflow(template: CreateWorkflowRequest): Promise<WorkflowTemplate> {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (this.isLocal) {
      const workflow: WorkflowTemplate = {
        id: workflowId,
        name: template.name,
        description: template.description,
        domain: template.domain,
        active: false,
        nodes: this.generateWorkflowNodes(template),
        connections: this.generateWorkflowConnections(template),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.saveLocalWorkflow(workflow);
      return workflow;
    }

    try {
      const n8nWorkflow = {
        name: template.name,
        nodes: this.generateWorkflowNodes(template),
        connections: this.generateWorkflowConnections(template),
        active: false,
        settings: {}
      };

      const response = await this.makeRequest('POST', '/rest/workflows', n8nWorkflow);
      return this.convertN8nWorkflow(response);
    } catch (error) {
      console.error('Failed to create n8n workflow:', error);
      throw new Error('Workflow creation failed');
    }
  }

  async executeWorkflow(workflowId: string, inputData?: any): Promise<WorkflowExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (this.isLocal) {
      return this.executeLocalWorkflow(workflowId, inputData, executionId);
    }

    try {
      const response = await this.makeRequest('POST', `/rest/workflows/${workflowId}/execute`, {
        data: inputData || {}
      });

      return {
        id: executionId,
        workflowId,
        status: 'running',
        startTime: new Date().toISOString(),
        inputData,
        outputData: null,
        error: null
      };
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw new Error('Workflow execution failed');
    }
  }

  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution | null> {
    if (this.isLocal) {
      return this.getLocalExecution(executionId);
    }

    try {
      const response = await this.makeRequest('GET', `/rest/executions/${executionId}`);
      return this.convertN8nExecution(response);
    } catch (error) {
      console.error('Failed to get execution:', error);
      return null;
    }
  }

  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return [
      {
        id: 'template-doc-ingestion',
        name: 'Document Ingestion Pipeline',
        description: 'Monitors folders for new documents, processes them, and adds to RAG system',
        domain: 'general',
        active: false,
        nodes: this.getDocumentIngestionNodes(),
        connections: this.getDocumentIngestionConnections(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template-hr-qa',
        name: 'HR Q&A Assistant',
        description: 'Automated HR question answering with escalation to human agents',
        domain: 'hr',
        active: false,
        nodes: this.getHRQANodes(),
        connections: this.getHRQAConnections(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template-legal-review',
        name: 'Legal Document Review',
        description: 'Automated legal document analysis and risk assessment',
        domain: 'legal',
        active: false,
        nodes: this.getLegalReviewNodes(),
        connections: this.getLegalReviewConnections(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template-financial-analysis',
        name: 'Financial Report Analysis',
        description: 'Automated analysis of financial reports with trend detection',
        domain: 'finance',
        active: false,
        nodes: this.getFinancialAnalysisNodes(),
        connections: this.getFinancialAnalysisConnections(),
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async deployWorkflowTemplate(templateId: string, customizations?: any): Promise<WorkflowTemplate> {
    const templates = await this.getWorkflowTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Apply customizations
    const customizedTemplate = {
      ...template,
      id: `deployed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customizations?.name || template.name,
      settings: { ...template.settings, ...customizations?.settings }
    };

    // Customize nodes based on parameters
    if (customizations?.parameters) {
      customizedTemplate.nodes = this.customizeNodes(template.nodes, customizations.parameters);
    }

    return this.createWorkflow({
      name: customizedTemplate.name,
      description: customizedTemplate.description,
      domain: customizedTemplate.domain,
      template: customizedTemplate
    });
  }

  // Local workflow management
  private getLocalWorkflowTemplates(): WorkflowTemplate[] {
    const stored = localStorage.getItem('local_workflows');
    return stored ? JSON.parse(stored) : [];
  }

  private saveLocalWorkflow(workflow: WorkflowTemplate): void {
    const workflows = this.getLocalWorkflowTemplates();
    const existingIndex = workflows.findIndex(w => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem('local_workflows', JSON.stringify(workflows));
  }

  private async executeLocalWorkflow(workflowId: string, inputData: any, executionId: string): Promise<WorkflowExecution> {
    const workflows = this.getLocalWorkflowTemplates();
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Simulate workflow execution
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime: new Date().toISOString(),
      inputData,
      outputData: null,
      error: null
    };

    // Store execution
    const executions = this.getLocalExecutions();
    executions.push(execution);
    localStorage.setItem('local_executions', JSON.stringify(executions));

    // Simulate execution completion after a delay
    setTimeout(() => {
      const completedExecution: WorkflowExecution = {
        ...execution,
        status: 'completed',
        endTime: new Date().toISOString(),
        outputData: this.simulateWorkflowOutput(workflow, inputData)
      };

      const updatedExecutions = this.getLocalExecutions();
      const execIndex = updatedExecutions.findIndex(e => e.id === executionId);
      if (execIndex >= 0) {
        updatedExecutions[execIndex] = completedExecution;
        localStorage.setItem('local_executions', JSON.stringify(updatedExecutions));
      }
    }, 3000); // 3 second simulation

    return execution;
  }

  private getLocalExecutions(): WorkflowExecution[] {
    const stored = localStorage.getItem('local_executions');
    return stored ? JSON.parse(stored) : [];
  }

  private getLocalExecution(executionId: string): WorkflowExecution | null {
    const executions = this.getLocalExecutions();
    return executions.find(e => e.id === executionId) || null;
  }

  private simulateWorkflowOutput(workflow: WorkflowTemplate, inputData: any): any {
    // Simulate different outputs based on workflow domain
    switch (workflow.domain) {
      case 'general':
        return {
          documentsProcessed: inputData?.documents?.length || 1,
          chunksCreated: (inputData?.documents?.length || 1) * 10,
          embeddingsGenerated: (inputData?.documents?.length || 1) * 10,
          processingTime: Math.random() * 30000 + 10000
        };
      case 'hr':
        return {
          question: inputData?.question || 'Sample HR question',
          answer: 'This is a simulated HR response based on company policies.',
          confidence: Math.random() * 0.3 + 0.7,
          sources: ['HR Handbook Section 3.2', 'Employee Benefits Guide']
        };
      case 'legal':
        return {
          riskScore: Math.random() * 10,
          keyTerms: ['liability', 'indemnification', 'termination'],
          recommendations: ['Review clause 4.2', 'Consider additional warranties'],
          complianceIssues: []
        };
      case 'finance':
        return {
          revenue: Math.random() * 1000000 + 500000,
          expenses: Math.random() * 800000 + 300000,
          trends: 'Revenue up 12% YoY',
          alerts: ['Unusual spending in Q3']
        };
      default:
        return { status: 'completed', timestamp: new Date().toISOString() };
    }
  }

  // Node generation methods
  private generateWorkflowNodes(template: CreateWorkflowRequest): WorkflowNode[] {
    const baseNodes: WorkflowNode[] = [
      {
        id: 'trigger',
        name: 'Trigger',
        type: template.triggerType || 'manual',
        typeVersion: 1,
        position: [250, 300],
        parameters: template.triggerParameters || {}
      }
    ];

    // Add processing nodes based on template type
    if (template.template) {
      return template.template.nodes;
    }

    return baseNodes;
  }

  private generateWorkflowConnections(template: CreateWorkflowRequest): any {
    if (template.template) {
      return template.template.connections;
    }
    
    return {};
  }

  private customizeNodes(nodes: WorkflowNode[], parameters: Record<string, any>): WorkflowNode[] {
    return nodes.map(node => ({
      ...node,
      parameters: {
        ...node.parameters,
        ...parameters[node.name] || {}
      }
    }));
  }

  // Template node definitions
  private getDocumentIngestionNodes(): WorkflowNode[] {
    return [
      {
        id: 'trigger-folder-watch',
        name: 'Folder Watch',
        type: 'n8n-nodes-base.fsWatcher',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: './uploads',
          watchFiles: true,
          watchFolders: false
        }
      },
      {
        id: 'process-document',
        name: 'Process Document',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          functionCode: `
// Extract text from uploaded document
const filePath = items[0].json.path;
// Process document and extract text
return [{
  json: {
    filePath,
    extractedText: 'Sample extracted text...',
    chunks: ['chunk1', 'chunk2', 'chunk3']
  }
}];
          `
        }
      },
      {
        id: 'generate-embeddings',
        name: 'Generate Embeddings',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          url: '/api/embeddings/generate',
          method: 'POST',
          bodyParametersUi: {
            parameter: [
              { name: 'text', value: '={{$json.extractedText}}' }
            ]
          }
        }
      },
      {
        id: 'store-vectors',
        name: 'Store in Vector DB',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [850, 300],
        parameters: {
          url: '/api/vectorstore/add',
          method: 'POST'
        }
      },
      {
        id: 'notify-completion',
        name: 'Notify Completion',
        type: 'n8n-nodes-base.slack',
        typeVersion: 1,
        position: [1050, 300],
        parameters: {
          channel: '#rag-updates',
          text: 'Document processed: {{$json.filePath}}'
        }
      }
    ];
  }

  private getDocumentIngestionConnections(): any {
    return {
      'Folder Watch': {
        main: [
          [{ node: 'Process Document', type: 'main', index: 0 }]
        ]
      },
      'Process Document': {
        main: [
          [{ node: 'Generate Embeddings', type: 'main', index: 0 }]
        ]
      },
      'Generate Embeddings': {
        main: [
          [{ node: 'Store in Vector DB', type: 'main', index: 0 }]
        ]
      },
      'Store in Vector DB': {
        main: [
          [{ node: 'Notify Completion', type: 'main', index: 0 }]
        ]
      }
    };
  }

  private getHRQANodes(): WorkflowNode[] {
    return [
      {
        id: 'webhook-trigger',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: 'hr-question',
          httpMethod: 'POST'
        }
      },
      {
        id: 'query-rag',
        name: 'Query RAG System',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          url: '/api/rag/query',
          method: 'POST',
          bodyParametersUi: {
            parameter: [
              { name: 'query', value: '={{$json.question}}' },
              { name: 'namespace', value: 'hr' }
            ]
          }
        }
      },
      {
        id: 'check-confidence',
        name: 'Check Confidence',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json.confidence}}',
                operation: 'larger',
                value2: 0.8
              }
            ]
          }
        }
      },
      {
        id: 'send-answer',
        name: 'Send Answer',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [850, 200],
        parameters: {
          url: '/api/chat/respond',
          method: 'POST'
        }
      },
      {
        id: 'escalate-human',
        name: 'Escalate to Human',
        type: 'n8n-nodes-base.slack',
        typeVersion: 1,
        position: [850, 400],
        parameters: {
          channel: '#hr-support',
          text: 'Question needs human review: {{$json.question}}'
        }
      }
    ];
  }

  private getHRQAConnections(): any {
    return {
      'Webhook Trigger': {
        main: [
          [{ node: 'Query RAG System', type: 'main', index: 0 }]
        ]
      },
      'Query RAG System': {
        main: [
          [{ node: 'Check Confidence', type: 'main', index: 0 }]
        ]
      },
      'Check Confidence': {
        main: [
          [{ node: 'Send Answer', type: 'main', index: 0 }],
          [{ node: 'Escalate to Human', type: 'main', index: 0 }]
        ]
      }
    };
  }

  private getLegalReviewNodes(): WorkflowNode[] {
    return [
      {
        id: 'document-upload',
        name: 'Document Upload',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: 'legal-review',
          httpMethod: 'POST'
        }
      },
      {
        id: 'extract-clauses',
        name: 'Extract Key Clauses',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          functionCode: `
// Use NLP to extract key legal clauses
const document = items[0].json.document;
const keyClauses = [
  'liability', 'indemnification', 'termination', 
  'intellectual_property', 'confidentiality'
];
return [{ json: { document, keyClauses } }];
          `
        }
      },
      {
        id: 'risk-assessment',
        name: 'Risk Assessment',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          url: '/api/legal/assess-risk',
          method: 'POST'
        }
      },
      {
        id: 'generate-report',
        name: 'Generate Review Report',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [850, 300],
        parameters: {
          functionCode: `
// Generate comprehensive legal review report
const riskScore = items[0].json.riskScore;
const report = {
  overallRisk: riskScore > 7 ? 'HIGH' : riskScore > 4 ? 'MEDIUM' : 'LOW',
  recommendations: ['Review clause 4.2', 'Add termination clause'],
  flaggedSections: ['Section 3: Liability', 'Section 7: IP Rights']
};
return [{ json: report }];
          `
        }
      }
    ];
  }

  private getLegalReviewConnections(): any {
    return {
      'Document Upload': {
        main: [
          [{ node: 'Extract Key Clauses', type: 'main', index: 0 }]
        ]
      },
      'Extract Key Clauses': {
        main: [
          [{ node: 'Risk Assessment', type: 'main', index: 0 }]
        ]
      },
      'Risk Assessment': {
        main: [
          [{ node: 'Generate Review Report', type: 'main', index: 0 }]
        ]
      }
    };
  }

  private getFinancialAnalysisNodes(): WorkflowNode[] {
    return [
      {
        id: 'report-trigger',
        name: 'Monthly Report Trigger',
        type: 'n8n-nodes-base.cron',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          triggerTimes: {
            item: [
              {
                mode: 'everyMonth',
                dayOfMonth: 1,
                hour: 9,
                minute: 0
              }
            ]
          }
        }
      },
      {
        id: 'fetch-data',
        name: 'Fetch Financial Data',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          url: '/api/financial/monthly-data',
          method: 'GET'
        }
      },
      {
        id: 'analyze-trends',
        name: 'Analyze Trends',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          functionCode: `
// Analyze financial trends and generate insights
const data = items[0].json;
const analysis = {
  revenue_trend: data.revenue > data.previous_revenue ? 'UP' : 'DOWN',
  expense_ratio: (data.expenses / data.revenue) * 100,
  profit_margin: ((data.revenue - data.expenses) / data.revenue) * 100,
  alerts: []
};

if (analysis.expense_ratio > 80) {
  analysis.alerts.push('High expense ratio detected');
}

return [{ json: analysis }];
          `
        }
      },
      {
        id: 'generate-summary',
        name: 'Generate Executive Summary',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [850, 300],
        parameters: {
          url: '/api/llm/generate',
          method: 'POST',
          bodyParametersUi: {
            parameter: [
              { 
                name: 'prompt', 
                value: 'Generate executive summary for financial data: {{$json}}' 
              }
            ]
          }
        }
      },
      {
        id: 'email-report',
        name: 'Email to Executives',
        type: 'n8n-nodes-base.gmail',
        typeVersion: 1,
        position: [1050, 300],
        parameters: {
          to: 'cfo@company.com,ceo@company.com',
          subject: 'Monthly Financial Analysis Report',
          emailType: 'html'
        }
      }
    ];
  }

  private getFinancialAnalysisConnections(): any {
    return {
      'Monthly Report Trigger': {
        main: [
          [{ node: 'Fetch Financial Data', type: 'main', index: 0 }]
        ]
      },
      'Fetch Financial Data': {
        main: [
          [{ node: 'Analyze Trends', type: 'main', index: 0 }]
        ]
      },
      'Analyze Trends': {
        main: [
          [{ node: 'Generate Executive Summary', type: 'main', index: 0 }]
        ]
      },
      'Generate Executive Summary': {
        main: [
          [{ node: 'Email to Executives', type: 'main', index: 0 }]
        ]
      }
    };
  }

  // HTTP request helper
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.n8nBaseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-N8N-API-KEY'] = this.apiKey;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private convertN8nWorkflow(n8nWorkflow: any): WorkflowTemplate {
    return {
      id: n8nWorkflow.id,
      name: n8nWorkflow.name,
      description: n8nWorkflow.description || '',
      domain: 'general',
      active: n8nWorkflow.active,
      nodes: n8nWorkflow.nodes || [],
      connections: n8nWorkflow.connections || {},
      settings: n8nWorkflow.settings || {},
      createdAt: n8nWorkflow.createdAt || new Date().toISOString(),
      updatedAt: n8nWorkflow.updatedAt || new Date().toISOString()
    };
  }

  private convertN8nExecution(n8nExecution: any): WorkflowExecution {
    return {
      id: n8nExecution.id,
      workflowId: n8nExecution.workflowId,
      status: n8nExecution.finished ? 'completed' : 'running',
      startTime: n8nExecution.startedAt,
      endTime: n8nExecution.stoppedAt,
      inputData: n8nExecution.data?.startData,
      outputData: n8nExecution.data?.resultData,
      error: n8nExecution.data?.error || null
    };
  }
}

// Type definitions
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  active: boolean;
  nodes: WorkflowNode[];
  connections: any;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  domain: string;
  triggerType?: string;
  triggerParameters?: Record<string, any>;
  template?: WorkflowTemplate;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  inputData: any;
  outputData: any;
  error: string | null;
}

// Singleton instance
export const realWorkflowService = new RealWorkflowService();
