
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Brain, 
  Server, 
  Shield, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

const LLMConfigPanel = () => {
  const [providers, setProviders] = useState([
    {
      id: 'llama3',
      name: 'LLaMA 3 70B',
      type: 'private',
      status: 'online',
      endpoint: 'http://llama3-service:8000',
      costPerToken: 0.0001,
      enabled: true
    },
    {
      id: 'gemini',
      name: 'Gemini 2.5 Pro',
      type: 'cloud',
      status: 'online',
      endpoint: 'https://generativelanguage.googleapis.com/v1',
      costPerToken: 0.0015,
      enabled: false
    },
    {
      id: 'mistral',
      name: 'Mistral Large',
      type: 'cloud',
      status: 'offline',
      endpoint: '',
      costPerToken: 0.0008,
      enabled: false
    }
  ]);

  const [ragConfig, setRagConfig] = useState({
    vectorStore: 'chromadb',
    embeddingModel: 'text-embedding-ada-002',
    chunkSize: 1000,
    chunkOverlap: 200,
    topK: 5,
    similarity: 0.7
  });

  const [budget, setBudget] = useState({
    monthly: 1000,
    alertThreshold: 80,
    dailyLimit: 50
  });

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">LLM & RAG Configuration</h1>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">LLM Providers</TabsTrigger>
          <TabsTrigger value="rag">RAG Settings</TabsTrigger>
          <TabsTrigger value="budget">Budget Control</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className={`relative ${provider.enabled ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      {provider.name}
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.status === 'online' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Switch 
                        checked={provider.enabled}
                        onCheckedChange={() => toggleProvider(provider.id)}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant={provider.type === 'private' ? 'default' : 'secondary'}>
                      {provider.type}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={provider.status === 'online' ? 'default' : 'destructive'}>
                      {provider.status}
                    </Badge>
                  </div>

                  <div>
                    <Label htmlFor={`endpoint-${provider.id}`}>Endpoint</Label>
                    <Input 
                      id={`endpoint-${provider.id}`}
                      value={provider.endpoint}
                      className="mt-1"
                      placeholder="Enter API endpoint"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cost per 1K tokens:</span>
                    <span className="font-medium">${(provider.costPerToken * 1000).toFixed(4)}</span>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={provider.status === 'offline'}
                  >
                    Test Connection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider-name">Provider Name</Label>
                  <Input id="provider-name" placeholder="e.g., Claude 4" />
                </div>
                <div>
                  <Label htmlFor="provider-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private/Self-hosted</SelectItem>
                      <SelectItem value="cloud">Cloud API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="provider-endpoint">API Endpoint</Label>
                  <Input id="provider-endpoint" placeholder="https://api.example.com/v1" />
                </div>
                <div>
                  <Label htmlFor="provider-cost">Cost per 1K tokens ($)</Label>
                  <Input id="provider-cost" type="number" step="0.0001" placeholder="0.0010" />
                </div>
              </div>
              <Button>Add Provider</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vector Store Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vector-store">Vector Store</Label>
                  <Select value={ragConfig.vectorStore}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chromadb">ChromaDB</SelectItem>
                      <SelectItem value="weaviate">Weaviate</SelectItem>
                      <SelectItem value="qdrant">Qdrant</SelectItem>
                      <SelectItem value="pinecone">Pinecone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="embedding-model">Embedding Model</Label>
                  <Select value={ragConfig.embeddingModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-embedding-ada-002">OpenAI Ada-002</SelectItem>
                      <SelectItem value="llama-embedding">LLaMA Embeddings</SelectItem>
                      <SelectItem value="bert-base">BERT Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Chunk Size: {ragConfig.chunkSize}</Label>
                  <Slider
                    value={[ragConfig.chunkSize]}
                    onValueChange={([value]) => setRagConfig(prev => ({ ...prev, chunkSize: value }))}
                    max={2000}
                    min={200}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Chunk Overlap: {ragConfig.chunkOverlap}</Label>
                  <Slider
                    value={[ragConfig.chunkOverlap]}
                    onValueChange={([value]) => setRagConfig(prev => ({ ...prev, chunkOverlap: value }))}
                    max={500}
                    min={0}
                    step={50}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retrieval Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Top K Results: {ragConfig.topK}</Label>
                  <Slider
                    value={[ragConfig.topK]}
                    onValueChange={([value]) => setRagConfig(prev => ({ ...prev, topK: value }))}
                    max={20}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Similarity Threshold: {ragConfig.similarity}</Label>
                  <Slider
                    value={[ragConfig.similarity]}
                    onValueChange={([value]) => setRagConfig(prev => ({ ...prev, similarity: value }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Re-ranking Strategy</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No re-ranking</SelectItem>
                      <SelectItem value="cohere">Cohere Re-rank</SelectItem>
                      <SelectItem value="cross-encoder">Cross Encoder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">Test RAG Pipeline</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Monthly Budget ($): {budget.monthly}</Label>
                  <Slider
                    value={[budget.monthly]}
                    onValueChange={([value]) => setBudget(prev => ({ ...prev, monthly: value }))}
                    max={10000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Alert Threshold (%): {budget.alertThreshold}</Label>
                  <Slider
                    value={[budget.alertThreshold]}
                    onValueChange={([value]) => setBudget(prev => ({ ...prev, alertThreshold: value }))}
                    max={100}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Daily Limit ($): {budget.dailyLimit}</Label>
                  <Slider
                    value={[budget.dailyLimit]}
                    onValueChange={([value]) => setBudget(prev => ({ ...prev, dailyLimit: value }))}
                    max={500}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-medium">$247.30 / $1,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24.7%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Today</span>
                    <span className="font-medium">$12.50 / $50</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="font-medium">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>LLaMA 3 (Private)</span>
                      <span>$145.20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Embeddings</span>
                      <span>$67.80</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vector Store</span>
                      <span>$34.30</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Latency</p>
                    <p className="text-2xl font-bold">284ms</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">99.2%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Token Usage</p>
                    <p className="text-2xl font-bold">2.4M</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts & Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium">High latency detected</p>
                    <p className="text-sm text-muted-foreground">LLaMA 3 response time exceeded 500ms threshold</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Budget threshold reached</p>
                    <p className="text-sm text-muted-foreground">Monthly budget is at 80% usage</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMConfigPanel;
