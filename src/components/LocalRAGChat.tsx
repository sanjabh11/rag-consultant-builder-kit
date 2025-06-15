
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLocalDocuments } from "@/hooks/useLocalDocuments";
import { MessageSquare, Send, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocalRAGChatProps {
  projectId: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    fileName: string;
    chunkIndex: number;
    snippet: string;
  }>;
  timestamp: string;
}

const LocalRAGChat: React.FC<LocalRAGChatProps> = ({ projectId }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { documents, searchDocuments } = useLocalDocuments(projectId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    if (documents.length === 0) {
      toast({
        title: "No documents",
        description: "Please upload some documents first to enable RAG chat.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Simple local search through documents
      const relevantDocs = searchDocuments(query);
      const sources = relevantDocs.slice(0, 3).map(doc => ({
        fileName: doc.fileName,
        chunkIndex: 0,
        snippet: doc.content.substring(0, 200) + '...'
      }));

      // Create a simple response (in production, this would call an LLM)
      const context = relevantDocs
        .flatMap(doc => doc.chunks || [])
        .slice(0, 5)
        .map(chunk => chunk.text)
        .join('\n\n');

      const assistantResponse = generateSimpleResponse(query, context);

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: assistantResponse,
        sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setQuery("");

    } catch (error) {
      console.error('RAG query error:', error);
      toast({
        title: "Error",
        description: "Failed to process query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple response generation (placeholder for actual LLM integration)
  const generateSimpleResponse = (query: string, context: string): string => {
    if (!context.trim()) {
      return "I couldn't find relevant information in your documents to answer this question. Please try rephrasing your query or upload more relevant documents.";
    }

    const words = query.toLowerCase().split(' ');
    const contextLower = context.toLowerCase();
    
    // Simple keyword matching
    const relevantSentences = context.split('.').filter(sentence => 
      words.some(word => sentence.toLowerCase().includes(word))
    ).slice(0, 3);

    if (relevantSentences.length > 0) {
      return `Based on your documents, here's what I found:\n\n${relevantSentences.join('. ')}.`;
    }

    return "I found some related content in your documents, but couldn't generate a specific answer. Please try a more specific question.";
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Local RAG Chat
          </CardTitle>
          <Badge variant="outline">
            {documents.length} documents
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation by asking a question about your documents.</p>
                {documents.length === 0 && (
                  <p className="text-sm mt-2">Upload some documents first to enable RAG chat.</p>
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
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="ml-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Sources:</div>
                      <div className="space-y-1">
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-xs p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                            <div className="font-medium">{source.fileName}</div>
                            <div className="text-muted-foreground">{source.snippet}</div>
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
              disabled={isProcessing || documents.length === 0}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isProcessing || !query.trim() || documents.length === 0}
            >
              {isProcessing ? (
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

export default LocalRAGChat;
