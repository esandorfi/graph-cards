#!/usr/bin/env node

/**
 * Simple demonstration script for graph-cards library
 * Shows basic usage with both datasets
 */

const path = require('path');
const { GraphGenerator } = require('../dist/index.js');

console.log('🎭 Graph Cards - Simple Demo\n');

// Create generator
const generator = new GraphGenerator();

// Analyze choreographers
console.log('🩰 Choreographers Dataset:');
const choreoDir = path.resolve(__dirname, '../samples/choreographers');
const choreoGraph = generator.generateFromDirectory(choreoDir);
const choreoAnalytics = generator.getAnalytics(choreoGraph);

console.log(`   Cards: ${choreoAnalytics.nodeCount}`);
console.log(`   Connections: ${choreoAnalytics.edgeCount}`);
console.log(`   Density: ${(choreoAnalytics.density * 100).toFixed(1)}%\n`);

// Analyze emotions  
console.log('😊 Emotions Dataset:');
const emotionDir = path.resolve(__dirname, '../samples/emotions');
const emotionGraph = generator.generateFromDirectory(emotionDir);
const emotionAnalytics = generator.getAnalytics(emotionGraph);

console.log(`   Cards: ${emotionAnalytics.nodeCount}`);
console.log(`   Connections: ${emotionAnalytics.edgeCount}`);
console.log(`   Density: ${(emotionAnalytics.density * 100).toFixed(1)}%\n`);

// Show a sample card
const joyCard = emotionGraph.nodes.get('joy');
if (joyCard) {
  console.log('💫 Sample Card - Joy:');
  console.log(`   Title: ${joyCard.card.title}`);
  console.log(`   Links: ${joyCard.card.links.slice(0, 3).join(', ')}...`);
  console.log(`   Tags: ${joyCard.card.tags.join(', ')}\n`);
}

// Export sample
console.log('📄 JSON Export (first 200 chars):');
const json = generator.exportToJSON(emotionGraph);
console.log(json.substring(0, 200) + '...\n');

console.log('✅ Demo completed! See sample-usage.js for detailed analysis.');