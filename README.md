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
import { GraphGenerator } from 'graph-cards';

const generator = new GraphGenerator();

// Generate graph from a directory of markdown files
const graph = generator.generateFromDirectory('./my-notes');

// Export to different formats
const json = generator.exportToJSON(graph);
const dot = generator.exportToDOT(graph);
const mermaid = generator.exportToMermaid(graph);

// Get analytics
const analytics = generator.getAnalytics(graph);
console.log(`Found ${analytics.nodeCount} cards with ${analytics.edgeCount} connections`);
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
    linkPattern: /\[\[([^\]]+)\]\]/g,  // Custom link pattern
    tagPattern: /#([a-zA-Z0-9_-]+)/g,  // Custom tag pattern
  },
  graph: {
    includeBacklinks: true,    // Include backlink edges
    includeTags: true,         // Include tag-based connections
    weightByFrequency: false   // Weight edges by frequency
  }
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
import { MarkdownParser } from 'graph-cards';

const parser = new MarkdownParser();
const card = parser.parseFile('./my-note.md');
const cards = parser.parseDirectory('./notes');
```

### CardGraph

Build and manipulate graph structures.

```typescript
import { CardGraph } from 'graph-cards';

const graph = new CardGraph();
const result = graph.buildGraph(cards);

// Graph analysis
const shortestPath = graph.getShortestPath('card1', 'card2');
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
  LINK = 'link',
  BACKLINK = 'backlink',
  TAG = 'tag',
  MENTION = 'mention'
}
```

## Examples

### Custom Link Patterns

```typescript
const generator = new GraphGenerator({
  parser: {
    linkPattern: /\[([^\]]+)\]\([^)]+\)/g,  // Standard markdown links
    tagPattern: /@([a-zA-Z0-9_-]+)/g,       // Use @ for tags instead of #
  }
});
```

### Export to Visualization Tools

```typescript
const graph = generator.generateFromDirectory('./notes');

// For Graphviz
const dotContent = generator.exportToDOT(graph);
fs.writeFileSync('graph.dot', dotContent);

// For Mermaid diagrams
const mermaidContent = generator.exportToMermaid(graph);
fs.writeFileSync('graph.mmd', mermaidContent);
```

## License

MIT