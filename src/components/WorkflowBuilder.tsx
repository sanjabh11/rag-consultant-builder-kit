
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTemporalWorkflows } from '@/hooks/useTemporalWorkflows';
import { useEnterpriseAuth } from '@/hooks/useEnterpriseAuth';
import { 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  Workflow,
  Clock,
  FileText,
  Mail,
  Webhook,
  BarChart3,
  Filter
} from 'lucide-react';

const WorkflowBuilder = () => {
  const { currentTenant, hasPermission } = useEnterpriseAuth();
  const { 
    workflows, 
    executions, 
    loading, 
    loadWorkflows, 
    createWorkflow, 
    updateWorkflow, 
    executeWorkflow,
    loadExecutions,
    getWorkflowTemplates
  } = useTemporalWorkflows();

  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    status: 'draft' as const,
    definition: {
      triggers: [] as any[],
      actions: [] as any[],
      conditions: [] as any[]
    }
  });

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, [currentTenant]);

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) return;
    
    try {
      await createWorkflow(newWorkflow);
      setNewWorkflow({
        name: '',
        description: '',
        status: 'draft',
        definition: { triggers: [], actions: [], conditions: [] }
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await executeWorkflow(workflowId, { manual_trigger: true });
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };

  const addTrigger = (type: string) => {
    const trigger = {
      id: `trigger-${Date.now()}`,
      type,
      config: getDefaultTriggerConfig(type)
    };
    
    setNewWorkflow(prev => ({
      ...prev,
      definition: {
        ...prev.definition,
        triggers: [...prev.definition.triggers, trigger]
      }
    }));
  };

  const addAction = (type: string) => {
    const action = {
      id: `action-${Date.now()}`,
      type,
      config: getDefaultActionConfig(type),
      retry_policy: { max_attempts: 3, backoff_coefficient: 2 }
    };
    
    setNewWorkflow(prev => ({
      ...prev,
      definition: {
        ...prev.definition,
        actions: [...prev.definition.actions, action]
      }
    }));
  };

  const getDefaultTriggerConfig = (type: string) => {
    switch (type) {
      case 'document_upload':
        return { file_types: ['pdf', 'docx', 'txt'] };
      case 'schedule':
        return { cron: '0 9 * * *' };
      case 'webhook':
        return { endpoint: '/api/webhook' };
      default:
        return {};
    }
  };

  const getDefaultActionConfig = (type: string) => {
    switch (type) {
      case 'process_document':
        return { chunk_size: 1000, chunk_overlap: 200 };
      case 'send_email':
        return { recipients: [], subject: 'Workflow Notification' };
      case 'rag_query':
        return { max_sources: 5, confidence_threshold: 0.7 };
      default:
        return {};
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'document_upload': return <FileText className="h-4 w-4" />;
      case 'schedule': return <Clock className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'process_document': return <FileText className="h-4 w-4" />;
      case 'send_email': return <Mail className="h-4 w-4" />;
      case 'rag_query': return <BarChart3 className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (!currentTenant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Workflow className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Workspace Access</h2>
          <p className="text-gray-600">You need to be part of a workspace to build workflows.</p>
        </div>
      </div>
    );
  }

  if (!hasPermission('workflows', 'read')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Workflow className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access workflow builder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Workflow className="h-8 w-8 text-blue-600" />
            Workflow Builder
          </h1>
          <p className="text-gray-600 mt-1">Create and manage automated workflows</p>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Workflow Name</label>
                  <Input
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={newWorkflow.status}
                    onValueChange={(value: any) => setNewWorkflow(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workflow does"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Triggers</h3>
                  <div className="space-y-2 mb-4">
                    {newWorkflow.definition.triggers.map((trigger, index) => (
                      <div key={trigger.id} className="flex items-center gap-2 p-2 border rounded">
                        {getTriggerIcon(trigger.type)}
                        <span className="text-sm">{trigger.type.replace('_', ' ')}</span>
                        <Badge variant="outline">{trigger.type}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => addTrigger('document_upload')}>
                      <FileText className="h-3 w-3 mr-1" />
                      Document Upload
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addTrigger('schedule')}>
                      <Clock className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addTrigger('webhook')}>
                      <Webhook className="h-3 w-3 mr-1" />
                      Webhook
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Actions</h3>
                  <div className="space-y-2 mb-4">
                    {newWorkflow.definition.actions.map((action, index) => (
                      <div key={action.id} className="flex items-center gap-2 p-2 border rounded">
                        {getActionIcon(action.type)}
                        <span className="text-sm">{action.type.replace('_', ' ')}</span>
                        <Badge variant="outline">{action.type}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => addAction('process_document')}>
                      <FileText className="h-3 w-3 mr-1" />
                      Process Document
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addAction('send_email')}>
                      <Mail className="h-3 w-3 mr-1" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addAction('rag_query')}>
                      <BarChart3 className="h-3 w-3 mr-1" />
                      RAG Query
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateWorkflow} disabled={!newWorkflow.name.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading workflows...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                    </div>
                    {workflow.description && (
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <strong>Triggers:</strong> {workflow.definition.triggers?.length || 0}
                      </p>
                      <p className="text-sm">
                        <strong>Actions:</strong> {workflow.definition.actions?.length || 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        disabled={workflow.status !== 'active'}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {getWorkflowTemplates().map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <strong>Triggers:</strong> {template.definition.triggers?.length || 0}
                    </p>
                    <p className="text-sm">
                      <strong>Actions:</strong> {template.definition.actions?.length || 0}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.slice(0, 10).map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Execution {execution.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(execution.started_at).toLocaleString()}
                      </p>
                      {execution.execution_time_ms && (
                        <p className="text-sm text-gray-600">
                          Duration: {execution.execution_time_ms}ms
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      execution.status === 'completed' ? 'default' :
                      execution.status === 'failed' ? 'destructive' :
                      execution.status === 'running' ? 'secondary' : 'outline'
                    }>
                      {execution.status}
                    </Badge>
                  </div>
                ))}
                {executions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No executions found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowBuilder;
