import * as fs from "fs";
import { parse } from "csv-parse/sync";
import { Provider } from "./types";

/**
 * Reads provider data from a CSV file
 * @param filePath - Path to the CSV file
 * @returns Array of Provider objects
 */
export function readProvidersFromCSV(filePath: string): Provider[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((record: Record<string, string>) => ({
    id: record.id || "",
    name: record.name || "",
    specialty: record.specialty || "",
    location: record.location || "",
    phone: record.phone || "",
    email: record.email || "",
    rating: parseFloat(record.rating) || 0,
    yearsExperience: parseInt(record.years_experience, 10) || 0,
    acceptingPatients: record.accepting_patients?.toLowerCase() === "true",
  }));
}
