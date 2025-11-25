/**
 * Provider data interface representing the structure of provider records
 */
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  yearsExperience: number;
  acceptingPatients: boolean;
}

/**
 * Enriched provider with additional LLM-generated data
 */
export interface EnrichedProvider extends Provider {
  summary: string;
  keywords: string[];
}

/**
 * Provider with embedding vector for search
 */
export interface ProviderWithEmbedding extends EnrichedProvider {
  embedding: number[];
}

/**
 * Search result including similarity score
 */
export interface SearchResult {
  provider: EnrichedProvider;
  score: number;
}

/**
 * ETL Pipeline configuration
 */
export interface ETLConfig {
  openaiApiKey?: string;
  embeddingModel?: string;
  llmModel?: string;
  embeddingDimensions?: number;
}
