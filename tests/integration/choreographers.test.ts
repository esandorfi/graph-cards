import { describe, it, expect } from 'vitest';
import { GraphGenerator } from '../../src/generator';
import { expectGraphStructure, expectNodeExists, expectEdgeExists } from '../utils/test-helpers';
import { EdgeType } from '../../src/types';

describe('Choreographers Dataset Integration', () => {
  const generator = new GraphGenerator();

  it('should parse all 12 choreographer files', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    
    expectGraphStructure(graph, 12, expect.any(Number));
  });

  it('should create expected choreographer nodes', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    
    // Test key choreographers exist
    expectNodeExists(graph, 'martha-graham');
    expectNodeExists(graph, 'george-balanchine');
    expectNodeExists(graph, 'merce-cunningham');
    expectNodeExists(graph, 'pina-bausch');
    expectNodeExists(graph, 'jerome-robbins');
    expectNodeExists(graph, 'alvin-ailey');
    expectNodeExists(graph, 'twyla-tharp');
    expectNodeExists(graph, 'william-forsythe');
    expectNodeExists(graph, 'akram-khan');
    expectNodeExists(graph, 'crystal-pite');
    expectNodeExists(graph, 'christopher-wheeldon');
    expectNodeExists(graph, 'isadora-duncan');
  });

  it('should establish known choreographer relationships', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    
    // Martha Graham influenced Merce Cunningham
    expectEdgeExists(graph, 'martha-graham', 'merce-cunningham', EdgeType.LINK);
    
    // Merce Cunningham studied with Martha Graham (should be mentioned)
    expectEdgeExists(graph, 'merce-cunningham', 'martha-graham', EdgeType.LINK);
    
    // George Balanchine influenced Jerome Robbins
    expectEdgeExists(graph, 'jerome-robbins', 'george-balanchine', EdgeType.LINK);
    
    // William Forsythe draws from Balanchine
    expectEdgeExists(graph, 'william-forsythe', 'george-balanchine', EdgeType.LINK);
  });

  it('should create tag-based connections for dance styles', () => {
    const generator = new GraphGenerator({
      graph: { includeTags: true }
    });
    
    const graph = generator.generateFromDirectory('./samples/choreographers');
    
    // Should have tag edges connecting similar styles
    const tagEdges = graph.edges.filter(e => e.type === EdgeType.TAG);
    expect(tagEdges.length).toBeGreaterThan(0);
    
    // Modern dance choreographers should be connected
    const modernChoreographers = ['martha-graham', 'merce-cunningham', 'alvin-ailey'];
    const modernConnections = tagEdges.filter(e => 
      modernChoreographers.includes(e.from) && modernChoreographers.includes(e.to)
    );
    expect(modernConnections.length).toBeGreaterThan(0);
  });

  it('should find paths between related choreographers', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    generator.graph.buildGraph(Array.from(graph.nodes.values()).map(n => n.card));
    
    // Path from Martha Graham to William Forsythe (through modern dance lineage)
    const path = generator.graph.getShortestPath('martha-graham', 'william-forsythe');
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toBe('martha-graham');
    expect(path[path.length - 1]).toBe('william-forsythe');
  });

  it('should identify choreographer communities', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    generator.graph.buildGraph(Array.from(graph.nodes.values()).map(n => n.card));
    
    const components = generator.graph.getStronglyConnectedComponents();
    
    // Should find at least one connected component of choreographers
    expect(components.length).toBeGreaterThan(0);
    const largestComponent = components.reduce((prev, current) => 
      prev.length > current.length ? prev : current
    );
    expect(largestComponent.length).toBeGreaterThan(1);
  });

  it('should have meaningful analytics for choreographer network', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    const analytics = generator.getAnalytics(graph);
    
    expect(analytics.nodeCount).toBe(12);
    expect(analytics.edgeCount).toBeGreaterThan(10); // Should have good connectivity
    expect(analytics.avgConnections).toBeGreaterThan(1); // Most should be connected
    expect(analytics.isolatedNodes).toBeLessThan(3); // Few isolated nodes
    expect(analytics.density).toBeGreaterThan(0.1); // Reasonable density
  });

  it('should export choreographer graph to all formats', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    
    const json = generator.exportToJSON(graph);
    expect(() => JSON.parse(json)).not.toThrow();
    
    const dot = generator.exportToDOT(graph);
    expect(dot).toContain('martha-graham');
    expect(dot).toContain('merce-cunningham');
    
    const mermaid = generator.exportToMermaid(graph);
    expect(mermaid).toContain('marthagraham');
    expect(mermaid).toContain('mercecunningham');
  });

  it('should handle choreographer names with special characters', () => {
    const graph = generator.generateFromDirectory('./samples/choreographers');
    
    // Pina Bausch has a space and special characters in related content
    expectNodeExists(graph, 'pina-bausch');
    
    // Akram Khan has a hyphen-like connection
    expectNodeExists(graph, 'akram-khan');
    
    // All names should be properly sanitized as IDs
    for (const [nodeId] of graph.nodes) {
      expect(nodeId).toMatch(/^[a-z0-9-]+$/);
    }
  });
});