
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Settings, 
  Upload, 
  FileText, 
  Database, 
  Mail, 
  Slack,
  Brain,
  Filter,
  ArrowRight,
  Plus
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  icon: React.ReactNode;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
}

const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: '1',
      type: 'trigger',
      name: 'Document Upload',
      icon: <Upload className="h-4 w-4" />,
      config: { folder: '/documents' },
      position: { x: 50, y: 100 }
    },
    {
      id: '2',
      type: 'action',
      name: 'Extract Text',
      icon: <FileText className="h-4 w-4" />,
      config: { format: 'pdf' },
      position: { x: 300, y: 100 }
    },
    {
      id: '3',
      type: 'action',
      name: 'Generate Embeddings',
      icon: <Brain className="h-4 w-4" />,
      config: { model: 'text-embedding-ada-002' },
      position: { x: 550, y: 100 }
    },
    {
      id: '4',
      type: 'action',
      name: 'Store in Vector DB',
      icon: <Database className="h-4 w-4" />,
      config: { collection: 'documents' },
      position: { x: 800, y: 100 }
    }
  ]);

  const [connections] = useState<WorkflowConnection[]>([
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4' }
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const nodeTypes = [
    { type: 'trigger', name: 'File Upload', icon: <Upload className="h-4 w-4" /> },
    { type: 'trigger', name: 'Schedule', icon: <Play className="h-4 w-4" /> },
    { type: 'action', name: 'Process Document', icon: <FileText className="h-4 w-4" /> },
    { type: 'action', name: 'Generate Embeddings', icon: <Brain className="h-4 w-4" /> },
    { type: 'action', name: 'Store Data', icon: <Database className="h-4 w-4" /> },
    { type: 'action', name: 'Send Email', icon: <Mail className="h-4 w-4" /> },
    { type: 'action', name: 'Slack Notification', icon: <Slack className="h-4 w-4" /> },
    { type: 'condition', name: 'Filter', icon: <Filter className="h-4 w-4" /> }
  ];

  const addNode = useCallback((nodeType: any) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: nodeType.type,
      name: nodeType.name,
      icon: nodeType.icon,
      config: {},
      position: { x: 100, y: 200 }
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const executeWorkflow = () => {
    setIsRunning(true);
    // Simulate workflow execution
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="h-screen flex">
      {/* Node Palette */}
      <div className="w-64 bg-gray-50 border-r p-4">
        <h3 className="font-semibold mb-4">Workflow Components</h3>
        <div className="space-y-2">
          {nodeTypes.map((nodeType, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => addNode(nodeType)}
            >
              {nodeType.icon}
              <span className="ml-2">{nodeType.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-white overflow-hidden">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Document Processing Workflow</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              onClick={executeWorkflow}
              disabled={isRunning}
              className={isRunning ? 'bg-green-600' : ''}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="pt-20 p-8 h-full">
          <div className="relative">
            {/* Render Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn, index) => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromX = fromNode.position.x + 150;
                const fromY = fromNode.position.y + 40;
                const toX = toNode.position.x;
                const toY = toNode.position.y + 40;

                return (
                  <line
                    key={index}
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#3b82f6"
                  />
                </marker>
              </defs>
            </svg>

            {/* Render Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute border-2 rounded-lg bg-white shadow-sm cursor-pointer transition-all ${
                  selectedNode === node.id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  isRunning ? 'animate-pulse' : ''
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: 150,
                  height: 80
                }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="p-3 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    {node.icon}
                    <Badge 
                      variant={
                        node.type === 'trigger' ? 'default' : 
                        node.type === 'condition' ? 'secondary' : 
                        'outline'
                      }
                      className="text-xs"
                    >
                      {node.type}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{node.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-gray-50 border-l p-4">
          <h3 className="font-semibold mb-4">Node Properties</h3>
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;

            return (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Node Name</label>
                  <Input value={node.name} className="mt-1" />
                </div>

                {node.type === 'trigger' && node.name === 'Document Upload' && (
                  <div>
                    <label className="text-sm font-medium">Watch Folder</label>
                    <Input value={node.config.folder || ''} className="mt-1" />
                  </div>
                )}

                {node.type === 'action' && node.name === 'Generate Embeddings' && (
                  <div>
                    <label className="text-sm font-medium">Embedding Model</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ada-002">text-embedding-ada-002</SelectItem>
                        <SelectItem value="llama">LLaMA Embeddings</SelectItem>
                        <SelectItem value="bert">BERT Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {node.type === 'action' && node.name === 'Store in Vector DB' && (
                  <div>
                    <label className="text-sm font-medium">Collection</label>
                    <Input value={node.config.collection || ''} className="mt-1" />
                  </div>
                )}

                <Button className="w-full">
                  Update Node
                </Button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
