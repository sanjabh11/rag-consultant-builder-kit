import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRAGQueries, useCreateRAGQuery } from "@/hooks/useRAGQueries";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmbedding } from "@/hooks/useEmbedding";
import { getRetrievedChunks } from "./rag/ragChatUtils";
import RAGUserMessage from "./rag/RAGUserMessage";
import RAGBotMessage from "./rag/RAGBotMessage";

interface RAGChatInterfaceProps {
  projectId: string;
}

// (original interface kept for bot and chunks)
// type definition copy-pasted below; kept for use across children

const RAGChatInterface: React.FC<RAGChatInterfaceProps> = ({ projectId }) => {
  const [query, setQuery] = useState("");
  const [retrievedChunks, setRetrievedChunks] = useState<any[]>([]);
  const { data: queries, isLoading } = useRAGQueries(projectId);
  const createQuery = useCreateRAGQuery();
  const { toast } = useToast();
  const { getEmbedding, isLoading: embeddingLoading } = useEmbedding();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // 1. Get query embedding
      const embedding = await getEmbedding(query);
      if (!embedding) throw new Error("Failed to get embedding for query.");

      // 2. Retrieve relevant chunks:
      const { data: chunks, error: chunkError } = await (supabase as any)
        .from("document_chunks")
        .select(
          "id, chunk_text, file_name, file_path, chunk_index, embedding, created_at"
        )
        .eq("project_id", projectId)
        .order("embedding", {
          ascending: true,
          // @ts-ignore
          queryVector: embedding,
          // @ts-ignore
          similarity: "cosine",
        })
        .limit(5);

      if (chunkError) throw chunkError;
      setRetrievedChunks(chunks);

      // 3. Form context for Gemini
      const context =
        chunks?.map((c: any) => c.chunk_text).join("\n\n") ?? "";
      const prompt = `Based on the following context, answer the user's question. If the context does not answer the question, simply say you do not have enough information.

Context:
${context}

Question: ${query}`;

      // 4. Call Gemini API through our edge function
      const { data: geminiResponse, error } = await supabase.functions.invoke(
        "gemini-llm",
        {
          body: {
            prompt,
            temperature: 0.7,
            maxTokens: 1000,
          },
        }
      );

      if (error)
        throw new Error(error.message || "Failed to get response from Gemini");
      if (!geminiResponse)
        throw new Error("No response received from Gemini API");

      await createQuery.mutateAsync({
        project_id: projectId,
        query_text: query,
        response_text: geminiResponse.text,
        retrieved_chunks: (chunks || []).map((c: any) => ({
          id: c.id,
          text: c.chunk_text,
          file_name: c.file_name,
          file_path: c.file_path,
          score: null, // Can update if/when scoring provided.
        })),
        llm_provider: "gemini",
        tokens_used: geminiResponse.tokensUsed || 0,
        response_time_ms: Date.now() - startTime,
      });

      setQuery("");
      toast({
        title: "Query processed",
        description: "Your question has been answered using RAG + Gemini AI.",
      });
    } catch (error) {
      console.error("RAG query error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          RAG Chat Interface (Powered by Gemini)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">
                Loading conversation...
              </div>
            ) : queries?.length === 0 ? (
              <div className="text-center text-muted-foreground">
                Start a conversation by asking a question about your documents.
              </div>
            ) : (
              queries?.map((q) => {
                const retrievedChunks = getRetrievedChunks(q.retrieved_chunks);
                return (
                  <div key={q.id} className="space-y-3">
                    <RAGUserMessage
                      queryText={q.query_text}
                      createdAt={q.created_at}
                    />
                    {q.response_text && (
                      <RAGBotMessage
                        responseText={q.response_text}
                        tokensUsed={q.tokens_used}
                        responseTimeMs={q.response_time_ms}
                        llmProvider={q.llm_provider}
                        retrievedChunks={retrievedChunks}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={isProcessing || embeddingLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isProcessing || embeddingLoading || !query.trim()}
            >
              {isProcessing || embeddingLoading ? (
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

export default RAGChatInterface;
