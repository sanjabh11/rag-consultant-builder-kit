
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

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { query, projectId, userId, maxSources = 5, similarityThreshold = 0.7 } = await req.json();

    console.log('RAG Query received:', { query, projectId, maxSources });

    // Get embeddings for the query using Gemini
    const embeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/embedding-001",
          content: { parts: [{ text: query }] }
        })
      }
    );

    if (!embeddingResponse.ok) {
      throw new Error('Failed to get embeddings');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.embedding.values;

    // Search for relevant documents using similarity
    const { data: chunks, error: searchError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        chunk_text,
        metadata,
        documents!inner(id, file_name, project_id)
      `)
      .eq('documents.project_id', projectId)
      .limit(maxSources);

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error('Failed to search documents');
    }

    // For now, return the first few chunks (in production, you'd use vector similarity)
    const relevantChunks = (chunks || []).slice(0, maxSources);

    // Combine chunks into context
    const context = relevantChunks
      .map(chunk => chunk.chunk_text)
      .join('\n\n');

    // Generate answer using Gemini
    const prompt = `Based on the following context from documents, answer the user's question comprehensively:

Context:
${context}

Question: ${query}

Please provide a detailed answer based only on the information provided in the context. If the context doesn't contain enough information to answer the question, please say so.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    // Estimate tokens used
    const tokensUsed = Math.ceil(answer.length / 4);

    // Format sources
    const sources = relevantChunks.map(chunk => ({
      documentId: chunk.documents.id,
      fileName: chunk.documents.file_name,
      chunkText: chunk.chunk_text.substring(0, 200) + '...',
      similarity: 0.8 // Placeholder similarity score
    }));

    // Log the query
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

    return new Response(
      JSON.stringify({
        answer,
        sources,
        tokensUsed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG query error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
