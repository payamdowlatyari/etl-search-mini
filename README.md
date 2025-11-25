# etl-search-mini

A minimal end-to-end ETL pipeline that:

1. **Reads provider data from CSV** - Parses CSV files containing healthcare provider information
2. **Cleans and normalizes fields** - Standardizes phone numbers, emails, names, and other fields
3. **Uses an LLM (GPT-4.1) to enrich data** - Generates professional summaries and keywords for each provider
4. **Generates short vector embeddings** - Creates 256-dimensional embeddings using OpenAI's text-embedding-3-small model
5. **Performs simple vector search over enriched data** - Enables semantic search to find providers by query

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Add your OpenAI API key:

```
OPENAI_API_KEY=your-openai-api-key-here
```

## Usage

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Demo (Mock Mode)

Run the demo script without API calls (uses mock data):

```bash
npx ts-node src/demo.ts
```

### Programmatic Usage

```typescript
import { ETLPipeline } from "etl-search-mini";

// Create pipeline
const pipeline = new ETLPipeline({
  openaiApiKey: "your-api-key", // or set OPENAI_API_KEY env var
  llmModel: "gpt-4.1-2025-04-14",
  embeddingModel: "text-embedding-3-small",
  embeddingDimensions: 256,
});

// Run with real API calls
const providers = await pipeline.run("./data/providers.csv");

// Search
const results = await pipeline.search("cardiology specialist", 5);
console.log(results);
```

### Mock Mode (No API Calls)

For testing and development without API calls:

```typescript
import { ETLPipeline } from "etl-search-mini";

const pipeline = new ETLPipeline();

// Run with mock enrichment and embeddings
const providers = pipeline.runSync("./data/providers.csv");

// Search with mock embeddings
const results = pipeline.searchSync("heart doctor", 5);
```

## Project Structure

```
etl-search-mini/
├── src/
│   ├── index.ts         # Main ETL pipeline orchestrator
│   ├── types.ts         # TypeScript interfaces
│   ├── csvReader.ts     # CSV parsing module
│   ├── cleaner.ts       # Data cleaning/normalization
│   ├── enricher.ts      # LLM enrichment (GPT-4.1)
│   ├── embeddings.ts    # Vector embedding generation
│   ├── vectorSearch.ts  # In-memory vector search
│   └── demo.ts          # Demo script
├── data/
│   └── providers.csv    # Sample provider data
├── package.json
├── tsconfig.json
└── jest.config.js
```

## API Reference

### ETLPipeline

Main class that orchestrates the ETL process.

#### Methods

- `run(csvPath: string)` - Run full pipeline with API calls (async)
- `runSync(csvPath: string)` - Run pipeline with mock data (sync)
- `search(query: string, topK?: number)` - Search with real embeddings (async)
- `searchSync(query: string, topK?: number)` - Search with mock embeddings (sync)
- `getSearchStore()` - Get the underlying VectorSearchStore

### Individual Modules

You can also use individual modules:

```typescript
import {
  readProvidersFromCSV,
  cleanProviders,
  enrichProviders,
  generateEmbeddings,
  VectorSearchStore,
  cosineSimilarity,
} from "etl-search-mini";
```

## Data Format

The CSV file should have the following columns:

| Column             | Type    | Description                       |
| ------------------ | ------- | --------------------------------- |
| id                 | string  | Unique provider identifier        |
| name               | string  | Provider name                     |
| specialty          | string  | Medical specialty                 |
| location           | string  | City and state                    |
| phone              | string  | Phone number (various formats OK) |
| email              | string  | Email address                     |
| rating             | number  | Rating (0-5)                      |
| years_experience   | number  | Years of experience               |
| accepting_patients | boolean | Whether accepting new patients    |

## License

MIT