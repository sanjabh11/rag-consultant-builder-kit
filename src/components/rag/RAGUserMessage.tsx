
import React from "react";
import { Clock, User } from "lucide-react";

interface RAGUserMessageProps {
  queryText: string;
  createdAt: string;
}

const RAGUserMessage: React.FC<RAGUserMessageProps> = ({ queryText, createdAt }) => (
  <div className="flex items-start gap-3">
    <div className="bg-primary text-primary-foreground rounded-full p-2">
      <User className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <div className="bg-muted p-3 rounded-lg">
        <p>{queryText}</p>
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {new Date(createdAt).toLocaleTimeString()}
      </div>
    </div>
  </div>
);

export default RAGUserMessage;
