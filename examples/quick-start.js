#!/usr/bin/env node

/**
 * Quick start script - minimal example
 */

const { GraphGenerator } = require('../dist/index.js');

// One-liner usage
const generator = new GraphGenerator();
const graph = generator.generateFromDirectory('../dataset/emotions');

console.log('📊 Emotions Graph:');
console.log(`   ${graph.nodes.size} cards, ${graph.edges.length} connections`);
console.log(`   Cards: ${Array.from(graph.nodes.keys()).join(', ')}`);

// Quick export
const json = generator.exportToJSON(graph);
console.log(`\n📄 Exported ${json.length} characters of JSON data`);
console.log('✅ Ready to use!');