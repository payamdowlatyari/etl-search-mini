import {
  ProviderWithEmbedding,
  EnrichedProvider,
  SearchResult,
} from "./types";

/**
 * Calculates cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity score (-1 to 1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Simple in-memory vector search store
 */
export class VectorSearchStore {
  private providers: ProviderWithEmbedding[] = [];

  /**
   * Adds providers to the search store
   * @param providers - Providers with embeddings to add
   */
  addProviders(providers: ProviderWithEmbedding[]): void {
    this.providers.push(...providers);
  }

  /**
   * Clears all providers from the store
   */
  clear(): void {
    this.providers = [];
  }

  /**
   * Gets the count of providers in the store
   * @returns Number of providers
   */
  count(): number {
    return this.providers.length;
  }

  /**
   * Searches for providers similar to the query embedding
   * @param queryEmbedding - Query embedding vector
   * @param topK - Number of top results to return
   * @param minScore - Minimum similarity score threshold
   * @returns Array of search results sorted by score
   */
  search(
    queryEmbedding: number[],
    topK: number = 5,
    minScore: number = 0
  ): SearchResult[] {
    const results: SearchResult[] = [];

    for (const provider of this.providers) {
      const score = cosineSimilarity(queryEmbedding, provider.embedding);

      if (score >= minScore) {
        // Return provider without embedding for cleaner results
        const { embedding: _, ...providerData } = provider;
        results.push({
          provider: providerData as EnrichedProvider,
          score,
        });
      }
    }

    // Sort by score descending and take top K
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Gets all providers in the store
   * @returns Array of all providers with embeddings
   */
  getAllProviders(): ProviderWithEmbedding[] {
    return [...this.providers];
  }
}

/**
 * Creates a new vector search store
 * @returns New VectorSearchStore instance
 */
export function createSearchStore(): VectorSearchStore {
  return new VectorSearchStore();
}
