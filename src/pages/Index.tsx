
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, MessageSquare, Settings, BarChart3, Upload, Zap, Shield, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for demonstration
  const kpis = {
    totalQueries: 1247,
    avgLatency: 280,
    ragHitRate: 94,
    llmCost: 125.30,
    complianceScore: 98,
    activeUsers: 156
  };

  const recentProjects = [
    { id: 1, name: 'HR Policy Assistant', vertical: 'HR', status: 'Active', queries: 342, accuracy: 96 },
    { id: 2, name: 'Legal Contract Analyzer', vertical: 'Legal', status: 'Training', queries: 0, accuracy: 0 },
    { id: 3, name: 'Financial Report Q&A', vertical: 'Finance', status: 'Active', queries: 178, accuracy: 94 }
  ];

  const workflows = [
    { id: 1, name: 'Document Ingestion', type: 'Data Processing', status: 'Running', lastRun: '2 min ago' },
    { id: 2, name: 'Daily Report Generation', type: 'Analytics', status: 'Scheduled', lastRun: '1 hour ago' },
    { id: 3, name: 'Compliance Monitoring', type: 'Security', status: 'Running', lastRun: '5 min ago' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">AI Advisor Platform</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Enterprise</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Workflows
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                  <MessageSquare className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.totalQueries.toLocaleString()}</div>
                  <p className="text-xs text-blue-100">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RAG Hit Rate</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.ragHitRate}%</div>
                  <p className="text-xs text-green-100">+2% from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                  <Clock className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.avgLatency}ms</div>
                  <p className="text-xs text-purple-100">-15ms from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">LLM Cost</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${kpis.llmCost}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.complianceScore}%</div>
                  <p className="text-xs text-muted-foreground">HIPAA, GDPR, SOC2</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Brain className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.vertical} • {project.queries} queries</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{project.accuracy}% accuracy</p>
                          <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      AI Assistant Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm">Hello! I'm your AI assistant. How can I help you today?</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                            <p className="text-sm">What's our company's vacation policy?</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-white rounded-lg p-3 max-w-md shadow-sm">
                            <p className="text-sm">Based on your HR handbook, here's your vacation policy: Full-time employees accrue 15 days of vacation annually, increasing to 20 days after 3 years of service. Vacation must be requested 2 weeks in advance...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button>Send</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Brain className="h-4 w-4 mr-2" />
                      Create New Project
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure RAG
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Knowledge Bases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">HR Policies</span>
                      <Badge variant="secondary">342 docs</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Financial Reports</span>
                      <Badge variant="secondary">89 docs</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Legal Contracts</span>
                      <Badge variant="secondary">156 docs</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Projects</h2>
              <Button>
                <Brain className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {project.name}
                      <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Vertical:</span>
                        <span className="font-medium">{project.vertical}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Queries:</span>
                        <span className="font-medium">{project.queries}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Accuracy:</span>
                        <span className="font-medium">{project.accuracy}%</span>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          Configure
                        </Button>
                        <Button size="sm" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Automation Workflows</h2>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {workflow.name}
                      <div className="flex items-center gap-2">
                        {workflow.status === 'Running' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                        <Badge variant={workflow.status === 'Running' ? 'default' : 'secondary'}>
                          {workflow.status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <span className="font-medium">{workflow.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Run:</span>
                        <span className="font-medium">{workflow.lastRun}</span>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Logs
                        </Button>
                        <Button size="sm">
                          Run Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <h3 className="font-medium mb-2">Document Processing</h3>
                    <p className="text-sm text-muted-foreground">Auto-process uploaded documents into knowledge base</p>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <h3 className="font-medium mb-2">Daily Reports</h3>
                    <p className="text-sm text-muted-foreground">Generate and email daily analytics reports</p>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <h3 className="font-medium mb-2">Compliance Check</h3>
                    <p className="text-sm text-muted-foreground">Monitor documents for compliance violations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
