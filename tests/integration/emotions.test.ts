import { describe, it, expect } from 'vitest';
import { GraphGenerator } from '../../src/generator';
import { expectGraphStructure, expectNodeExists, expectEdgeExists } from '../utils/test-helpers';
import { EdgeType } from '../../src/types';

describe('Emotions Dataset Integration', () => {
  const generator = new GraphGenerator();

  it('should parse all 12 emotion files', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    expect(graph.nodes.size).toBe(12);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('should create expected emotion nodes', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    // Test core emotions exist
    expectNodeExists(graph, 'joy');
    expectNodeExists(graph, 'anger');
    expectNodeExists(graph, 'fear');
    expectNodeExists(graph, 'sadness');
    expectNodeExists(graph, 'love');
    expectNodeExists(graph, 'anxiety');
    expectNodeExists(graph, 'gratitude');
    expectNodeExists(graph, 'shame');
    expectNodeExists(graph, 'hope');
    expectNodeExists(graph, 'curiosity');
    expectNodeExists(graph, 'compassion');
    expectNodeExists(graph, 'excitement');
  });

  it('should establish known emotional relationships', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    // Joy connects to excitement (which exists as a file)
    expectEdgeExists(graph, 'joy', 'excitement', EdgeType.LINK);
    
    // Anger connects to shame (both files exist)
    expectEdgeExists(graph, 'anger', 'shame', EdgeType.LINK);
    
    // Anger connects to compassion (transformation)
    expectEdgeExists(graph, 'anger', 'compassion', EdgeType.LINK);
    
    // Fear connects to anxiety
    expectEdgeExists(graph, 'fear', 'anxiety', EdgeType.LINK);
    
    // Love connects to compassion
    expectEdgeExists(graph, 'love', 'compassion', EdgeType.LINK);
  });

  it('should create tag-based emotional groupings', () => {
    const generator = new GraphGenerator({
      graph: { includeTags: true }
    });
    
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    // Should have tag edges connecting similar emotional categories
    const tagEdges = graph.edges.filter(e => e.type === EdgeType.TAG);
    expect(tagEdges.length).toBeGreaterThan(0);
    
    // Positive emotions should be connected
    const positiveEmotions = ['joy', 'love', 'gratitude', 'hope', 'excitement'];
    const positiveConnections = tagEdges.filter(e => 
      positiveEmotions.includes(e.from) && positiveEmotions.includes(e.to)
    );
    expect(positiveConnections.length).toBeGreaterThan(0);
  });

  it('should find emotional transition paths', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    generator.graph.buildGraph(Array.from(graph.nodes.values()).map(n => n.card));
    
    // Path from sadness to hope (emotional healing journey)
    const healingPath = generator.graph.getShortestPath('sadness', 'hope');
    expect(healingPath.length).toBeGreaterThan(0);
    expect(healingPath[0]).toBe('sadness');
    expect(healingPath[healingPath.length - 1]).toBe('hope');
    
    // Path from anger to compassion (transformation)
    const transformPath = generator.graph.getShortestPath('anger', 'compassion');
    expect(transformPath.length).toBeGreaterThan(0);
  });

  it('should identify emotional clusters', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    generator.graph.buildGraph(Array.from(graph.nodes.values()).map(n => n.card));
    
    const components = generator.graph.getStronglyConnectedComponents();
    
    // Should find connected emotional networks
    expect(components.length).toBeGreaterThan(0);
    const largestComponent = components.reduce((prev, current) => 
      prev.length > current.length ? prev : current
    );
    expect(largestComponent.length).toBeGreaterThan(2);
  });

  it('should handle emotional opposites and contrasts', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    // Joy should reference its opposite sadness
    const joyNode = graph.nodes.get('joy');
    expect(joyNode?.card.content).toContain('sadness');
    
    // Fear and courage should be connected
    const fearNode = graph.nodes.get('fear');
    expect(fearNode?.card.content).toContain('courage');
    
    // Anger and compassion transformation
    const angerNode = graph.nodes.get('anger');
    expect(angerNode?.card.content).toContain('compassion');
  });

  it('should have rich emotional network analytics', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    const analytics = generator.getAnalytics(graph);
    
    expect(analytics.nodeCount).toBe(12);
    expect(analytics.edgeCount).toBeGreaterThan(15); // Rich emotional connections
    expect(analytics.avgConnections).toBeGreaterThan(2); // Emotions are interconnected
    expect(analytics.isolatedNodes).toBe(0); // No isolated emotions
    expect(analytics.density).toBeGreaterThan(0.15); // Dense emotional network
  });

  it('should export emotions graph to all formats', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    const json = generator.exportToJSON(graph);
    const parsed = JSON.parse(json);
    expect(parsed.nodes.length).toBe(12);
    
    const dot = generator.exportToDOT(graph);
    expect(dot).toContain('"joy"');
    expect(dot).toContain('"sadness"');
    expect(dot).toContain('->');
    
    const mermaid = generator.exportToMermaid(graph);
    expect(mermaid).toContain('joy');
    expect(mermaid).toContain('sadness');
    expect(mermaid).toContain('-->');
  });

  it('should capture emotional intensity relationships', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    // Excitement should connect to joy (intensity relationship)
    expectEdgeExists(graph, 'excitement', 'joy', EdgeType.LINK);
    
    // Anxiety should connect to fear (related intensity)
    expectEdgeExists(graph, 'anxiety', 'fear', EdgeType.LINK);
    
    // Check that intensity hierarchies are captured in content
    const anxietyNode = graph.nodes.get('anxiety');
    expect(anxietyNode?.card.content.toLowerCase()).toContain('panic');
    expect(anxietyNode?.card.content.toLowerCase()).toContain('worry');
  });

  it('should handle complex emotional relationships', () => {
    const graph = generator.generateFromDirectory('./samples/emotions');
    
    // Shame should have multiple complex relationships
    const shameNode = graph.nodes.get('shame');
    expect(shameNode?.card.links.length).toBeGreaterThan(3);
    
    // Love should connect to multiple positive emotions
    const loveNode = graph.nodes.get('love');
    expect(loveNode?.card.links).toContain('joy');
    expect(loveNode?.card.links).toContain('compassion');
    
    // Compassion should connect across emotional categories
    const compassionNode = graph.nodes.get('compassion');
    expect(compassionNode?.card.links.length).toBeGreaterThan(4);
  });
});