
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

    const { documentId } = await req.json();

    console.log('Processing document:', documentId);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Update status to processing
    await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Extract text from file (simplified - supports text files)
    let text = '';
    if (document.file_type === 'text/plain') {
      text = await fileData.text();
    } else {
      // For other file types, you'd implement proper parsing
      text = 'File content extraction not implemented for this file type yet.';
    }

    // Chunk the text
    const chunks = chunkText(text, 500); // 500 words per chunk

    // Generate embeddings and store chunks
    let chunkCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Get embedding for this chunk
        const embeddingResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: "models/embedding-001",
              content: { parts: [{ text: chunk }] }
            })
          }
        );

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.embedding.values;

          // Store chunk in database
          await supabase.from('document_chunks').insert({
            document_id: documentId,
            project_id: document.project_id,
            chunk_index: i,
            chunk_text: chunk,
            embedding: JSON.stringify(embedding), // Store as JSON for now
            metadata: { 
              word_count: chunk.split(' ').length,
              char_count: chunk.length 
            }
          });

          chunkCount++;
        }
      } catch (chunkError) {
        console.error(`Error processing chunk ${i}:`, chunkError);
      }
    }

    // Update document with completion status
    await supabase
      .from('documents')
      .update({ 
        processing_status: 'completed',
        chunk_count: chunkCount
      })
      .eq('id', documentId);

    console.log(`Document processed: ${chunkCount} chunks created`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksCreated: chunkCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    
    // Mark document as failed
    const { documentId } = await req.json().catch(() => ({}));
    if (documentId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase
        .from('documents')
        .update({ processing_status: 'failed' })
        .eq('id', documentId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function chunkText(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}
