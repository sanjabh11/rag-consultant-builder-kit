
import React from "react";

interface RetrievedChunk {
  id: string;
  text: string;
  file_name?: string;
  file_path?: string;
  score: number | null;
}

const RAGRetrievedChunks: React.FC<{ chunks: RetrievedChunk[] }> = ({ chunks }) => (
  <details className="text-xs">
    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
      View retrieved chunks ({chunks.length})
    </summary>
    <div className="mt-2 space-y-1">
      {chunks.map((chunk, idx) => (
        <div key={chunk.id ?? idx} className="bg-gray-50 p-2 rounded text-xs">
          <div className="font-medium">
            Chunk {idx + 1}
            {chunk.score !== undefined && chunk.score !== null && (
              <> (score: {chunk.score})</>
            )}
          </div>
          <div className="text-muted-foreground truncate">{chunk.text}</div>
        </div>
      ))}
    </div>
  </details>
);

export default RAGRetrievedChunks;
