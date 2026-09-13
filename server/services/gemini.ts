import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];

export interface GenerateWithFallbackOptions {
  contents: GenerateContentParameters['contents'];
  config?: GenerateContentParameters['config'];
}

/**
 * Executes a Gemini generateContent request with multi-model fallback and fast failover
 * to gracefully handle temporary 503 (high demand) or 429 rate limit spikes.
 */
export async function generateContentWithFallback(
  options: GenerateWithFallbackOptions
): Promise<GenerateContentResponse> {
  const ai = getGeminiAI();
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (let mIndex = 0; mIndex < modelsToTry.length; mIndex++) {
    const model = modelsToTry[mIndex];

    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errorMessage = err?.message || String(err);
      console.warn(`[Gemini API] Notice on ${model}: ${errorMessage.slice(0, 100)}... Trying next fallback model...`);
    }
  }

  throw lastError || new Error('All Gemini models failed to generate content');
}
