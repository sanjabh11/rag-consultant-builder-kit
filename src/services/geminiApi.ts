
interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface GeminiResponse {
  text: string;
  tokensUsed: number;
}

export class GeminiApiService {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  
  async generateText(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      const response = await fetch('/api/llm/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async generateRAGResponse(query: string, context: string): Promise<GeminiResponse> {
    const prompt = `Based on the following context, answer the user's question:

Context:
${context}

Question: ${query}

Please provide a comprehensive answer based only on the information provided in the context.`;

    return this.generateText({
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
    });
  }
}

export const geminiApi = new GeminiApiService();
