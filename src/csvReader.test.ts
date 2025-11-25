import * as fs from "fs";
import * as path from "path";
import { readProvidersFromCSV } from "./csvReader";

describe("csvReader", () => {
  const testCsvPath = path.join(__dirname, "../data/providers.csv");

  describe("readProvidersFromCSV", () => {
    it("should read providers from CSV file", () => {
      const providers = readProvidersFromCSV(testCsvPath);

      expect(providers).toHaveLength(10);
      expect(providers[0]).toHaveProperty("id");
      expect(providers[0]).toHaveProperty("name");
      expect(providers[0]).toHaveProperty("specialty");
      expect(providers[0]).toHaveProperty("location");
      expect(providers[0]).toHaveProperty("phone");
      expect(providers[0]).toHaveProperty("email");
      expect(providers[0]).toHaveProperty("rating");
      expect(providers[0]).toHaveProperty("yearsExperience");
      expect(providers[0]).toHaveProperty("acceptingPatients");
    });

    it("should parse numeric fields correctly", () => {
      const providers = readProvidersFromCSV(testCsvPath);

      expect(typeof providers[0].rating).toBe("number");
      expect(typeof providers[0].yearsExperience).toBe("number");
      expect(providers[0].rating).toBe(4.8);
      expect(providers[0].yearsExperience).toBe(15);
    });

    it("should parse boolean fields correctly", () => {
      const providers = readProvidersFromCSV(testCsvPath);

      expect(typeof providers[0].acceptingPatients).toBe("boolean");
      expect(providers[0].acceptingPatients).toBe(true);
      expect(providers[2].acceptingPatients).toBe(false);
    });

    it("should handle various name formats", () => {
      const providers = readProvidersFromCSV(testCsvPath);

      // Names in CSV have various casing
      expect(providers[0].name).toBe("dr. john smith");
      expect(providers[1].name).toBe("DR. SARAH JOHNSON");
    });
  });
});
