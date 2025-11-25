import {
  createMockEmbedding,
  generateMockEmbeddings,
} from "./embeddings";
import { EnrichedProvider } from "./types";

describe("embeddings", () => {
  describe("createMockEmbedding", () => {
    it("should create an embedding of the specified dimension", () => {
      const embedding = createMockEmbedding("test", 256);
      expect(embedding).toHaveLength(256);
    });

    it("should create normalized vectors", () => {
      const embedding = createMockEmbedding("test", 256);
      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0)
      );
      expect(magnitude).toBeCloseTo(1);
    });

    it("should create deterministic embeddings for same seed", () => {
      const embedding1 = createMockEmbedding("test", 256);
      const embedding2 = createMockEmbedding("test", 256);

      expect(embedding1).toEqual(embedding2);
    });

    it("should create different embeddings for different seeds", () => {
      const embedding1 = createMockEmbedding("test1", 256);
      const embedding2 = createMockEmbedding("test2", 256);

      expect(embedding1).not.toEqual(embedding2);
    });
  });

  describe("generateMockEmbeddings", () => {
    const mockProviders: EnrichedProvider[] = [
      {
        id: "1",
        name: "Dr. John Smith",
        specialty: "Cardiology",
        location: "New York, NY",
        phone: "555-123-4567",
        email: "john.smith@hospital.com",
        rating: 4.8,
        yearsExperience: 15,
        acceptingPatients: true,
        summary: "Test summary",
        keywords: ["test"],
      },
      {
        id: "2",
        name: "Dr. Jane Doe",
        specialty: "Pediatrics",
        location: "Los Angeles, CA",
        phone: "555-987-6543",
        email: "jane.doe@hospital.com",
        rating: 4.9,
        yearsExperience: 12,
        acceptingPatients: true,
        summary: "Test summary 2",
        keywords: ["test2"],
      },
    ];

    it("should generate embeddings for all providers", () => {
      const withEmbeddings = generateMockEmbeddings(mockProviders, 128);

      expect(withEmbeddings).toHaveLength(2);
      expect(withEmbeddings[0].embedding).toHaveLength(128);
      expect(withEmbeddings[1].embedding).toHaveLength(128);
    });

    it("should preserve original provider data", () => {
      const withEmbeddings = generateMockEmbeddings(mockProviders, 128);

      expect(withEmbeddings[0].name).toBe("Dr. John Smith");
      expect(withEmbeddings[0].summary).toBe("Test summary");
      expect(withEmbeddings[1].specialty).toBe("Pediatrics");
    });

    it("should create different embeddings for different providers", () => {
      const withEmbeddings = generateMockEmbeddings(mockProviders, 128);

      expect(withEmbeddings[0].embedding).not.toEqual(
        withEmbeddings[1].embedding
      );
    });
  });
});
