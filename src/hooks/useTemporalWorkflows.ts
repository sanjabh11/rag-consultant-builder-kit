
import { useState, useCallback } from 'react';
import { useEnterpriseAuth } from '@/hooks/useEnterpriseAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  definition: {
    triggers: WorkflowTrigger[];
    actions: WorkflowAction[];
    conditions?: WorkflowCondition[];
  };
  status: 'draft' | 'active' | 'paused' | 'archived';
  schedule?: {
    type: 'cron' | 'interval' | 'event';
    expression: string;
  };
}

interface WorkflowTrigger {
  id: string;
  type: 'document_upload' | 'schedule' | 'webhook' | 'manual';
  config: Record<string, any>;
}

interface WorkflowAction {
  id: string;
  type: 'process_document' | 'send_email' | 'webhook' | 'rag_query' | 'generate_report';
  config: Record<string, any>;
  retry_policy?: {
    max_attempts: number;
    backoff_coefficient: number;
  };
}

interface WorkflowCondition {
  id: string;
  type: 'filter' | 'branch' | 'loop';
  expression: string;
  config: Record<string, any>;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  input_data?: any;
  output_data?: any;
  error_details?: any;
  execution_time_ms?: number;
  started_at: string;
  completed_at?: string;
}

export const useTemporalWorkflows = () => {
  const { currentTenant, hasPermission } = useEnterpriseAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkflows = useCallback(async () => {
    if (!currentTenant || !hasPermission('workflows', 'read')) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentTenant, hasPermission, toast]);

  const createWorkflow = async (workflow: Omit<WorkflowDefinition, 'id'>) => {
    if (!currentTenant || !hasPermission('workflows', 'create')) {
      throw new Error('Insufficient permissions');
    }

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          tenant_id: currentTenant.id,
          user_id: currentTenant.id, // Will be replaced with actual user ID
          name: workflow.name,
          description: workflow.description,
          definition: workflow.definition,
          status: workflow.status,
          schedule: workflow.schedule
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadWorkflows();
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<WorkflowDefinition>) => {
    if (!hasPermission('workflows', 'update')) {
      throw new Error('Insufficient permissions');
    }

    try {
      const { data, error } = await supabase
        .from('workflows')
        .update({
          name: updates.name,
          description: updates.description,
          definition: updates.definition,
          status: updates.status,
          schedule: updates.schedule,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await loadWorkflows();
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  };

  const executeWorkflow = async (workflowId: string, inputData?: any) => {
    if (!hasPermission('workflows', 'execute')) {
      throw new Error('Insufficient permissions');
    }

    try {
      const { data, error } = await supabase.functions.invoke('execute-temporal-workflow', {
        body: {
          workflow_id: workflowId,
          tenant_id: currentTenant?.id,
          input_data: inputData
        }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Workflow execution started",
      });
      
      return data;
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive",
      });
      throw error;
    }
  };

  const loadExecutions = async (workflowId?: string) => {
    if (!currentTenant || !hasPermission('workflows', 'read')) return;

    try {
      let query = supabase
        .from('workflow_executions')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('started_at', { ascending: false })
        .limit(100);

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setExecutions(data || []);
    } catch (error) {
      console.error('Error loading executions:', error);
      toast({
        title: "Error", 
        description: "Failed to load workflow executions",
        variant: "destructive",
      });
    }
  };

  const cancelExecution = async (executionId: string) => {
    if (!hasPermission('workflows', 'execute')) {
      throw new Error('Insufficient permissions');
    }

    try {
      const { error } = await supabase.functions.invoke('cancel-workflow-execution', {
        body: { execution_id: executionId }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Workflow execution cancelled",
      });
      
      await loadExecutions();
    } catch (error) {
      console.error('Error cancelling execution:', error);
      throw error;
    }
  };

  // Built-in workflow templates
  const getWorkflowTemplates = () => [
    {
      name: 'Document Processing Pipeline',
      description: 'Automatically process uploaded documents through RAG pipeline',
      definition: {
        triggers: [{
          id: 'doc-upload',
          type: 'document_upload' as const,
          config: { file_types: ['pdf', 'docx', 'txt'] }
        }],
        actions: [{
          id: 'process-doc',
          type: 'process_document' as const,
          config: { 
            chunk_size: 1000,
            chunk_overlap: 200,
            generate_embeddings: true
          },
          retry_policy: { max_attempts: 3, backoff_coefficient: 2 }
        }]
      }
    },
    {
      name: 'Daily Analytics Report',
      description: 'Generate and send daily analytics reports',
      definition: {
        triggers: [{
          id: 'daily-schedule',
          type: 'schedule' as const,
          config: { cron: '0 9 * * *' } // 9 AM daily
        }],
        actions: [
          {
            id: 'generate-report',
            type: 'generate_report' as const,
            config: { report_type: 'analytics', format: 'pdf' }
          },
          {
            id: 'send-email',
            type: 'send_email' as const,
            config: { 
              recipients: ['admin@company.com'],
              subject: 'Daily Analytics Report'
            }
          }
        ]
      }
    },
    {
      name: 'Smart Q&A Pipeline',
      description: 'Automated RAG queries with quality scoring',
      definition: {
        triggers: [{
          id: 'webhook-trigger',
          type: 'webhook' as const,
          config: { endpoint: '/api/query' }
        }],
        actions: [
          {
            id: 'rag-query',
            type: 'rag_query' as const,
            config: { 
              max_sources: 5,
              confidence_threshold: 0.7,
              rerank: true
            }
          }
        ],
        conditions: [{
          id: 'quality-filter',
          type: 'filter' as const,
          expression: 'confidence > 0.8',
          config: {}
        }]
      }
    }
  ];

  return {
    workflows,
    executions,
    loading,
    loadWorkflows,
    createWorkflow,
    updateWorkflow,
    executeWorkflow,
    loadExecutions,
    cancelExecution,
    getWorkflowTemplates
  };
};
