import * as dotenv from "dotenv";
import { readProvidersFromCSV } from "./csvReader";
import { cleanProviders } from "./cleaner";
import { enrichProviders, enrichProvidersSync } from "./enricher";
import {
  generateEmbeddings,
  generateQueryEmbedding,
  generateMockEmbeddings,
  createMockEmbedding,
} from "./embeddings";
import { VectorSearchStore, createSearchStore } from "./vectorSearch";
import {
  Provider,
  EnrichedProvider,
  ProviderWithEmbedding,
  SearchResult,
  ETLConfig,
} from "./types";

// Load environment variables
dotenv.config();

/**
 * ETL Pipeline class that orchestrates the entire data processing flow
 */
export class ETLPipeline {
  private config: ETLConfig;
  private searchStore: VectorSearchStore;

  /**
   * Constructs an ETL pipeline instance with configuration options
   * @param {ETLConfig} config - Configuration options for the pipeline
   * @property {string} openaiApiKey - OpenAI API key
   * @property {string} embeddingModel - Model used for generating embeddings
   * @property {string} llmModel - Model used for generating LLM summaries
   * @property {number} embeddingDimensions - Dimensions of the embedding vectors
   */
  constructor(config: ETLConfig = {}) {
    this.config = {
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      embeddingModel: config.embeddingModel || "text-embedding-3-small",
      llmModel: config.llmModel || "gpt-4.1-2025-04-14",
      embeddingDimensions: config.embeddingDimensions || 256,
    };
    this.searchStore = createSearchStore();
  }

  /**
   * Runs the complete ETL pipeline with real API calls
   * @param csvPath - Path to the CSV file
   * @returns Array of providers with embeddings
   */
  async run(csvPath: string): Promise<ProviderWithEmbedding[]> {
    console.log("Starting ETL pipeline...");

    // Step 1: Read from CSV
    console.log("Step 1: Reading providers from CSV...");
    const rawProviders = readProvidersFromCSV(csvPath);
    console.log(`  Loaded ${rawProviders.length} providers`);

    // Step 2: Clean and normalize
    console.log("Step 2: Cleaning and normalizing data...");
    const cleanedProviders = cleanProviders(rawProviders);
    console.log(`  Cleaned ${cleanedProviders.length} providers`);

    // Step 3: Enrich with LLM
    console.log("Step 3: Enriching data with LLM...");
    const enrichedProviders = await enrichProviders(
      cleanedProviders,
      this.config
    );
    console.log(`  Enriched ${enrichedProviders.length} providers`);

    // Step 4: Generate embeddings
    console.log("Step 4: Generating embeddings...");
    const providersWithEmbeddings = await generateEmbeddings(
      enrichedProviders,
      this.config
    );
    console.log(
      `  Generated embeddings for ${providersWithEmbeddings.length} providers`
    );

    // Step 5: Add to search store
    console.log("Step 5: Adding to search store...");
    this.searchStore.clear();
    this.searchStore.addProviders(providersWithEmbeddings);
    console.log(
      `  Search store now contains ${this.searchStore.count()} providers`
    );

    console.log("ETL pipeline complete!");
    return providersWithEmbeddings;
  }

  /**
   * Runs the ETL pipeline with mock data (no API calls)
   * Useful for testing and development
   * @param csvPath - Path to the CSV file
   * @returns Array of providers with mock embeddings
   */
  runSync(csvPath: string): ProviderWithEmbedding[] {
    console.log("Starting ETL pipeline (sync/mock mode)...");

    // Step 1: Read from CSV
    console.log("Step 1: Reading providers from CSV...");
    const rawProviders = readProvidersFromCSV(csvPath);
    console.log(`  Loaded ${rawProviders.length} providers`);

    // Step 2: Clean and normalize
    console.log("Step 2: Cleaning and normalizing data...");
    const cleanedProviders = cleanProviders(rawProviders);
    console.log(`  Cleaned ${cleanedProviders.length} providers`);

    // Step 3: Enrich with mock data
    console.log("Step 3: Enriching data (mock)...");
    const enrichedProviders = enrichProvidersSync(cleanedProviders);
    console.log(`  Enriched ${enrichedProviders.length} providers`);

    // Step 4: Generate mock embeddings
    console.log("Step 4: Generating embeddings (mock)...");
    const providersWithEmbeddings = generateMockEmbeddings(
      enrichedProviders,
      this.config.embeddingDimensions
    );
    console.log(
      `  Generated embeddings for ${providersWithEmbeddings.length} providers`
    );

    // Step 5: Add to search store
    console.log("Step 5: Adding to search store...");
    this.searchStore.clear();
    this.searchStore.addProviders(providersWithEmbeddings);
    console.log(
      `  Search store now contains ${this.searchStore.count()} providers`
    );

    console.log("ETL pipeline complete!");
    return providersWithEmbeddings;
  }

  /**
   * Searches for providers using a text query (with API)
   * @param query - Search query text
   * @param topK - Number of results to return
   * @returns Search results
   */
  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = await generateQueryEmbedding(query, this.config);
    return this.searchStore.search(queryEmbedding, topK);
  }

  /**
   * Searches for providers using a text query (mock embeddings)
   * @param query - Search query text
   * @param topK - Number of results to return
   * @returns Search results
   */
  searchSync(query: string, topK: number = 5): SearchResult[] {
    const queryEmbedding = createMockEmbedding(
      query,
      this.config.embeddingDimensions
    );
    return this.searchStore.search(queryEmbedding, topK);
  }

  /**
   * Gets the search store instance
   * @returns VectorSearchStore
   */
  getSearchStore(): VectorSearchStore {
    return this.searchStore;
  }
}

// Export all modules
export { readProvidersFromCSV } from "./csvReader";
export {
  cleanProvider,
  cleanProviders,
  normalizePhone,
  normalizeEmail,
  normalizeName,
} from "./cleaner";
export {
  enrichProviders,
  enrichProvidersSync,
  createMockEnrichedProvider,
} from "./enricher";
export {
  generateEmbeddings,
  generateQueryEmbedding,
  generateMockEmbeddings,
  createMockEmbedding,
} from "./embeddings";
export {
  VectorSearchStore,
  createSearchStore,
  cosineSimilarity,
} from "./vectorSearch";
export type {
  Provider,
  EnrichedProvider,
  ProviderWithEmbedding,
  SearchResult,
  ETLConfig,
} from "./types";
