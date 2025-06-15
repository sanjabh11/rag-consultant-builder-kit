
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCloudRAG } from "@/hooks/useCloudRAG";
import { useCloudDocuments } from "@/hooks/useCloudDocuments";
import { MessageSquare, Send, FileText, Cloud, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CloudRAGChatProps {
  projectId: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{
    documentId: string;
    fileName: string;
    chunkText: string;
    similarity: number;
    chunkIndex?: number;
    metadata?: any;
  }>;
  timestamp: string;
  tokensUsed?: number;
  chunksFound?: number;
  error?: boolean;
}

const CloudRAGChat: React.FC<CloudRAGChatProps> = ({ projectId }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const { documents, loading: documentsLoading } = useCloudDocuments(projectId);
  const { queryRAG, loading } = useCloudRAG();
  const { toast } = useToast();

  const completedDocs = documents.filter(doc => doc.processing_status === 'completed');
  const processingDocs = documents.filter(doc => doc.processing_status === 'processing');
  const failedDocs = documents.filter(doc => doc.processing_status === 'failed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    if (completedDocs.length === 0) {
      if (documents.length === 0) {
        toast({
          title: "No documents uploaded",
          description: "Please upload some documents before asking questions.",
          variant: "destructive",
        });
      } else if (processingDocs.length > 0) {
        toast({
          title: "Documents still processing",
          description: "Please wait for documents to finish processing before asking questions.",
        });
      } else {
        toast({
          title: "No processed documents",
          description: "All uploaded documents failed to process. Please check file formats and try re-uploading.",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");

    try {
      const response = await queryRAG(currentQuery, projectId, {
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
          tokensUsed: response.tokensUsed,
          chunksFound: (response as any).chunksFound || response.sources.length
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No response received from the system');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 2}`,
        type: 'system',
        content: 'Sorry, I encountered an error while processing your question. Please try again or rephrase your question.',
        timestamp: new Date().toISOString(),
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDocumentStatusSummary = () => {
    if (documentsLoading) return "Loading documents...";
    if (documents.length === 0) return "No documents uploaded";
    
    const statusParts = [];
    if (completedDocs.length > 0) statusParts.push(`${completedDocs.length} ready`);
    if (processingDocs.length > 0) statusParts.push(`${processingDocs.length} processing`);
    if (failedDocs.length > 0) statusParts.push(`${failedDocs.length} failed`);
    
    return statusParts.join(', ');
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
            <Badge variant={completedDocs.length > 0 ? "default" : "secondary"}>
              {getDocumentStatusSummary()}
            </Badge>
          </div>
        </div>
        
        {/* Status alerts */}
        {documents.length > 0 && completedDocs.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {processingDocs.length > 0 
                ? "Documents are being processed. Please wait before asking questions."
                : "No documents are ready for chat. Please check your uploads and try re-processing failed documents."
              }
            </AlertDescription>
          </Alert>
        )}

        {failedDocs.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {failedDocs.length} document(s) failed to process. Check file formats and try re-uploading.
            </AlertDescription>
          </Alert>
        )}
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
                {documents.length > 0 && completedDocs.length === 0 && (
                  <p className="text-sm mt-2">Waiting for documents to be processed...</p>
                )}
                {completedDocs.length > 0 && (
                  <p className="text-sm mt-2 text-green-600">
                    Ready to answer questions from {completedDocs.length} processed document(s).
                  </p>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.error
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : message.type === 'system'
                        ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.error && <AlertCircle className="h-4 w-4 inline mr-2" />}
                      {message.type === 'assistant' && !message.error && <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.tokensUsed && (
                          <span>• {message.tokensUsed} tokens</span>
                        )}
                        {message.chunksFound && (
                          <span>• {message.chunksFound} sources</span>
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
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(source.similarity * 100)}% match
                                </Badge>
                                {source.chunkIndex !== undefined && (
                                  <Badge variant="outline" className="text-xs">
                                    Chunk {source.chunkIndex + 1}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-muted-foreground">
                              {source.chunkText}
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
              placeholder={
                completedDocs.length > 0
                  ? "Ask a question about your documents..."
                  : documents.length === 0
                  ? "Upload documents first..."
                  : "Waiting for document processing..."
              }
              disabled={loading || completedDocs.length === 0}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !query.trim() || completedDocs.length === 0}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          {completedDocs.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Ready to search across {completedDocs.length} processed document(s)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudRAGChat;
