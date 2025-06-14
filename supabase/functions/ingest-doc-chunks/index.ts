
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY'); // Use Gemini if available by changing logic
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getFileText(fileUrl: string): Promise<string> {
  // Fetch and extract file text (simple TXT for demo; extend for PDF/DOCX if needed)
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error('File download failed');
  const text = await res.text();
  return text;
}

function chunkText(text: string, maxTokens = 300): string[] {
  // Simple chunking algorithm: split by paragraphs then into maxTokens words
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxTokens) {
    chunks.push(words.slice(i, i + maxTokens).join(' '));
  }
  return chunks;
}

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // Use OpenAI embedding endpoint for demo (use Gemini via Vertex AI if needed)
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: texts,
      model: 'text-embedding-3-small'
    })
  });
  if (!res.ok) throw new Error('Embedding request failed');
  const data = await res.json();
  return data.data.map((d: any) => d.embedding);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { fileUrl, fileName, projectId } = await req.json();
    if (!fileUrl || !fileName || !projectId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    // 1. Download file and extract text (for demo: TXT only, extend as needed)
    const fileText = await getFileText(fileUrl);

    // 2. Chunk text
    const chunks = chunkText(fileText, 300);
    // 3. Compute embeddings
    const embeddings = await getEmbeddings(chunks);

    // 4. Save chunks in pg table
    const supabaseAdminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const result: any[] = [];

    for (let i = 0; i < chunks.length; ++i) {
      // Store
      const res = await fetch(`${supabaseUrl}/rest/v1/document_chunks`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAdminKey,
          'Authorization': `Bearer ${supabaseAdminKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([{
          project_id: projectId,
          file_name: fileName,
          file_path: fileUrl,
          chunk_index: i,
          chunk_text: chunks[i],
          embedding: embeddings[i]
        }])
      });
      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error('DB insert failed: ' + errTxt);
      }
      result.push(await res.json());
    }

    return new Response(JSON.stringify({
      chunks: result.length
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e instanceof Error ? e.message : String(e)) }), { status: 500, headers: corsHeaders });
  }
});
