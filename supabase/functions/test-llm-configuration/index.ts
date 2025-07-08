
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { tenant_id, config_id, test_prompt } = await req.json();

    if (!tenant_id || !config_id) {
      throw new Error('Missing required parameters: tenant_id and config_id');
    }

    // Get LLM configuration
    const { data: config, error: configError } = await supabase
      .from('llm_configurations')
      .select('*')
      .eq('id', config_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (configError || !config) {
      throw new Error(`Configuration not found: ${configError?.message}`);
    }

    const prompt = test_prompt || "Hello! Please respond with 'Configuration test successful' if you can see this message.";
    let response;

    // Test based on provider
    switch (config.provider) {
      case 'openai':
        response = await testOpenAI(config, prompt);
        break;
      case 'anthropic':
        response = await testAnthropic(config, prompt);
        break;
      case 'gemini':
        response = await testGemini(config, prompt);
        break;
      case 'llama':
      case 'local':
        response = await testLocal(config, prompt);
        break;
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        response,
        config_name: config.name,
        provider: config.provider,
        model: config.model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('LLM test error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'LLM configuration test failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function testOpenAI(config: any, prompt: string) {
  if (!config.api_key_encrypted) {
    throw new Error('API key required for OpenAI');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key_encrypted}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: config.configuration.system_prompt || 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.configuration.temperature || 0.7,
      max_tokens: Math.min(config.configuration.max_tokens || 100, 100) // Limit for test
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response received';
}

async function testAnthropic(config: any, prompt: string) {
  if (!config.api_key_encrypted) {
    throw new Error('API key required for Anthropic');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.api_key_encrypted,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: Math.min(config.configuration.max_tokens || 100, 100),
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: config.configuration.system_prompt || 'You are a helpful assistant.'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'No response received';
}

async function testGemini(config: any, prompt: string) {
  const apiKey = config.api_key_encrypted || Deno.env.get('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API key required for Gemini');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.configuration.temperature || 0.7,
          maxOutputTokens: Math.min(config.configuration.max_tokens || 100, 100)
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
}

async function testLocal(config: any, prompt: string) {
  if (!config.endpoint_url) {
    throw new Error('Endpoint URL required for local/private models');
  }

  const response = await fetch(`${config.endpoint_url}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.api_key_encrypted && { 'Authorization': `Bearer ${config.api_key_encrypted}` })
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: config.configuration.system_prompt || 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.configuration.temperature || 0.7,
      max_tokens: Math.min(config.configuration.max_tokens || 100, 100)
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Local API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response received';
}
