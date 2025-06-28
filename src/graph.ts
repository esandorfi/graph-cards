import { Card, Graph, GraphNode, GraphEdge, EdgeType, GraphOptions } from './types';

export class CardGraph {
  private graph: Graph;
  private options: GraphOptions;

  constructor(options: GraphOptions = {}) {
    this.graph = {
      nodes: new Map(),
      edges: []
    };
    this.options = {
      includeBacklinks: options.includeBacklinks ?? true,
      includeTags: options.includeTags ?? true,
      weightByFrequency: options.weightByFrequency ?? false,
      ...options
    };
  }

  buildGraph(cards: Card[]): Graph {
    this.graph.nodes.clear();
    this.graph.edges = [];

    this.addCards(cards);
    this.buildConnections(cards);
    
    if (this.options.includeBacklinks) {
      this.addBacklinks();
    }

    if (this.options.includeTags) {
      this.addTagConnections(cards);
    }

    return this.graph;
  }

  getGraph(): Graph {
    return this.graph;
  }

  getNode(id: string): GraphNode | undefined {
    return this.graph.nodes.get(id);
  }

  getConnectedNodes(id: string): GraphNode[] {
    const node = this.graph.nodes.get(id);
    if (!node) return [];

    return node.connections
      .map(edge => this.graph.nodes.get(edge.to))
      .filter((node): node is GraphNode => node !== undefined);
  }

  getShortestPath(fromId: string, toId: string): string[] {
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }];

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;

      if (id === toId) {
        return path;
      }

      if (visited.has(id)) {
        continue;
      }

      visited.add(id);

      const node = this.graph.nodes.get(id);
      if (node) {
        for (const edge of node.connections) {
          if (!visited.has(edge.to)) {
            queue.push({ id: edge.to, path: [...path, edge.to] });
          }
        }
      }
    }

    return [];
  }

  getStronglyConnectedComponents(): string[][] {
    const components: string[][] = [];
    const visited = new Set<string>();

    for (const [nodeId] of this.graph.nodes) {
      if (!visited.has(nodeId)) {
        const component = this.dfsComponent(nodeId, visited);
        if (component.length > 1) {
          components.push(component);
        }
      }
    }

    return components;
  }

  private addCards(cards: Card[]): void {
    for (const card of cards) {
      const node: GraphNode = {
        id: card.id,
        card,
        connections: []
      };
      this.graph.nodes.set(card.id, node);
    }
  }

  private buildConnections(cards: Card[]): void {
    for (const card of cards) {
      const fromNode = this.graph.nodes.get(card.id);
      if (!fromNode) continue;

      for (const linkId of card.links) {
        const toNode = this.graph.nodes.get(linkId);
        if (toNode && linkId !== card.id) {
          const edge: GraphEdge = {
            from: card.id,
            to: linkId,
            type: EdgeType.LINK,
            weight: this.options.weightByFrequency ? 1 : undefined
          };

          fromNode.connections.push(edge);
          this.graph.edges.push(edge);
        }
      }
    }
  }

  private addBacklinks(): void {
    const backlinkMap = new Map<string, string[]>();

    for (const edge of this.graph.edges) {
      if (edge.type === EdgeType.LINK) {
        if (!backlinkMap.has(edge.to)) {
          backlinkMap.set(edge.to, []);
        }
        backlinkMap.get(edge.to)!.push(edge.from);
      }
    }

    for (const [nodeId, backlinks] of backlinkMap) {
      const node = this.graph.nodes.get(nodeId);
      if (node) {
        node.card.backlinks = backlinks;

        for (const backlinkId of backlinks) {
          const backlinkEdge: GraphEdge = {
            from: nodeId,
            to: backlinkId,
            type: EdgeType.BACKLINK,
            weight: this.options.weightByFrequency ? 1 : undefined
          };

          node.connections.push(backlinkEdge);
          this.graph.edges.push(backlinkEdge);
        }
      }
    }
  }

  private addTagConnections(cards: Card[]): void {
    const tagMap = new Map<string, string[]>();

    for (const card of cards) {
      for (const tag of card.tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(card.id);
      }
    }

    for (const [tag, cardIds] of tagMap) {
      if (cardIds.length > 1) {
        for (let i = 0; i < cardIds.length; i++) {
          for (let j = i + 1; j < cardIds.length; j++) {
            const fromNode = this.graph.nodes.get(cardIds[i]);
            const toNode = this.graph.nodes.get(cardIds[j]);

            if (fromNode && toNode) {
              const edge1: GraphEdge = {
                from: cardIds[i],
                to: cardIds[j],
                type: EdgeType.TAG,
                weight: this.options.weightByFrequency ? 1 : undefined
              };

              const edge2: GraphEdge = {
                from: cardIds[j],
                to: cardIds[i],
                type: EdgeType.TAG,
                weight: this.options.weightByFrequency ? 1 : undefined
              };

              fromNode.connections.push(edge1);
              toNode.connections.push(edge2);
              this.graph.edges.push(edge1, edge2);
            }
          }
        }
      }
    }
  }

  private dfsComponent(startId: string, visited: Set<string>): string[] {
    const component: string[] = [];
    const stack = [startId];

    while (stack.length > 0) {
      const nodeId = stack.pop()!;

      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);
      component.push(nodeId);

      const node = this.graph.nodes.get(nodeId);
      if (node) {
        for (const edge of node.connections) {
          if (!visited.has(edge.to)) {
            stack.push(edge.to);
          }
        }
      }
    }

    return component;
  }
}