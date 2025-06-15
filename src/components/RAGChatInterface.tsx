
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LocalRAGChat from "./LocalRAGChat";
import { MessageSquare, HardDrive, Cloud } from "lucide-react";
import { useRateLimiting, RATE_LIMITS } from "@/hooks/useRateLimiting";

interface RAGChatInterfaceProps {
  projectId: string;
}

const RAGChatInterface: React.FC<RAGChatInterfaceProps> = ({ projectId }) => {
  const { remainingRequests } = useRateLimiting({
    ...RATE_LIMITS.CHAT_MESSAGES,
    identifier: `chat_${projectId}`
  });

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            RAG Chat Interface
          </div>
          <div className="text-xs text-muted-foreground">
            {remainingRequests} requests remaining
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue="local" className="flex-1 flex flex-col">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="local" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Local RAG
              </TabsTrigger>
              <TabsTrigger value="cloud" disabled className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Cloud RAG (Soon)
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="local" className="flex-1 m-0">
            <LocalRAGChat projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="cloud" className="flex-1 m-0">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Cloud-powered RAG coming soon!</p>
                <p className="text-sm mt-2">Enhanced with external LLM integration.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RAGChatInterface;
