import * as fs from "fs";
import * as path from "path";
import MarkdownIt from "markdown-it";
import { Card, ParserOptions } from "./types";

export class MarkdownParser {
  private md: MarkdownIt;
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.md = new MarkdownIt();
    this.options = {
      linkPattern: options.linkPattern || /\[\[([^\]]+)\]\]/g,
      tagPattern: options.tagPattern || /#([a-zA-Z0-9_-]+)/g,
      cardIdPattern: options.cardIdPattern || /^#\s+(.+)$/m,
      ...options,
    };
  }

  parseFile(filePath: string): Card {
    const content = fs.readFileSync(filePath, "utf-8");
    return this.parseContent(content, filePath);
  }

  parseContent(content: string, filePath: string): Card {
    const id = this.extractCardId(content, filePath);
    const title = this.extractTitle(content);
    const links = this.extractLinks(content);
    const tags = this.extractTags(content);

    return {
      id,
      title,
      content,
      filePath,
      tags,
      links,
      backlinks: [],
    };
  }

  parseDirectory(dirPath: string, recursive: boolean = true): Card[] {
    const cards: Card[] = [];
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && recursive) {
        cards.push(...this.parseDirectory(fullPath, recursive));
      } else if (stat.isFile() && this.isMarkdownFile(file)) {
        try {
          cards.push(this.parseFile(fullPath));
        } catch (error) {
          console.warn(`Failed to parse ${fullPath}:`, error);
        }
      }
    }

    return cards;
  }

  private extractCardId(content: string, filePath: string): string {
    const match = content.match(this.options.cardIdPattern!);
    if (match) {
      return this.sanitizeId(match[1]);
    }
    return this.sanitizeId(path.basename(filePath, path.extname(filePath)));
  }

  private extractTitle(content: string): string {
    const match = content.match(this.options.cardIdPattern!);
    if (match) {
      return match[1].trim();
    }

    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        return trimmed.substring(0, 100);
      }
    }

    return "Untitled";
  }

  private extractLinks(content: string): string[] {
    const links: string[] = [];
    let match;

    while ((match = this.options.linkPattern!.exec(content)) !== null) {
      const link = this.sanitizeId(match[1]);
      if (!links.includes(link)) {
        links.push(link);
      }
    }

    this.options.linkPattern!.lastIndex = 0;
    return links;
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    let match;

    while ((match = this.options.tagPattern!.exec(content)) !== null) {
      const tag = match[1].toLowerCase();
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    this.options.tagPattern!.lastIndex = 0;
    return tags;
  }

  private sanitizeId(id: string): string {
    return id
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  private isMarkdownFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return [".md", ".markdown", ".mdown", ".mkd"].includes(ext);
  }
}
