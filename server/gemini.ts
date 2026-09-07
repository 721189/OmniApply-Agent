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
const FALLBACK_MODELS = ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'];

export interface GenerateWithFallbackOptions {
  contents: GenerateContentParameters['contents'];
  config?: GenerateContentParameters['config'];
}

/**
 * Executes a Gemini generateContent request with multi-model fallback and exponential backoff
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
    let attempts = 0;
    const maxAttemptsForModel = 2;

    while (attempts < maxAttemptsForModel) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        attempts++;
        const errorMessage = err?.message || String(err);
        const isTransient =
          errorMessage.includes('503') ||
          errorMessage.includes('UNAVAILABLE') ||
          errorMessage.includes('high demand') ||
          errorMessage.includes('429') ||
          errorMessage.includes('RESOURCE_EXHAUSTED') ||
          errorMessage.includes('FETCH_ERROR');

        if (isTransient && attempts < maxAttemptsForModel) {
          const delay = attempts * 600;
          console.warn(`[Gemini API] Transient error on ${model} (attempt ${attempts}): ${errorMessage.slice(0, 120)}... Retrying in ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If not transient or exhausted attempts for this model, try next model
        console.warn(`[Gemini API] Model ${model} encountered error. Trying next fallback model if available...`);
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini models failed to generate content');
}
