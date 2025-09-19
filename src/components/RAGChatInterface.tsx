
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import LocalRAGChat from "./LocalRAGChat";
import CloudRAGChat from "./CloudRAGChat";
import EnhancedLocalRAGChat from "./EnhancedLocalRAGChat";
import { MessageSquare, HardDrive, Cloud } from "lucide-react";

interface RAGChatInterfaceProps {
  projectId: string;
}

const RAGChatInterface: React.FC<RAGChatInterfaceProps> = ({ projectId }) => {
  const { user } = useAuth();

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            RAG Chat Interface
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue={user ? "cloud" : "enhanced"} className="flex-1 flex flex-col">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cloud" disabled={!user} className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Cloud RAG {!user && "(Login Required)"}
              </TabsTrigger>
              <TabsTrigger value="enhanced" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Enhanced Local
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Basic Local
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="cloud" className="flex-1 m-0">
            {user ? (
              <CloudRAGChat projectId={projectId} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Please log in to use Cloud RAG</p>
                  <p className="text-sm mt-2">Enhanced with vector search and cloud processing</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="enhanced" className="flex-1 m-0">
            <EnhancedLocalRAGChat projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="local" className="flex-1 m-0">
            <LocalRAGChat projectId={projectId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RAGChatInterface;
