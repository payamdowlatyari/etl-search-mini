import OpenAI from "openai";
import { EnrichedProvider, ProviderWithEmbedding, ETLConfig } from "./types";

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_EMBEDDING_DIMENSIONS = 256;

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
 * Creates text content for embedding from an enriched provider
 * @param provider - Enriched provider
 * @returns Text to embed
 */
function createEmbeddingText(provider: EnrichedProvider): string {
  const parts = [
    provider.name,
    provider.specialty,
    provider.location,
    provider.summary,
    provider.keywords.join(", "),
  ];
  return parts.filter(Boolean).join(" | ");
}

/**
 * Generates embeddings for a single provider
 * @param provider - Provider to embed
 * @param client - OpenAI client
 * @param model - Embedding model
 * @param dimensions - Embedding dimensions
 * @returns Provider with embedding
 */
async function embedSingleProvider(
  provider: EnrichedProvider,
  client: OpenAI,
  model: string,
  dimensions: number
): Promise<ProviderWithEmbedding> {
  const text = createEmbeddingText(provider);

  const response = await client.embeddings.create({
    model,
    input: text,
    dimensions,
  });

  const embedding = response.data[0]?.embedding || [];

  return {
    ...provider,
    embedding,
  };
}

/**
 * Generates embeddings for multiple providers
 * @param providers - Array of enriched providers
 * @param config - ETL configuration
 * @returns Array of providers with embeddings
 */
export async function generateEmbeddings(
  providers: EnrichedProvider[],
  config: ETLConfig = {}
): Promise<ProviderWithEmbedding[]> {
  const client = createOpenAIClient(config);
  const model = config.embeddingModel || DEFAULT_EMBEDDING_MODEL;
  const dimensions = config.embeddingDimensions || DEFAULT_EMBEDDING_DIMENSIONS;

  const providersWithEmbeddings: ProviderWithEmbedding[] = [];

  for (const provider of providers) {
    const withEmbedding = await embedSingleProvider(
      provider,
      client,
      model,
      dimensions
    );
    providersWithEmbeddings.push(withEmbedding);
  }

  return providersWithEmbeddings;
}

/**
 * Generates a query embedding
 * @param query - Search query text
 * @param config - ETL configuration
 * @returns Embedding vector
 */
export async function generateQueryEmbedding(
  query: string,
  config: ETLConfig = {}
): Promise<number[]> {
  const client = createOpenAIClient(config);
  const model = config.embeddingModel || DEFAULT_EMBEDDING_MODEL;
  const dimensions = config.embeddingDimensions || DEFAULT_EMBEDDING_DIMENSIONS;

  const response = await client.embeddings.create({
    model,
    input: query,
    dimensions,
  });

  return response.data[0]?.embedding || [];
}

/**
 * Creates a mock embedding vector for testing
 * @param seed - Seed value for consistent mock embeddings
 * @param dimensions - Embedding dimensions
 * @returns Mock embedding vector
 */
export function createMockEmbedding(
  seed: string,
  dimensions: number = DEFAULT_EMBEDDING_DIMENSIONS
): number[] {
  const embedding: number[] = [];
  let hash = 0;

  // Simple hash function for seeding
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  // Generate deterministic pseudo-random values
  for (let i = 0; i < dimensions; i++) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    embedding.push((hash / 0x7fffffff) * 2 - 1);
  }

  // Normalize the vector
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  return embedding.map((val) => val / magnitude);
}

/**
 * Generates mock embeddings for providers (testing without API)
 * @param providers - Array of enriched providers
 * @param dimensions - Embedding dimensions
 * @returns Array of providers with mock embeddings
 */
export function generateMockEmbeddings(
  providers: EnrichedProvider[],
  dimensions: number = DEFAULT_EMBEDDING_DIMENSIONS
): ProviderWithEmbedding[] {
  return providers.map((provider) => ({
    ...provider,
    embedding: createMockEmbedding(
      `${provider.id}-${provider.name}-${provider.specialty}`,
      dimensions
    ),
  }));
}
