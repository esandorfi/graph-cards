import { describe, it, expect, beforeEach } from "vitest";
import { MarkdownParser } from "../../src/parser";
import { ParserOptions } from "../../src/types";
import {
  createTestMarkdown,
  expectCardHasLinks,
  expectCardHasTags,
} from "../utils/test-helpers";

describe("MarkdownParser", () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe("parseContent", () => {
    it("should parse a simple markdown file", () => {
      const content = createTestMarkdown("Test Card", "Simple content");
      const card = parser.parseContent(content, "/test/path.md");

      expect(card.id).toBe("test-card");
      expect(card.title).toBe("Test Card");
      expect(card.content).toBe(content);
      expect(card.filePath).toBe("/test/path.md");
      expect(card.tags).toEqual([]);
      expect(card.links).toEqual([]);
      expect(card.backlinks).toEqual([]);
    });

    it("should extract links from markdown content", () => {
      const content = createTestMarkdown(
        "Linked Card",
        "This card links to other cards.",
        ["Another Card", "Third Card"],
      );
      const card = parser.parseContent(content, "/test/linked.md");

      expectCardHasLinks(card, ["another-card", "third-card"]);
    });

    it("should extract tags from markdown content", () => {
      const content = createTestMarkdown(
        "Tagged Card",
        "This card has tags.",
        [],
        ["important", "test", "example"],
      );
      const card = parser.parseContent(content, "/test/tagged.md");

      expectCardHasTags(card, ["important", "test", "example"]);
    });

    it("should handle both links and tags", () => {
      const content = createTestMarkdown(
        "Complex Card",
        "This has both links and tags.",
        ["Reference Card"],
        ["complex", "test"],
      );
      const card = parser.parseContent(content, "/test/complex.md");

      expectCardHasLinks(card, ["reference-card"]);
      expectCardHasTags(card, ["complex", "test"]);
    });

    it("should sanitize IDs correctly", () => {
      const content =
        "# Card With Spaces & Special Characters!\n\nContent here.";
      const card = parser.parseContent(content, "/test/special.md");

      expect(card.id).toBe("card-with-spaces--special-characters");
    });

    it("should handle duplicate links and tags", () => {
      const content = `# Duplicate Test

This links to [[Same Card]] and [[Same Card]] again.
It also has #duplicate and #duplicate tags.`;

      const card = parser.parseContent(content, "/test/duplicates.md");

      expect(card.links).toEqual(["same-card"]);
      expect(card.tags).toEqual(["duplicate"]);
    });

    it("should extract title from first heading", () => {
      const content = `# Main Title

Some content here.

## Subtitle

More content.`;

      const card = parser.parseContent(content, "/test/title.md");

      expect(card.title).toBe("Main Title");
      expect(card.id).toBe("main-title");
    });

    it("should fallback to filename for ID when no title", () => {
      const content = "Just content without a heading.";
      const card = parser.parseContent(content, "/test/no-title.md");

      expect(card.id).toBe("no-title");
      expect(card.title).toBe("Just content without a heading.");
    });
  });

  describe("custom parser options", () => {
    it("should use custom link pattern", () => {
      const customParser = new MarkdownParser({
        linkPattern: /\[([^\]]+)\]\([^)]+\)/g,
      });

      const content =
        "# Custom Links\n\nCheck out [Google](https://google.com) and [GitHub](https://github.com).";
      const card = customParser.parseContent(content, "/test/custom.md");

      expectCardHasLinks(card, ["google", "github"]);
    });

    it("should use custom tag pattern", () => {
      const customParser = new MarkdownParser({
        tagPattern: /@([a-zA-Z0-9_-]+)/g,
      });

      const content = "# Custom Tags\n\nThis has @mention and @another tags.";
      const card = customParser.parseContent(content, "/test/mentions.md");

      expectCardHasTags(card, ["mention", "another"]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty content", () => {
      const card = parser.parseContent("", "/test/empty.md");

      expect(card.id).toBe("empty");
      expect(card.title).toBe("Untitled");
      expect(card.content).toBe("");
    });

    it("should handle content with only whitespace", () => {
      const card = parser.parseContent(
        "   \n\n  \t  \n",
        "/test/whitespace.md",
      );

      expect(card.id).toBe("whitespace");
      expect(card.title).toBe("Untitled");
    });

    it("should handle malformed links gracefully", () => {
      const content =
        "# Malformed\n\nThis has [[incomplete link and [[]] empty link.";
      const card = parser.parseContent(content, "/test/malformed.md");

      expect(card.links).toEqual(["incomplete-link-and-"]);
    });
  });
});
