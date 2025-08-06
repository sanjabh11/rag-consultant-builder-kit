// supabase/functions/workflow-list/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Fetch workflows from n8n REST API using environment variables
  const n8nUrl = Deno.env.get('N8N_URL')?.replace(/\/$/, '') // trim trailing slash
  const apiKey = Deno.env.get('N8N_API_KEY')

  if (!n8nUrl || !apiKey) {
    return new Response(
      JSON.stringify({ error: 'n8n not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  try {
    const n8nRes = await fetch(`${n8nUrl}/rest/workflows`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!n8nRes.ok) {
      throw new Error(`n8n responded with ${n8nRes.status}`)
    }

    const workflows = await n8nRes.json()

    return new Response(
      JSON.stringify(workflows),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
