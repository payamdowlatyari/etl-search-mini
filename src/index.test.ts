import * as path from "path";
import { ETLPipeline } from "./index";

describe("ETLPipeline", () => {
  const csvPath = path.join(__dirname, "../data/providers.csv");

  describe("runSync", () => {
    it("should run the complete ETL pipeline with mock data", () => {
      const pipeline = new ETLPipeline();
      const result = pipeline.runSync(csvPath);

      expect(result).toHaveLength(10);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("summary");
      expect(result[0]).toHaveProperty("keywords");
      expect(result[0]).toHaveProperty("embedding");
    });

    it("should clean provider names during pipeline", () => {
      const pipeline = new ETLPipeline();
      const result = pipeline.runSync(csvPath);

      // Original: "dr. john smith" should become "Dr. John Smith"
      expect(result[0].name).toBe("Dr. John Smith");
    });

    it("should populate search store", () => {
      const pipeline = new ETLPipeline();
      pipeline.runSync(csvPath);

      const store = pipeline.getSearchStore();
      expect(store.count()).toBe(10);
    });
  });

  describe("searchSync", () => {
    it("should search and return results", () => {
      const pipeline = new ETLPipeline();
      pipeline.runSync(csvPath);

      const results = pipeline.searchSync("cardiology", 5);

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
      expect(results[0]).toHaveProperty("provider");
      expect(results[0]).toHaveProperty("score");
    });

    it("should return empty array when store is empty", () => {
      const pipeline = new ETLPipeline();
      // Don't run pipeline, so store is empty
      const results = pipeline.searchSync("cardiology", 5);

      expect(results).toHaveLength(0);
    });
  });
});
