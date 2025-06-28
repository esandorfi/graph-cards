import { Card, Graph, GraphEdge, EdgeType } from '../../src/types';

export const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'test-card',
  title: 'Test Card',
  content: 'Test content',
  filePath: '/test/path.md',
  tags: [],
  links: [],
  backlinks: [],
  ...overrides
});

export const createMockCards = (count: number): Card[] => {
  return Array.from({ length: count }, (_, i) => createMockCard({
    id: `card-${i}`,
    title: `Card ${i}`,
    content: `Content for card ${i}`,
    filePath: `/test/card-${i}.md`
  }));
};

export const expectGraphStructure = (graph: Graph, expectedNodes: number, expectedEdges: number) => {
  expect(graph.nodes.size).toBe(expectedNodes);
  expect(graph.edges.length).toBe(expectedEdges);
};

export const expectNodeExists = (graph: Graph, nodeId: string) => {
  expect(graph.nodes.has(nodeId)).toBe(true);
  const node = graph.nodes.get(nodeId);
  expect(node).toBeDefined();
  expect(node!.id).toBe(nodeId);
};

export const expectEdgeExists = (graph: Graph, from: string, to: string, type?: EdgeType) => {
  const edge = graph.edges.find(e => e.from === from && e.to === to);
  expect(edge).toBeDefined();
  if (type) {
    expect(edge!.type).toBe(type);
  }
};

export const expectCardHasLinks = (card: Card, expectedLinks: string[]) => {
  expect(card.links).toEqual(expect.arrayContaining(expectedLinks));
  expect(card.links.length).toBe(expectedLinks.length);
};

export const expectCardHasTags = (card: Card, expectedTags: string[]) => {
  expect(card.tags).toEqual(expect.arrayContaining(expectedTags));
  expect(card.tags.length).toBe(expectedTags.length);
};

export const createTestMarkdown = (title: string, content: string, links: string[] = [], tags: string[] = []): string => {
  let markdown = `# ${title}\n\n${content}`;
  
  if (links.length > 0) {
    markdown += '\n\n';
    links.forEach(link => {
      markdown += `[[${link}]] `;
    });
  }
  
  if (tags.length > 0) {
    markdown += '\n\n';
    tags.forEach(tag => {
      markdown += `#${tag} `;
    });
  }
  
  return markdown;
};

export const expectValidJSON = (jsonString: string) => {
  expect(() => JSON.parse(jsonString)).not.toThrow();
  const parsed = JSON.parse(jsonString);
  expect(parsed).toHaveProperty('nodes');
  expect(parsed).toHaveProperty('edges');
  expect(Array.isArray(parsed.nodes)).toBe(true);
  expect(Array.isArray(parsed.edges)).toBe(true);
};

export const expectValidDOT = (dotString: string) => {
  expect(dotString).toMatch(/^digraph G \{/);
  expect(dotString).toMatch(/\}$/);
  expect(dotString).toContain('rankdir=LR');
};

export const expectValidMermaid = (mermaidString: string) => {
  expect(mermaidString).toMatch(/^graph TD/);
  expect(mermaidString).toContain('["');
  expect(mermaidString).toContain('-->');
};