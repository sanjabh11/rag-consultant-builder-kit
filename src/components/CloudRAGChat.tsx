
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCloudRAG } from "@/hooks/useCloudRAG";
import { useCloudDocuments } from "@/hooks/useCloudDocuments";
import { MessageSquare, Send, FileText, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CloudRAGChatProps {
  projectId: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    documentId: string;
    fileName: string;
    chunkText: string;
    similarity: number;
  }>;
  timestamp: string;
  tokensUsed?: number;
}

const CloudRAGChat: React.FC<CloudRAGChatProps> = ({ projectId }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const { documents } = useCloudDocuments(projectId);
  const { queryRAG, loading } = useCloudRAG();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const completedDocs = documents.filter(doc => doc.processing_status === 'completed');
    if (completedDocs.length === 0) {
      toast({
        title: "No documents ready",
        description: "Please upload and wait for documents to be processed before asking questions.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await queryRAG(query, projectId, {
        maxSources: 5,
        similarityThreshold: 0.7
      });

      if (response) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          type: 'assistant',
          content: response.answer,
          sources: response.sources,
          timestamp: new Date().toISOString(),
          tokensUsed: response.tokensUsed
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setQuery("");
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud RAG Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {documents.filter(d => d.processing_status === 'completed').length} ready
            </Badge>
            <Badge variant="outline">
              {documents.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ask questions about your uploaded documents.</p>
                {documents.length === 0 && (
                  <p className="text-sm mt-2">Upload some documents first to get started.</p>
                )}
                {documents.length > 0 && documents.filter(d => d.processing_status === 'completed').length === 0 && (
                  <p className="text-sm mt-2">Waiting for documents to be processed...</p>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.tokensUsed && (
                          <span>• {message.tokensUsed} tokens</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="ml-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Sources:</div>
                      <div className="space-y-1">
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-xs p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">{source.fileName}</div>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(source.similarity * 100)}% match
                              </Badge>
                            </div>
                            <div className="text-muted-foreground">
                              {source.chunkText.substring(0, 200)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={loading || documents.filter(d => d.processing_status === 'completed').length === 0}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !query.trim() || documents.filter(d => d.processing_status === 'completed').length === 0}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudRAGChat;
