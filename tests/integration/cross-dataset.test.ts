import { describe, it, expect } from 'vitest';
import { GraphGenerator } from '../../src/generator';
import { expectGraphStructure } from '../utils/test-helpers';

describe('Cross-Dataset Integration', () => {
  const generator = new GraphGenerator();

  it('should combine both datasets into single graph', () => {
    // Parse both directories
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    
    // Combine and build graph
    const allCards = [...choreographersCards, ...emotionsCards];
    const combinedGraph = generator.generateFromCards(allCards);
    
    expectGraphStructure(combinedGraph, 24, expect.any(Number)); // 12 + 12 = 24 nodes
  });

  it('should maintain dataset integrity when combined', () => {
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    const allCards = [...choreographersCards, ...emotionsCards];
    
    const combinedGraph = generator.generateFromCards(allCards);
    
    // Check that all choreographers still exist
    const choreographerIds = choreographersCards.map(c => c.id);
    choreographerIds.forEach(id => {
      expect(combinedGraph.nodes.has(id)).toBe(true);
    });
    
    // Check that all emotions still exist
    const emotionIds = emotionsCards.map(c => c.id);
    emotionIds.forEach(id => {
      expect(combinedGraph.nodes.has(id)).toBe(true);
    });
  });

  it('should not create cross-dataset links unless explicitly referenced', () => {
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    const allCards = [...choreographersCards, ...emotionsCards];
    
    const combinedGraph = generator.generateFromCards(allCards);
    
    // Count edges between datasets
    const choreographerIds = new Set(choreographersCards.map(c => c.id));
    const emotionIds = new Set(emotionsCards.map(c => c.id));
    
    const crossDatasetEdges = combinedGraph.edges.filter(edge => 
      (choreographerIds.has(edge.from) && emotionIds.has(edge.to)) ||
      (emotionIds.has(edge.from) && choreographerIds.has(edge.to))
    );
    
    // Should be minimal cross-dataset connections (only if explicitly referenced)
    expect(crossDatasetEdges.length).toBeLessThan(5);
  });

  it('should provide accurate analytics for combined dataset', () => {
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    const allCards = [...choreographersCards, ...emotionsCards];
    
    const combinedGraph = generator.generateFromCards(allCards);
    const analytics = generator.getAnalytics(combinedGraph);
    
    expect(analytics.nodeCount).toBe(24);
    expect(analytics.edgeCount).toBeGreaterThan(20);
    
    // Combined dataset should have lower density due to fewer cross-connections
    expect(analytics.density).toBeLessThan(0.2);
    
    // Should have some isolated nodes from different domains
    expect(analytics.isolatedNodes).toBeGreaterThan(0);
  });

  it('should handle tag overlaps between datasets', () => {
    const generator = new GraphGenerator({
      graph: { includeTags: true }
    });
    
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    
    // Look for common tags (if any)
    const choreographerTags = new Set(choreographersCards.flatMap(c => c.tags));
    const emotionTags = new Set(emotionsCards.flatMap(c => c.tags));
    const commonTags = [...choreographerTags].filter(tag => emotionTags.has(tag));
    
    if (commonTags.length > 0) {
      const allCards = [...choreographersCards, ...emotionsCards];
      const combinedGraph = generator.generateFromCards(allCards);
      
      // Should create tag-based connections across datasets for common tags
      const tagEdges = combinedGraph.edges.filter(e => e.type === 'tag');
      expect(tagEdges.length).toBeGreaterThan(0);
    }
  });

  it('should export combined dataset correctly', () => {
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    const allCards = [...choreographersCards, ...emotionsCards];
    
    const combinedGraph = generator.generateFromCards(allCards);
    
    // Test JSON export
    const json = generator.exportToJSON(combinedGraph);
    const parsed = JSON.parse(json);
    expect(parsed.nodes.length).toBe(24);
    
    // Test DOT export contains both datasets
    const dot = generator.exportToDOT(combinedGraph);
    expect(dot).toContain('martha-graham'); // choreographer
    expect(dot).toContain('joy'); // emotion
    
    // Test Mermaid export
    const mermaid = generator.exportToMermaid(combinedGraph);
    expect(mermaid).toContain('marthagraham');
    expect(mermaid).toContain('joy');
  });

  it('should find paths within datasets but not across unless connected', () => {
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    const allCards = [...choreographersCards, ...emotionsCards];
    
    const combinedGraph = generator.generateFromCards(allCards);
    generator.graph.buildGraph(allCards);
    
    // Should find paths within choreographers
    const choreoPath = generator.graph.getShortestPath('martha-graham', 'merce-cunningham');
    expect(choreoPath.length).toBeGreaterThan(0);
    
    // Should find paths within emotions
    const emotionPath = generator.graph.getShortestPath('joy', 'sadness');
    expect(emotionPath.length).toBeGreaterThan(0);
    
    // Should not find paths across datasets (unless explicitly connected)
    const crossPath = generator.graph.getShortestPath('martha-graham', 'joy');
    expect(crossPath.length).toBe(0); // No path expected
  });

  it('should handle different file counts gracefully', () => {
    // Test with just a few files from each dataset
    const limitedChoreographers = generator.parser.parseDirectory('./samples/choreographers').slice(0, 3);
    const limitedEmotions = generator.parser.parseDirectory('./samples/emotions').slice(0, 5);
    
    const limitedGraph = generator.generateFromCards([...limitedChoreographers, ...limitedEmotions]);
    
    expect(limitedGraph.nodes.size).toBe(8);
    expect(limitedGraph.edges.length).toBeGreaterThanOrEqual(0);
  });

  it('should maintain performance with combined datasets', () => {
    const start = Date.now();
    
    const choreographersCards = generator.parser.parseDirectory('./samples/choreographers');
    const emotionsCards = generator.parser.parseDirectory('./samples/emotions');
    const allCards = [...choreographersCards, ...emotionsCards];
    
    const combinedGraph = generator.generateFromCards(allCards);
    const analytics = generator.getAnalytics(combinedGraph);
    
    const duration = Date.now() - start;
    
    // Should complete reasonably quickly (under 1 second for this dataset size)
    expect(duration).toBeLessThan(1000);
    expect(analytics.nodeCount).toBe(24);
  });
});