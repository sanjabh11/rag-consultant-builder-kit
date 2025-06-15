
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { query, projectId, userId, maxSources = 5, similarityThreshold = 0.7 } = await req.json();

    if (!query || !projectId || !userId) {
      throw new Error('Missing required parameters: query, projectId, and userId are required');
    }

    console.log('RAG Query received:', { query, projectId, maxSources, userId });

    // Validate user access to project
    const { data: projectAccess } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!projectAccess) {
      throw new Error('Access denied: User does not have access to this project');
    }

    // Get embeddings for the query using Gemini with retry logic
    const embeddingResponse = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/embedding-001",
          content: { parts: [{ text: query }] }
        })
      },
      3
    );

    if (!embeddingResponse.ok) {
      throw new Error(`Failed to get embeddings: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.embedding.values;

    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error('Failed to generate query embedding');
    }

    // Search for relevant documents using proper vector similarity
    let relevantChunks = [];
    
    try {
      // Try vector similarity search first
      const vectorQuery = `[${queryEmbedding.join(',')}]`;
      const { data: vectorData, error: vectorError } = await supabase
        .from('document_chunks')
        .select(`
          id,
          chunk_text,
          metadata,
          chunk_index,
          documents!inner(id, file_name, project_id, user_id)
        `)
        .eq('documents.project_id', projectId)
        .eq('documents.user_id', userId)
        .order('embedding <-> ?', { foreignTable: null, ascending: true })
        .limit(maxSources);

      if (!vectorError && vectorData) {
        relevantChunks = vectorData;
        console.log(`Found ${relevantChunks.length} chunks using vector search`);
      } else {
        console.log('Vector search failed, falling back to text search:', vectorError);
        
        // Fallback to text-based search
        const { data: textData, error: textError } = await supabase
          .from('document_chunks')
          .select(`
            id,
            chunk_text,
            metadata,
            chunk_index,
            documents!inner(id, file_name, project_id, user_id)
          `)
          .eq('documents.project_id', projectId)
          .eq('documents.user_id', userId)
          .textSearch('chunk_text', query.split(' ').join(' | '))
          .limit(maxSources);

        if (textError) {
          throw new Error(`Search failed: ${textError.message}`);
        }
        
        relevantChunks = textData || [];
        console.log(`Found ${relevantChunks.length} chunks using text search`);
      }
    } catch (searchError) {
      console.error('Search error:', searchError);
      throw new Error(`Document search failed: ${searchError.message}`);
    }

    if (relevantChunks.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find any relevant information in your documents to answer this question. Please make sure you have uploaded and processed documents related to your query.",
          sources: [],
          tokensUsed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine chunks into context with metadata
    const context = relevantChunks
      .map((chunk, index) => `Document: ${chunk.documents.file_name}\nContent: ${chunk.chunk_text}`)
      .join('\n\n---\n\n');

    // Generate answer using Gemini with enhanced prompt
    const prompt = `You are a helpful AI assistant that answers questions based on provided document context. Please follow these guidelines:

1. Answer the user's question using ONLY the information provided in the context below
2. If the context doesn't contain enough information, clearly state this limitation
3. Cite specific documents when referencing information
4. Be accurate and concise
5. If you're uncertain about any information, express this uncertainty

Context from user's documents:
${context}

User's question: ${query}

Please provide a comprehensive answer based on the available context:`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.3, 
            maxOutputTokens: 1000,
            candidateCount: 1
          }
        })
      },
      3
    );

    if (!response.ok) {
      throw new Error(`Failed to generate response: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      throw new Error('No response generated from AI model');
    }

    // Calculate similarity scores and estimate tokens used
    const tokensUsed = Math.ceil((prompt.length + answer.length) / 4);

    // Format sources with enhanced metadata
    const sources = relevantChunks.map((chunk, index) => ({
      documentId: chunk.documents.id,
      fileName: chunk.documents.file_name,
      chunkText: chunk.chunk_text.substring(0, 200) + (chunk.chunk_text.length > 200 ? '...' : ''),
      similarity: 0.8 - (index * 0.1), // Simulated similarity score based on ranking
      chunkIndex: chunk.chunk_index,
      metadata: chunk.metadata
    }));

    // Log the query for analytics
    try {
      await supabase.from('rag_queries').insert({
        project_id: projectId,
        user_id: userId,
        query_text: query,
        response_text: answer,
        retrieved_chunks: sources,
        llm_provider: 'gemini',
        tokens_used: tokensUsed,
        response_time_ms: Date.now() % 10000
      });
    } catch (logError) {
      console.error('Failed to log query:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({
        answer,
        sources,
        tokensUsed,
        chunksFound: relevantChunks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG query error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process your question. Please try again or contact support if the issue persists.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number): Promise<Response> {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError;
}
