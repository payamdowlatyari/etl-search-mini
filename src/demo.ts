#!/usr/bin/env ts-node
/**
 * Demo script showing the ETL pipeline in action
 * Run with: npx ts-node src/demo.ts
 */

import * as path from "path";
import { ETLPipeline } from "./index";

/**
 * Demo script showing the ETL pipeline in action
 * Runs the ETL pipeline in sync mode with mock data, prints out sample enriched provider data,
 * and performs some vector searches
 */
async function main() {
  const csvPath = path.join(__dirname, "../data/providers.csv");

  console.log("=".repeat(60));
  console.log("ETL Search Mini - Demo");
  console.log("=".repeat(60));
  console.log("");

  // Create pipeline (using sync mode with mock data for demo)
  const pipeline = new ETLPipeline();

  // Run the ETL pipeline
  const providers = pipeline.runSync(csvPath);

  console.log("");
  console.log("=".repeat(60));
  console.log("Sample Enriched Provider:");
  console.log("=".repeat(60));
  const sample = providers[0];
  console.log(`  ID: ${sample.id}`);
  console.log(`  Name: ${sample.name}`);
  console.log(`  Specialty: ${sample.specialty}`);
  console.log(`  Location: ${sample.location}`);
  console.log(`  Rating: ${sample.rating}`);
  console.log(`  Years Experience: ${sample.yearsExperience}`);
  console.log(`  Accepting Patients: ${sample.acceptingPatients}`);
  console.log(`  Summary: ${sample.summary}`);
  console.log(`  Keywords: ${sample.keywords.join(", ")}`);
  console.log(`  Embedding length: ${sample.embedding.length}`);

  console.log("");
  console.log("=".repeat(60));
  console.log("Vector Search Demo:");
  console.log("=".repeat(60));

  // Perform some searches
  const queries = [
    "heart doctor in New York",
    "pediatrics children",
    "mental health psychiatrist",
  ];

  for (const query of queries) {
    console.log(`\nSearch: "${query}"`);
    console.log("-".repeat(40));

    const results = pipeline.searchSync(query, 3);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(
        `  ${i + 1}. ${result.provider.name} (${result.provider.specialty})`
      );
      console.log(`     Location: ${result.provider.location}`);
      console.log(`     Score: ${result.score.toFixed(4)}`);
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("Demo complete!");
  console.log("=".repeat(60));
}

main().catch(console.error);
