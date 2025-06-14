
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, Zap } from "lucide-react";
import RAGRetrievedChunks from "./RAGRetrievedChunks";

interface RetrievedChunk {
  id: string;
  text: string;
  file_name?: string;
  file_path?: string;
  score: number | null;
}

interface RAGBotMessageProps {
  responseText: string;
  tokensUsed: number | null;
  responseTimeMs?: number | null;
  llmProvider?: string;
  retrievedChunks: RetrievedChunk[];
}

const RAGBotMessage: React.FC<RAGBotMessageProps> = ({
  responseText,
  tokensUsed,
  responseTimeMs,
  llmProvider,
  retrievedChunks,
}) => (
  <div className="flex items-start gap-3">
    <div className="bg-blue-600 text-white rounded-full p-2">
      <Bot className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="whitespace-pre-wrap">{responseText}</p>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          {tokensUsed ?? 0} tokens
        </div>
        {responseTimeMs && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {responseTimeMs}ms
          </div>
        )}
        <Badge variant="secondary" className="text-xs">
          {llmProvider}
        </Badge>
      </div>
      {retrievedChunks.length > 0 && (
        <div className="mt-2">
          <RAGRetrievedChunks chunks={retrievedChunks} />
        </div>
      )}
    </div>
  </div>
);

export default RAGBotMessage;
