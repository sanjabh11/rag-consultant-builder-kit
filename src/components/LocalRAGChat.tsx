
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalDocuments } from "@/hooks/useLocalDocuments";
import { useGemini } from "@/hooks/useGemini";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { MessageSquare, Send, FileText, Settings } from "lucide-react";
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
    score: number;
  }>;
  timestamp: string;
  tokensUsed?: number;
}

const LocalRAGChat: React.FC<LocalRAGChatProps> = ({ projectId }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchAlgorithm, setSearchAlgorithm] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid');
  const [showSettings, setShowSettings] = useState(false);
  
  const { documents } = useLocalDocuments(projectId);
  const { generateText, isLoading } = useGemini();
  const { search, isSearching } = useAdvancedSearch(projectId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    if (documents.length === 0) {
      toast({
        title: "No documents",
        description: "Please upload some documents first to enable RAG chat.",
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
      // Use advanced search to find relevant content
      const searchResults = await search(query, {
        algorithm: searchAlgorithm,
        threshold: 0.3,
        maxResults: 5,
        boostRecent: true
      });

      const context = searchResults
        .map(result => result.content)
        .join('\n\n');

      if (!context.trim()) {
        const fallbackMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          type: 'assistant',
          content: "I couldn't find relevant information in your documents to answer this question. Please try rephrasing your query or upload more relevant documents.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackMessage]);
        setQuery("");
        return;
      }

      // Generate AI response using Gemini
      const prompt = `Based on the following context from documents, answer the user's question accurately and comprehensively:

Context:
${context}

Question: ${query}

Instructions:
- Answer based only on the provided context
- If the context doesn't contain enough information, say so clearly
- Be specific and cite relevant parts of the context
- Keep the response helpful and concise`;

      const response = await generateText(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });

      if (response) {
        const sources = searchResults.slice(0, 3).map(result => ({
          fileName: result.fileName,
          chunkIndex: 0,
          snippet: result.content.substring(0, 200) + '...',
          score: result.score
        }));

        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          type: 'assistant',
          content: response.text,
          sources,
          timestamp: new Date().toISOString(),
          tokensUsed: response.tokensUsed
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('RAG query error:', error);
      toast({
        title: "Error",
        description: "Failed to process query. Please try again.",
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
            <MessageSquare className="h-5 w-5" />
            Enhanced RAG Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {documents.length} documents
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showSettings && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Search Algorithm:</label>
              <Select value={searchAlgorithm} onValueChange={(value: any) => setSearchAlgorithm(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
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
                                {Math.round(source.score * 100)}% match
                              </Badge>
                            </div>
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
              disabled={isLoading || isSearching || documents.length === 0}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || isSearching || !query.trim() || documents.length === 0}
            >
              {isLoading || isSearching ? (
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
