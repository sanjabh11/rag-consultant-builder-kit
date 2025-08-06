// supabase/functions/workflow-run/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { workflowId, data } = await req.json();

  const n8nUrl = Deno.env.get('N8N_URL')?.replace(/\/$/, '');
  const apiKey = Deno.env.get('N8N_API_KEY');

  if (!n8nUrl || !apiKey) {
    return new Response(
      JSON.stringify({ error: 'n8n not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    // POST to n8n /rest/workflows/:id/run
    const n8nRes = await fetch(`${n8nUrl}/rest/workflows/${workflowId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data || {}),
    });

    if (!n8nRes.ok) {
      throw new Error(`n8n responded with ${n8nRes.status}`);
    }

    const result = await n8nRes.json();
    return new Response(
      JSON.stringify({ success: true, workflowId, result }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
