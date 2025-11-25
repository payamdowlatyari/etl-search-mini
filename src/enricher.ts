import OpenAI from "openai";
import { Provider, EnrichedProvider, ETLConfig } from "./types";

const DEFAULT_LLM_MODEL = "gpt-4.1-2025-04-14";

/**
 * Creates an OpenAI client instance
 * @param config - ETL configuration
 * @returns OpenAI client
 */
function createOpenAIClient(config: ETLConfig): OpenAI {
  const apiKey = config.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config."
    );
  }
  return new OpenAI({ apiKey });
}

/**
 * Generates a prompt for enriching provider data
 * @param provider - Provider to enrich
 * @returns Prompt string
 */
function generateEnrichmentPrompt(provider: Provider): string {
  return `You are a healthcare data assistant. Given the following healthcare provider information, generate:
1. A brief professional summary (2-3 sentences) describing the provider
2. A list of 5-7 relevant keywords that would help patients find this provider

Provider Information:
- Name: ${provider.name}
- Specialty: ${provider.specialty}
- Location: ${provider.location}
- Rating: ${provider.rating}/5
- Years of Experience: ${provider.yearsExperience}
- Accepting New Patients: ${provider.acceptingPatients ? "Yes" : "No"}

Respond in JSON format only:
{
  "summary": "Professional summary here...",
  "keywords": ["keyword1", "keyword2", ...]
}`;
}

/**
 * Parses the LLM response to extract summary and keywords
 * @param response - LLM response text
 * @returns Object with summary and keywords
 */
function parseEnrichmentResponse(response: string): {
  summary: string;
  keywords: string[];
} {
  try {
    // Try to parse as JSON directly
    const parsed = JSON.parse(response);
    return {
      summary: parsed.summary || "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch {
    // If JSON parsing fails, try to extract from text
    const summaryMatch = response.match(/"summary":\s*"([^"]+)"/);
    const keywordsMatch = response.match(/"keywords":\s*\[([^\]]+)\]/);

    const summary = summaryMatch ? summaryMatch[1] : "";
    const keywords = keywordsMatch
      ? keywordsMatch[1].split(",").map((k) => k.trim().replace(/"/g, ""))
      : [];

    return { summary, keywords };
  }
}

/**
 * Enriches a single provider using the LLM
 * @param provider - Provider to enrich
 * @param client - OpenAI client
 * @param model - LLM model to use
 * @returns Enriched provider
 */
async function enrichSingleProvider(
  provider: Provider,
  client: OpenAI,
  model: string
): Promise<EnrichedProvider> {
  const prompt = generateEnrichmentPrompt(provider);

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || "";
  const { summary, keywords } = parseEnrichmentResponse(content);

  return {
    ...provider,
    summary,
    keywords,
  };
}

/**
 * Enriches providers with LLM-generated summaries and keywords
 * @param providers - Array of providers to enrich
 * @param config - ETL configuration
 * @returns Array of enriched providers
 */
export async function enrichProviders(
  providers: Provider[],
  config: ETLConfig = {}
): Promise<EnrichedProvider[]> {
  const client = createOpenAIClient(config);
  const model = config.llmModel || DEFAULT_LLM_MODEL;

  const enrichedProviders: EnrichedProvider[] = [];

  for (const provider of providers) {
    const enriched = await enrichSingleProvider(provider, client, model);
    enrichedProviders.push(enriched);
  }

  return enrichedProviders;
}

/**
 * Creates a mock enriched provider for testing without API calls
 * @param provider - Provider to enrich
 * @returns Mock enriched provider
 */
export function createMockEnrichedProvider(provider: Provider): EnrichedProvider {
  return {
    ...provider,
    summary: `${provider.name} is a ${provider.specialty} specialist based in ${provider.location} with ${provider.yearsExperience} years of experience.`,
    keywords: [
      provider.specialty.toLowerCase(),
      provider.location.toLowerCase(),
      "healthcare",
      "provider",
      provider.acceptingPatients ? "accepting patients" : "not accepting patients",
    ],
  };
}

/**
 * Enriches providers with mock data (for testing without API)
 * @param providers - Array of providers
 * @returns Array of mock enriched providers
 */
export function enrichProvidersSync(providers: Provider[]): EnrichedProvider[] {
  return providers.map(createMockEnrichedProvider);
}
