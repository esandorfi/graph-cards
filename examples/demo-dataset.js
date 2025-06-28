#!/usr/bin/env node

/**
 * Minimal one-dataset demo for the graph-cards library.
 *
 * Usage:
 *   node demo-dataset.js <dataset>
 *
 * <dataset> should be the folder name inside ../samples (e.g. "choreographers" or "emotions").
 *
 * The script prints basic analytics and exports the graph in JSON, DOT and Mermaid formats.
 */

const path = require('path');
const fs = require('fs');
const { GraphGenerator } = require('../dist/index.js');

// ---------- helpers ---------------------------------------------------------

function resolveDatasetDir(dataset) {
  return path.resolve(__dirname, `../samples/${dataset}`);
}

function exportGraph(graph, name, generator) {
  const outDir = path.resolve(__dirname, 'outputs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, `${name}.json`), generator.exportToJSON(graph));
  fs.writeFileSync(path.join(outDir, `${name}.dot`), generator.exportToDOT(graph));
  fs.writeFileSync(path.join(outDir, `${name}.mmd`), generator.exportToMermaid(graph));

  console.log(`\n💾 Exported to ${outDir}/${name}.{json,dot,mmd}`);
}

function printAnalytics(analytics) {
  console.log('📈 Analytics');
  console.log(`   • Cards: ${analytics.nodeCount}`);
  console.log(`   • Connections: ${analytics.edgeCount}`);
  console.log(`   • Average connections per card: ${analytics.avgConnections.toFixed(2)}`);
  console.log(`   • Density: ${(analytics.density * 100).toFixed(2)}%`);
}

// ---------- main ------------------------------------------------------------

async function main() {
  const datasetArg = process.argv[2];
  if (!datasetArg) {
    console.error('Usage: node demo-dataset.js <dataset-folder>');
    console.error('Example: node demo-dataset.js choreographers');
    process.exit(1);
  }

  const datasetDir = resolveDatasetDir(datasetArg);
  if (!fs.existsSync(datasetDir)) {
    console.error(`Dataset folder not found: ${datasetDir}`);
    process.exit(1);
  }

  const generator = new GraphGenerator();

  console.log(`\n🎭 Graph Cards – ${datasetArg.charAt(0).toUpperCase() + datasetArg.slice(1)} Demo\n`);

  const graph = generator.generateFromDirectory(datasetDir);
  const analytics = generator.getAnalytics(graph);
  printAnalytics(analytics);

  // Show a sample card (first node)
  const firstId = graph.nodes.keys().next().value;
  const firstCard = graph.nodes.get(firstId)?.card;
  if (firstCard) {
    console.log(`\n🔍 Sample Card – ${firstCard.title}`);
    console.log(`   Tags: ${firstCard.tags.join(', ') || 'none'}`);
    console.log(`   Links: ${firstCard.links.slice(0, 5).join(', ') || 'none'}`);
  }

  exportGraph(graph, datasetArg, generator);

  console.log('\n✅ Done');
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
