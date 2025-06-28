# Graph Cards

A TypeScript library to generate relational graphs from markdown files, perfect for creating knowledge graphs from interconnected notes and cards.

## Features

- Parse markdown files to extract cards with titles, content, links, and tags
- Build relational graphs with different edge types (links, backlinks, tags)
- Export graphs to multiple formats (JSON, DOT, Mermaid)
- Graph analysis and analytics
- Customizable parsing patterns
- TypeScript support with full type definitions

## Installation

```bash
npm install graph-cards
```

## Quick Start

```typescript
import { GraphGenerator } from "graph-cards";

const generator = new GraphGenerator();

// Generate graph from a directory of markdown files
const graph = generator.generateFromDirectory("./my-notes");

// Export to different formats
const json = generator.exportToJSON(graph);
const dot = generator.exportToDOT(graph);
const mermaid = generator.exportToMermaid(graph);

// Get analytics
const analytics = generator.getAnalytics(graph);
console.log(
  `Found ${analytics.nodeCount} cards with ${analytics.edgeCount} connections`,
);
```

## Markdown Format

The library recognizes these patterns in markdown files:

### Card Links

```markdown
This card links to [[Another Card]] and [[Third Card]].
```

### Tags

```markdown
This card has #tag1 and #tag2.
```

### Card Title

```markdown
# My Card Title

Content goes here...
```

## API Reference

### GraphGenerator

Main class for generating graphs from markdown files.

```typescript
const generator = new GraphGenerator({
  parser: {
    linkPattern: /\[\[([^\]]+)\]\]/g, // Custom link pattern
    tagPattern: /#([a-zA-Z0-9_-]+)/g, // Custom tag pattern
  },
  graph: {
    includeBacklinks: true, // Include backlink edges
    includeTags: true, // Include tag-based connections
    weightByFrequency: false, // Weight edges by frequency
  },
});
```

#### Methods

- `generateFromDirectory(dirPath: string, recursive?: boolean): Graph`
- `generateFromFiles(filePaths: string[]): Graph`
- `generateFromCards(cards: Card[]): Graph`
- `exportToJSON(graph: Graph): string`
- `exportToDOT(graph: Graph): string`
- `exportToMermaid(graph: Graph): string`
- `getAnalytics(graph: Graph): Analytics`

### MarkdownParser

Parse individual markdown files or directories.

```typescript
import { MarkdownParser } from "graph-cards";

const parser = new MarkdownParser();
const card = parser.parseFile("./my-note.md");
const cards = parser.parseDirectory("./notes");
```

### CardGraph

Build and manipulate graph structures.

```typescript
import { CardGraph } from "graph-cards";

const graph = new CardGraph();
const result = graph.buildGraph(cards);

// Graph analysis
const shortestPath = graph.getShortestPath("card1", "card2");
const components = graph.getStronglyConnectedComponents();
```

## Types

```typescript
interface Card {
  id: string;
  title: string;
  content: string;
  filePath: string;
  tags: string[];
  links: string[];
  backlinks: string[];
}

interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

enum EdgeType {
  LINK = "link",
  BACKLINK = "backlink",
  TAG = "tag",
  MENTION = "mention",
}
```

## samples

### Custom Link Patterns

```typescript
const generator = new GraphGenerator({
  parser: {
    linkPattern: /\[([^\]]+)\]\([^)]+\)/g, // Standard markdown links
    tagPattern: /@([a-zA-Z0-9_-]+)/g, // Use @ for tags instead of #
  },
});
```

### Export to Visualization Tools

```typescript
const graph = generator.generateFromDirectory("./notes");

// For Graphviz
const dotContent = generator.exportToDOT(graph);
fs.writeFileSync("graph.dot", dotContent);

// For Mermaid diagrams
const mermaidContent = generator.exportToMermaid(graph);
fs.writeFileSync("graph.mmd", mermaidContent);
```

## samples

See the `samples/` directory for comprehensive demonstrations:

```bash
# Run simple demo
cd samples && node simple-demo.js

# Run full sample program
cd samples && node sample-usage.js
```

**Sample Output:**

```
🎭 Graph Cards - Simple Demo

🩰 Choreographers Dataset:
   Cards: 12
   Connections: 154
   Density: 116.7%

😊 Emotions Dataset:
   Cards: 12
   Connections: 94
   Density: 71.2%

💫 Sample Card - Joy:
   Title: Joy
   Links: happiness, excitement, contentment...
   Tags: positive, happiness, well-being, energy
```

The samples demonstrate:

- **Dataset Analysis** - Complete analytics for both sample datasets
- **Individual Card Exploration** - Deep-dive into specific cards and relationships
- **Cross-Dataset Analysis** - Combining multiple markdown datasets
- **Export Demonstrations** - JSON, DOT, and Mermaid format generation
- **Pathfinding** - Finding connections between cards across the graph

## Development & Testing

### Running Tests

The library includes comprehensive tests using Vitest:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/                    # Unit tests for individual classes
│   ├── parser.test.ts      # MarkdownParser functionality
│   ├── graph.test.ts       # CardGraph building and analysis
│   └── generator.test.ts   # GraphGenerator and exports
├── integration/            # Integration tests with real datasets
│   ├── choreographers.test.ts  # Famous dance choreographers
│   ├── emotions.test.ts        # Emotional vocabulary
│   └── cross-dataset.test.ts   # Combined dataset scenarios
├── fixtures/               # Test data and sample files
└── utils/                  # Testing utilities and helpers
```

### Sample Datasets

The library includes two comprehensive sample datasets for testing and demonstration:

#### 1. **Choreographers Dataset** (`dataset/choreographers/`)

12 interconnected cards about famous dance choreographers including:

- Martha Graham, George Balanchine, Merce Cunningham
- Pina Bausch, Jerome Robbins, Alvin Ailey
- Modern, ballet, and contemporary dance relationships
- Techniques, signature works, and artistic influences

#### 2. **Emotions Dataset** (`dataset/emotions/`)

12 cards mapping emotional relationships and transitions:

- Core emotions: joy, anger, fear, sadness, love
- Complex emotions: anxiety, shame, compassion, hope
- Emotional intensity scales and transformation paths
- Psychological and physiological characteristics

### Example Test Scenarios

```typescript
// Test choreographer relationships
expect(graph).toHaveEdge("martha-graham", "merce-cunningham");
expect(graph).toHaveEdge("george-balanchine", "jerome-robbins");

// Test emotional connections
expect(graph).toHaveEdge("joy", "happiness");
expect(graph).toHaveEdge("fear", "anxiety");

// Test cross-dataset isolation
expect(graph.getShortestPath("martha-graham", "joy")).toEqual([]);
```

### Building and TypeScript

```bash
# Build the library
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## License

MIT
