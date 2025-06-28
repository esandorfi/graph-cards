import { describe, it, expect, beforeEach } from 'vitest';
import { CardGraph } from '../../src/graph';
import { EdgeType } from '../../src/types';
import { 
  createMockCard, 
  createMockCards, 
  expectGraphStructure, 
  expectNodeExists, 
  expectEdgeExists 
} from '../utils/test-helpers';

describe('CardGraph', () => {
  let graph: CardGraph;

  beforeEach(() => {
    graph = new CardGraph();
  });

  describe('buildGraph', () => {
    it('should create nodes for all cards', () => {
      const cards = createMockCards(3);
      const result = graph.buildGraph(cards);

      expectGraphStructure(result, 3, 0);
      expectNodeExists(result, 'card-0');
      expectNodeExists(result, 'card-1');
      expectNodeExists(result, 'card-2');
    });

    it('should create link edges between connected cards', () => {
      const cards = [
        createMockCard({ id: 'card-a', links: ['card-b', 'card-c'] }),
        createMockCard({ id: 'card-b', links: ['card-c'] }),
        createMockCard({ id: 'card-c', links: [] })
      ];

      const result = graph.buildGraph(cards);

      expectGraphStructure(result, 3, 3);
      expectEdgeExists(result, 'card-a', 'card-b', EdgeType.LINK);
      expectEdgeExists(result, 'card-a', 'card-c', EdgeType.LINK);
      expectEdgeExists(result, 'card-b', 'card-c', EdgeType.LINK);
    });

    it('should ignore links to non-existent cards', () => {
      const cards = [
        createMockCard({ id: 'card-a', links: ['non-existent', 'card-b'] }),
        createMockCard({ id: 'card-b', links: [] })
      ];

      const result = graph.buildGraph(cards);

      expectGraphStructure(result, 2, 1);
      expectEdgeExists(result, 'card-a', 'card-b', EdgeType.LINK);
    });

    it('should create backlink edges when enabled', () => {
      const graphWithBacklinks = new CardGraph({ includeBacklinks: true });
      const cards = [
        createMockCard({ id: 'card-a', links: ['card-b'] }),
        createMockCard({ id: 'card-b', links: [] })
      ];

      const result = graphWithBacklinks.buildGraph(cards);

      expectGraphStructure(result, 2, 2);
      expectEdgeExists(result, 'card-a', 'card-b', EdgeType.LINK);
      expectEdgeExists(result, 'card-b', 'card-a', EdgeType.BACKLINK);
    });

    it('should create tag-based edges when enabled', () => {
      const graphWithTags = new CardGraph({ includeTags: true });
      const cards = [
        createMockCard({ id: 'card-a', tags: ['common', 'unique-a'] }),
        createMockCard({ id: 'card-b', tags: ['common', 'unique-b'] }),
        createMockCard({ id: 'card-c', tags: ['different'] })
      ];

      const result = graphWithTags.buildGraph(cards);

      // Should have link edges and tag edges between card-a and card-b
      expect(result.edges.filter(e => e.type === EdgeType.TAG).length).toBe(2);
      expectEdgeExists(result, 'card-a', 'card-b', EdgeType.TAG);
      expectEdgeExists(result, 'card-b', 'card-a', EdgeType.TAG);
    });

    it('should not create self-referencing edges', () => {
      const cards = [
        createMockCard({ id: 'card-a', links: ['card-a', 'card-b'] }),
        createMockCard({ id: 'card-b', links: [] })
      ];

      const result = graph.buildGraph(cards);

      expectGraphStructure(result, 2, 1);
      expectEdgeExists(result, 'card-a', 'card-b', EdgeType.LINK);
      
      // Ensure no self-referencing edge
      const selfEdge = result.edges.find(e => e.from === 'card-a' && e.to === 'card-a');
      expect(selfEdge).toBeUndefined();
    });
  });

  describe('graph analysis methods', () => {
    it('should find shortest path between nodes', () => {
      const cards = [
        createMockCard({ id: 'start', links: ['middle'] }),
        createMockCard({ id: 'middle', links: ['end'] }),
        createMockCard({ id: 'end', links: [] })
      ];

      graph.buildGraph(cards);
      const path = graph.getShortestPath('start', 'end');

      expect(path).toEqual(['start', 'middle', 'end']);
    });

    it('should return empty path when no connection exists', () => {
      const cards = [
        createMockCard({ id: 'isolated-a', links: [] }),
        createMockCard({ id: 'isolated-b', links: [] })
      ];

      graph.buildGraph(cards);
      const path = graph.getShortestPath('isolated-a', 'isolated-b');

      expect(path).toEqual([]);
    });

    it('should find connected nodes', () => {
      const cards = [
        createMockCard({ id: 'hub', links: ['node-1', 'node-2'] }),
        createMockCard({ id: 'node-1', links: [] }),
        createMockCard({ id: 'node-2', links: [] }),
        createMockCard({ id: 'isolated', links: [] })
      ];

      graph.buildGraph(cards);
      const connected = graph.getConnectedNodes('hub');

      expect(connected.length).toBe(2);
      expect(connected.map(n => n.id)).toEqual(expect.arrayContaining(['node-1', 'node-2']));
    });

    it('should identify strongly connected components', () => {
      const cards = [
        createMockCard({ id: 'a', links: ['b'] }),
        createMockCard({ id: 'b', links: ['c'] }),
        createMockCard({ id: 'c', links: ['a'] }),
        createMockCard({ id: 'd', links: [] })
      ];

      graph.buildGraph(cards);
      const components = graph.getStronglyConnectedComponents();

      // Should find the cycle between a, b, c
      expect(components.length).toBeGreaterThan(0);
      const largestComponent = components.reduce((prev, current) => 
        prev.length > current.length ? prev : current
      );
      expect(largestComponent).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    });
  });

  describe('graph options', () => {
    it('should respect includeBacklinks option', () => {
      const noBacklinks = new CardGraph({ includeBacklinks: false });
      const cards = [
        createMockCard({ id: 'a', links: ['b'] }),
        createMockCard({ id: 'b', links: [] })
      ];

      const result = noBacklinks.buildGraph(cards);
      
      const backlinkEdges = result.edges.filter(e => e.type === EdgeType.BACKLINK);
      expect(backlinkEdges.length).toBe(0);
    });

    it('should respect includeTags option', () => {
      const noTags = new CardGraph({ includeTags: false });
      const cards = [
        createMockCard({ id: 'a', tags: ['common'] }),
        createMockCard({ id: 'b', tags: ['common'] })
      ];

      const result = noTags.buildGraph(cards);
      
      const tagEdges = result.edges.filter(e => e.type === EdgeType.TAG);
      expect(tagEdges.length).toBe(0);
    });
  });
});