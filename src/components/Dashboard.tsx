
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, Cloud, HardDrive } from 'lucide-react';
import { useProjects } from './ProjectProvider';
import CloudDocumentUpload from './CloudDocumentUpload';
import LocalDocumentUpload from './LocalDocumentUpload';
import CloudRAGChat from './CloudRAGChat';
import LocalRAGChat from './LocalRAGChat';

const Dashboard: React.FC = () => {
  const { currentProject } = useProjects();
  const [activeTab, setActiveTab] = useState('cloud');

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome to RAG Chat Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Create your first project to get started with document upload and AI-powered chat.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">{currentProject.name}</h2>
          {currentProject.description && (
            <p className="text-gray-600 mt-1">{currentProject.description}</p>
          )}
        </div>
        <Badge variant="outline">Active Project</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Cloud RAG
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Local RAG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cloud" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cloud Document Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CloudDocumentUpload projectId={currentProject.id} />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Cloud RAG Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CloudRAGChat projectId={currentProject.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="local" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Local Document Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocalDocumentUpload projectId={currentProject.id} />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Local RAG Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocalRAGChat projectId={currentProject.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
