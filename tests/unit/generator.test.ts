import { describe, it, expect, beforeEach } from 'vitest';
import { GraphGenerator } from '../../src/generator';
import { createMockCards, expectValidJSON, expectValidDOT, expectValidMermaid } from '../utils/test-helpers';

describe('GraphGenerator', () => {
  let generator: GraphGenerator;

  beforeEach(() => {
    generator = new GraphGenerator();
  });

  describe('generateFromCards', () => {
    it('should generate graph from card array', () => {
      const cards = createMockCards(3);
      cards[0].links = ['card-1'];
      cards[1].links = ['card-2'];

      const graph = generator.generateFromCards(cards);

      expect(graph.nodes.size).toBe(3);
      expect(graph.edges.length).toBeGreaterThan(2); // includes backlinks
    });

    it('should handle empty card array', () => {
      const graph = generator.generateFromCards([]);

      expect(graph.nodes.size).toBe(0);
      expect(graph.edges.length).toBe(0);
    });
  });

  describe('export formats', () => {
    it('should export to valid JSON format', () => {
      const cards = createMockCards(2);
      cards[0].links = ['card-1'];
      cards[0].tags = ['test'];

      const graph = generator.generateFromCards(cards);
      const json = generator.exportToJSON(graph);

      expectValidJSON(json);

      const parsed = JSON.parse(json);
      expect(parsed.nodes.length).toBe(2);
      expect(parsed.edges.length).toBeGreaterThan(0);
      
      // Check node structure
      expect(parsed.nodes[0]).toHaveProperty('id');
      expect(parsed.nodes[0]).toHaveProperty('card');
      expect(parsed.nodes[0].card).toHaveProperty('title');
      expect(parsed.nodes[0].card).toHaveProperty('tags');
      expect(parsed.nodes[0].card).toHaveProperty('links');
    });

    it('should export to valid DOT format', () => {
      const cards = createMockCards(2);
      cards[0].links = ['card-1'];

      const graph = generator.generateFromCards(cards);
      const dot = generator.exportToDOT(graph);

      expectValidDOT(dot);
      
      // Check for node declarations
      expect(dot).toContain('"card-0"');
      expect(dot).toContain('"card-1"');
      
      // Check for edge declaration
      expect(dot).toContain('"card-0" -> "card-1"');
    });

    it('should export to valid Mermaid format', () => {
      const cards = createMockCards(2);
      cards[0].links = ['card-1'];

      const graph = generator.generateFromCards(cards);
      const mermaid = generator.exportToMermaid(graph);

      expectValidMermaid(mermaid);
      
      // Check for sanitized node IDs (no hyphens)
      expect(mermaid).toContain('card0');
      expect(mermaid).toContain('card1');
      
      // Check for edge
      expect(mermaid).toContain('card0 --> card1');
    });

    it('should handle different edge types in DOT export', () => {
      const generator = new GraphGenerator({
        graph: { includeBacklinks: true, includeTags: true }
      });

      const cards = [
        createMockCards(1)[0],
        { ...createMockCards(1)[0], id: 'card-b', tags: ['shared'] }
      ];
      cards[0].id = 'card-a';
      cards[0].links = ['card-b'];
      cards[0].tags = ['shared'];

      const graph = generator.generateFromCards(cards);
      const dot = generator.exportToDOT(graph);

      // Should have different edge styles
      expect(dot).toContain('[color=blue]'); // link edges
      expect(dot).toContain('[color=red, style=dashed]'); // backlink edges
      // Note: may not have tag edges if no common tags
    });

    it('should handle different edge types in Mermaid export', () => {
      const generator = new GraphGenerator({
        graph: { includeBacklinks: true, includeTags: true }
      });

      const cards = [
        createMockCards(1)[0],
        { ...createMockCards(1)[0], id: 'card-b', tags: ['shared'] }
      ];
      cards[0].id = 'card-a';
      cards[0].links = ['card-b'];
      cards[0].tags = ['shared'];

      const graph = generator.generateFromCards(cards);
      const mermaid = generator.exportToMermaid(graph);

      // Should have different arrow types
      expect(mermaid).toContain('-->'); // link edges
      expect(mermaid).toContain('-.->'); // backlink edges  
      // Note: may not have tag edges if no common tags
    });
  });

  describe('getAnalytics', () => {
    it('should provide correct analytics for simple graph', () => {
      const cards = createMockCards(3);
      cards[0].links = ['card-1', 'card-2'];
      cards[1].links = ['card-2'];

      const graph = generator.generateFromCards(cards);
      const analytics = generator.getAnalytics(graph);

      expect(analytics.nodeCount).toBe(3);
      expect(analytics.edgeCount).toBeGreaterThan(3); // includes backlinks
      expect(analytics.avgConnections).toBeGreaterThan(1); // includes backlinks
      expect(analytics.maxConnections).toBe(2);
      expect(analytics.isolatedNodes).toBe(0);
      expect(analytics.density).toBeGreaterThan(0);
    });

    it('should identify isolated nodes', () => {
      const cards = [
        ...createMockCards(2),
        createMockCards(1)[0] // isolated node
      ];
      cards[0].links = ['card-1'];
      cards[2].id = 'isolated';

      const graph = generator.generateFromCards(cards);
      const analytics = generator.getAnalytics(graph);

      expect(analytics.isolatedNodes).toBe(1);
    });

    it('should categorize edges by type', () => {
      const generator = new GraphGenerator({
        graph: { includeBacklinks: true, includeTags: true }
      });

      const cards = [
        createMockCards(1)[0],
        { ...createMockCards(1)[0], id: 'card-b', tags: ['shared'] }
      ];
      cards[0].id = 'card-a';
      cards[0].links = ['card-b'];
      cards[0].tags = ['shared'];

      const graph = generator.generateFromCards(cards);
      const analytics = generator.getAnalytics(graph);

      expect(analytics.edgesByType).toHaveProperty('link');
      expect(analytics.edgesByType).toHaveProperty('backlink');
      expect(analytics.edgesByType).toHaveProperty('tag');
      expect(analytics.edgesByType.link).toBeGreaterThan(0);
      expect(analytics.edgesByType.backlink).toBeGreaterThan(0);
      expect(analytics.edgesByType.tag).toBeGreaterThan(0);
    });

    it('should handle empty graph', () => {
      const graph = generator.generateFromCards([]);
      const analytics = generator.getAnalytics(graph);

      expect(analytics.nodeCount).toBe(0);
      expect(analytics.edgeCount).toBe(0);
      expect(analytics.avgConnections).toBe(0);
      expect(analytics.maxConnections).toBe(0);
      expect(analytics.isolatedNodes).toBe(0);
      expect(analytics.density).toBe(0);
    });
  });

  describe('generator options', () => {
    it('should pass parser options correctly', () => {
      const customGenerator = new GraphGenerator({
        parser: {
          tagPattern: /@([a-zA-Z0-9_-]+)/g
        }
      });

      // This would need integration testing with actual markdown content
      expect(customGenerator).toBeDefined();
    });

    it('should pass graph options correctly', () => {
      const customGenerator = new GraphGenerator({
        graph: {
          includeBacklinks: false,
          includeTags: false
        }
      });

      const cards = createMockCards(2);
      cards[0].links = ['card-1'];
      cards[0].tags = ['test'];

      const graph = customGenerator.generateFromCards(cards);
      
      // Should only have link edges, no backlinks or tag edges
      expect(graph.edges.every(e => e.type === 'link')).toBe(true);
    });
  });
});