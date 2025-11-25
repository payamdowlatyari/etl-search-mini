import {
  cleanProvider,
  cleanProviders,
  normalizePhone,
  normalizeEmail,
  normalizeName,
  normalizeSpecialty,
  normalizeLocation,
  normalizeRating,
  normalizeYearsExperience,
} from "./cleaner";
import { Provider } from "./types";

describe("cleaner", () => {
  describe("normalizePhone", () => {
    it("should normalize 10-digit phone numbers", () => {
      expect(normalizePhone("5551234567")).toBe("555-123-4567");
      expect(normalizePhone("(555) 123-4567")).toBe("555-123-4567");
      expect(normalizePhone("555.123.4567")).toBe("555-123-4567");
      expect(normalizePhone("555 123 4567")).toBe("555-123-4567");
    });

    it("should normalize 11-digit phone numbers with country code", () => {
      expect(normalizePhone("15551234567")).toBe("555-123-4567");
      expect(normalizePhone("1-555-123-4567")).toBe("555-123-4567");
      expect(normalizePhone("+1-555-123-4567")).toBe("555-123-4567");
    });

    it("should return original if cannot normalize", () => {
      expect(normalizePhone("123")).toBe("123");
      expect(normalizePhone("invalid")).toBe("invalid");
    });
  });

  describe("normalizeEmail", () => {
    it("should lowercase and trim email", () => {
      expect(normalizeEmail("  TEST@EMAIL.COM  ")).toBe("test@email.com");
      expect(normalizeEmail("User@Domain.Org")).toBe("user@domain.org");
    });
  });

  describe("normalizeName", () => {
    it("should convert to proper case", () => {
      expect(normalizeName("john smith")).toBe("John Smith");
      expect(normalizeName("JANE DOE")).toBe("Jane Doe");
      expect(normalizeName("  mary  jones  ")).toBe("Mary Jones");
    });
  });

  describe("normalizeSpecialty", () => {
    it("should normalize specialty names", () => {
      expect(normalizeSpecialty("cardiology")).toBe("Cardiology");
      expect(normalizeSpecialty("FAMILY MEDICINE")).toBe("Family Medicine");
    });
  });

  describe("normalizeLocation", () => {
    it("should trim location strings", () => {
      expect(normalizeLocation("  New York, NY  ")).toBe("New York, NY");
    });
  });

  describe("normalizeRating", () => {
    it("should clamp rating to valid range", () => {
      expect(normalizeRating(4.5)).toBe(4.5);
      expect(normalizeRating(-1)).toBe(0);
      expect(normalizeRating(6)).toBe(5);
    });
  });

  describe("normalizeYearsExperience", () => {
    it("should ensure non-negative integer", () => {
      expect(normalizeYearsExperience(10)).toBe(10);
      expect(normalizeYearsExperience(-5)).toBe(0);
      expect(normalizeYearsExperience(5.7)).toBe(5);
    });
  });

  describe("cleanProvider", () => {
    it("should clean all provider fields", () => {
      const rawProvider: Provider = {
        id: "  1  ",
        name: "john doe",
        specialty: "CARDIOLOGY",
        location: "  New York  ",
        phone: "(555) 123-4567",
        email: "  JOHN@HOSPITAL.COM  ",
        rating: 4.5,
        yearsExperience: 10,
        acceptingPatients: true,
      };

      const cleaned = cleanProvider(rawProvider);

      expect(cleaned.id).toBe("1");
      expect(cleaned.name).toBe("John Doe");
      expect(cleaned.specialty).toBe("Cardiology");
      expect(cleaned.location).toBe("New York");
      expect(cleaned.phone).toBe("555-123-4567");
      expect(cleaned.email).toBe("john@hospital.com");
      expect(cleaned.rating).toBe(4.5);
      expect(cleaned.yearsExperience).toBe(10);
      expect(cleaned.acceptingPatients).toBe(true);
    });
  });

  describe("cleanProviders", () => {
    it("should clean an array of providers", () => {
      const rawProviders: Provider[] = [
        {
          id: "1",
          name: "john doe",
          specialty: "cardiology",
          location: "NYC",
          phone: "5551234567",
          email: "john@test.com",
          rating: 4.5,
          yearsExperience: 10,
          acceptingPatients: true,
        },
        {
          id: "2",
          name: "jane smith",
          specialty: "pediatrics",
          location: "LA",
          phone: "5559876543",
          email: "jane@test.com",
          rating: 4.8,
          yearsExperience: 15,
          acceptingPatients: false,
        },
      ];

      const cleaned = cleanProviders(rawProviders);

      expect(cleaned).toHaveLength(2);
      expect(cleaned[0].name).toBe("John Doe");
      expect(cleaned[1].name).toBe("Jane Smith");
    });
  });
});
