import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { localStorageManager } from '@/services/storage/LocalStorageManager';
import { UnifiedRAGService, LocalEmbeddingProvider } from '@/services/rag/UnifiedRAGService';
import { LLMManager, LocalLLMClient } from '@/services/llm/BaseLLMClient';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  HardDrive, 
  Brain,
  Clock,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: any[];
  metadata?: {
    tokens_used?: number;
    cost?: number;
    response_time_ms?: number;
    model_used?: string;
  };
}

interface EnhancedLocalRAGChatProps {
  projectId: string;
  collectionId?: string;
}

export const EnhancedLocalRAGChat: React.FC<EnhancedLocalRAGChatProps> = ({
  projectId,
  collectionId = projectId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ragService, setRagService] = useState<UnifiedRAGService | null>(null);
  const [sessionStats, setSessionStats] = useState({
    totalQueries: 0,
    totalTokens: 0,
    totalCost: 0,
    avgResponseTime: 0
  });
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 500,
    topK: 5,
    systemPrompt: 'You are a helpful AI assistant. Use the provided context to answer questions accurately and cite your sources.'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeServices();
    loadChatHistory();
  }, [projectId, collectionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeServices = async () => {
    try {
      await localStorageManager.initialize();
      
      const llmManager = new LLMManager();
      const embeddingProvider = new LocalEmbeddingProvider();
      
      // Register local LLM client
      llmManager.registerClient({
        id: 'local-client',
        name: 'Local Browser LLM',
        provider_type: 'openai', // Using OpenAI interface for compatibility
        cost_per_token: 0
      });
      
      const ragServiceInstance = new UnifiedRAGService(
        llmManager,
        localStorageManager,
        embeddingProvider
      );
      
      setRagService(ragServiceInstance);
    } catch (error) {
      console.error('Failed to initialize RAG services:', error);
      toast({
        title: "Service Error",
        description: "Failed to initialize RAG services",
        variant: "destructive",
      });
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await localStorageManager.getChatHistory(projectId, 50);
      const formattedMessages: ChatMessage[] = history.map(msg => ({
        id: msg.id || Date.now().toString(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        sources: msg.sources
      }));
      setMessages(formattedMessages);
      
      // Calculate session stats from history
      const stats = formattedMessages.reduce((acc, msg) => {
        if (msg.role === 'assistant' && msg.metadata) {
          acc.totalQueries++;
          acc.totalTokens += msg.metadata.tokens_used || 0;
          acc.totalCost += msg.metadata.cost || 0;
          acc.avgResponseTime = (acc.avgResponseTime + (msg.metadata.response_time_ms || 0)) / acc.totalQueries;
        }
        return acc;
      }, { totalQueries: 0, totalTokens: 0, totalCost: 0, avgResponseTime: 0 });
      
      setSessionStats(stats);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !ragService || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ragService.queryRAG(
        userMessage.content,
        collectionId,
        'local-client',
        {
          topK: settings.topK,
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          systemPrompt: settings.systemPrompt
        }
      );

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        metadata: response.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session stats
      setSessionStats(prev => ({
        totalQueries: prev.totalQueries + 1,
        totalTokens: prev.totalTokens + (response.metadata.tokens_used || 0),
        totalCost: prev.totalCost + (response.metadata.cost || 0),
        avgResponseTime: (prev.avgResponseTime * prev.totalQueries + response.metadata.response_time_ms) / (prev.totalQueries + 1)
      }));

      // Show success toast with stats
      toast({
        title: "Query Completed",
        description: `Found ${response.sources.length} relevant sources in ${response.metadata.response_time_ms}ms`,
      });

    } catch (error) {
      console.error('RAG query failed:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `Sorry, I encountered an error while processing your query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Query Failed",
        description: "Failed to process your query",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const clearChat = () => {
    setMessages([]);
    setSessionStats({ totalQueries: 0, totalTokens: 0, totalCost: 0, avgResponseTime: 0 });
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header with Stats */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Local RAG Chat
              <Badge variant="outline" className="ml-2">
                <HardDrive className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-muted-foreground">Queries</p>
                <p className="font-semibold">{sessionStats.totalQueries}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-muted-foreground">Tokens</p>
                <p className="font-semibold">{sessionStats.totalTokens}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-muted-foreground">Cost</p>
                <p className="font-semibold">${sessionStats.totalCost.toFixed(4)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-muted-foreground">Avg Time</p>
                <p className="font-semibold">{Math.round(sessionStats.avgResponseTime)}ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Local RAG Chat Ready</p>
                  <p className="text-sm">Ask questions about your uploaded documents</p>
                  <p className="text-sm mt-2 text-blue-600">✓ Runs entirely in your browser</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 border'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium mb-2">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.slice(0, 3).map((source, idx) => (
                            <div key={idx} className="text-xs bg-white p-2 rounded border">
                              <div className="flex items-center gap-1 mb-1">
                                <FileText className="h-3 w-3" />
                                <span className="font-medium">Chunk {source.chunk_index + 1}</span>
                                {source.similarity && (
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(source.similarity * 100)}% match
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 line-clamp-2">
                                {source.content.substring(0, 100)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.metadata && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>{formatTimestamp(message.timestamp)}</span>
                          <span>{message.metadata.tokens_used} tokens • {message.metadata.response_time_ms}ms</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 border">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing your query...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your documents..."
                className="flex-1 min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Settings */}
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  <span>Top-K: {settings.topK}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Temp: {settings.temperature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Max Tokens: {settings.maxTokens}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                <HardDrive className="h-3 w-3 mr-1" />
                Local Processing
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLocalRAGChat;
