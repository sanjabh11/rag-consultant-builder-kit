
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { workflow_id, tenant_id, input_data } = await req.json();

    if (!workflow_id || !tenant_id) {
      throw new Error('Missing required parameters: workflow_id and tenant_id');
    }

    console.log('Executing workflow:', { workflow_id, tenant_id });

    // Get workflow definition
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflow_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Workflow not found: ${workflowError?.message}`);
    }

    if (workflow.status !== 'active') {
      throw new Error('Workflow is not active');
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id,
        tenant_id,
        status: 'running',
        input_data,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (executionError) {
      throw new Error(`Failed to create execution: ${executionError.message}`);
    }

    // Execute workflow actions in sequence
    let currentData = input_data;
    const results = [];

    try {
      for (const action of workflow.definition.actions || []) {
        console.log('Executing action:', action.id, action.type);
        
        const actionResult = await executeAction(action, currentData, {
          supabase,
          geminiApiKey: GEMINI_API_KEY,
          tenantId: tenant_id,
          workflowId: workflow_id
        });

        results.push({
          action_id: action.id,
          result: actionResult,
          timestamp: new Date().toISOString()
        });

        // Use action result as input for next action
        currentData = actionResult;
      }

      // Update execution as completed
      await supabase
        .from('workflow_executions')
        .update({
          status: 'completed',
          output_data: { results, final_output: currentData },
          completed_at: new Date().toISOString(),
          execution_time_ms: Date.now() - new Date(execution.started_at).getTime()
        })
        .eq('id', execution.id);

      // Update workflow stats
      await supabase.rpc('increment_workflow_stats', {
        workflow_id,
        stat_type: 'successful_runs'
      });

      return new Response(
        JSON.stringify({
          success: true,
          execution_id: execution.id,
          results,
          final_output: currentData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (actionError) {
      console.error('Action execution error:', actionError);
      
      // Update execution as failed
      await supabase
        .from('workflow_executions')
        .update({
          status: 'failed',
          error_details: { 
            error: actionError.message,
            results_so_far: results 
          },
          completed_at: new Date().toISOString(),
          execution_time_ms: Date.now() - new Date(execution.started_at).getTime()
        })
        .eq('id', execution.id);

      // Update workflow stats
      await supabase.rpc('increment_workflow_stats', {
        workflow_id,
        stat_type: 'failed_runs'
      });

      throw actionError;
    }

  } catch (error) {
    console.error('Workflow execution error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Workflow execution failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function executeAction(
  action: WorkflowAction, 
  inputData: any, 
  context: { supabase: any; geminiApiKey?: string; tenantId: string; workflowId: string }
) {
  const { supabase, geminiApiKey, tenantId } = context;

  switch (action.type) {
    case 'process_document':
      return await processDocumentAction(action, inputData, context);
    
    case 'rag_query':
      return await ragQueryAction(action, inputData, context);
    
    case 'send_email':
      return await sendEmailAction(action, inputData, context);
    
    case 'webhook':
      return await webhookAction(action, inputData, context);
    
    case 'generate_report':
      return await generateReportAction(action, inputData, context);
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

async function processDocumentAction(action: WorkflowAction, inputData: any, context: any) {
  const { supabase } = context;
  const { document_id } = inputData;

  if (!document_id) {
    throw new Error('Document ID required for process_document action');
  }

  // Call the existing process-document function
  const { data, error } = await supabase.functions.invoke('process-document', {
    body: { documentId: document_id }
  });

  if (error) throw new Error(`Document processing failed: ${error.message}`);
  
  return {
    document_id,
    chunks_created: data?.chunksCreated || 0,
    processing_time: data?.processingTime || 0
  };
}

async function ragQueryAction(action: WorkflowAction, inputData: any, context: any) {
  const { supabase, geminiApiKey } = context;
  const { query, project_id } = inputData;

  if (!query) {
    throw new Error('Query required for rag_query action');
  }

  // Call the existing query-rag function
  const { data, error } = await supabase.functions.invoke('query-rag', {
    body: {
      query,
      projectId: project_id || 'default',
      maxSources: action.config.max_sources || 5,
      similarityThreshold: action.config.confidence_threshold || 0.7
    }
  });

  if (error) throw new Error(`RAG query failed: ${error.message}`);
  
  return {
    query,
    answer: data?.answer,
    sources: data?.sources,
    confidence: data?.confidence || 0
  };
}

async function sendEmailAction(action: WorkflowAction, inputData: any, context: any) {
  // Mock email sending - in production, integrate with actual email service
  const { recipients, subject, body } = action.config;
  
  console.log('Sending email:', { recipients, subject, body: body || JSON.stringify(inputData) });
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    email_sent: true,
    recipients: recipients || ['default@example.com'],
    subject: subject || 'Workflow Notification',
    timestamp: new Date().toISOString()
  };
}

async function webhookAction(action: WorkflowAction, inputData: any, context: any) {
  const { url, method = 'POST', headers = {} } = action.config;
  
  if (!url) {
    throw new Error('URL required for webhook action');
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(inputData)
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }

  const responseData = await response.json().catch(() => null);
  
  return {
    webhook_called: true,
    url,
    status: response.status,
    response_data: responseData
  };
}

async function generateReportAction(action: WorkflowAction, inputData: any, context: any) {
  const { supabase, tenantId } = context;
  const { report_type = 'analytics', format = 'json' } = action.config;

  // Generate analytics report based on tenant data
  const { data: analytics, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Analytics query error:', error);
  }

  const report = {
    report_type,
    generated_at: new Date().toISOString(),
    tenant_id: tenantId,
    period: 'last_30_days',
    data: {
      total_events: analytics?.length || 0,
      unique_users: new Set(analytics?.map(a => a.user_id).filter(Boolean)).size,
      top_events: analytics?.reduce((acc, event) => {
        acc[event.event_name] = (acc[event.event_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    }
  };

  return {
    report_generated: true,
    report_type,
    format,
    report_data: report
  };
}
