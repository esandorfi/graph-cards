#!/usr/bin/env node

/**
 * Sample program demonstrating the graph-cards library
 * with choreographers and emotions datasets
 */

const { GraphGenerator } = require('../dist/index.js');
const fs = require('fs');
const path = require('path');

console.log('🎭 Graph Cards Library - Sample Usage\n');
console.log('Analyzing choreographers and emotions datasets...\n');

// Initialize generator with custom options
const generator = new GraphGenerator({
  graph: {
    includeBacklinks: true,
    includeTags: true,
    weightByFrequency: false
  }
});

async function analyzeDataset(name, directory) {
  console.log(`📊 === ${name.toUpperCase()} DATASET ===`);
  
  try {
    // Generate graph from directory (adjust path for examples subdirectory)
    const adjustedPath = directory.startsWith('./samples/') ? `../${directory}` : directory;
    const graph = generator.generateFromDirectory(adjustedPath);
    
    // Get analytics
    const analytics = generator.getAnalytics(graph);
    
    console.log(`📈 Analytics:`);
    console.log(`   • Cards: ${analytics.nodeCount}`);
    console.log(`   • Connections: ${analytics.edgeCount}`);
    console.log(`   • Average connections per card: ${analytics.avgConnections.toFixed(2)}`);
    console.log(`   • Most connected card: ${analytics.maxConnections} connections`);
    console.log(`   • Isolated cards: ${analytics.isolatedNodes}`);
    console.log(`   • Network density: ${(analytics.density * 100).toFixed(2)}%`);
    
    if (analytics.edgesByType) {
      console.log(`   • Edge types:`);
      Object.entries(analytics.edgesByType).forEach(([type, count]) => {
        console.log(`     - ${type}: ${count}`);
      });
    }
    
    // Find some interesting paths
    const nodes = Array.from(graph.nodes.keys());
    if (nodes.length >= 2) {
      const startNode = nodes[0];
      const endNode = nodes[Math.floor(nodes.length / 2)];
      
      generator.graph.buildGraph(Array.from(graph.nodes.values()).map(n => n.card));
      const path = generator.graph.getShortestPath(startNode, endNode);
      
      if (path.length > 0) {
        console.log(`🔗 Sample path: ${path.join(' → ')}`);
      }
    }
    
    // Find strongly connected components
    const components = generator.graph.getStronglyConnectedComponents();
    if (components.length > 0) {
      const largestComponent = components.reduce((prev, current) => 
        prev.length > current.length ? prev : current
      );
      console.log(`🌐 Largest connected group: ${largestComponent.length} cards`);
      if (largestComponent.length <= 5) {
        console.log(`   Cards: ${largestComponent.join(', ')}`);
      }
    }
    
    return { graph, analytics };
    
  } catch (error) {
    console.error(`❌ Error analyzing ${name}:`, error.message);
    return null;
  }
}

async function exploreConnections(graph, nodeId, title) {
  console.log(`\n🔍 Exploring connections for "${title}" (${nodeId}):`);
  
  const node = graph.nodes.get(nodeId);
  if (!node) {
    console.log(`   Card not found!`);
    return;
  }
  
  const card = node.card;
  console.log(`   📝 Title: ${card.title}`);
  console.log(`   🏷️  Tags: ${card.tags.length > 0 ? card.tags.join(', ') : 'none'}`);
  console.log(`   🔗 Links to: ${card.links.length > 0 ? card.links.join(', ') : 'none'}`);
  console.log(`   ↩️  Backlinks: ${card.backlinks.length > 0 ? card.backlinks.join(', ') : 'none'}`);
  
  // Show connection types
  const connections = node.connections;
  const connectionTypes = connections.reduce((acc, conn) => {
    acc[conn.type] = (acc[conn.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log(`   📊 Connection types: ${Object.entries(connectionTypes).map(([type, count]) => `${type}(${count})`).join(', ')}`);
}

async function compareDatasets(choreoResult, emotionResult) {
  console.log(`\n🔬 === DATASET COMPARISON ===`);
  
  if (!choreoResult || !emotionResult) {
    console.log('❌ Cannot compare - one or both datasets failed to load');
    return;
  }
  
  const { analytics: choreoAnalytics } = choreoResult;
  const { analytics: emotionAnalytics } = emotionResult;
  
  console.log(`📊 Comparison:`);
  console.log(`   Choreographers: ${choreoAnalytics.nodeCount} cards, ${choreoAnalytics.edgeCount} connections`);
  console.log(`   Emotions: ${emotionAnalytics.nodeCount} cards, ${emotionAnalytics.edgeCount} connections`);
  console.log(`   Density difference: ${((choreoAnalytics.density - emotionAnalytics.density) * 100).toFixed(2)}%`);
  
  const moreDense = choreoAnalytics.density > emotionAnalytics.density ? 'Choreographers' : 'Emotions';
  console.log(`   More interconnected: ${moreDense}`);
}

async function demonstrateCombinedDataset() {
  console.log(`\n🤝 === COMBINED DATASET ANALYSIS ===`);
  
  try {
    // Parse both datasets
    const choreoCards = generator.parser.parseDirectory('../samples/choreographers');
    const emotionCards = generator.parser.parseDirectory('../samples/emotions');
    
    // Combine and analyze
    const combinedCards = [...choreoCards, ...emotionCards];
    const combinedGraph = generator.generateFromCards(combinedCards);
    const combinedAnalytics = generator.getAnalytics(combinedGraph);
    
    console.log(`📈 Combined Analytics:`);
    console.log(`   • Total cards: ${combinedAnalytics.nodeCount}`);
    console.log(`   • Total connections: ${combinedAnalytics.edgeCount}`);
    console.log(`   • Overall density: ${(combinedAnalytics.density * 100).toFixed(2)}%`);
    console.log(`   • Isolated cards: ${combinedAnalytics.isolatedNodes}`);
    
    // Test cross-dataset connections
    generator.graph.buildGraph(combinedCards);
    const crossPath = generator.graph.getShortestPath('martha-graham', 'joy');
    
    if (crossPath.length > 0) {
      console.log(`🌉 Cross-dataset path found: ${crossPath.join(' → ')}`);
    } else {
      console.log(`🏝️  No direct path between choreographers and emotions (separate domains)`);
    }
    
    return combinedGraph;
    
  } catch (error) {
    console.error(`❌ Error with combined analysis:`, error.message);
    return null;
  }
}

async function exportSamples(graph, name) {
  console.log(`\n💾 Exporting ${name} graph to multiple formats...`);
  
  try {
    const outputDir = `./outputs`;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Export to JSON
    const json = generator.exportToJSON(graph);
    fs.writeFileSync(`${outputDir}/${name}-graph.json`, json);
    console.log(`   ✅ JSON exported to ${outputDir}/${name}-graph.json`);
    
    // Export to DOT (Graphviz)
    const dot = generator.exportToDOT(graph);
    fs.writeFileSync(`${outputDir}/${name}-graph.dot`, dot);
    console.log(`   ✅ DOT exported to ${outputDir}/${name}-graph.dot`);
    
    // Export to Mermaid
    const mermaid = generator.exportToMermaid(graph);
    fs.writeFileSync(`${outputDir}/${name}-graph.mmd`, mermaid);
    console.log(`   ✅ Mermaid exported to ${outputDir}/${name}-graph.mmd`);
    
    console.log(`\n📄 To visualize:`);
    console.log(`   • Graphviz: dot -Tpng ${outputDir}/${name}-graph.dot -o ${name}-graph.png`);
    console.log(`   • Mermaid: Use mermaid-cli or paste into https://mermaid.live`);
    
  } catch (error) {
    console.error(`❌ Export error:`, error.message);
  }
}

// Main execution
async function main() {
  try {
    // Analyze individual datasets
    const choreoResult = await analyzeDataset('Choreographers', './samples/choreographers');
    console.log('');
    const emotionResult = await analyzeDataset('Emotions', './samples/emotions');
    
    // Compare datasets
    await compareDatasets(choreoResult, emotionResult);
    
    // Analyze combined dataset
    const combinedGraph = await demonstrateCombinedDataset();
    
    // Explore specific cards
    if (choreoResult) {
      await exploreConnections(choreoResult.graph, 'martha-graham', 'Martha Graham');
      await exploreConnections(choreoResult.graph, 'merce-cunningham', 'Merce Cunningham');
    }
    
    if (emotionResult) {
      await exploreConnections(emotionResult.graph, 'joy', 'Joy');
      await exploreConnections(emotionResult.graph, 'anger', 'Anger');
    }
    
    // Export examples
    if (choreoResult) {
      await exportSamples(choreoResult.graph, 'choreographers');
    }
    
    if (emotionResult) {
      await exportSamples(emotionResult.graph, 'emotions');
    }
    
    if (combinedGraph) {
      await exportSamples(combinedGraph, 'combined');
    }
    
    console.log(`\n✨ === SUMMARY ===`);
    console.log(`🎭 Successfully analyzed both datasets!`);
    console.log(`📊 Generated comprehensive analytics and visualizations`);
    console.log(`🔗 Demonstrated relationship mapping and pathfinding`);
    console.log(`💾 Exported graphs in multiple formats for visualization`);
    console.log(`\n👀 Check the ./examples/outputs/ directory for exported files!`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };