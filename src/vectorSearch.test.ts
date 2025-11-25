import {
  cosineSimilarity,
  VectorSearchStore,
  createSearchStore,
} from "./vectorSearch";
import { ProviderWithEmbedding, EnrichedProvider } from "./types";

describe("vectorSearch", () => {
  describe("cosineSimilarity", () => {
    it("should return 1 for identical vectors", () => {
      const vec = [1, 0, 0];
      expect(cosineSimilarity(vec, vec)).toBeCloseTo(1);
    });

    it("should return 0 for orthogonal vectors", () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(0);
    });

    it("should return -1 for opposite vectors", () => {
      const vec1 = [1, 0, 0];
      const vec2 = [-1, 0, 0];
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(-1);
    });

    it("should throw error for vectors of different lengths", () => {
      expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow(
        "Vectors must have the same length"
      );
    });
  });

  describe("VectorSearchStore", () => {
    let store: VectorSearchStore;

    const createMockProvider = (
      id: string,
      embedding: number[]
    ): ProviderWithEmbedding => ({
      id,
      name: `Provider ${id}`,
      specialty: "Test",
      location: "Test Location",
      phone: "555-555-5555",
      email: "test@test.com",
      rating: 4.5,
      yearsExperience: 10,
      acceptingPatients: true,
      summary: "Test summary",
      keywords: ["test"],
      embedding,
    });

    beforeEach(() => {
      store = createSearchStore();
    });

    it("should add providers to the store", () => {
      const providers = [
        createMockProvider("1", [1, 0, 0]),
        createMockProvider("2", [0, 1, 0]),
      ];

      store.addProviders(providers);
      expect(store.count()).toBe(2);
    });

    it("should clear all providers", () => {
      store.addProviders([createMockProvider("1", [1, 0, 0])]);
      expect(store.count()).toBe(1);

      store.clear();
      expect(store.count()).toBe(0);
    });

    it("should search and return results sorted by similarity", () => {
      const providers = [
        createMockProvider("1", [1, 0, 0]),
        createMockProvider("2", [0.9, 0.1, 0]),
        createMockProvider("3", [0, 1, 0]),
      ];

      store.addProviders(providers);

      // Query similar to provider 1
      const queryEmbedding = [1, 0, 0];
      const results = store.search(queryEmbedding, 3);

      expect(results).toHaveLength(3);
      expect(results[0].provider.id).toBe("1"); // Most similar
      expect(results[0].score).toBeCloseTo(1);
      expect(results[1].provider.id).toBe("2"); // Second most similar
    });

    it("should respect topK parameter", () => {
      const providers = [
        createMockProvider("1", [1, 0, 0]),
        createMockProvider("2", [0.9, 0.1, 0]),
        createMockProvider("3", [0.8, 0.2, 0]),
      ];

      store.addProviders(providers);

      const results = store.search([1, 0, 0], 2);
      expect(results).toHaveLength(2);
    });

    it("should filter by minimum score", () => {
      const providers = [
        createMockProvider("1", [1, 0, 0]),
        createMockProvider("2", [0, 1, 0]),
      ];

      store.addProviders(providers);

      const results = store.search([1, 0, 0], 10, 0.5);
      expect(results).toHaveLength(1);
      expect(results[0].provider.id).toBe("1");
    });

    it("should return all providers", () => {
      const providers = [
        createMockProvider("1", [1, 0, 0]),
        createMockProvider("2", [0, 1, 0]),
      ];

      store.addProviders(providers);
      const allProviders = store.getAllProviders();

      expect(allProviders).toHaveLength(2);
      expect(allProviders[0].embedding).toBeDefined();
    });
  });
});
