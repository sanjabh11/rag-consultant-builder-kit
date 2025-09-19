// Abstract base class for LLM clients to enable pluggable architecture
export abstract class BaseLLMClient {
  protected config: LLMProviderConfig;
  
  constructor(config: LLMProviderConfig) {
    this.config = config;
  }
  
  abstract generate(
    prompt: string, 
    options?: GenerationOptions
  ): Promise<LLMResponse>;
  
  abstract testConnection(): Promise<boolean>;
  
  abstract getTokenUsage(text: string): Promise<number>;
  
  abstract getCostPerToken(): number;
}

export interface LLMProviderConfig {
  id: string;
  name: string;
  provider_type: 'llama3' | 'gemini' | 'mistral' | 'claude' | 'openai';
  endpoint_url?: string;
  api_key?: string;
  model_name?: string;
  max_tokens?: number;
  temperature?: number;
  cost_per_token: number;
}

export interface GenerationOptions {
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
}

export interface LLMResponse {
  text: string;
  tokens_used: number;
  cost: number;
  model_used: string;
  response_time_ms: number;
  metadata?: Record<string, any>;
}

// Local LLM Client for browser-based processing
export class LocalLLMClient extends BaseLLMClient {
  private worker?: Worker;
  
  async generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
    // Implement local processing using WebAssembly or transformers.js
    const startTime = Date.now();
    
    if (!this.worker) {
      this.worker = new Worker('/workers/local-llm-worker.js');
    }
    
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString();
      
      this.worker!.postMessage({
        id: requestId,
        prompt,
        options: {
          max_tokens: options?.max_tokens || 100,
          temperature: options?.temperature || 0.7
        }
      });
      
      this.worker!.onmessage = (event) => {
        if (event.data.id === requestId) {
          resolve({
            text: event.data.text,
            tokens_used: event.data.tokens_used,
            cost: 0, // Local processing is free
            model_used: this.config.model_name || 'local',
            response_time_ms: Date.now() - startTime,
            metadata: { local: true }
          });
        }
      };
      
      setTimeout(() => reject(new Error('Local LLM timeout')), 30000);
    });
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generate('Test', { max_tokens: 5 });
      return response.text.length > 0;
    } catch {
      return false;
    }
  }
  
  async getTokenUsage(text: string): Promise<number> {
    // Approximate token counting (4 chars per token)
    return Math.ceil(text.length / 4);
  }
  
  getCostPerToken(): number {
    return 0; // Local processing is free
  }
}

// OpenAI Client for comparison
export class OpenAIClient extends BaseLLMClient {
  async generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.api_key}`
      },
      body: JSON.stringify({
        model: this.config.model_name || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.max_tokens || 100,
        temperature: options?.temperature || 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const tokens_used = data.usage.total_tokens;
    
    return {
      text: data.choices[0].message.content,
      tokens_used,
      cost: tokens_used * this.getCostPerToken(),
      model_used: data.model,
      response_time_ms: Date.now() - startTime,
      metadata: data.usage
    };
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generate('Test', { max_tokens: 5 });
      return response.text.length > 0;
    } catch {
      return false;
    }
  }
  
  async getTokenUsage(text: string): Promise<number> {
    // Use tiktoken for accurate counting in production
    return Math.ceil(text.length / 4);
  }
  
  getCostPerToken(): number {
    return this.config.cost_per_token;
  }
}

// LLM Manager for handling multiple providers
export class LLMManager {
  private clients: Map<string, BaseLLMClient> = new Map();
  
  registerClient(config: LLMProviderConfig): void {
    let client: BaseLLMClient;
    
    switch (config.provider_type) {
      case 'openai':
        client = new OpenAIClient(config);
        break;
      case 'llama3':
        // For now, use local client. In production, implement actual LLaMA client
        client = new LocalLLMClient(config);
        break;
      default:
        client = new LocalLLMClient(config);
    }
    
    this.clients.set(config.id, client);
  }
  
  async generate(
    providerId: string, 
    prompt: string, 
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const client = this.clients.get(providerId);
    if (!client) {
      throw new Error(`LLM provider ${providerId} not found`);
    }
    
    return client.generate(prompt, options);
  }
  
  async testProvider(providerId: string): Promise<boolean> {
    const client = this.clients.get(providerId);
    return client ? client.testConnection() : false;
  }
  
  getAvailableProviders(): string[] {
    return Array.from(this.clients.keys());
  }
}
