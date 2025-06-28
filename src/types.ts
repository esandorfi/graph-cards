export interface Card {
  id: string;
  title: string;
  content: string;
  filePath: string;
  tags: string[];
  links: string[];
  backlinks: string[];
}

export interface GraphNode {
  id: string;
  card: Card;
  connections: GraphEdge[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type: EdgeType;
  weight?: number;
}

export enum EdgeType {
  LINK = 'link',
  BACKLINK = 'backlink',
  TAG = 'tag',
  MENTION = 'mention'
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

export interface ParserOptions {
  linkPattern?: RegExp;
  tagPattern?: RegExp;
  cardIdPattern?: RegExp;
}

export interface GraphOptions {
  includeBacklinks?: boolean;
  includeTags?: boolean;
  weightByFrequency?: boolean;
}