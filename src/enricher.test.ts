import { createMockEnrichedProvider, enrichProvidersSync } from "./enricher";
import { Provider } from "./types";

describe("enricher", () => {
  const mockProvider: Provider = {
    id: "1",
    name: "Dr. John Smith",
    specialty: "Cardiology",
    location: "New York, NY",
    phone: "555-123-4567",
    email: "john.smith@hospital.com",
    rating: 4.8,
    yearsExperience: 15,
    acceptingPatients: true,
  };

  describe("createMockEnrichedProvider", () => {
    it("should create an enriched provider with summary and keywords", () => {
      const enriched = createMockEnrichedProvider(mockProvider);

      expect(enriched).toMatchObject(mockProvider);
      expect(enriched.summary).toContain("Dr. John Smith");
      expect(enriched.summary).toContain("Cardiology");
      expect(enriched.summary).toContain("15 years");
      expect(enriched.keywords).toContain("cardiology");
      expect(enriched.keywords).toContain("healthcare");
    });

    it("should include accepting patients status in keywords", () => {
      const acceptingProvider = { ...mockProvider, acceptingPatients: true };
      const notAcceptingProvider = { ...mockProvider, acceptingPatients: false };

      const enrichedAccepting = createMockEnrichedProvider(acceptingProvider);
      const enrichedNotAccepting = createMockEnrichedProvider(notAcceptingProvider);

      expect(enrichedAccepting.keywords).toContain("accepting patients");
      expect(enrichedNotAccepting.keywords).toContain("not accepting patients");
    });
  });

  describe("enrichProvidersSync", () => {
    it("should enrich an array of providers", () => {
      const providers: Provider[] = [
        mockProvider,
        {
          ...mockProvider,
          id: "2",
          name: "Dr. Jane Doe",
          specialty: "Pediatrics",
        },
      ];

      const enriched = enrichProvidersSync(providers);

      expect(enriched).toHaveLength(2);
      expect(enriched[0].summary).toBeDefined();
      expect(enriched[0].keywords).toHaveLength(5);
      expect(enriched[1].summary).toContain("Dr. Jane Doe");
    });
  });
});
