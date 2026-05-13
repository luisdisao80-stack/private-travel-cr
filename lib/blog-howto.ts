// Detect when a blog post is shaped like a HowTo (a sequence of numbered
// "## 1. Title" / "## 2. Title" / ... H2 sections) and extract the steps so
// we can emit schema.org HowTo JSON-LD for AI / SERP rich results.
//
// Heuristic: at least 3 consecutive numbered H2s in the body. We trust the
// markdown rather than the rendered HTML because it's simpler to parse.

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type HowToStep = {
  name: string;
  text: string;
};

const STEP_HEADING_RE = /^##\s+(\d+)\.\s+(.+?)\s*$/;

export function extractHowToSteps(markdown: string): HowToStep[] {
  const lines = markdown.split("\n");
  type Found = { lineIdx: number; n: number; name: string };
  const headings: Found[] = [];
  lines.forEach((line, i) => {
    const m = STEP_HEADING_RE.exec(line);
    if (m) {
      headings.push({ lineIdx: i, n: parseInt(m[1], 10), name: m[2] });
    }
  });
  if (headings.length < 3) return [];

  // Reject if the numbers don't form a strictly increasing sequence starting
  // at 1 — otherwise "## 1. Foo" then a stray "## 5. Bar" would produce junk.
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].n !== i + 1) return [];
  }

  const steps: HowToStep[] = [];
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].lineIdx + 1;
    const end = i + 1 < headings.length ? headings[i + 1].lineIdx : lines.length;
    const body = lines.slice(start, end).join("\n").trim();
    const text = stripMarkdown(body);
    if (!text) continue;
    steps.push({
      name: headings[i].name,
      // Schema.org caps HowToStep.text length at a few hundred chars in
      // practice; trim aggressively so the JSON-LD doesn't bloat the page.
      text: text.length > 500 ? text.slice(0, 497) + "..." : text,
    });
  }
  return steps;
}

function stripMarkdown(s: string): string {
  return s
    // Strip code fences entirely
    .replace(/```[\s\S]*?```/g, "")
    // Strip inline code
    .replace(/`([^`]+)`/g, "$1")
    // Bold / italic / strikethrough markers
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Links: keep the text, drop the URL
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Headings inside (shouldn't appear but defensive)
    .replace(/^#{1,6}\s+/gm, "")
    // List bullets
    .replace(/^[*+-]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    // Blockquotes
    .replace(/^>\s+/gm, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export function readPostMarkdown(slug: string): string | null {
  const file = path.join(process.cwd(), "content/blog", `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);
  return content;
}
