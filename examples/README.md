# Graph Cards Examples

This directory contains example programs demonstrating how to use the graph-cards library with the choreographers and emotions datasets.

## Quick Start

```bash
# Build the main library first
cd ..
npm run build

# Run a dataset demo
cd examples
# Run both datasets sequentially
npm run demo

# Or run individually
npm run demo.dance   # Choreographers
npm run demo.emotions # Emotions
```

## What the Sample Program Does

The `demo-output.js` program demonstrates:

### 📊 **Dataset Analysis**

- Parses both choreographers and emotions markdown datasets
- Generates comprehensive analytics (node count, edge count, density, etc.)
- Identifies strongly connected components and pathfinding

### 🔍 **Individual Card Exploration**

- Deep-dives into specific cards (Martha Graham, Merce Cunningham, Joy, Anger)
- Shows links, backlinks, tags, and connection types
- Demonstrates relationship mapping

### 🤝 **Combined Dataset Analysis**

- Merges both datasets into a single graph
- Tests cross-dataset connectivity
- Compares dataset characteristics

### 💾 **Export Demonstrations**

- Exports graphs to JSON, DOT (Graphviz), and Mermaid formats
- Creates visualization-ready files in `./outputs/` directory
- Provides commands for generating visual graphs

## Sample Output

```
🎭 Graph Cards Library - Sample Usage

📊 === CHOREOGRAPHERS DATASET ===
📈 Analytics:
   • Cards: 12
   • Connections: 154
   • Average connections per card: 12.83
   • Most connected card: 19 connections
   • Isolated cards: 0
   • Network density: 117.42%

🔗 Sample path: martha-graham → merce-cunningham → william-forsythe
🌐 Largest connected group: 12 cards

📊 === EMOTIONS DATASET ===
📈 Analytics:
   • Cards: 12
   • Connections: 92
   • Average connections per card: 7.67
   • Most connected card: 12 connections
   • Isolated cards: 0
   • Network density: 69.70%

🔍 Exploring connections for "Joy" (joy):
   📝 Title: Joy
   🏷️  Tags: positive, happiness, well-being, energy, spontaneous, core-emotion
   🔗 Links to: happiness, excitement, contentment, euphoria, serenity, ...
   ↩️  Backlinks: excitement, gratitude
   📊 Connection types: link(15), backlink(2), tag(4)
```

## Generated Files

After running the sample, check the `./outputs/` directory for:

- `choreographers-graph.json` - Graph data in JSON format
- `choreographers-graph.dot` - Graphviz DOT format for visualization
- `choreographers-graph.mmd` - Mermaid diagram format
- `emotions-graph.json/dot/mmd` - Same formats for emotions dataset
- `combined-graph.json/dot/mmd` - Merged dataset graphs

## Visualization Commands

```bash
# Generate PNG with Graphviz (if installed)
dot -Tpng outputs/choreographers-graph.dot -o choreographers.png

# View Mermaid diagrams online
# Copy content from .mmd files to https://mermaid.live
```

## Key Learning Points

1. **Rich Interconnections**: Choreographers show higher density due to historical influences
2. **Emotional Networks**: Emotions demonstrate psychological relationship patterns
3. **Domain Separation**: Datasets remain separate unless explicitly cross-referenced
4. **Export Flexibility**: Multiple formats support different visualization tools
5. **Graph Analytics**: Comprehensive metrics reveal network characteristics

## Extending the Examples

You can modify `demo-output.js` to:

- Add your own markdown datasets
- Customize parsing patterns (links, tags)
- Implement custom graph analysis algorithms
- Create different export formats
- Build interactive visualizations
