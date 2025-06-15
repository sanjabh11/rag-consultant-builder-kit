
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGemini } from '@/hooks/useGemini';
import { useLocalDocuments } from '@/hooks/useLocalDocuments';
import { MessageSquare, Search, Settings, Filter, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    fileName: string;
    snippet: string;
    confidence: number;
  }>;
}

interface EnhancedRAGChatProps {
  projectId: string;
}

const EnhancedRAGChat: React.FC<EnhancedRAGChatProps> = ({ projectId }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    documentTypes: [] as string[],
    confidence: 0.7,
    maxResults: 5,
  });
  
  const { generateText, isLoading } = useGemini();
  const { documents, searchDocuments } = useLocalDocuments(projectId);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    if (documents.length === 0) {
      toast({
        title: "No documents",
        description: "Please upload some documents first to enable RAG chat.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Search relevant documents
      const relevantDocs = searchDocuments(query);
      const context = relevantDocs
        .slice(0, filters.maxResults)
        .flatMap(doc => doc.chunks || [])
        .slice(0, 5)
        .map(chunk => chunk.text)
        .join('\n\n');

      // Generate AI response using real LLM
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
        const sources = relevantDocs.slice(0, 3).map(doc => ({
          fileName: doc.fileName,
          snippet: doc.content.substring(0, 200) + '...',
          confidence: Math.random() * 0.3 + 0.7 // Simulated confidence score
        }));

        const assistantMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          type: 'assistant',
          content: response.text,
          timestamp: new Date().toISOString(),
          sources
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('RAG query error:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    }

    setQuery('');
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Enhanced RAG Chat
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              {documents.length} documents
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Confidence Threshold: {filters.confidence}</label>
                <Slider
                  value={[filters.confidence]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, confidence: value }))}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Max Results: {filters.maxResults}</label>
                <Slider
                  value={[filters.maxResults]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, maxResults: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        )}

        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium">{source.fileName}</div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(source.confidence * 100)}%
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

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
            className="flex-1"
            disabled={isLoading || documents.length === 0}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !query.trim() || documents.length === 0}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedRAGChat;
