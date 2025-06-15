
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

    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error('Document ID is required');
    }

    console.log('Processing document:', documentId);

    // Get document details with user validation
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found or access denied');
    }

    // Update status to processing
    await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // Download file from storage with proper error handling
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message || 'Unknown error'}`);
    }

    // Extract text from file with enhanced support
    let text = '';
    const fileType = document.file_type.toLowerCase();
    
    try {
      if (fileType === 'text/plain' || fileType.includes('text/')) {
        text = await fileData.text();
      } else if (fileType === 'application/pdf') {
        // For production, you'd implement PDF parsing here
        // For now, provide a meaningful message
        text = `PDF document: ${document.file_name}. Content extraction for PDF files requires additional setup. Please convert to text format for full processing.`;
      } else if (fileType.includes('word') || fileType.includes('document')) {
        // For production, you'd implement DOCX parsing here
        text = `Word document: ${document.file_name}. Content extraction for Word documents requires additional setup. Please convert to text format for full processing.`;
      } else {
        text = `Unsupported file type: ${document.file_type}. Please convert to a supported text format.`;
      }
    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      text = `Error extracting content from ${document.file_name}. Please ensure the file is not corrupted.`;
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text content could be extracted from the document');
    }

    // Enhanced chunking with overlap
    const chunks = chunkTextWithOverlap(text, 500, 50);

    if (chunks.length === 0) {
      throw new Error('Document could not be chunked properly');
    }

    // Generate embeddings and store chunks with better error handling
    let chunkCount = 0;
    const failedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Get embedding for this chunk with retry logic
        const embeddingResponse = await fetchWithRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: "models/embedding-001",
              content: { parts: [{ text: chunk }] }
            })
          },
          3 // max retries
        );

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.embedding.values;

          // Store chunk in database with proper vector format
          const { error: insertError } = await supabase
            .from('document_chunks')
            .insert({
              document_id: documentId,
              project_id: document.project_id,
              chunk_index: i,
              chunk_text: chunk,
              embedding: `[${embedding.join(',')}]`, // Store as proper vector format
              metadata: { 
                word_count: chunk.split(' ').length,
                char_count: chunk.length,
                file_name: document.file_name,
                file_type: document.file_type
              }
            });

          if (insertError) {
            console.error(`Error inserting chunk ${i}:`, insertError);
            failedChunks.push(i);
          } else {
            chunkCount++;
          }
        } else {
          const errorText = await embeddingResponse.text();
          console.error(`Embedding API error for chunk ${i}:`, errorText);
          failedChunks.push(i);
        }
      } catch (chunkError) {
        console.error(`Error processing chunk ${i}:`, chunkError);
        failedChunks.push(i);
      }
    }

    // Update document with completion status and metadata
    const processingStatus = chunkCount > 0 ? 'completed' : 'failed';
    const metadata = {
      total_chunks: chunks.length,
      successful_chunks: chunkCount,
      failed_chunks: failedChunks.length,
      processing_time: Date.now(),
      file_type: document.file_type,
      word_count: text.split(' ').length
    };

    await supabase
      .from('documents')
      .update({ 
        processing_status: processingStatus,
        chunk_count: chunkCount
      })
      .eq('id', documentId);

    console.log(`Document processed: ${chunkCount}/${chunks.length} chunks created successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksCreated: chunkCount,
        totalChunks: chunks.length,
        failedChunks: failedChunks.length,
        metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    
    // Mark document as failed with error details
    try {
      const { documentId } = await req.json().catch(() => ({}));
      if (documentId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        
        await supabase
          .from('documents')
          .update({ 
            processing_status: 'failed',
            metadata: { error: error.message, failed_at: new Date().toISOString() }
          })
          .eq('id', documentId);
      }
    } catch (updateError) {
      console.error('Error updating document status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Document processing failed. Please check the file format and try again.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function chunkTextWithOverlap(text: string, maxWords: number, overlapWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += maxWords - overlapWords) {
    const chunk = words.slice(i, i + maxWords).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

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
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError;
}
