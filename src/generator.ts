import { MarkdownParser } from './parser';
import { CardGraph } from './graph';
import { Card, Graph, ParserOptions, GraphOptions } from './types';

export interface GeneratorOptions {
  parser?: ParserOptions;
  graph?: GraphOptions;
}

export class GraphGenerator {
  private parser: MarkdownParser;
  private graph: CardGraph;

  constructor(options: GeneratorOptions = {}) {
    this.parser = new MarkdownParser(options.parser);
    this.graph = new CardGraph(options.graph);
  }

  generateFromDirectory(dirPath: string, recursive: boolean = true): Graph {
    const cards = this.parser.parseDirectory(dirPath, recursive);
    return this.graph.buildGraph(cards);
  }

  generateFromFiles(filePaths: string[]): Graph {
    const cards: Card[] = [];
    
    for (const filePath of filePaths) {
      try {
        const card = this.parser.parseFile(filePath);
        cards.push(card);
      } catch (error) {
        console.warn(`Failed to parse ${filePath}:`, error);
      }
    }
    
    return this.graph.buildGraph(cards);
  }

  generateFromCards(cards: Card[]): Graph {
    return this.graph.buildGraph(cards);
  }

  exportToJSON(graph: Graph): string {
    const exportData = {
      nodes: Array.from(graph.nodes.entries()).map(([id, node]) => ({
        id,
        card: {
          id: node.card.id,
          title: node.card.title,
          filePath: node.card.filePath,
          tags: node.card.tags,
          links: node.card.links,
          backlinks: node.card.backlinks
        }
      })),
      edges: graph.edges
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  exportToDOT(graph: Graph): string {
    let dot = 'digraph G {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    for (const [id, node] of graph.nodes) {
      const label = node.card.title.replace(/"/g, '\\"');
      dot += `  "${id}" [label="${label}"];\n`;
    }

    dot += '\n';

    const addedEdges = new Set<string>();
    for (const edge of graph.edges) {
      const edgeKey = `${edge.from}->${edge.to}`;
      if (!addedEdges.has(edgeKey)) {
        let style = '';
        switch (edge.type) {
          case 'link':
            style = '[color=blue]';
            break;
          case 'backlink':
            style = '[color=red, style=dashed]';
            break;
          case 'tag':
            style = '[color=green, style=dotted]';
            break;
        }
        dot += `  "${edge.from}" -> "${edge.to}" ${style};\n`;
        addedEdges.add(edgeKey);
      }
    }

    dot += '}';
    return dot;
  }

  exportToMermaid(graph: Graph): string {
    let mermaid = 'graph TD\n';

    for (const [id, node] of graph.nodes) {
      const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
      const title = node.card.title.substring(0, 20);
      mermaid += `  ${cleanId}["${title}"]\n`;
    }

    mermaid += '\n';

    const addedEdges = new Set<string>();
    for (const edge of graph.edges) {
      const fromClean = edge.from.replace(/[^a-zA-Z0-9]/g, '');
      const toClean = edge.to.replace(/[^a-zA-Z0-9]/g, '');
      const edgeKey = `${fromClean}-${toClean}`;
      
      if (!addedEdges.has(edgeKey)) {
        let arrow = '-->';
        switch (edge.type) {
          case 'backlink':
            arrow = '-.->';
            break;
          case 'tag':
            arrow = '==>';
            break;
        }
        mermaid += `  ${fromClean} ${arrow} ${toClean}\n`;
        addedEdges.add(edgeKey);
      }
    }

    return mermaid;
  }

  getAnalytics(graph: Graph) {
    const nodeCount = graph.nodes.size;
    const edgeCount = graph.edges.length;
    
    const edgesByType = graph.edges.reduce((acc, edge) => {
      acc[edge.type] = (acc[edge.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const connections = Array.from(graph.nodes.values()).map(node => node.connections.length);
    const avgConnections = connections.length > 0 ? connections.reduce((a, b) => a + b, 0) / connections.length : 0;
    const maxConnections = connections.length > 0 ? Math.max(...connections) : 0;

    const isolatedNodes = Array.from(graph.nodes.values()).filter(node => node.connections.length === 0);

    return {
      nodeCount,
      edgeCount,
      edgesByType,
      avgConnections: Math.round(avgConnections * 100) / 100,
      maxConnections,
      isolatedNodes: isolatedNodes.length,
      density: nodeCount > 1 ? (edgeCount / (nodeCount * (nodeCount - 1))) : 0
    };
  }
}